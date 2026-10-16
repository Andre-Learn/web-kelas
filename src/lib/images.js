const BASE = '/img'

/* Ship original + thumbnail pairs from /public/img so the gallery and cards
   never download a full photo where a thumb is enough (PRD 6.5, PRD 13). */
export function originalSrc(id) {
  return `${BASE}/${id}.jpg`
}

export function thumbSrc(id) {
  return `${BASE}/${id}-thumb.jpg`
}

/* Class photo fallbacks as inline SVG data URIs: they render everywhere and
   load nothing over the network. Placeholder state only, swapped for real
   photos through the admin dashboard. */
export function classPhotoFallback(kind, label) {
  const text = encodeURIComponent(label)
  const palettes = {
    hero: ['#EEF2F7', '#8B5CF6'],
    portrait: ['#E2E8F0', '#64748B'],
    landscape: ['#EEF2F7', '#64748B'],
  }
  const [bg, fg] = palettes[kind] || palettes.landscape
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="${bg}"/><text x="2" y="1.7" font-family="sans-serif" font-size="0.32" font-weight="700" text-anchor="middle" fill="${fg}">${text}</text></svg>`
  return `data:image/svg+xml,${svg.replace(/#/g, '%23').replace(/"/g, "'")}`
}

export function memberPhotoFallback(name) {
  const text = encodeURIComponent(name)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="#E2E8F0"/><text x="0.5" y="0.58" font-family="sans-serif" font-size="0.2" font-weight="700" text-anchor="middle" fill="#64748B">${text}</text></svg>`
  return `data:image/svg+xml,${svg.replace(/#/g, '%23').replace(/"/g, "'")}`
}
