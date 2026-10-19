import { supabase, isSupabaseConfigured, isLocalPreviewAllowed, STORAGE_BUCKET } from './supabase.js';
import { defaultContent, defaultSettings } from '../data/defaultContent.js';
import { prepareImage, blobToDataURL, createId } from './image.js';

/*
 * Data access for public pages and the dashboard.
 * Two backends share one interface:
 *  - "supabase": the real backend. Writes are authorised by RLS policies (supabase/schema.sql).
 *  - "local": a development-only preview stored in this browser's localStorage.
 */
export const backend = isSupabaseConfigured ? 'supabase' : isLocalPreviewAllowed ? 'local' : 'none';

const LOCAL_KEY = 'tjkt:preview-content';

// Column mapping between app objects (camelCase) and database rows (snake_case).
const COLLECTIONS = {
  officers: {
    table: 'officers',
    fields: {
      name: 'name',
      role: 'role',
      tier: 'tier',
      description: 'description',
      photo: 'photo_url',
      photoPath: 'photo_path',
      groupName: 'group_name',
      isDeputy: 'is_deputy',
    },
  },
  members: {
    table: 'members',
    fields: { name: 'name', number: 'class_number', intro: 'intro', photo: 'photo_url', photoThumb: 'photo_thumb_url', photoPath: 'photo_path' },
  },
  gallery: {
    table: 'gallery_images',
    fields: {
      src: 'image_url',
      thumb: 'thumb_url',
      path: 'storage_path',
      width: 'width',
      height: 'height',
      caption: 'caption',
      alt: 'alt_text',
      date: 'taken_on',
      category: 'category',
    },
  },
};

const NULLABLE_EMPTY = new Set(['taken_on', 'class_number', 'width', 'height', 'group_name']);

// Officer group columns come from supabase/migrations/2026-10-19-officer-groups.sql. Until that migration has been
// run, they are left out of writes so the existing officer CRUD keeps working unchanged.
const OFFICER_GROUP_COLUMNS = new Set(['group_name', 'is_deputy']);
let officerGroupColumns = true;

/** False when the database has not received the officer-groups migration yet. */
export function officerGroupsAvailable() {
  return officerGroupColumns;
}

function friendlyError(error) {
  const message = error?.message || 'Unknown error.';
  if (/group_name|is_deputy/.test(message)) {
    return 'The officer groups migration has not been applied to the database yet (supabase/migrations/2026-10-19-officer-groups.sql).';
  }
  return message;
}

function toRow(collection, item, index) {
  const { fields } = COLLECTIONS[collection];
  const row = { id: item.id, sort_order: index ?? item.order ?? 0 };
  for (const [key, column] of Object.entries(fields)) {
    if (!officerGroupColumns && OFFICER_GROUP_COLUMNS.has(column)) continue;
    const value = item[key];
    if (column === 'is_deputy') row[column] = Boolean(value);
    else row[column] = value === '' && NULLABLE_EMPTY.has(column) ? null : value ?? (column === 'name' ? '' : null);
  }
  return row;
}

function fromRow(collection, row) {
  const { fields } = COLLECTIONS[collection];
  const item = { id: row.id, order: row.sort_order ?? 0 };
  for (const [key, column] of Object.entries(fields)) item[key] = column === 'is_deputy' ? Boolean(row[column]) : row[column] ?? '';
  return item;
}

function mergeSettings(data) {
  return {
    ...defaultSettings,
    ...data,
    ctaPrimary: { ...defaultSettings.ctaPrimary, ...data?.ctaPrimary },
    ctaSecondary: { ...defaultSettings.ctaSecondary, ...data?.ctaSecondary },
    about: { ...defaultSettings.about, ...data?.about },
  };
}

/* ---------- local preview backend ---------- */

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return structuredClone(defaultContent);
    const parsed = JSON.parse(raw);
    return {
      settings: mergeSettings(parsed.settings),
      officers: parsed.officers ?? [],
      members: parsed.members ?? [],
      gallery: parsed.gallery ?? [],
    };
  } catch {
    return structuredClone(defaultContent);
  }
}

function writeLocal(content) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(content));
  } catch {
    throw new Error('Browser storage is full. Local preview can only hold a few images. Remove some and try again.');
  }
}

/* ---------- public API ---------- */

export async function fetchContent() {
  if (backend === 'local') return readLocal();
  if (backend === 'none') return structuredClone(defaultContent);

  const [settings, officers, members, gallery] = await Promise.all([
    supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
    supabase.from('officers').select('*').order('sort_order'),
    supabase.from('members').select('*').order('sort_order'),
    supabase.from('gallery_images').select('*').order('sort_order'),
  ]);
  const failed = [settings, officers, members, gallery].find((r) => r.error);
  if (failed) throw new Error(failed.error.message);
  // A non-empty result shows which columns exist; an empty table can't tell, so the last known state stays.
  if (officers.data.length) officerGroupColumns = 'group_name' in officers.data[0];

  return {
    settings: mergeSettings(settings.data?.data),
    // An empty table means nothing is published yet. Starter roles are never shown as if they were saved.
    officers: officers.data.map((r) => fromRow('officers', r)),
    members: members.data.map((r) => fromRow('members', r)),
    gallery: gallery.data.map((r) => fromRow('gallery', r)),
  };
}

export async function saveSettings(settings) {
  if (backend === 'local') {
    const content = readLocal();
    content.settings = settings;
    writeLocal(content);
    return settings;
  }
  const { error } = await supabase.from('site_settings').upsert({ id: 1, data: settings });
  if (error) throw new Error(error.message);
  return settings;
}

export async function saveItem(collection, item, index) {
  const record = { ...item, id: item.id || createId() };
  if (backend === 'local') {
    const content = readLocal();
    const list = content[collection];
    const at = list.findIndex((x) => x.id === item.id);
    const stored = { ...record, order: at >= 0 ? at : list.length };
    if (at >= 0) list[at] = stored;
    else list.push(stored);
    writeLocal(content);
    return stored;
  }
  const { data, error } = await supabase
    .from(COLLECTIONS[collection].table)
    .upsert(toRow(collection, record, index))
    .select()
    .single();
  if (error) throw new Error(friendlyError(error));
  return fromRow(collection, data);
}

/** Inserts several new records in one request, so either all of them are saved or none are. */
export async function insertItems(collection, items, startIndex = 0) {
  const records = items.map((item, i) => ({ ...item, id: createId(), order: startIndex + i }));
  if (backend === 'local') {
    const content = readLocal();
    content[collection] = [...content[collection], ...records];
    writeLocal(content);
    return records;
  }
  const { data, error } = await supabase
    .from(COLLECTIONS[collection].table)
    .insert(records.map((r) => toRow(collection, r, r.order)))
    .select();
  if (error) throw new Error(friendlyError(error));
  return data.map((r) => fromRow(collection, r)).sort((a, b) => a.order - b.order);
}

export async function deleteItem(collection, item, { keepFiles = false } = {}) {
  if (backend === 'local') {
    const content = readLocal();
    content[collection] = content[collection].filter((x) => x.id !== item.id);
    writeLocal(content);
    return;
  }
  const { data, error } = await supabase.from(COLLECTIONS[collection].table).delete().eq('id', item.id).select('id');
  if (error) throw new Error(error.message);
  // RLS can filter a delete down to zero rows without raising an error.
  if (!data?.length) throw new Error('Nothing was deleted. The item may already be gone, or this account cannot delete it.');
  if (!keepFiles) await removeStoredFiles([item.path, item.photoPath]);
}

/**
 * Persists a new order. Only rows whose position changed are written, in a single upsert,
 * so a failure leaves the previous order intact instead of a half-saved one.
 */
export async function saveOrder(collection, items) {
  const ordered = items.map((item, i) => ({ ...item, order: i }));
  if (backend === 'local') {
    const content = readLocal();
    content[collection] = ordered;
    writeLocal(content);
    return ordered;
  }
  const changed = ordered.filter((item, i) => items[i].order !== i);
  if (!changed.length) return ordered;
  const { data, error } = await supabase
    .from(COLLECTIONS[collection].table)
    .upsert(changed.map((item) => toRow(collection, item, item.order)))
    .select('id');
  if (error) throw new Error(friendlyError(error));
  if ((data?.length ?? 0) !== changed.length) throw new Error('The new order was not saved for every item. Reload and try again.');
  return ordered;
}

/** Deletes uploaded files and their thumbnails. Cleanup failures never undo a successful save or delete. */
export async function removeStoredFiles(paths) {
  if (backend !== 'supabase') return;
  const all = paths.filter(Boolean).flatMap((p) => [p, thumbPathOf(p)]);
  if (!all.length) return;
  try {
    await supabase.storage.from(STORAGE_BUCKET).remove(all);
  } catch {
    /* orphaned files are harmless; they are only unused storage */
  }
}

/** Storage path of a public URL from this project's media bucket, or '' for anything else. */
export function storagePathFromUrl(url) {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const at = url ? url.indexOf(marker) : -1;
  return at < 0 ? '' : decodeURIComponent(url.slice(at + marker.length).split('?')[0]);
}

/**
 * Thumbnail URL for an uploaded image. Every upload writes "<name>-thumb.<ext>" next to the
 * full file, so the thumbnail is derived from the stored path rather than guessed.
 */
export function thumbUrlOf(url, path) {
  if (!url || !path || backend !== 'supabase' || !url.includes(path)) return '';
  return url.replace(path, thumbPathOf(path));
}

// Longest side of the thumbnail rendition written by uploadImage.
export const THUMB_SIZE = backend === 'local' ? 480 : 640;

function thumbPathOf(path) {
  return path.replace(/(\.[a-z]+)$/i, '-thumb$1');
}

/**
 * Resizes then stores an image. onStage reports honest progress steps:
 * "processing" -> "uploading" -> "done".
 */
export async function uploadImage(file, folder, onStage = () => {}) {
  onStage('processing');
  const local = backend === 'local';
  const { full, thumb } = await prepareImage(file, local ? { maxSize: 1280, thumbSize: THUMB_SIZE, quality: 0.72 } : { thumbSize: THUMB_SIZE });

  onStage('uploading');
  if (local) {
    const [src, thumbSrc] = await Promise.all([blobToDataURL(full.blob), blobToDataURL(thumb.blob)]);
    onStage('done');
    return { src, thumb: thumbSrc, path: '', width: full.width, height: full.height };
  }

  const ext = full.blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${folder}/${createId()}.${ext}`;
  const bucket = supabase.storage.from(STORAGE_BUCKET);
  const options = { contentType: full.blob.type, cacheControl: '31536000', upsert: false };
  const [a, b] = await Promise.all([
    bucket.upload(path, full.blob, options),
    bucket.upload(thumbPathOf(path), thumb.blob, options),
  ]);
  if (a.error || b.error) {
    // Do not leave half an upload behind.
    await bucket.remove([a.error ? null : path, b.error ? null : thumbPathOf(path)].filter(Boolean)).catch(() => {});
    throw new Error((a.error || b.error).message);
  }

  onStage('done');
  return {
    src: bucket.getPublicUrl(path).data.publicUrl,
    thumb: bucket.getPublicUrl(thumbPathOf(path)).data.publicUrl,
    path,
    width: full.width,
    height: full.height,
  };
}

export function resetLocalPreview() {
  localStorage.removeItem(LOCAL_KEY);
}
