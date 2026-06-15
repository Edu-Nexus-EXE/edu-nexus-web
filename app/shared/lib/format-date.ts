// Shared date formatters. BE trả ISO 8601 (vd "2026-06-11T08:03:58.64089Z").
// Hiển thị theo locale, guard giá trị rỗng/không hợp lệ (an toàn SSR).

function toLocale(lang?: string): string {
  return lang === 'en' ? 'en-US' : 'vi-VN'
}

function toDate(value: unknown): Date | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Date only, e.g. 11/06/2026 (vi) hoặc Jun 11, 2026 (en). */
export function formatDate(value: unknown, lang?: string): string {
  const d = toDate(value)
  if (!d) return '—'
  return new Intl.DateTimeFormat(toLocale(lang), { dateStyle: 'medium' }).format(d)
}

/** Date + time, e.g. 11/06/2026 15:03. */
export function formatDateTime(value: unknown, lang?: string): string {
  const d = toDate(value)
  if (!d) return '—'
  return new Intl.DateTimeFormat(toLocale(lang), { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
