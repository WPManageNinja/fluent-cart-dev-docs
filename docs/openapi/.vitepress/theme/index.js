import DefaultTheme from 'vitepress/theme'
import { theme, useOpenapi } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'
import './style.css'

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
  async enhanceApp({ app }) {
    // Load and merge multiple OpenAPI specification files
    try {
      // List of spec files to load and merge
      const specFiles = [
        '/fluentcart-base.json',
        // Orders
        '/orders/list-orders.json',
        '/orders/create-order.json',
        '/orders/get-order.json',
        '/orders/update-order.json',
        '/orders/delete-order.json',
        '/orders/mark-as-paid.json',
        '/orders/refund-order.json',
        '/orders/update-statuses.json',
        // Products
        '/products/list-products.json',
        '/products/create-product.json',
        '/products/get-product.json',
        '/products/update-product-pricing.json',
        '/products/delete-product.json',
        // Customers
        '/customers/list-customers.json',
        '/customers/create-customer.json',
        '/customers/get-customer.json',
        '/customers/update-customer.json',
        // Coupons
        '/coupons/list-coupons.json',
        '/coupons/create-coupon.json',
        '/coupons/get-coupon.json',
        '/coupons/update-coupon.json',
        '/coupons/delete-coupon.json',
        '/coupons/apply-coupon.json',
        // Subscriptions
        '/subscriptions/list-subscriptions.json',
        '/subscriptions/get-subscription.json',
        '/subscriptions/cancel-subscription.json',
        '/subscriptions/reactivate-subscription.json',
        // Tax
        '/tax/list-tax-classes.json',
        '/tax/create-tax-class.json',
        // Shipping
        '/shipping/list-shipping-zones.json',
        // Settings
        '/settings/get-store-settings.json',
        '/settings/save-store-settings.json',
        // Reports
        '/reports/get-overview.json',
        '/reports/quick-order-stats.json',
        // Files
        '/files/list-files.json',
        '/files/upload-file.json',
        // Dashboard
        '/dashboard/get-dashboard-stats.json',
        // Roles & Permissions
        '/roles-permissions/get-permissions.json',
        '/roles-permissions/save-permissions.json',
        // Integration
        '/integration/list-addons.json',
        '/integration/get-global-settings.json',
        '/integration/set-global-settings.json',
        '/integration/get-global-feeds.json',
        // Licensing
        '/licensing/get-license-chart.json',
        '/licensing/get-license-pie-chart.json',
        '/licensing/get-license-summary.json',
        // Email Notification
        '/email-notification/list-notifications.json',
        '/email-notification/get-notification.json',
        '/email-notification/update-notification.json'
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
      // Silently handle errors
    }

    // Use the theme.
    theme.enhanceApp({ app })
    
    // Remove "Powered by VitePress OpenAPI" footer
    if (typeof window !== 'undefined') {
      const removePoweredBy = () => {
        // Find and remove elements containing "Powered by" text
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        )
        
        let node
        while (node = walker.nextNode()) {
          if (node.textContent && node.textContent.includes('Powered by')) {
            let parent = node.parentElement
            // Remove the parent element containing the text
            while (parent && parent !== document.body) {
              const text = parent.textContent || ''
              if (text.includes('Powered by') && text.includes('VitePress OpenAPI')) {
                parent.remove()
                break
              }
              parent = parent.parentElement
            }
          }
        }
      }
      
      // Run after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removePoweredBy)
      } else {
        removePoweredBy()
      }
      
      // Also watch for dynamically added content
      setTimeout(removePoweredBy, 500)
      setTimeout(removePoweredBy, 1000)
      setTimeout(removePoweredBy, 2000)
      
      const observer = new MutationObserver(() => {
        removePoweredBy()
      })
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true })
      }
    }
    
    // Set placeholder for authorization input field
    if (typeof window !== 'undefined') {
      const setPlaceholder = () => {
        // Find all inputs and check if they're in the authorization section
        const allInputs = document.querySelectorAll('input')
        allInputs.forEach(input => {
          // Look for inputs near "wordpressAuth" text or in authorization-related sections
          let parent = input.parentElement
          let found = false
          let depth = 0
          
          // Check up to 5 levels up the DOM tree
          while (parent && depth < 5 && !found) {
            const text = parent.textContent || ''
            const className = parent.className || ''
            
            // Check if this is the authorization section
            if (text.includes('ApplicationPasswords') || 
                text.includes('wordpressAuth') || 
                text.includes('Authorization') || 
                className.toLowerCase().includes('auth') ||
                className.toLowerCase().includes('security')) {
              input.placeholder = 'username:application_password'
              found = true
            }
            
            parent = parent.parentElement
            depth++
          }
        })
      }
      
      // Try multiple times to catch dynamically loaded content
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setPlaceholder)
      } else {
        setPlaceholder()
      }
      
      setTimeout(setPlaceholder, 500)
      setTimeout(setPlaceholder, 1000)
      setTimeout(setPlaceholder, 2000)
      
      // Watch for DOM changes
      const observer = new MutationObserver(() => {
        setPlaceholder()
      })
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true })
      }
    }

    // Add server URL input field to playground
    if (typeof window !== 'undefined') {
      const addServerUrlInput = () => {
        // Find the playground container - look for common vitepress-openapi classes
        const playgroundSelectors = [
          '[class*="playground"]',
          '[class*="Playground"]',
          '[class*="oa-playground"]',
          '.OAPlayground'
        ]

        let playgroundContainer = null
        
        // First try standard selectors
        for (const selector of playgroundSelectors) {
          try {
            const elements = document.querySelectorAll(selector)
            if (elements.length > 0) {
              // Find the parent container that likely contains the playground
              for (const el of elements) {
                let parent = el.closest('[class*="operation"]') || 
                            el.closest('[class*="Operation"]') ||
                            el.closest('details')?.parentElement
                if (parent) {
                  playgroundContainer = parent
                  break
                }
              }
              if (playgroundContainer) break
            }
          } catch (e) {
            // Skip invalid selectors
            continue
          }
        }

        // If not found, try finding by content (Authorization or Variables sections)
        if (!playgroundContainer) {
          const allDetails = document.querySelectorAll('details')
          for (const details of allDetails) {
            const summary = details.querySelector('summary')
            if (summary) {
              const text = summary.textContent || ''
              if (text.includes('Authorization') || text.includes('Variables')) {
                playgroundContainer = details.parentElement
                break
              }
            }
          }
        }

        // Find the Authorization section specifically
        const allDetails = document.querySelectorAll('details')
        let authSection = null
        
        for (const details of allDetails) {
          const summary = details.querySelector('summary')
          if (summary) {
            const text = summary.textContent || ''
            if (text.includes('Authorization')) {
              authSection = details
              break
            }
          }
        }

        // If we found the Authorization section, add instructions and server URL input inside it
        if (authSection) {
          const existingInstructions = authSection.querySelector('[data-playground-instructions]')
          const existingServerInput = authSection.querySelector('[data-server-url-input]')
          if (existingInstructions && existingServerInput) return // Already added

          // Find the content area inside the details element
          // Look for the div that contains the authorization content
          let contentArea = authSection.querySelector('div')
          if (!contentArea) {
            // If no div found, create one
            contentArea = document.createElement('div')
            authSection.appendChild(contentArea)
          }

          // Create playground instructions HTML with integrated warning
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

          // Create server URL input HTML
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

          // Create temporary containers to parse the HTML
          const tempInstructionsDiv = document.createElement('div')
          tempInstructionsDiv.innerHTML = instructionsHtml
          const instructionsElement = tempInstructionsDiv.firstElementChild

          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = serverUrlHtml
          const serverUrlElement = tempDiv.firstElementChild

          // Insert instructions first, then server URL input
          if (contentArea.firstChild) {
            contentArea.insertBefore(instructionsElement, contentArea.firstChild)
            contentArea.insertBefore(serverUrlElement, instructionsElement.nextSibling)
          } else {
            contentArea.appendChild(instructionsElement)
            contentArea.appendChild(serverUrlElement)
          }

          // Add event listener to update server URL
          const input = serverUrlElement.querySelector('[data-server-url-input]')
          const display = serverUrlElement.querySelector('[data-server-url-display]')
          
          if (input && display) {
            const updateServerUrl = () => {
              const website = input.value.trim() || 'YourWebsite.com'
              const fullUrl = `https://${website}/wp-json/fluent-cart/v2`
              display.textContent = fullUrl

              // Update the OpenAPI spec server variable
              // This will be handled by intercepting fetch and modifying the URL
              window.__customServerUrl = fullUrl
            }

            input.addEventListener('input', updateServerUrl)
            input.addEventListener('change', updateServerUrl)
          }
        }
      }

      // Try multiple times to catch dynamically loaded content
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addServerUrlInput)
      } else {
        addServerUrlInput()
      }

      setTimeout(addServerUrlInput, 500)
      setTimeout(addServerUrlInput, 1000)
      setTimeout(addServerUrlInput, 2000)

      // Watch for DOM changes
      const serverObserver = new MutationObserver(() => {
        addServerUrlInput()
      })
      if (document.body) {
        serverObserver.observe(document.body, { childList: true, subtree: true })
      }
    }
    
    // Fix: Intercept fetch to add "Basic " prefix to Authorization header if missing
    // Also update server URL if custom server URL is set
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch
      window.fetch = function(...args) {
        // Update server URL if custom server URL is set
        if (window.__customServerUrl && args[0] && typeof args[0] === 'string') {
          // Check if this is an API request (contains /wp-json/fluent-cart/v2)
          if (args[0].includes('/wp-json/fluent-cart/v2')) {
            try {
              // Extract the endpoint path (everything after /wp-json/fluent-cart/v2)
              const match = args[0].match(/\/wp-json\/fluent-cart\/v2(\/[^?#]*)?(\?.*)?(#.*)?/)
              if (match) {
                // window.__customServerUrl already includes /wp-json/fluent-cart/v2
                // So we just append the endpoint path and query string
                const endpointPath = match[1] || ''
                const queryString = match[2] || ''
                args[0] = window.__customServerUrl + endpointPath + queryString
              }
            } catch (e) {
              // If regex fails, try simple string replacement
              const baseMatch = args[0].match(/https?:\/\/[^\/]+(\/wp-json\/fluent-cart\/v2.*)/)
              if (baseMatch) {
                const endpointPath = baseMatch[1].replace('/wp-json/fluent-cart/v2', '')
                args[0] = window.__customServerUrl + endpointPath
              }
            }
          }
        }

        // Fix Authorization header if needed
        if (args[1] && args[1].headers) {
          const headers = args[1].headers
          
          // Helper function to process auth value
          const processAuthValue = (authValue) => {
            if (!authValue) return null
            
            // If it already has Basic or Bearer prefix, return as is
            if (authValue.startsWith('Basic ') || authValue.startsWith('Bearer ')) {
              return authValue
            }
            
            // If it looks like base64 (no colon), add Basic prefix
            if (!authValue.includes(':')) {
              return 'Basic ' + authValue
            }
            
            // If it's in username:password format, encode it
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
          
          // Handle Headers object
          if (headers instanceof Headers) {
            const authValue = headers.get('authorization') || headers.get('Authorization')
            if (authValue) {
              const processed = processAuthValue(authValue)
              if (processed && processed !== authValue) {
                headers.set('Authorization', processed)
              }
            }
          } 
          // Handle plain object
          else if (headers instanceof Object) {
            const authKey = headers.authorization ? 'authorization' : (headers.Authorization ? 'Authorization' : null)
            if (authKey) {
              const authValue = headers[authKey]
              if (authValue) {
                const processed = processAuthValue(authValue)
                if (processed && processed !== authValue) {
                  headers[authKey] = processed
                }
              }
            }
          }
        }
        
        return originalFetch.apply(this, args)
      }
    }
  }
}

