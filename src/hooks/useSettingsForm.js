import { useCallback, useState } from 'react';
import { removeStoredFiles, saveSettings, storagePathFromUrl, uploadImage } from '../lib/api.js';
import { useContent } from '../context/ContentContext.jsx';
import { useToast } from '../components/Toast.jsx';

// Hero files that may be deleted once nothing points at them. Gallery files are never touched here.
function unusedHeroPaths(previous, next, content) {
  const inUse = new Set(
    [next.heroImage, next.heroImageThumb, ...content.gallery.flatMap((g) => [g.src, g.thumb])].map(storagePathFromUrl).filter(Boolean),
  );
  return [previous.heroImage]
    .map(storagePathFromUrl)
    .filter((p) => p && p.startsWith('hero/') && !inUse.has(p));
}

/**
 * Shared save flow for site settings, with optional single-image upload.
 * `ready` is false until the saved settings have loaded; forms must not save before that,
 * otherwise default values would overwrite real content.
 */
export default function useSettingsForm() {
  const { content, update, status, error, reload } = useContent();
  const toast = useToast();
  const [stage, setStage] = useState(null);
  const ready = status === 'ready';

  const save = useCallback(
    async (patch, { file, imageKey, thumbKey, folder = 'site', message = 'Changes saved.' } = {}) => {
      if (!ready) {
        toast.error('Not saved: the current settings have not loaded yet.');
        return false;
      }
      let uploadedPath = '';
      try {
        let next = { ...content.settings, ...patch };
        if (file && imageKey) {
          const uploaded = await uploadImage(file, folder, setStage);
          uploadedPath = uploaded.path;
          next = { ...next, [imageKey]: uploaded.src, ...(thumbKey ? { [thumbKey]: uploaded.thumb } : {}) };
        }
        setStage('saving');
        await saveSettings(next);
        update('settings', next);
        removeStoredFiles(unusedHeroPaths(content.settings, next, content));
        toast.success(message);
        return true;
      } catch (err) {
        if (uploadedPath) removeStoredFiles([uploadedPath]);
        toast.error(`Not saved: ${err.message}`);
        return false;
      } finally {
        setStage(null);
      }
    },
    [content, ready, update, toast],
  );

  return { settings: content.settings, save, stage, busy: stage !== null, ready, status, error, reload };
}
