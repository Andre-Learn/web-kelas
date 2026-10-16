import { useEffect } from 'react';
import { useContent } from '../context/ContentContext.jsx';

export default function useDocumentTitle(title) {
  const { content } = useContent();
  const name = content.settings.className;
  useEffect(() => {
    document.title = title ? `${title} · ${name}` : name;
  }, [title, name]);
}
