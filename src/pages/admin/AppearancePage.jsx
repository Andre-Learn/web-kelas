import { useEffect, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import { TextInput, UploadStatus } from '../../components/FormControls.jsx';
import ContentGate from '../../components/admin/ContentGate.jsx';
import HeroImageField, { EMPTY_HERO_IMAGE, heroImagePatch } from '../../components/admin/HeroImageField.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { ACCENT_OPTIONS } from '../../data/defaultContent.js';
import useSettingsForm from '../../hooks/useSettingsForm.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

export default function AppearancePage() {
  useDocumentTitle('Appearance');
  return (
    <>
      <AdminPageHeader title="Appearance" description="Site-wide identity and accent colour. Visitors still choose light or dark mode for themselves." />
      <ContentGate what="appearance settings">
        <AppearanceForm />
      </ContentGate>
    </>
  );
}

function AppearanceForm() {
  const { settings, save, stage, busy, ready } = useSettingsForm();
  const [accent, setAccent] = useState(settings.accent);
  const [className, setClassName] = useState(settings.className);
  const [tagline, setTagline] = useState(settings.tagline);
  const [image, setImage] = useState(EMPTY_HERO_IMAGE);
  const [error, setError] = useState('');

  const preview = (id) => {
    setAccent(id);
    document.documentElement.dataset.accent = id;
  };

  // Leaving without saving must not keep the previewed accent.
  const savedAccent = settings.accent;
  useEffect(() => () => {
    document.documentElement.dataset.accent = savedAccent;
  }, [savedAccent]);

  const submit = async (e) => {
    e.preventDefault();
    if (!className.trim()) {
      setError('Enter the class name.');
      return;
    }
    setError('');
    const { patch, upload } = heroImagePatch(image);
    const ok = await save({ accent, className: className.trim(), tagline: tagline.trim(), ...patch }, { ...upload, message: 'Appearance saved.' });
    if (ok) setImage(EMPTY_HERO_IMAGE);
  };

  return (
      <form className="admin-form" onSubmit={submit} noValidate>
        <section className="admin-panel form">
          <h2 className="admin-panel__title">Accent colour</h2>
          <fieldset className="swatches">
            <legend className="field__hint">Used for buttons, links, and highlights. Each option meets contrast requirements in both themes.</legend>
            {ACCENT_OPTIONS.map((o) => (
              <label key={o.id} className="swatch" data-swatch={o.id}>
                <input type="radio" name="accent" value={o.id} checked={accent === o.id} onChange={() => preview(o.id)} />
                <span className="swatch__dot" aria-hidden="true" />
                {o.label}
              </label>
            ))}
          </fieldset>
          <div className="accent-preview">
            <span className="btn btn--primary btn--sm" aria-hidden="true">
              Primary button
            </span>
            <span className="eyebrow">Section label</span>
            <span className="accent-preview__theme">
              Check both themes
              <ThemeToggle />
            </span>
          </div>
        </section>

        <section className="admin-panel form">
          <h2 className="admin-panel__title">Identity</h2>
          <TextInput label="Class name" value={className} onChange={(e) => setClassName(e.target.value)} error={error} />
          <TextInput label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} optional />
          <HeroImageField value={image} onChange={setImage} allowRemove={false} hint="Same image as Hero settings. Upload a wide landscape photo or reuse one from the gallery." />
        </section>

        <div className="admin-form__bar">
          <UploadStatus stage={stage} />
          {accent !== settings.accent ? (
            <button type="button" className="btn btn--ghost" onClick={() => preview(settings.accent)} disabled={busy}>
              Reset accent
            </button>
          ) : null}
          <button type="submit" className="btn btn--primary" disabled={busy || !ready}>
            {busy ? 'Saving…' : 'Save appearance'}
          </button>
        </div>
      </form>
  );
}
