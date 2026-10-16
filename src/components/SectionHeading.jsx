import { Reveal } from './Reveal.jsx';

export default function SectionHeading({ eyebrow, title, description, as: Heading = 'h2', id, action, align = 'start' }) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      <div className="section-heading__text">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Heading id={id} className="section-heading__title">
          {title}
        </Heading>
        {description ? <p className="section-heading__desc">{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </Reveal>
  );
}
