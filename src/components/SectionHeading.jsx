import { Reveal } from './Reveal.jsx';

export function Eyebrow({ index, children }) {
  if (!index) return <p className="eyebrow">{children}</p>;
  return (
    <p className="eyebrow eyebrow--indexed">
      <span className="eyebrow__index">{index} /</span> {children}
    </p>
  );
}

export default function SectionHeading({ eyebrow, index, title, description, as: Heading = 'h2', id, action, align = 'start' }) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      <div className="section-heading__text">
        {eyebrow ? <Eyebrow index={index}>{eyebrow}</Eyebrow> : null}
        <Heading id={id} className="section-heading__title">
          {title}
        </Heading>
        {description ? <p className="section-heading__desc">{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </Reveal>
  );
}
