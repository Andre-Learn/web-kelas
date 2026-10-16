import { useCallback, useState } from 'react';
import { saveSettings, uploadImage } from '../lib/api.js';
import { useContent } from '../context/ContentContext.jsx';
import { useToast } from '../components/Toast.jsx';

/** Shared save flow for site settings, with optional single-image upload. */
export default function useSettingsForm() {
  const { content, update } = useContent();
  const toast = useToast();
  const [stage, setStage] = useState(null);

  const save = useCallback(
    async (patch, { file, imageKey, thumbKey, folder = 'site', message = 'Changes saved.' } = {}) => {
      try {
        let next = { ...content.settings, ...patch };
        if (file && imageKey) {
          const uploaded = await uploadImage(file, folder, setStage);
          next = { ...next, [imageKey]: uploaded.src, ...(thumbKey ? { [thumbKey]: uploaded.thumb } : {}) };
        }
        setStage('saving');
        await saveSettings(next);
        update('settings', next);
        toast.success(message);
        return true;
      } catch (err) {
        toast.error(`Not saved: ${err.message}`);
        return false;
      } finally {
        setStage(null);
      }
    },
    [content.settings, update, toast],
  );

  return { settings: content.settings, save, stage, busy: stage !== null };
}
