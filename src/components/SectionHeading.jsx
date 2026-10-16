export default function SectionHeading({ kicker, title, lead, id, align = 'start' }) {
  return (
    <div className={`section-heading align-${align}`}>
      {kicker && <p className="kicker">{kicker}</p>}
      <h2 id={id}>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  )
}
