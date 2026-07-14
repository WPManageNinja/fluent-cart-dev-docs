<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../engineering.data'
import { initialsOf } from '../postUtils'
import TagFilter from './TagFilter.vue'

const selectedTag = ref<string | null>(null)

const allTags = computed(() => {
  const tags = new Set<string>()
  for (const post of posts) {
    for (const tag of post.tags) tags.add(tag)
  }
  return [...tags].sort()
})

const visiblePosts = computed(() =>
  selectedTag.value === null
    ? posts
    : posts.filter((post) => post.tags.includes(selectedTag.value as string))
)

// Support deep links like /engineering/?tag=performance (used by PostMeta tag chips)
onMounted(() => {
  const tag = new URLSearchParams(window.location.search).get('tag')
  if (tag && allTags.value.includes(tag)) {
    selectedTag.value = tag
  }
})
</script>

<template>
  <div class="fc-post-list">
    <TagFilter v-if="allTags.length" v-model="selectedTag" :tags="allTags" />

    <p v-if="!visiblePosts.length" class="fc-post-list-empty">
      No posts{{ selectedTag ? ` tagged “${selectedTag}”` : '' }} yet.
    </p>

    <article v-for="post in visiblePosts" :key="post.url" class="fc-post-row">
      <div class="fc-post-main">
        <p v-if="post.tags.length" class="fc-post-eyebrow">
          <button
            v-for="tag in post.tags"
            :key="tag"
            type="button"
            class="fc-post-eyebrow-tag"
            :class="{ 'fc-post-eyebrow-tag--active': selectedTag === tag }"
            @click="selectedTag = selectedTag === tag ? null : tag"
          >
            {{ tag }}
          </button>
        </p>
        <h2 class="fc-post-title">
          <a :href="withBase(post.url)">{{ post.title }}</a>
        </h2>
        <p v-if="post.description" class="fc-post-desc">{{ post.description }}</p>
        <div v-else-if="post.excerpt" class="fc-post-desc" v-html="post.excerpt" />
        <p class="fc-post-readmore">
          <a :href="withBase(post.url)">Read more <span aria-hidden="true">→</span></a>
        </p>
      </div>
      <aside class="fc-post-aside">
        <p class="fc-post-date">
          <time :datetime="post.date.iso">{{ post.date.string }}</time>
          <span class="fc-post-date-sub">{{ post.readingTime }} min read</span>
        </p>
        <p class="fc-post-author">
          <span class="fc-avatar" aria-hidden="true">{{ initialsOf(post.author) }}</span>
          <span class="fc-post-author-names">
            <span class="fc-post-author-name">{{ post.author }}</span>
            <span v-if="post.authorTitle" class="fc-post-author-role">{{ post.authorTitle }}</span>
          </span>
        </p>
      </aside>
    </article>
  </div>
</template>
