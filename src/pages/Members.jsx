import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import ProfileCard from '../components/ProfileCard'
import { EmptyState } from '../components/States'
import { MEMBERS } from '../data/placeholders'

export default function Members() {
  const [query, setQuery] = useState('')

  const filtered = MEMBERS.filter((member) =>
    member.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <section className="section page-section">
      <div className="container">
        <SectionHeading kicker="Anggota" title="Semua anggota kelas" id="anggota-title" />
        <div className="search-field">
          <label htmlFor="member-search">Cari anggota</label>
          <input
            id="member-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ketik nama..."
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            title="Tidak ada hasil"
            description={`Tidak ada anggota bernama "${query}". Coba kata kunci lain.`}
          />
        ) : (
          <div className="member-grid">
            {filtered.map((member) => (
              <ProfileCard key={member.id} {...member} role={`Absen ${member.number}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
