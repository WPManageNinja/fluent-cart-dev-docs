# Deployment — Cloudflare Pages

This site deploys as a static build on **Cloudflare Pages**. No Worker is
required; Pages Functions remain available later if we ever want dynamic
pieces (view counts, OG images).

## One-time setup (account owner)

In the Cloudflare dashboard → **Workers & Pages → Create → Pages →
Connect to Git**, select the `fluent-cart-dev-docs` GitHub repository and
configure:

| Setting                | Value                |
|------------------------|----------------------|
| Production branch      | `master`             |
| Build command          | `npm run docs:build` |
| Build output directory | `.vitepress/dist`    |
| Node version           | 20+ (set `NODE_VERSION=20` env var; local dev uses Node 24) |

Every merge to `master` then builds and deploys automatically; PRs get
preview deployments.

## What the build produces

`npm run docs:build` runs `generate-manifest.js`, builds the VitePress site
into `.vitepress/dist/`, and in the `buildEnd` hook:

- copies the OpenAPI JSON specs to `openapi/public/` (with `manifest.json`)
- generates the Engineering blog RSS feed at `engineering/feed.rss`

## Hostname

The canonical production URL is defined once as `HOSTNAME` in
`.vitepress/genFeed.ts` and is used for absolute URLs in the RSS feed and the
RSS autodiscovery `<link>` tag. If the site is served from a different domain,
update that constant.
