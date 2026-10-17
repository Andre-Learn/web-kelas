import { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import { TextArea, TextInput } from '../../components/FormControls.jsx';
import Icon from '../../components/Icon.jsx';
import ContentGate from '../../components/admin/ContentGate.jsx';
import useSettingsForm from '../../hooks/useSettingsForm.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

export default function AboutManagerPage() {
  useDocumentTitle('About settings');
  return (
    <>
      <AdminPageHeader title="About" description="The class introduction on the homepage and the longer story on the About page." />
      <ContentGate what="About content">
        <AboutForm />
      </ContentGate>
    </>
  );
}

function storyParagraphs(story) {
  return (story || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function AboutForm() {
  const { settings, save, busy, ready } = useSettingsForm();
  const [about, setAbout] = useState(() => structuredClone(settings.about));
  const [error, setError] = useState('');

  const set = (key) => (e) => setAbout((a) => ({ ...a, [key]: e.target.value }));
  const setFact = (i, key) => (e) =>
    setAbout((a) => ({ ...a, facts: a.facts.map((f, j) => (j === i ? { ...f, [key]: e.target.value } : f)) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!about.intro.trim()) {
      setError('Write a short introduction.');
      return;
    }
    setError('');
    await save({ about: { ...about, facts: about.facts.filter((f) => f.label.trim() && f.value.trim()) } }, { message: 'About section updated.' });
  };

  const story = storyParagraphs(about.story);
  const facts = about.facts.filter((f) => f.label.trim() && f.value.trim());

  return (
      <div className="split">
        <form className="admin-form" onSubmit={submit} noValidate>
          <section className="admin-panel form">
            <h2 className="admin-panel__title">Introduction</h2>
            <TextInput label="Headline" value={about.headline} onChange={set('headline')} />
            <TextArea label="Introduction" rows={3} value={about.intro} onChange={set('intro')} error={error} />
            <TextArea label="Identity and background" rows={3} value={about.identity} onChange={set('identity')} />
            <TextArea label="Community statement" rows={3} value={about.community} onChange={set('community')} />
            <TextArea
              label="Our story"
              optional
              rows={8}
              value={about.story}
              onChange={set('story')}
              hint="Shown on the About page only. Leave a blank line between paragraphs."
            />
          </section>

          <section className="admin-panel form">
            <h2 className="admin-panel__title">Class facts</h2>
            <p className="field__hint">Only add facts you can confirm. Empty rows are not shown.</p>
            {about.facts.map((fact, i) => (
              <div className="form__row form__row--fact" key={i}>
                <TextInput label="Label" value={fact.label} onChange={setFact(i, 'label')} />
                <TextInput label="Value" value={fact.value} onChange={setFact(i, 'value')} />
                <button
                  type="button"
                  className="btn btn--icon btn--ghost form__row-remove"
                  aria-label={`Remove fact ${fact.label || i + 1}`}
                  onClick={() => setAbout((a) => ({ ...a, facts: a.facts.filter((_, j) => j !== i) }))}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
            {about.facts.length < 6 ? (
              <button type="button" className="btn btn--sm" onClick={() => setAbout((a) => ({ ...a, facts: [...a.facts, { label: '', value: '' }] }))}>
                <Icon name="plus" size={16} />
                Add fact
              </button>
            ) : null}
          </section>

          <div className="admin-form__bar">
            <button type="submit" className="btn btn--primary" disabled={busy || !ready}>
              {busy ? 'Saving…' : 'Save about'}
            </button>
          </div>
        </form>

        <aside className="admin-panel preview" aria-labelledby="about-preview-title">
          <p className="preview__label" id="about-preview-title">
            <Icon name="eye" size={14} />
            Preview, unsaved changes included
          </p>

          <div className="preview__block">
            <p className="preview__where">Homepage section</p>
            <p className="eyebrow">About the class</p>
            <h3 className="preview__headline">{about.headline || <span className="muted">No headline</span>}</h3>
            <p className="preview__lead">{about.intro || <span className="muted">Introduction is required</span>}</p>
            {about.identity ? <p className="muted">{about.identity}</p> : null}
            {facts.length ? (
              <dl className="preview__facts">
                {facts.map((f, i) => (
                  <div key={`${f.label}-${i}`}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <div className="preview__block">
            <p className="preview__where">About page</p>
            <h4 className="preview__subhead">Our story</h4>
            {story.length ? (
              story.map((p, i) => (
                <p key={i} className="preview__text">
                  {p}
                </p>
              ))
            ) : (
              <p className="muted preview__text">No story yet. This heading is hidden on the site until you write one.</p>
            )}
            <h4 className="preview__subhead">Our community</h4>
            <p className="preview__text">{about.community || <span className="muted">Empty</span>}</p>
          </div>
        </aside>
      </div>
  );
}
