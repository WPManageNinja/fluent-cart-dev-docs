# Engineering Blog — Implementation Plan

A blog where FluentCart engineers publish engineering articles, built **into the existing
VitePress dev-docs site** and deployed on **Cloudflare Pages**. Lives at `/engineering/`.

## Guiding decisions (already made)

- **Slug:** `/engineering` (not `/blog`) — signals "written by our engineers."
- **Location:** inside the existing `fluent-cart-dev-docs` VitePress site, **not** a separate repo.
- **Theme approach:** build a small "blog module" **into the existing custom theme**
  (`.vitepress/theme/`). Do **NOT** drop in a full third-party blog theme
  (e.g. `@sugarat/theme`) — this site already has a custom `Layout` override plus the
  `vitepress-openapi` client theme, Mermaid, FluentComments, and a chat widget. A drop-in
  theme would fight the existing `Layout` and likely break the API playground.
- **Comments:** already solved. `<fluent-comments>` is wired globally in
  `.vitepress/theme/index.ts` and renders on every content page (dark/light synced).
  Posts get comments for free. Set `comments: false` in a post's frontmatter to opt out.
- **Infra:** Cloudflare **Pages** (static). No Worker needed. Pages Functions are available
  later if we ever want dynamic pieces (view counts, OG images).
- **Branch:** `feat/engineering-blog` on the `fluent-cart-dev-docs` repo.

## Key facts about the codebase (verified)

- `srcDir: "docs"` in `.vitepress/config.mts` → post files live in `docs/engineering/`,
  content-loader glob is `engineering/*.md`.
- Nav is `themeConfig.nav` (array) in `.vitepress/config.mts` (~line 417).
- A `buildEnd(siteConfig)` hook already exists (~line 683) — hang RSS generation off it.
- No `sitemap`/`hostname` is currently configured — RSS needs an absolute base URL, so add a
  `hostname` constant (production docs domain, e.g. `https://docs.fluentcart.com`).
- Custom theme entry: `.vitepress/theme/index.ts` (`extends: DefaultTheme`, custom `Layout`).
- Existing theme components live in `.vitepress/theme/components/` (e.g. `Mermaid.vue`).

## Deliverables

1. **`docs/engineering/` directory** — one markdown file per post.
   Post frontmatter contract:
   ```yaml
   ---
   title: Post Title
   date: 2026-07-10          # ISO date, drives ordering + RSS
   author: Jane Doe
   authorTitle: Senior Engineer   # optional
   tags: [orders, performance]
   description: One-line summary for cards, SEO, and RSS.
   comments: true            # optional; defaults on
   ---
   ```

2. **`docs/engineering/index.md`** — the blog landing page. Uses `layout: page` (or a custom
   layout) and renders the post list component.

3. **`docs/engineering/[tag].md` or a `TagPage` component** — tag filtering. Simplest first
   pass: a single index with client-side tag filter chips (no dynamic routes needed).

4. **`.vitepress/theme/engineering.data.ts`** — a `createContentLoader('engineering/*.md', …)`
   loader that returns `{ url, title, date, author, tags, description, excerpt }[]`, sorted by
   date desc, excluding `index.md` and `AUTHORING.md`. Single source of truth for the index,
   tag filter, and RSS.

5. **Theme components** (added under `.vitepress/theme/components/`, registered in
   `.vitepress/theme/index.ts` via `enhanceApp`):
   - `PostList.vue` — card list (title, date, author, reading time, tags, excerpt).
   - `PostMeta.vue` — byline + date + reading time, rendered at the top of each post.
   - `TagFilter.vue` — clickable tag chips that filter the list.
   - Reading time = word count / 200, computed in the loader or component.

6. **RSS feed** — generate `dist/engineering/feed.rss` (RSS 2.0) inside the existing
   `buildEnd` hook using the `feed` npm package (add as devDependency), reading the same
   frontmatter the loader uses. Add `<link rel="alternate" type="application/rss+xml">` to
   `head` so readers autodiscover it.

7. **Nav entry** — add `{ text: 'Engineering', link: '/engineering/' }` to `themeConfig.nav`.

8. **`docs/engineering/AUTHORING.md`** — engineer-facing guide: "copy the template, fill
   frontmatter, drop your `.md` in `docs/engineering/`, open a PR, it's live on merge."
   Include the frontmatter contract and a sample post.

9. **One seed post** — a real first article (e.g. "Why FluentCart uses a custom schema, not
   WooCommerce") so the index isn't empty and authors have a working example to copy.

10. **Cloudflare Pages** — documented in the PR description (account owner connects the
    `fluent-cart-dev-docs` GitHub repo in the CF dashboard):
    - Build command: `npm run docs:build`
    - Output directory: `.vitepress/dist`
    - Node version: match local (Node 20+).
    (No code change strictly required, but add a short `DEPLOY.md` note.)

## Constraints / guardrails

- **Do not** modify or remove the OpenAPI, Mermaid, FluentComments, or chat-widget wiring in
  `.vitepress/theme/index.ts` — only *add* to `enhanceApp`/globals.
- **Do not** add a second full theme or replace `Layout`.
- Keep PHP-side plugin code untouched — this is entirely in the `fluent-cart-dev-docs` submodule.
- Match the existing config style (`.mts`, existing `buildEnd` structure).
- Reading time, dates, and RSS all read from **one** frontmatter contract — don't duplicate.

## Acceptance check (verify before claiming done)

- `npm run docs:dev` → `/engineering/` lists the seed post with byline + reading time + tags.
- Tag chips filter the list.
- Opening the seed post shows meta header and a working FluentComments widget at the bottom.
- `npm run docs:build` produces `.vitepress/dist/engineering/feed.rss` with a valid item.
- API playground / OpenAPI pages still render (no theme regression).
- "Engineering" appears in the top nav and routes correctly.

## Out of scope (later)

- Author profile pages, pagination, search over posts, per-tag routes, OG image generation
  (Pages Function), newsletter signup.
