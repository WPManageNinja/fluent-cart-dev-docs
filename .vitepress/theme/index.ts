/// <reference path="../../env.d.ts" />

import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import type { Theme } from 'vitepress'
import { theme, useOpenapi } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'
import Mermaid from './components/Mermaid.vue'
import './custom.css'
// OpenAPI styles - loaded globally but scoped to OpenAPI pages via CSS selectors
import './openapi.css'

// Extend Window interface for custom property
declare global {
  interface Window {
    __customServerUrl?: string
  }
}

// Playground instructions configuration - update these variables to change instruction text globally
const PLAYGROUND_INSTRUCTIONS = {
  title: '📡 Interactive API Playground',
  description: 'This is a live API playground where you can test endpoints and see real-time responses.',
  instructions: [
    'Enter your WordPress website domain in the Server URL field below',
    'Add your Application Password credentials in the Authorization field',
    'Fill in any required parameters or request body data',
    'Click "Try it out" to execute the API request',
    'View the real-time response from your API below'
  ],
  warning: '⚠️ Important: Use test sites only. Requests make permanent changes. We do not collect or store any data.',
  style: {
    backgroundColor: 'var(--vp-c-bg-soft, #f6f6f7)',
    borderColor: 'var(--vp-c-divider, #e5e7eb)',
    textColor: 'var(--vp-c-text-1, #1f2937)',
    titleColor: 'var(--vp-c-brand-1, #3b82f6)',
    warningColor: 'var(--vp-c-yellow-1, #d97706)'
  }
}

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  async enhanceApp({ app, router, siteData }) {
    app.component('Mermaid', Mermaid)
    
    // Always register OpenAPI theme components (needed for OAOperation and OASpec components)
    theme.enhanceApp({ app, router, siteData })
    
    // OpenAPI integration - load spec data for OpenAPI pages
    // This needs to run on client side only
    if (typeof window !== 'undefined') {
      // Load spec data for any OpenAPI page
      const loadOpenAPISpec = async () => {
        try {
          // Fetch the auto-generated manifest file that lists all JSON specs
          const manifestResponse = await fetch('/openapi/public/manifest.json')
          if (!manifestResponse.ok) {
            console.error('Failed to load OpenAPI manifest')
            return
          }
          
          const manifest = await manifestResponse.json()
          const specFiles: string[] = manifest.files || []
          
          if (specFiles.length === 0) {
            console.warn('No OpenAPI spec files found in manifest')
            return
          }
          
          // Fetch all spec files listed in the manifest
          const specs = await Promise.all(
            specFiles.map(async (file) => {
              try {
                const response = await fetch(file)
                if (response.ok) {
                  return await response.json()
                }
                return null
              } catch (error) {
                console.warn(`Failed to load ${file}:`, error)
                return null
              }
            })
          )
          
          // Filter out null values and merge specs
          const validSpecs = specs.filter(spec => spec !== null)
          
          if (validSpecs.length > 0) {
            // Start with base spec
            const baseSpec = validSpecs.find(spec => spec.openapi) || validSpecs[0]
            const mergedSpec = {
              ...baseSpec,
              paths: {},
              components: {
                ...baseSpec.components,
                schemas: { ...baseSpec.components?.schemas }
              }
            }
            
            // First merge all schemas, then merge paths (so $ref can resolve)
            validSpecs.forEach(spec => {
              if (spec.components?.schemas) {
                Object.assign(mergedSpec.components.schemas, spec.components.schemas)
              }
            })
            
            // Then merge paths after all schemas are available
            validSpecs.forEach(spec => {
              if (spec.paths) {
                Object.keys(spec.paths).forEach(path => {
                  if (!mergedSpec.paths[path]) {
                    mergedSpec.paths[path] = {}
                  }
                  // Merge HTTP methods for the same path
                  Object.assign(mergedSpec.paths[path], spec.paths[path])
                })
              }
            })
            
            // Set the merged OpenAPI specification
            useOpenapi({ 
              spec: mergedSpec, 
            })
          }
        } catch (error) {
          console.error('Error loading OpenAPI spec:', error)
        }
      }
      
      // Function to add simple "Documentation in Progress" notice on REST API pages
      const toggleProgressNotice = () => {
        const currentPath = window.location.pathname
        const isRestAPIPage = currentPath.includes('/restapi/')
        
        // Look for existing notice
        let existingNotice = document.getElementById('restapi-progress-notice')
        
        if (isRestAPIPage) {
          // Add notice if it doesn't exist
          if (!existingNotice) {
            // Find the main content container
            const contentContainer = document.querySelector('.vp-doc') || document.querySelector('.content')
            
            if (contentContainer) {
              // Create simple one-liner notice
              const notice = document.createElement('div')
              notice.id = 'restapi-progress-notice'
              notice.innerHTML = `
                <p style="
                  padding: 8px 12px;
                  margin: 0 0 20px 0;
                  background: #fef3c7;
                  border-left: 3px solid #f59e0b;
                  color: #92400e;
                  font-size: 0.875rem;
                  border-radius: 4px;
                ">
                  📝 <em>Documentation in progress - some sections may be incomplete or subject to change.</em>
                </p>
              `
              
              // Insert at the beginning of content
              contentContainer.insertBefore(notice, contentContainer.firstChild)
            }
          }
        } else {
          // Remove notice if it exists (when not on REST API pages)
          if (existingNotice) {
            existingNotice.remove()
          }
        }
      }
      
      // Load spec when on REST API pages - ensure it loads before components render
      const loadSpecIfNeeded = async () => {
        const currentPath = window.location.pathname
        if (currentPath.includes('/restapi/')) {
          await loadOpenAPISpec()
        }
        // Update progress notice on route change
        toggleProgressNotice()
      }
      
      // Check if we're on a REST API page right now and load spec immediately
      const isRestAPIPage = window.location.pathname.includes('/restapi/')
      if (isRestAPIPage) {
        // Load spec immediately before any components render
        await loadOpenAPISpec()
      }
      
      // Add progress notice with multiple attempts to ensure DOM is ready
      setTimeout(toggleProgressNotice, 100)
      setTimeout(toggleProgressNotice, 300)
      setTimeout(toggleProgressNotice, 500)
      setTimeout(toggleProgressNotice, 1000)

      // Add mermaid diagram zoom functionality
      let currentZoomedElement: HTMLElement | null = null

      const handleMermaidClick = function(this: HTMLElement, event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        console.log('Mermaid clicked:', this)

        if (this.classList.contains('zoomed')) {
          this.classList.remove('zoomed')
          currentZoomedElement = null
          document.body.style.overflow = ''
          this.style.cursor = 'zoom-in'
          this.title = 'Click to zoom'
        } else {
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

      const setupMermaidZoom = () => {
        setTimeout(() => {
          const mermaidElements = document.querySelectorAll('.mermaid, .mermaid-container, [class*="mermaid"]')
          mermaidElements.forEach((element) => {
            const htmlElement = element as HTMLElement

            if (htmlElement.dataset.zoomEnabled) return
            htmlElement.dataset.zoomEnabled = 'true'

            htmlElement.addEventListener('click', handleMermaidClick)
            htmlElement.style.cursor = 'zoom-in'
            htmlElement.title = 'Click to zoom'
          })
        }, 500)
      }

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

      window.addEventListener('mermaidRendered', (event: any) => {
        const element = event.detail.element as HTMLElement
        if (element && !element.dataset.zoomEnabled) {
          element.dataset.zoomEnabled = 'true'
          element.addEventListener('click', handleMermaidClick)
          element.style.cursor = 'zoom-in'
          element.title = 'Click to zoom'
        }
      })
      
      // Setup mermaid zoom on page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMermaidZoom)
      } else {
        setupMermaidZoom()
      }
      
      // Reload spec on route changes
      if (router) {
        router.onAfterRouteChanged = async (to: string) => {
          await loadSpecIfNeeded()
          setupMermaidZoom()
        }
      }
      
      // LocalStorage keys for persisting API credentials
      const STORAGE_KEYS = {
        SERVER_URL: 'fluentcart_api_server_url',
        AUTH_CREDENTIALS: 'fluentcart_api_auth_credentials'
      }
      
      // Add OpenAPI-specific enhancements (playground instructions, server URL input, etc.)
      // This code is similar to the OpenAPI theme but adapted for the parent theme
      // Add server URL input and playground instructions
      const addOpenAPIEnhancements = () => {
            const allDetails = document.querySelectorAll('details')
            let authSection: HTMLDetailsElement | null = null
            
            for (const details of allDetails) {
              const summary = details.querySelector('summary')
              if (summary) {
                const text = summary.textContent || ''
                if (text.includes('Authorization')) {
                  authSection = details as HTMLDetailsElement
                  break
                }
              }
            }

            if (authSection) {
              const existingInstructions = authSection.querySelector('[data-playground-instructions]')
              const existingServerInput = authSection.querySelector('[data-server-url-input]')
              if (existingInstructions && existingServerInput) return

              let contentArea = authSection.querySelector('div') as HTMLDivElement | null
              if (!contentArea) {
                contentArea = document.createElement('div')
                authSection.appendChild(contentArea)
              }

              const instructionItems = PLAYGROUND_INSTRUCTIONS.instructions.map(instruction => 
                `<li style="margin-bottom: 8px; line-height: 1.6;">${instruction}</li>`
              ).join('')
              
              const instructionsHtml = `
                <div data-playground-instructions style="margin-bottom: 20px; padding: 16px; background: ${PLAYGROUND_INSTRUCTIONS.style.backgroundColor}; border: 1px solid ${PLAYGROUND_INSTRUCTIONS.style.borderColor}; border-radius: 6px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <div style="font-weight: 600; font-size: 0.95rem; color: ${PLAYGROUND_INSTRUCTIONS.style.titleColor}; display: flex; align-items: center; gap: 8px;">
                      ${PLAYGROUND_INSTRUCTIONS.title}
                    </div>
                    <button 
                      data-clear-credentials 
                      style="padding: 4px 12px; font-size: 0.75rem; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 4px; cursor: pointer; color: var(--vp-c-text-2); transition: all 0.2s;"
                      onmouseover="this.style.background='var(--vp-c-bg)'; this.style.borderColor='var(--vp-c-brand-1)'; this.style.color='var(--vp-c-brand-1)'"
                      onmouseout="this.style.background='var(--vp-c-bg-soft)'; this.style.borderColor='var(--vp-c-divider)'; this.style.color='var(--vp-c-text-2)'"
                      title="Clear saved Server URL and credentials from browser storage"
                    >
                      🗑️ Clear Browser Credentials
                    </button>
                  </div>
                  <p style="margin: 0 0 12px 0; color: ${PLAYGROUND_INSTRUCTIONS.style.textColor}; font-size: 0.875rem; line-height: 1.5;">
                    ${PLAYGROUND_INSTRUCTIONS.description} <strong>Your credentials are saved in your browser</strong> and will persist across pages.
                  </p>
                  <ol style="margin: 0 0 12px 20px; color: ${PLAYGROUND_INSTRUCTIONS.style.textColor}; font-size: 0.875rem; line-height: 1.6;">
                    ${instructionItems}
                  </ol>
                  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid ${PLAYGROUND_INSTRUCTIONS.style.borderColor}; color: ${PLAYGROUND_INSTRUCTIONS.style.warningColor}; font-size: 0.85rem; line-height: 1.5;">
                    ${PLAYGROUND_INSTRUCTIONS.warning}
                  </div>
                </div>
              `

              const serverUrlHtml = `
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--vp-c-divider, #ddd);">
                  <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500; color: var(--vp-c-text-1, #000);">
                    Server URL
                  </label>
                  <div style="margin-bottom: 8px;">
                    <label style="display: block; margin-bottom: 4px; font-size: 0.85rem; color: var(--vp-c-text-2, #666);">
                      Your WordPress website domain (without https://)
                    </label>
                    <input 
                      type="text" 
                      data-server-url-input
                      placeholder="YourWebsite.com"
                      value="YourWebsite.com"
                      style="width: 100%; padding: 8px 12px; border: 1px solid var(--vp-c-divider, #ddd); border-radius: 4px; background: var(--vp-c-bg, #fff); color: var(--vp-c-text-1, #000); font-size: 0.9rem;"
                    />
                  </div>
                  <div style="font-size: 0.85rem; color: var(--vp-c-text-2, #666);">
                    Full URL: <span data-server-url-display>https://YourWebsite.com/wp-json/fluent-cart/v2</span>
                  </div>
                </div>
              `

              const tempInstructionsDiv = document.createElement('div')
              tempInstructionsDiv.innerHTML = instructionsHtml
              const instructionsElement = tempInstructionsDiv.firstElementChild as HTMLElement | null

              const tempDiv = document.createElement('div')
              tempDiv.innerHTML = serverUrlHtml
              const serverUrlElement = tempDiv.firstElementChild as HTMLElement | null

              if (contentArea && instructionsElement && serverUrlElement) {
                if (contentArea.firstChild) {
                  contentArea.insertBefore(instructionsElement, contentArea.firstChild)
                  contentArea.insertBefore(serverUrlElement, instructionsElement.nextSibling)
                } else {
                  contentArea.appendChild(instructionsElement)
                  contentArea.appendChild(serverUrlElement)
                }
                
                // Add clear credentials button functionality
                const clearButton = instructionsElement.querySelector('[data-clear-credentials]') as HTMLButtonElement | null
                if (clearButton) {
                  clearButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to clear saved Server URL and credentials?')) {
                      localStorage.removeItem(STORAGE_KEYS.SERVER_URL)
                      localStorage.removeItem(STORAGE_KEYS.AUTH_CREDENTIALS)
                      
                      // Reset to defaults
                      const serverInput = serverUrlElement.querySelector('[data-server-url-input]') as HTMLInputElement | null
                      const serverDisplay = serverUrlElement.querySelector('[data-server-url-display]') as HTMLElement | null
                      const authInput = authSection.querySelector('input[placeholder="username:application_password"]') as HTMLInputElement | null
                      
                      if (serverInput) serverInput.value = 'YourWebsite.com'
                      if (serverDisplay) serverDisplay.textContent = 'https://YourWebsite.com/wp-json/fluent-cart/v2'
                      if (authInput) authInput.value = ''
                      window.__customServerUrl = undefined
                      
                      alert('✓ Saved data cleared successfully!')
                    }
                  })
                }

                const input = serverUrlElement.querySelector('[data-server-url-input]') as HTMLInputElement | null
                const display = serverUrlElement.querySelector('[data-server-url-display]') as HTMLElement | null
                
                if (input && display) {
                  // Load saved server URL from localStorage
                  const savedServerUrl = localStorage.getItem(STORAGE_KEYS.SERVER_URL)
                  if (savedServerUrl && savedServerUrl !== 'YourWebsite.com') {
                    input.value = savedServerUrl
                  }
                  
                  const updateServerUrl = () => {
                    const website = input.value.trim() || 'YourWebsite.com'
                    const fullUrl = `https://${website}/wp-json/fluent-cart/v2`
                    display.textContent = fullUrl
                    window.__customServerUrl = fullUrl
                    
                    // Save to localStorage
                    if (website && website !== 'YourWebsite.com') {
                      localStorage.setItem(STORAGE_KEYS.SERVER_URL, website)
                    }
                  }

                  // Initialize with saved value
                  updateServerUrl()
                  
                  input.addEventListener('input', updateServerUrl)
                  input.addEventListener('change', updateServerUrl)
                }

                const authInputField = authSection.querySelector('input[placeholder="Authorization"], input[aria-label="Authorization"]') as HTMLInputElement | null
                if (authInputField) {
                  authInputField.placeholder = 'username:application_password'
                  if (authInputField.value?.trim() === 'Authorization') {
                    authInputField.value = ''
                  }
                  
                  // Load saved auth credentials from localStorage
                  const savedAuthCredentials = localStorage.getItem(STORAGE_KEYS.AUTH_CREDENTIALS)
                  if (savedAuthCredentials) {
                    authInputField.value = savedAuthCredentials
                  }
                  
                  // Save auth credentials to localStorage on change
                  const saveAuthCredentials = () => {
                    const authValue = authInputField.value.trim()
                    if (authValue) {
                      localStorage.setItem(STORAGE_KEYS.AUTH_CREDENTIALS, authValue)
                    } else {
                      localStorage.removeItem(STORAGE_KEYS.AUTH_CREDENTIALS)
                    }
                  }
                  
                  authInputField.addEventListener('input', saveAuthCredentials)
                  authInputField.addEventListener('change', saveAuthCredentials)
                }
              }
            }
          }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addOpenAPIEnhancements)
      } else {
        addOpenAPIEnhancements()
      }

      setTimeout(addOpenAPIEnhancements, 500)
      setTimeout(addOpenAPIEnhancements, 1000)
      setTimeout(addOpenAPIEnhancements, 2000)

      const observer = new MutationObserver(() => {
        addOpenAPIEnhancements()
      })
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true })
      }

      // Intercept fetch for custom server URL and auth header
      const originalFetch = window.fetch
      window.fetch = function(...args: Parameters<typeof fetch>) {
            if (window.__customServerUrl && args[0] && typeof args[0] === 'string') {
              if (args[0].includes('/wp-json/fluent-cart/v2')) {
                try {
                  const match = args[0].match(/\/wp-json\/fluent-cart\/v2(\/[^?#]*)?(\?.*)?(#.*)?/)
                  if (match) {
                    const endpointPath = match[1] || ''
                    const queryString = match[2] || ''
                    args[0] = window.__customServerUrl + endpointPath + queryString
                  }
                } catch (e) {
                  const baseMatch = args[0].match(/https?:\/\/[^\/]+(\/wp-json\/fluent-cart\/v2.*)/)
                  if (baseMatch) {
                    const endpointPath = baseMatch[1].replace('/wp-json/fluent-cart/v2', '')
                    args[0] = window.__customServerUrl + endpointPath
                  }
                }
              }
            }

            if (args[1] && args[1].headers) {
              const headers = args[1].headers
              const processAuthValue = (authValue: string) => {
                if (!authValue) return null
                if (authValue.startsWith('Basic ') || authValue.startsWith('Bearer ')) {
                  return authValue
                }
                if (!authValue.includes(':')) {
                  return 'Basic ' + authValue
                }
                if (authValue.includes(':')) {
                  try {
                    const encoded = btoa(authValue)
                    return 'Basic ' + encoded
                  } catch (e) {
                    return 'Basic ' + authValue
                  }
                }
                return 'Basic ' + authValue
              }
              
              if (headers instanceof Headers) {
                const authValue = headers.get('authorization') || headers.get('Authorization')
                if (authValue) {
                  const processed = processAuthValue(authValue)
                  if (processed && processed !== authValue) {
                    headers.set('Authorization', processed)
                  }
                }
              } else if (headers instanceof Object) {
                const authKey = (headers as any).authorization ? 'authorization' : ((headers as any).Authorization ? 'Authorization' : null)
                if (authKey) {
                  const authValue = (headers as any)[authKey]
                  if (authValue) {
                    const processed = processAuthValue(authValue)
                    if (processed && processed !== authValue) {
                      (headers as any)[authKey] = processed
                    }
                  }
                }
              }
            }
            
        return originalFetch.apply(this, args)
      }

      setupMermaidZoom()
      setTimeout(setupMermaidZoom, 2000)
    }
  }
} satisfies Theme
