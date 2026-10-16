import { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import { ImagePicker, TextInput, UploadStatus } from '../../components/FormControls.jsx';
import useSettingsForm from '../../hooks/useSettingsForm.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

const ROUTE_HINT = 'A site path such as /members, or a full https:// link.';

function validHref(v) {
  return /^\/[\w\-/#]*$/.test(v) || /^https:\/\/\S+$/.test(v);
}

export default function HeroSettingsPage() {
  useDocumentTitle('Hero settings');
  const { settings, save, stage, busy } = useSettingsForm();
  const [form, setForm] = useState(() => ({
    className: settings.className,
    tagline: settings.tagline,
    heroAlt: settings.heroAlt,
    primaryLabel: settings.ctaPrimary.label,
    primaryHref: settings.ctaPrimary.href,
    secondaryLabel: settings.ctaSecondary.label,
    secondaryHref: settings.ctaSecondary.href,
  }));
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.className.trim()) next.className = 'Enter the class name.';
    if (!form.primaryLabel.trim()) next.primaryLabel = 'Enter a button label.';
    if (!form.secondaryLabel.trim()) next.secondaryLabel = 'Enter a button label.';
    if (!validHref(form.primaryHref)) next.primaryHref = ROUTE_HINT;
    if (!validHref(form.secondaryHref)) next.secondaryHref = ROUTE_HINT;
    setErrors(next);
    if (Object.keys(next).length) return;

    const ok = await save(
      {
        className: form.className.trim(),
        tagline: form.tagline.trim(),
        heroAlt: form.heroAlt.trim(),
        ctaPrimary: { label: form.primaryLabel.trim(), href: form.primaryHref.trim() },
        ctaSecondary: { label: form.secondaryLabel.trim(), href: form.secondaryHref.trim() },
        ...(removeImage && !file ? { heroImage: '', heroImageThumb: '' } : {}),
      },
      { file, imageKey: 'heroImage', thumbKey: 'heroImageThumb', folder: 'hero', message: 'Hero updated.' },
    );
    if (ok) {
      setFile(null);
      setRemoveImage(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Hero" description="The first thing visitors see: the class photo, name, tagline, and two buttons." />
      <form className="admin-form" onSubmit={submit} noValidate>
        <section className="admin-panel form">
          <h2 className="admin-panel__title">Photo</h2>
          <ImagePicker
            label="Hero photograph"
            currentSrc={removeImage ? '' : settings.heroImage}
            file={file}
            onFileChange={(f) => {
              setFile(f);
              if (f) setRemoveImage(false);
            }}
            onRemove={() => setRemoveImage(true)}
            hint="Use a wide landscape photo, at least 1920 px across. Faces near the centre stay visible on phones."
          />
          <TextInput
            label="Photo description"
            optional
            hint="Describes the photo for screen-reader users, for example “The class on the school field after sports day”."
            value={form.heroAlt}
            onChange={set('heroAlt')}
          />
        </section>

        <section className="admin-panel form">
          <h2 className="admin-panel__title">Text</h2>
          <TextInput label="Class name" value={form.className} onChange={set('className')} error={errors.className} />
          <TextInput label="Tagline" value={form.tagline} onChange={set('tagline')} optional />
        </section>

        <section className="admin-panel form">
          <h2 className="admin-panel__title">Buttons</h2>
          <div className="form__row">
            <TextInput label="Primary label" value={form.primaryLabel} onChange={set('primaryLabel')} error={errors.primaryLabel} />
            <TextInput label="Primary destination" value={form.primaryHref} onChange={set('primaryHref')} error={errors.primaryHref} hint={errors.primaryHref ? undefined : ROUTE_HINT} />
          </div>
          <div className="form__row">
            <TextInput label="Secondary label" value={form.secondaryLabel} onChange={set('secondaryLabel')} error={errors.secondaryLabel} />
            <TextInput
              label="Secondary destination"
              value={form.secondaryHref}
              onChange={set('secondaryHref')}
              error={errors.secondaryHref}
              hint={errors.secondaryHref ? undefined : ROUTE_HINT}
            />
          </div>
        </section>

        <div className="admin-form__bar">
          <UploadStatus stage={stage} />
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save hero'}
          </button>
        </div>
      </form>
    </>
  );
}
