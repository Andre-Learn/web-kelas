import SectionHeading from '../components/SectionHeading'
import { CLASS_PROFILE } from '../data/placeholders'

export default function About() {
  return (
    <section className="section page-section">
      <div className="container about-column">
        <SectionHeading kicker="Tentang" title="Tentang XI TJKT-1" id="tentang-title" />
        <p className="lead">{CLASS_PROFILE.about}</p>
        <dl className="about-facts">
          <div>
            <dt>Konsentrasi keahlian</dt>
            <dd>Teknik Jaringan Komputer dan Telekomunikasi</dd>
          </div>
          <div>
            <dt>Jenjang</dt>
            <dd>Kelas XI SMK</dd>
          </div>
          <div>
            <dt>Motto</dt>
            <dd>{CLASS_PROFILE.tagline}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
