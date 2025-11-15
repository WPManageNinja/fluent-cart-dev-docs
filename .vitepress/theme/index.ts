import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import type { Theme } from 'vitepress'
import Mermaid from './components/Mermaid.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('Mermaid', Mermaid)
    
    // Add mermaid diagram zoom functionality
    if (typeof window !== 'undefined') {
      let currentZoomedElement: HTMLElement | null = null
      
      const setupMermaidZoom = () => {
        setTimeout(() => {
          // Look for both .mermaid and .mermaid-container elements
          const mermaidElements = document.querySelectorAll('.mermaid, .mermaid-container, [class*="mermaid"]')
          mermaidElements.forEach((element) => {
            const htmlElement = element as HTMLElement
            
            // Skip if already has listener
            if (htmlElement.dataset.zoomEnabled) return
            htmlElement.dataset.zoomEnabled = 'true'
            
            htmlElement.addEventListener('click', handleMermaidClick)
            
            // Add visual indicator that it's clickable
            htmlElement.style.cursor = 'zoom-in'
            htmlElement.title = 'Click to zoom'
          })
        }, 500) // Increased timeout to ensure Mermaid has rendered
      }
      
      const handleMermaidClick = function(this: HTMLElement, event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()
        
        console.log('Mermaid clicked:', this) // Debug log
        
        if (this.classList.contains('zoomed')) {
          // Close zoom
          this.classList.remove('zoomed')
          currentZoomedElement = null
          document.body.style.overflow = ''
          this.style.cursor = 'zoom-in'
          this.title = 'Click to zoom'
        } else {
          // Open zoom
          // Close any other zoomed element first
          if (currentZoomedElement) {
            currentZoomedElement.classList.remove('zoomed')
            currentZoomedElement.style.cursor = 'zoom-in'
            currentZoomedElement.title = 'Click to zoom'
          }
          this.classList.add('zoomed')
          currentZoomedElement = this
          document.body.style.overflow = 'hidden'
          this.style.cursor = 'zoom-out'
          this.title = 'Click to close'
        }
      }
      
      // Close on Escape key
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && currentZoomedElement) {
          currentZoomedElement.classList.remove('zoomed')
          currentZoomedElement.style.cursor = 'zoom-in'
          currentZoomedElement.title = 'Click to zoom'
          currentZoomedElement = null
          document.body.style.overflow = ''
        }
      }
      
      document.addEventListener('keydown', handleKeydown)
      
      // Listen for mermaid rendered event
      window.addEventListener('mermaidRendered', (event: any) => {
        const element = event.detail.element as HTMLElement
        if (element && !element.dataset.zoomEnabled) {
          element.dataset.zoomEnabled = 'true'
          element.addEventListener('click', handleMermaidClick)
          element.style.cursor = 'zoom-in'
          element.title = 'Click to zoom'
        }
      })
      
      router.onAfterRouteChange = setupMermaidZoom
      
      // Also setup on route change and initial load
      setupMermaidZoom()
      
      // Setup after a longer delay for dynamic content
      setTimeout(setupMermaidZoom, 2000)
    }
  }
} satisfies Theme
