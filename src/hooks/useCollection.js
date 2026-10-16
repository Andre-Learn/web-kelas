import { useCallback, useState } from 'react';
import { deleteItem, saveItem, saveOrder, uploadImage } from '../lib/api.js';
import { useContent } from '../context/ContentContext.jsx';
import { useToast } from '../components/Toast.jsx';

/**
 * CRUD + reorder for officers, members, or gallery.
 * imageMap maps upload results onto item fields, e.g. { src: 'photo', thumb: 'photoThumb', path: 'photoPath' }.
 */
export default function useCollection(collection, { folder, imageMap, noun }) {
  const { content, update, reload } = useContent();
  const toast = useToast();
  const [stage, setStage] = useState(null);
  const items = content[collection];

  const save = useCallback(
    async (draft, file) => {
      try {
        let record = { ...draft };
        if (file) {
          const up = await uploadImage(file, folder, setStage);
          for (const [from, to] of Object.entries(imageMap)) record[to] = up[from];
        }
        setStage('saving');
        const index = draft.id ? items.findIndex((x) => x.id === draft.id) : items.length;
        const saved = await saveItem(collection, record, index < 0 ? items.length : index);
        if (saved.__reload) {
          await reload();
        } else {
          update(collection, (list) => {
            const at = list.findIndex((x) => x.id === draft.id);
            if (at < 0) return [...list, saved];
            const next = [...list];
            next[at] = saved;
            return next;
          });
        }
        toast.success(draft.id ? `${noun} updated.` : `${noun} added.`);
        return true;
      } catch (err) {
        toast.error(`Not saved: ${err.message}`);
        return false;
      } finally {
        setStage(null);
      }
    },
    [collection, folder, imageMap, items, noun, reload, toast, update],
  );

  const remove = useCallback(
    async (item) => {
      try {
        await deleteItem(collection, item);
        update(collection, (list) => list.filter((x) => x.id !== item.id));
        toast.success(`${noun} removed.`);
        return true;
      } catch (err) {
        toast.error(`Not removed: ${err.message}`);
        return false;
      }
    },
    [collection, noun, toast, update],
  );

  const move = useCallback(
    async (item, step) => {
      const from = items.findIndex((x) => x.id === item.id);
      const to = from + step;
      if (from < 0 || to < 0 || to >= items.length) return;
      const previous = items;
      const next = [...items];
      [next[from], next[to]] = [next[to], next[from]];
      update(collection, next);
      try {
        await saveOrder(collection, next);
      } catch (err) {
        update(collection, previous);
        toast.error(`Order not saved: ${err.message}`);
      }
    },
    [collection, items, toast, update],
  );

  return { items, save, remove, move, stage, busy: stage !== null };
}
