import { useCallback, useState } from 'react';
import { deleteItem, insertItems, removeStoredFiles, saveItem, saveOrder, uploadImage } from '../lib/api.js';
import { useContent } from '../context/ContentContext.jsx';
import { useToast } from '../components/Toast.jsx';

/**
 * CRUD + reorder for officers, members, or gallery.
 * imageMap maps upload results onto item fields, e.g. { src: 'photo', thumb: 'photoThumb', path: 'photoPath' }.
 */
export default function useCollection(collection, { folder, imageMap, noun }) {
  const { content, update, status } = useContent();
  const toast = useToast();
  const [stage, setStage] = useState(null);
  const [moving, setMoving] = useState(false);
  const items = content[collection];
  // Writes are allowed only once the real list has loaded, so nothing is saved against defaults.
  const ready = status === 'ready';
  const pathKey = imageMap.path;

  const save = useCallback(
    async (draft, file) => {
      if (!ready) {
        toast.error('Not saved: the current content has not loaded yet.');
        return false;
      }
      let uploadedPath = '';
      try {
        let record = { ...draft };
        if (file) {
          const up = await uploadImage(file, folder, setStage);
          uploadedPath = up.path;
          for (const [from, to] of Object.entries(imageMap)) record[to] = up[from];
        }
        setStage('saving');
        const index = draft.id ? items.findIndex((x) => x.id === draft.id) : items.length;
        const saved = await saveItem(collection, record, index < 0 ? items.length : index);
        const previous = draft.id ? items.find((x) => x.id === draft.id) : null;
        update(collection, (list) => {
          const at = list.findIndex((x) => x.id === saved.id);
          if (at < 0) return [...list, saved];
          const next = [...list];
          next[at] = saved;
          return next;
        });
        // The replaced or removed photo is no longer referenced anywhere.
        if (pathKey && previous?.[pathKey] && previous[pathKey] !== saved[pathKey]) removeStoredFiles([previous[pathKey]]);
        toast.success(draft.id ? `${noun} updated.` : `${noun} added.`);
        return true;
      } catch (err) {
        if (uploadedPath) removeStoredFiles([uploadedPath]);
        toast.error(`Not saved: ${err.message}`);
        return false;
      } finally {
        setStage(null);
      }
    },
    [collection, folder, imageMap, items, noun, pathKey, ready, toast, update],
  );

  const addMany = useCallback(
    async (records, message) => {
      if (!ready) {
        toast.error('Not saved: the current content has not loaded yet.');
        return false;
      }
      setStage('saving');
      try {
        const saved = await insertItems(collection, records, items.length);
        update(collection, (list) => [...list, ...saved]);
        toast.success(message);
        return true;
      } catch (err) {
        toast.error(`Not saved: ${err.message}`);
        return false;
      } finally {
        setStage(null);
      }
    },
    [collection, items.length, ready, toast, update],
  );

  const remove = useCallback(
    async (item, options) => {
      if (!ready) {
        toast.error('Not removed: the current content has not loaded yet.');
        return false;
      }
      try {
        await deleteItem(collection, item, options);
        update(collection, (list) => list.filter((x) => x.id !== item.id));
        toast.success(`${noun} removed.`);
        return true;
      } catch (err) {
        toast.error(`Not removed: ${err.message}`);
        return false;
      }
    },
    [collection, noun, ready, toast, update],
  );

  const move = useCallback(
    async (item, step) => {
      if (!ready || moving) return;
      const from = items.findIndex((x) => x.id === item.id);
      const to = from + step;
      if (from < 0 || to < 0 || to >= items.length) return;
      const previous = items;
      const next = [...items];
      [next[from], next[to]] = [next[to], next[from]];
      update(collection, next);
      setMoving(true);
      try {
        const saved = await saveOrder(collection, next);
        update(collection, saved);
      } catch (err) {
        update(collection, previous);
        toast.error(`Order not saved: ${err.message}`);
      } finally {
        setMoving(false);
      }
    },
    [collection, items, moving, ready, toast, update],
  );

  /** Saves a complete new order (every item exactly once). Rolls the list back if the request fails. */
  const reorder = useCallback(
    async (next) => {
      if (!ready || moving || next.length !== items.length) return false;
      const previous = items;
      update(collection, next);
      setMoving(true);
      try {
        const saved = await saveOrder(collection, next);
        update(collection, saved);
        return true;
      } catch (err) {
        update(collection, previous);
        toast.error(`Order not saved: ${err.message}`);
        return false;
      } finally {
        setMoving(false);
      }
    },
    [collection, items, moving, ready, toast, update],
  );

  return { items, save, addMany, remove, move, reorder, stage, busy: stage !== null, moving, ready };
}
