import 'server-only'

import sanitizeHtml from 'sanitize-html'

// Teks produk datang dari merchant. `description` adalah HTML (lihat OpenAPI); `short_description`
// di data nyata juga sering berisi HTML dan entitas (`<p>`, `&amp;`).

/** HTML deskripsi yang aman dirender dengan dangerouslySetInnerHTML. */
export function sanitizeDescription(html: string | null): string {
  if (!html) return ''
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'img', 'span'],
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt'] },
    allowedSchemes: ['https', 'mailto'],
    allowedSchemesByTag: { img: ['https'] },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' }),
      h1: 'h2',
    },
  })
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

/** Teks polos satu paragraf (untuk ringkasan di kartu produk dan meta description). */
export function plainText(html: string | null, maxLength = 200): string | null {
  if (!html) return null
  const text = decodeEntities(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return null
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text
}
