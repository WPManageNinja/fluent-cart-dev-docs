<template>
  <div 
    ref="mermaidContainer" 
    class="mermaid mermaid-diagram" 
    v-html="renderedContent"
    @click="handleClick"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  content: string
}

const props = defineProps<Props>()

const mermaidContainer = ref<HTMLElement>()
const renderedContent = ref('')

let themeObserver: MutationObserver | null = null
let rendering = false

const handleClick = (event: MouseEvent) => {
  // Handled by the global click handler in the theme.
}

const lightVars = {
  primaryColor: '#ffffff',
  primaryTextColor: '#1e293b',
  primaryBorderColor: '#3b82f6',
  lineColor: '#3b82f6',
  secondaryColor: '#f8fafc',
  tertiaryColor: '#e2e8f0',
  background: '#ffffff',
  mainBkg: '#ffffff',
  secondBkg: '#f8fafc',
  tertiaryBkg: '#e2e8f0',
  entityBkg: '#ffffff',
  entityTextColor: '#1e293b',
  relationLabelColor: '#1e293b',
  relationLabelBackground: '#ffffff'
}

const darkVars = {
  primaryColor: '#1e293b',
  primaryTextColor: '#e2e8f0',
  primaryBorderColor: '#60a5fa',
  lineColor: '#60a5fa',
  secondaryColor: '#334155',
  tertiaryColor: '#0f172a',
  background: '#0f172a',
  mainBkg: '#1e293b',
  secondBkg: '#334155',
  tertiaryBkg: '#0f172a',
  entityBkg: '#1e293b',
  entityTextColor: '#e2e8f0',
  relationLabelColor: '#e2e8f0',
  relationLabelBackground: '#1e293b'
}

const renderDiagram = async () => {
  if (rendering) return
  rendering = true

  try {
    const { default: mermaid } = await import('mermaid')
    const dark = document.documentElement.classList.contains('dark')

    mermaid.initialize({
      startOnLoad: false,
      theme: dark ? 'dark' : 'base',
      securityLevel: 'loose',
      themeVariables: dark ? darkVars : lightVars,
      er: {
        diagramPadding: 40,
        layoutDirection: 'TB',
        minEntityWidth: 180,
        minEntityHeight: 120,
        entityPadding: 30,
        stroke: dark ? '#60a5fa' : '#3b82f6',
        fill: dark ? '#1e293b' : '#ffffff',
        fontSize: 13,
        useMaxWidth: true,
        relationColor: dark ? '#60a5fa' : '#3b82f6'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    })

    const id = 'mermaid-' + Math.random().toString(36).substr(2, 9)

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }

    const { svg } = await mermaid.render(id, props.content)
    renderedContent.value = svg

    setTimeout(() => {
      if (mermaidContainer.value) {
        mermaidContainer.value.dataset.rendered = 'true'

        const foreignObjects = mermaidContainer.value.querySelectorAll('foreignObject')
        foreignObjects.forEach(foreignObj => {
          // ER-diagram label rows only (height 21) — give them room; leave flowchart labels sized to their box.
          if (foreignObj.getAttribute('height') === '21') {
            foreignObj.setAttribute('height', '40')
            const currentWidth = foreignObj.getAttribute('width')
            if (currentWidth) {
              foreignObj.setAttribute('width', (parseFloat(currentWidth) + 20).toString())
            }
          }
        })

        const event = new CustomEvent('mermaidRendered', {
          detail: { element: mermaidContainer.value }
        })
        window.dispatchEvent(event)
      }
    }, 100)

  } catch (error) {
    renderedContent.value = `<pre style="background: #f6f8fa; padding: 1rem; border-radius: 8px; overflow: auto;"><code>${props.content}</code></pre>`
  } finally {
    rendering = false
  }
}

onMounted(async () => {
  await nextTick()
  await renderDiagram()

  let lastDark = document.documentElement.classList.contains('dark')
  themeObserver = new MutationObserver(() => {
    const dark = document.documentElement.classList.contains('dark')
    if (dark !== lastDark) {
      lastDark = dark
      renderDiagram()
    }
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>

<style scoped>
.mermaid {
  text-align: center;
  margin: 20px 0;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 80vh;
  cursor: zoom-in;
  transition: all 0.3s ease;
  user-select: none;
}

.mermaid:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.labelBkg) {
  background: white !important;
  padding: 4px 8px !important;
  border: 1px solid #3b82f6;
}
</style>
