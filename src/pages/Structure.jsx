import SectionHeading from '../components/SectionHeading'
import ProfileCard from '../components/ProfileCard'
import { OFFICERS } from '../data/placeholders'

export default function Structure() {
  return (
    <section className="section page-section">
      <div className="container">
        <SectionHeading kicker="Struktur" title="Pengurus dan tanggung jawabnya" id="struktur-title" />
        <div className="structure-tier">
          <ProfileCard {...OFFICERS.find((officer) => officer.kind === 'teacher')} photoKind="landscape" />
          <div className="structure-pair">
            <ProfileCard {...OFFICERS.find((officer) => officer.kind === 'president')} />
            <ProfileCard {...OFFICERS.find((officer) => officer.kind === 'vice')} />
          </div>
        </div>
        <div className="structure-row">
          {OFFICERS.filter((officer) => officer.kind === 'officer').map((officer) => (
            <ProfileCard key={officer.id} {...officer} />
          ))}
        </div>
      </div>
    </section>
  )
}
