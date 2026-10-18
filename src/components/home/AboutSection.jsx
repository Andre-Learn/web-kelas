import { Link } from 'react-router-dom';
import { Reveal } from '../Reveal.jsx';
import { Eyebrow } from '../SectionHeading.jsx';
import Icon from '../Icon.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export default function AboutSection() {
  const { content, status } = useContent();
  // Default copy is never shown in place of the real text while it loads.
  const loading = status === 'loading';
  const { about, className } = content.settings;

  // Counts come from published content; an empty count is left out rather than shown as 0.
  const stats = [
    { label: content.members.length === 1 ? 'Member' : 'Members', value: content.members.length },
    { label: content.gallery.length === 1 ? 'Photo' : 'Photos', value: content.gallery.length },
    { label: content.officers.length === 1 ? 'Officer' : 'Officers', value: content.officers.length },
    { label: 'Since', value: about.founded },
  ].filter((s) => s.value);

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
          <Eyebrow index="01">About</Eyebrow>
          <h2 id="about-title" className="about__headline">
            {about.headline}
          </h2>
        </Reveal>

        <Reveal className="about__body" delay={0.08}>
          <p className="about__program mono">Teknik Jaringan Komputer dan Telekomunikasi</p>
          <p className="about__intro">{about.intro}</p>
          <p>{about.identity}</p>
          <Link to="/about" className="text-link">
            More about {className}
            <Icon name="arrowRight" size={16} />
          </Link>
        </Reveal>

        {stats.length ? (
          <Reveal as="dl" className="about__facts" delay={0.14}>
            {stats.map((stat) => (
              <div key={stat.label} className="about__fact">
                <dt>{stat.label}</dt>
                <dd className="mono">{stat.value}</dd>
              </div>
            ))}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
