// Starting content shown before an administrator publishes real data.
// Everything here is either derived from the class name itself or left empty on purpose:
// names, photos, and memories must come from the class, not from this file.

export const ACCENT_OPTIONS = [
  { id: 'teal', label: 'Teal (brand)' },
  { id: 'violet', label: 'Violet' },
  { id: 'rose', label: 'Rose' },
  { id: 'amber', label: 'Amber' },
];

export const OFFICER_TIERS = [
  { id: 'teacher', label: 'Homeroom teacher' },
  { id: 'core', label: 'Core officers' },
  { id: 'officer', label: 'Officers' },
];

export const PUBLIC_ROUTES = [
  { to: '/', label: 'Home' },
  { to: '/structure', label: 'Structure' },
  { to: '/members', label: 'Members' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
];

export const defaultSettings = {
  className: 'XI TJKT-1',
  tagline: 'One Class, One Story, Endless Memories.',
  heroImage: '',
  heroImageThumb: '',
  heroAlt: '',
  ctaPrimary: { label: 'Meet Our Class', href: '/members' },
  ctaSecondary: { label: 'Explore Memories', href: '/gallery' },
  accent: 'teal',
  // Footer details. Left empty until the class fills them in; empty lines are hidden.
  school: '',
  city: '',
  credits: '',
  about: {
    headline: 'A class that grows by staying connected.',
    intro:
      'XI TJKT-1 is an eleventh-grade class in the TJKT program: Teknik Jaringan Komputer dan Telekomunikasi, or Computer Network and Telecommunication Engineering.',
    identity:
      'This website is our shared space: a place to meet the people in our class, see how the class is organised, and keep the moments we spend together.',
    community:
      'Names and photos are published only with permission. If something here should be corrected or removed, ask a class administrator.',
    story: '',
    // Year the class started, e.g. "2024". Shown with the counts on the homepage when set.
    founded: '',
    facts: [
      { label: 'Grade', value: 'XI' },
      { label: 'Program', value: 'TJKT' },
      { label: 'Class', value: '1' },
    ],
  },
};

// Suggested roles an administrator can add in one step from Structure settings.
// They are never shown publicly until they have been saved as real records.
export const STARTER_ROLES = [
  { name: '', role: 'Homeroom Teacher', tier: 'teacher', description: '', photo: '' },
  { name: '', role: 'Class President', tier: 'core', description: '', photo: '' },
  { name: '', role: 'Vice President', tier: 'core', description: '', photo: '' },
  { name: '', role: 'Secretary', tier: 'officer', description: '', photo: '' },
  { name: '', role: 'Treasurer', tier: 'officer', description: '', photo: '' },
];

export const defaultContent = {
  settings: defaultSettings,
  officers: [],
  members: [],
  gallery: [],
};
