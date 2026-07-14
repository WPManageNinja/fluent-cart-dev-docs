<script setup lang="ts">
defineProps<{
  tags: string[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()
</script>

<template>
  <div class="fc-tag-filter" role="group" aria-label="Filter posts by tag">
    <button
      type="button"
      class="fc-tag-chip"
      :class="{ 'fc-tag-chip--active': modelValue === null }"
      :aria-pressed="modelValue === null"
      @click="emit('update:modelValue', null)"
    >
      All
    </button>
    <button
      v-for="tag in tags"
      :key="tag"
      type="button"
      class="fc-tag-chip"
      :class="{ 'fc-tag-chip--active': modelValue === tag }"
      :aria-pressed="modelValue === tag"
      @click="emit('update:modelValue', modelValue === tag ? null : tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
