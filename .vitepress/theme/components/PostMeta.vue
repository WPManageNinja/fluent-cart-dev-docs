<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { data as posts } from '../engineering.data'
import { initialsOf } from '../postUtils'

// Rendered globally via the layout's `doc-before` slot: resolves the current
// route against the engineering posts data and renders nothing on every
// other page, so posts need zero boilerplate to get their header.
//
// The post TITLE is rendered here from frontmatter (Stripe-style editorial
// header: breadcrumb → title → date → byline). Post markdown must therefore
// not contain an `# H1` — see docs/engineering/AUTHORING.md.

const route = useRoute()

function normalize(path: string): string {
  return path.replace(/\.html$/, '').replace(/\/index$/, '/')
}

const post = computed(
  () => posts.find((p) => normalize(p.url) === normalize(route.path)) ?? null
)
</script>

<template>
  <header v-if="post" class="fc-post-header">
    <p class="fc-post-breadcrumb">
      <a :href="withBase('/engineering/')">Engineering</a>
    </p>
    <h1 class="fc-post-heading">{{ post.title }}</h1>
    <p class="fc-post-header-date">
      <time :datetime="post.date.iso">{{ post.date.string }}</time>
      <span class="fc-post-meta-dot" aria-hidden="true">·</span>
      <span>{{ post.readingTime }} min read</span>
    </p>
    <div class="fc-post-meta-row">
      <p class="fc-post-meta-byline">
        <span class="fc-avatar" aria-hidden="true">{{ initialsOf(post.author) }}</span>
        <span class="fc-post-author-names">
          <span class="fc-post-author-name">{{ post.author }}</span>
          <span v-if="post.authorTitle" class="fc-post-author-role">{{ post.authorTitle }}</span>
        </span>
      </p>
      <p v-if="post.tags.length" class="fc-post-meta-tags">
        <a
          v-for="tag in post.tags"
          :key="tag"
          class="fc-post-eyebrow-tag"
          :href="withBase(`/engineering/?tag=${encodeURIComponent(tag)}`)"
        >
          {{ tag }}
        </a>
      </p>
    </div>
  </header>
</template>
