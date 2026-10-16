// Real data lives in Supabase once configured; until then these serve as
// labeled placeholders (PRD 15, R-23: no invented names or photos).
export const CLASS_PROFILE = {
  name: 'XI TJKT-1',
  tagline: 'One Class, One Story, Endless Memories.',
  about: 'Teknik Jaringan Komputer dan Telekomunikasi. Kelas belajar jaringan, komputer, dan telekomunikasi, satu kelas satu cerita. [REAL DATA: teks ini diganti deskripsi kelas dari dashboard admin.]',
  stats: null,
}

export const OFFICERS = [
  {
    id: 'placeholder-1',
    name: '[NAMA GURU BK]',
    role: 'Guru BK',
    description: null,
    photo: null,
    kind: 'teacher',
  },
  {
    id: 'placeholder-2',
    name: '[NAMA KETUA KELAS]',
    role: 'Ketua Kelas',
    description: null,
    photo: null,
    kind: 'president',
  },
  {
    id: 'placeholder-3',
    name: '[NAMA WAKIL KETUA]',
    role: 'Wakil Ketua',
    description: null,
    photo: null,
    kind: 'vice',
  },
  {
    id: 'placeholder-4',
    name: '[NAMA SEKRETARIS]',
    role: 'Sekretaris',
    description: null,
    photo: null,
    kind: 'officer',
  },
  {
    id: 'placeholder-5',
    name: '[NAMA BENDAHARA]',
    role: 'Bendahara',
    description: null,
    photo: null,
    kind: 'officer',
  },
]

export const MEMBERS = Array.from({ length: 12 }, (_, index) => ({
  id: `placeholder-member-${index + 1}`,
  name: `[NAMA SISWA ${index + 1}]`,
  number: index + 1,
  photo: null,
}))

export const GALLERY = Array.from({ length: 8 }, (_, index) => ({
  id: `placeholder-photo-${index + 1}`,
  src: null,
  alt: `[DOKUMENTASI ${index + 1}]`,
  caption: null,
  date: null,
  ratio: index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'square' : 'landscape',
}))
