<template>
  <div ref="mermaidContainer" class="mermaid-container"></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const mermaidContainer = ref(null)

onMounted(async () => {
  await nextTick()
  
  try {
    const mermaid = await import('mermaid')
    
    // Initialize Mermaid
    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    })
    
    // Render the diagram
    if (mermaidContainer.value) {
      mermaidContainer.value.innerHTML = props.content
      await mermaid.default.run({
        querySelector: '.mermaid-container'
      })
    }
  } catch (error) {
    console.error('Mermaid rendering error:', error)
    if (mermaidContainer.value) {
      mermaidContainer.value.innerHTML = `<pre><code>${props.content}</code></pre>`
    }
  }
})
</script>

<style scoped>
.mermaid-container {
  text-align: center;
  margin: 20px 0;
}
</style>
