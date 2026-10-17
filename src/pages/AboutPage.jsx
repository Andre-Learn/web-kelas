import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { Reveal } from '../components/Reveal.jsx';
import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import { LoadingState } from '../components/States.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useContent } from '../context/ContentContext.jsx';

export default function AboutPage() {
  useDocumentTitle('About');
  const { content, status } = useContent();
  // Default copy is never shown in place of the real text while it loads.
  const loading = status === 'loading';
  const { about, className, heroImage, heroAlt } = content.settings;
  const story = about.story
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const facts = about.facts.filter((f) => f.label && f.value);

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Our class" title={`About ${className}`} />
        <section className="section section--tight" aria-busy="true">
          <div className="container">
            <LoadingState label="Loading the class story…" />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Our class" title={`About ${className}`} description={about.headline} />

      <section className="section section--tight">
        <div className="container about-page">
          <Reveal className="about-page__media">
            <Photo
              src={heroImage}
              alt={heroImage ? heroAlt || `${className} class photo` : 'Class photo placeholder'}
              ratio="4 / 3"
              className="about-page__photo"
            />
          </Reveal>

          <Reveal as="article" className="prose" delay={0.06}>
            <h2>Who we are</h2>
            <p>{about.intro}</p>
            <p>{about.identity}</p>
            {story.length ? (
              <>
                <h2>Our story</h2>
                {story.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </>
            ) : null}
            <h2>Our community</h2>
            <p>{about.community}</p>
          </Reveal>
        </div>
      </section>

      {facts.length ? (
        <section className="section section--alt section--tight" aria-labelledby="facts-title">
          <div className="container">
            <h2 id="facts-title" className="sr-only">
              Class facts
            </h2>
            <dl className="fact-row">
              {facts.map((fact) => (
                <div key={fact.label} className="fact-row__item">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <section className="section section--tight">
        <div className="container about-next">
          <Link to="/structure" className="about-next__link">
            <span className="eyebrow">Next</span>
            <span className="about-next__title">See how the class is organised</span>
            <Icon name="arrowRight" size={20} />
          </Link>
          <Link to="/gallery" className="about-next__link">
            <span className="eyebrow">Or</span>
            <span className="about-next__title">Browse our memories</span>
            <Icon name="arrowRight" size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
