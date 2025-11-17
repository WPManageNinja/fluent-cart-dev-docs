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
    
    // Initialize OpenAPI with empty spec first to prevent errors on page reload
    if (typeof window !== 'undefined') {
      useOpenapi({ 
        spec: {
          openapi: '3.0.0',
          info: { title: 'FluentCart API', version: '1.0.0' },
          paths: {},
          components: { schemas: {} }
        }
      })
    }
    
    // OpenAPI integration - load spec data for OpenAPI pages
    // This needs to run on client side only
    if (typeof window !== 'undefined') {
      // Load spec data for any OpenAPI page
      const loadOpenAPISpec = async () => {
        try {
          // List of spec files to load and merge
          // Files are in public/openapi/ directory, so paths are /openapi/public/...
          const specFiles = [
            '/openapi/public/fluentcart-base.json',
            // Orders
            '/openapi/public/orders/list-orders.json',
            '/openapi/public/orders/create-order.json',
            '/openapi/public/orders/get-order.json',
            '/openapi/public/orders/update-order.json',
            '/openapi/public/orders/delete-order.json',
            '/openapi/public/orders/mark-as-paid.json',
            '/openapi/public/orders/refund-order.json',
            '/openapi/public/orders/update-statuses.json',
            // Products
            '/openapi/public/products/list-products.json',
            '/openapi/public/products/create-product.json',
            '/openapi/public/products/get-product.json',
            '/openapi/public/products/update-product-pricing.json',
            '/openapi/public/products/delete-product.json',
            // Customers
            '/openapi/public/customers/list-customers.json',
            '/openapi/public/customers/create-customer.json',
            '/openapi/public/customers/get-customer.json',
            '/openapi/public/customers/update-customer.json',
            // Coupons
            '/openapi/public/coupons/list-coupons.json',
            '/openapi/public/coupons/create-coupon.json',
            '/openapi/public/coupons/get-coupon.json',
            '/openapi/public/coupons/update-coupon.json',
            '/openapi/public/coupons/delete-coupon.json',
            '/openapi/public/coupons/apply-coupon.json',
            // Subscriptions
            '/openapi/public/subscriptions/list-subscriptions.json',
            '/openapi/public/subscriptions/get-subscription.json',
            '/openapi/public/subscriptions/cancel-subscription.json',
            '/openapi/public/subscriptions/reactivate-subscription.json',
            // Tax
            '/openapi/public/tax/list-tax-classes.json',
            '/openapi/public/tax/create-tax-class.json',
            // Shipping
            '/openapi/public/shipping/list-shipping-zones.json',
            // Settings
            '/openapi/public/settings/get-store-settings.json',
            '/openapi/public/settings/save-store-settings.json',
            // Reports
            '/openapi/public/reports/get-overview.json',
            '/openapi/public/reports/quick-order-stats.json',
            // Files
            '/openapi/public/files/list-files.json',
            '/openapi/public/files/upload-file.json',
            // Dashboard
            '/openapi/public/dashboard/get-dashboard-stats.json',
            // Roles & Permissions
            '/openapi/public/roles-permissions/get-permissions.json',
            '/openapi/public/roles-permissions/save-permissions.json',
            // Integration
            '/openapi/public/integration/list-addons.json',
            '/openapi/public/integration/get-global-settings.json',
            '/openapi/public/integration/set-global-settings.json',
            '/openapi/public/integration/get-global-feeds.json',
            // Licensing
            '/openapi/public/licensing/get-license-chart.json',
            '/openapi/public/licensing/get-license-pie-chart.json',
            '/openapi/public/licensing/get-license-summary.json',
            // Email Notification
            '/openapi/public/email-notification/list-notifications.json',
            '/openapi/public/email-notification/get-notification.json',
            '/openapi/public/email-notification/update-notification.json'
          ]
          
          // Fetch all spec files
          const specs = await Promise.all(
            specFiles.map(async (file) => {
              try {
                const response = await fetch(file)
                if (response.ok) {
                  return await response.json()
                }
                return null
              } catch (error) {
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
      
      // Load spec when on OpenAPI pages - ensure it loads before components render
      const loadSpecIfNeeded = async () => {
        const currentPath = window.location.pathname
        if (currentPath.includes('/openapi/')) {
          // Wait for spec to load before allowing page to render
          await loadOpenAPISpec()
        }
      }

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
      
      // Load immediately on page load (before components mount)
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          loadSpecIfNeeded()
          setupMermaidZoom()
        })
      } else {
        // Page already loaded, load spec immediately
        loadSpecIfNeeded()
        setupMermaidZoom()
      }
      
      // Also reload on route changes
      if (router) {
        const originalOnAfterRouteChanged = router.onAfterRouteChanged
        router.onAfterRouteChanged = async (to: string) => {
          if (originalOnAfterRouteChanged) {
            await originalOnAfterRouteChanged(to)
          }
          await loadSpecIfNeeded()
          setupMermaidZoom()
        }
      }
      
      // Also watch for navigation events
      window.addEventListener('popstate', () => {
        loadSpecIfNeeded()
        setupMermaidZoom()
      })
      
      // Watch for hash changes (SPA navigation)
      window.addEventListener('hashchange', () => {
        loadSpecIfNeeded()
        setupMermaidZoom()
      })
      
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
                  <div style="font-weight: 600; font-size: 0.95rem; color: ${PLAYGROUND_INSTRUCTIONS.style.titleColor}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    ${PLAYGROUND_INSTRUCTIONS.title}
                  </div>
                  <p style="margin: 0 0 12px 0; color: ${PLAYGROUND_INSTRUCTIONS.style.textColor}; font-size: 0.875rem; line-height: 1.5;">
                    ${PLAYGROUND_INSTRUCTIONS.description}
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

                const input = serverUrlElement.querySelector('[data-server-url-input]') as HTMLInputElement | null
                const display = serverUrlElement.querySelector('[data-server-url-display]') as HTMLElement | null
                
                if (input && display) {
                  const updateServerUrl = () => {
                    const website = input.value.trim() || 'YourWebsite.com'
                    const fullUrl = `https://${website}/wp-json/fluent-cart/v2`
                    display.textContent = fullUrl
                    window.__customServerUrl = fullUrl
                  }

                  input.addEventListener('input', updateServerUrl)
                  input.addEventListener('change', updateServerUrl)
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
