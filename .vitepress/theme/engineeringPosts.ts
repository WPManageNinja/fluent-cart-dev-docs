// Shared loader factory for the Engineering blog.
//
// Both `.vitepress/theme/engineering.data.ts` (index page / components) and
// `.vitepress/genFeed.ts` (RSS at buildEnd) build their loader through this
// factory so the frontmatter contract, exclusions, reading time, and sort
// order live in exactly one place.
//
// NOTE: createContentLoader() must be *called* while a VitePress process is
// active (dev, build, or buildEnd) — that's why this module only exports a
// factory instead of a ready-made loader.

import { createContentLoader } from 'vitepress'

export interface PostDate {
  /** Epoch ms — used for sorting and RSS dates */
  time: number
  /** ISO 8601 string for <time datetime> */
  iso: string
  /** Human-readable, e.g. "July 10, 2026" (formatted in UTC so builds are deterministic) */
  string: string
}

export interface EngineeringPost {
  url: string
  title: string
  date: PostDate
  author: string
  authorTitle?: string
  tags: string[]
  description: string
  excerpt?: string
  /** Minutes, word count / 200, minimum 1 */
  readingTime: number
  /** Full rendered HTML — only present when the loader is created with { render: true } (RSS) */
  html?: string
}

/** Pages inside docs/engineering/ that are not posts */
const EXCLUDED_URLS = [
  '/engineering/',
  '/engineering/index.html',
  '/engineering/AUTHORING',
  '/engineering/AUTHORING.html'
]

export const WORDS_PER_MINUTE = 200

function readingTimeOf(src: string | undefined): number {
  if (!src) return 1
  // Strip the frontmatter block, count the rest (prose + code)
  const body = src.replace(/^---[\s\S]*?---/, '')
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function normalizeDate(raw: unknown): PostDate {
  // YAML `date: 2026-07-10` arrives as a Date; quoted dates arrive as strings
  const date = raw instanceof Date ? raw : new Date(String(raw ?? ''))
  if (Number.isNaN(date.getTime())) {
    return { time: 0, iso: '', string: 'Undated' }
  }
  return {
    time: date.getTime(),
    iso: date.toISOString(),
    string: date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

export function createEngineeringLoader(options: { render?: boolean } = {}) {
  return createContentLoader('engineering/*.md', {
    excerpt: true,
    includeSrc: true,
    render: options.render === true,
    transform(raw): EngineeringPost[] {
      return raw
        .filter(({ url }) => !EXCLUDED_URLS.includes(url))
        .map(({ url, frontmatter, excerpt, src, html }): EngineeringPost => ({
          url,
          title: frontmatter.title || url,
          date: normalizeDate(frontmatter.date),
          author: frontmatter.author || 'FluentCart Team',
          authorTitle: frontmatter.authorTitle || undefined,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
          description: frontmatter.description || '',
          excerpt: excerpt || undefined,
          readingTime: readingTimeOf(src),
          html: options.render === true ? html : undefined
        }))
        .sort((a, b) => b.date.time - a.date.time)
    }
  })
}
