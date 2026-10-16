import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import Hero from '../components/Hero'
import SectionHeading from '../components/SectionHeading'
import ProfileCard from '../components/ProfileCard'
import { CLASS_PROFILE, OFFICERS, MEMBERS, GALLERY } from '../data/placeholders'
import { thumbSrc, originalSrc } from '../lib/images'

export default function Home() {
  return (
    <>
      <Hero />
      <section className="section" id="tentang" aria-labelledby="tentang-title">
        <div className="container about-grid">
          <div>
            <SectionHeading kicker="Tentang" title="Kelas yang tumbuh bersama" id="tentang-title" />
            <p className="lead">{CLASS_PROFILE.about}</p>
          </div>
          <dl className="about-facts">
            <div>
              <dt>Konsentrasi</dt>
              <dd>Teknik Jaringan Komputer dan Telekomunikasi</dd>
            </div>
            <div>
              <dt>Jenjang</dt>
              <dd>Kelas XI SMK</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section section-alt" id="struktur" aria-labelledby="struktur-title">
        <div className="container">
          <SectionHeading kicker="Struktur" title="Pengurus kelas" id="struktur-title" />
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
          <Link className="text-link" to={ROUTES.structure}>Lihat struktur lengkap</Link>
        </div>
      </section>

      <section className="section" id="anggota" aria-labelledby="anggota-title">
        <div className="container">
          <SectionHeading kicker="Anggota" title="Wajah-wajah di balik kelas" id="anggota-title" />
          <div className="member-grid">
            {MEMBERS.slice(0, 8).map((member) => (
              <ProfileCard key={member.id} {...member} role={`Absen ${member.number}`} />
            ))}
          </div>
          <Link className="text-link" to={ROUTES.members}>Lihat semua anggota</Link>
        </div>
      </section>

      <GallerySection />
    </>
  )
}

function GallerySection() {
  const [lightbox, setLightbox] = useState(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (lightbox === null) return
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') setLightbox(null)
      if (event.key === 'ArrowRight') setLightbox((index) => Math.min(index + 1, GALLERY.length - 1))
      if (event.key === 'ArrowLeft') setLightbox((index) => Math.max(index - 1, 0))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox !== null])

  return (
    <section className="section section-alt" id="galeri" aria-labelledby="galeri-title">
      <div className="container">
        <SectionHeading kicker="Galeri" title="Memori yang tersimpan" id="galeri-title" />
        <div className="gallery-grid">
          {GALLERY.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`gallery-item ${item.ratio}`}
              onClick={() => setLightbox(index)}
            >
              <img
                src={thumbSrc(item.id)}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width={item.ratio === 'portrait' ? 600 : 800}
                height={item.ratio === 'portrait' ? 800 : 560}
              />
            </button>
          ))}
        </div>
        <Link className="text-link" to={ROUTES.gallery}>Lihat galeri penuh</Link>
      </div>

      {lightbox !== null && GALLERY[lightbox] && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={GALLERY[lightbox].alt}>
          <button ref={closeRef} type="button" className="lightbox-close" onClick={() => setLightbox(null)}>Tutup</button>
          <img src={originalSrc(GALLERY[lightbox].id)} alt={GALLERY[lightbox].alt} />
          {GALLERY[lightbox].caption && <p>{GALLERY[lightbox].caption}</p>}
        </div>
      )}
    </section>
  )
}
