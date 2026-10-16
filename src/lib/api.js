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
    fields: { name: 'name', role: 'role', tier: 'tier', description: 'description', photo: 'photo_url', photoPath: 'photo_path' },
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

const NULLABLE_EMPTY = new Set(['taken_on', 'class_number', 'width', 'height']);

function toRow(collection, item, index) {
  const { fields } = COLLECTIONS[collection];
  const row = { id: item.id, sort_order: index ?? item.order ?? 0 };
  for (const [key, column] of Object.entries(fields)) {
    const value = item[key];
    row[column] = value === '' && NULLABLE_EMPTY.has(column) ? null : value ?? (column === 'name' ? '' : null);
  }
  return row;
}

function fromRow(collection, row) {
  const { fields } = COLLECTIONS[collection];
  const item = { id: row.id, order: row.sort_order ?? 0 };
  for (const [key, column] of Object.entries(fields)) item[key] = row[column] ?? '';
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
      officers: parsed.officers ?? defaultContent.officers,
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
    throw new Error('Browser storage is full. Local preview can only hold a few images — remove some and try again.');
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

  return {
    settings: mergeSettings(settings.data?.data),
    officers: officers.data.length ? officers.data.map((r) => fromRow('officers', r)) : defaultContent.officers,
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
  const record = { ...item, id: item.id && !item.id.startsWith('slot-') ? item.id : createId() };
  if (backend === 'local') {
    const content = readLocal();
    const list = content[collection];
    const at = list.findIndex((x) => x.id === item.id);
    if (at >= 0) list[at] = record;
    else list.push(record);
    writeLocal(content);
    return record;
  }
  // Slot ids come from the starter data and do not exist in the database yet.
  if (item.id?.startsWith('slot-')) await persistSlots(collection, item.id, record);
  const { data, error } = await supabase
    .from(COLLECTIONS[collection].table)
    .upsert(toRow(collection, record, index))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...fromRow(collection, data), __reload: Boolean(record.__reload) };
}

// The first real officer save writes the remaining starter role slots too, so they are not lost.
async function persistSlots(collection, replacingId, record) {
  if (collection !== 'officers') return;
  const { count } = await supabase.from('officers').select('id', { count: 'exact', head: true });
  if (count) return;
  const rows = defaultContent.officers
    .map((slot, i) => (slot.id === replacingId ? null : toRow('officers', { ...slot, id: createId() }, i)))
    .filter(Boolean);
  const { error } = await supabase.from('officers').insert(rows);
  if (error) throw new Error(error.message);
  record.__reload = true;
}

export async function deleteItem(collection, item) {
  if (backend === 'local') {
    const content = readLocal();
    content[collection] = content[collection].filter((x) => x.id !== item.id);
    writeLocal(content);
    return;
  }
  if (!item.id.startsWith('slot-')) {
    const { error } = await supabase.from(COLLECTIONS[collection].table).delete().eq('id', item.id);
    if (error) throw new Error(error.message);
  }
  const paths = [item.path, item.photoPath].filter(Boolean).flatMap((p) => [p, thumbPathOf(p)]);
  // Storage cleanup failures should not undo a successful delete.
  if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths).catch(() => {});
}

export async function saveOrder(collection, items) {
  if (backend === 'local') {
    const content = readLocal();
    content[collection] = items;
    writeLocal(content);
    return items;
  }
  const real = items.filter((x) => !x.id.startsWith('slot-'));
  const rows = real.map((item) => ({ id: item.id, sort_order: items.indexOf(item) }));
  for (const row of rows) {
    const { error } = await supabase.from(COLLECTIONS[collection].table).update({ sort_order: row.sort_order }).eq('id', row.id);
    if (error) throw new Error(error.message);
  }
  return items;
}

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
  const { full, thumb } = await prepareImage(file, local ? { maxSize: 1280, thumbSize: 480, quality: 0.72 } : undefined);

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
  if (a.error || b.error) throw new Error((a.error || b.error).message);

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
