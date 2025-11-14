import DefaultTheme from 'vitepress/theme'
import { theme, useOpenapi } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'
import './style.css'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    // Load and merge multiple OpenAPI specification files
    try {
      // List of spec files to load and merge
      const specFiles = [
        '/openapi-base.json',
        '/orders.json'
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
          // Preserve servers from base spec
          servers: baseSpec.servers || [],
          paths: {},
          components: {
            ...baseSpec.components,
            schemas: { ...baseSpec.components?.schemas }
          }
        }
        
        // Merge paths and schemas from all specs
        validSpecs.forEach(spec => {
          if (spec.paths) {
            Object.assign(mergedSpec.paths, spec.paths)
          }
          if (spec.components?.schemas) {
            Object.assign(mergedSpec.components.schemas, spec.components.schemas)
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
            if (text.includes('wordpressAuth') || 
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
    
    // Fix: Intercept fetch to add "Basic " prefix to Authorization header if missing
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch
      window.fetch = function(...args) {
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

