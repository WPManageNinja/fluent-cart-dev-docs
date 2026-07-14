---
title: Writing for the Engineering Blog
description: How to publish a post on the FluentCart Engineering blog.
comments: false
---

# Writing for the Engineering Blog

Publishing a post is one markdown file and one PR:

1. Copy the template below into a new file in `docs/engineering/` — use a kebab-case
   slug as the filename, e.g. `docs/engineering/taming-subscription-webhooks.md`.
2. Fill in the frontmatter (contract below).
3. Write the article in plain markdown — **start with a paragraph, not an `# H1`**.
   The title, byline, date, and reading time are all rendered from frontmatter as
   an editorial header, so an H1 in the body would duplicate the title. Use `##`
   for sections. Code blocks, tables, and Mermaid diagrams all work exactly like
   the rest of the dev docs.
4. Preview locally with `npm run docs:dev` → open `/engineering/`.
5. Open a PR against `master`. It's live on merge — the index page, tag filter,
   and RSS feed all pick the post up automatically from the frontmatter.

> This page and `index.md` are excluded from the post list — everything else in
> `docs/engineering/` is treated as a post.

## Frontmatter contract

```yaml
---
title: Post Title
date: 2026-07-10          # ISO date — drives ordering and RSS
author: Jane Doe
authorTitle: Senior Engineer   # optional
tags: [orders, performance]
description: One-line summary used for cards, SEO, and RSS.
comments: true            # optional; defaults on — set false to disable comments
---
```

Field notes:

- **`title`** — shown on the card, the post page, and in RSS.
- **`date`** — `YYYY-MM-DD`. Posts are listed newest-first. Don't post-date; the
  feed publishes whatever is merged.
- **`author` / `authorTitle`** — rendered in the byline at the top of the post.
  The byline, date, reading time, and tags are injected automatically — don't add
  them to the post body.
- **`tags`** — lowercase, short, reused where possible. Check the chips on
  [/engineering/](./index.md) before inventing a new one.
- **`description`** — one sentence. This is what people see on the index card and
  in their feed reader, so make it earn the click.
- **`comments`** — the FluentComments widget renders on every post by default;
  set `comments: false` to opt out.

Reading time is computed automatically (word count / 200).

## Optional: custom excerpt

By default the index card shows your `description`. If you want a longer teaser,
put `<!-- more -->` after your opening paragraph(s) — everything above the marker
becomes the excerpt and is used when `description` is empty.

## Images

Put images in `docs/public/engineering/` and reference them absolutely:

```md
![Query plan before the index](/engineering/query-plan-before.png)
```

## Sample post

```md
---
title: Taming Subscription Webhooks
date: 2026-07-10
author: Jane Doe
authorTitle: Senior Engineer
tags: [subscriptions, payments]
description: How we made Stripe webhook processing idempotent without a queue server.
---

Stripe retries webhooks. Customers double-click. Cron overlaps. Here's how we
made sure a renewal is recorded exactly once...

## The problem

...
```
