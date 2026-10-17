import { Link } from 'react-router-dom';
import { Reveal } from '../Reveal.jsx';
import Icon from '../Icon.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export default function AboutSection() {
  const { content, status } = useContent();
  // Default copy is never shown in place of the real text while it loads.
  const loading = status === 'loading';
  const { about, className } = content.settings;
  const facts = about.facts.filter((f) => f.label && f.value);

  if (loading) {
    return (
      <section id="about" className="section about" aria-busy="true" aria-label="About the class">
        <div className="container about__grid">
          <div className="text-skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <Reveal className="about__lead">
          <p className="eyebrow">About the class</p>
          <h2 id="about-title" className="about__headline">
            {about.headline}
          </h2>
        </Reveal>

        <Reveal className="about__body" delay={0.08}>
          <p className="about__intro">{about.intro}</p>
          <p>{about.identity}</p>
          <Link to="/about" className="text-link">
            More about {className}
            <Icon name="arrowRight" size={16} />
          </Link>
        </Reveal>

        {facts.length ? (
          <Reveal as="dl" className="about__facts" delay={0.14}>
            {facts.map((fact) => (
              <div key={fact.label} className="about__fact">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
