// Client-side helpers shared by the engineering blog components.

/** "Shahjahan Jewel" → "SJ" — used for the CSS-only author avatar circles */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return (first + last).toUpperCase()
}
