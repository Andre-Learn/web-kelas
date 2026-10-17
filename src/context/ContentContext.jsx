import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchContent } from '../lib/api.js';
import { defaultContent } from '../data/defaultContent.js';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setStatus((s) => (s === 'error' ? 'loading' : s));
    try {
      const data = await fetchContent();
      setContent(data);
      setStatus('ready');
      setError('');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Content could not be loaded.');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Accent is a site-wide setting chosen by administrators.
  useEffect(() => {
    const accent = content.settings.accent || 'violet';
    document.documentElement.dataset.accent = accent;
    try {
      localStorage.setItem('tjkt:accent', accent);
    } catch {
      /* ignore */
    }
  }, [content.settings.accent]);

  const update = useCallback((key, value) => {
    setContent((current) => ({ ...current, [key]: typeof value === 'function' ? value(current[key]) : value }));
  }, []);

  const value = useMemo(() => ({ content, status, error, reload, update }), [content, status, error, reload, update]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside ContentProvider');
  return ctx;
}
