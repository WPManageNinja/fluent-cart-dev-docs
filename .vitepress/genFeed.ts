// RSS 2.0 feed for the Engineering blog — called from the buildEnd hook in
// config.mts. Reads posts through the same loader factory the index page
// uses (.vitepress/theme/engineeringPosts.ts), so frontmatter is parsed in
// exactly one place. Output: <outDir>/engineering/feed.rss

import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Feed } from 'feed'
import type { SiteConfig } from 'vitepress'
import { createEngineeringLoader } from './theme/engineeringPosts'

// Production docs domain — also used for the RSS autodiscovery <link> in config.mts
export const HOSTNAME = 'https://docs.fluentcart.com'

export async function genFeed(siteConfig: SiteConfig): Promise<void> {
  // render: true → items carry full post HTML for feed readers
  const posts = await createEngineeringLoader({ render: true }).load()

  const feed = new Feed({
    title: 'FluentCart Engineering',
    description: 'Engineering articles from the team building FluentCart',
    id: `${HOSTNAME}/engineering/`,
    link: `${HOSTNAME}/engineering/`,
    language: 'en',
    favicon: `${HOSTNAME}/favicon.ico`,
    copyright: `Copyright © ${new Date().getFullYear()} FluentCart`
  })

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${HOSTNAME}${post.url}`,
      link: `${HOSTNAME}${post.url}`,
      description: post.description,
      content: post.html,
      author: [{ name: post.author }],
      category: post.tags.map((tag) => ({ name: tag })),
      date: post.date.time ? new Date(post.date.time) : new Date()
    })
  }

  const feedDir = join(siteConfig.outDir, 'engineering')
  mkdirSync(feedDir, { recursive: true })
  writeFileSync(join(feedDir, 'feed.rss'), feed.rss2())

  console.log(`✓ RSS: Generated engineering/feed.rss with ${posts.length} item(s)`)
}
