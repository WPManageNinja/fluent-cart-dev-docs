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
        '/files.json',
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
      } else {
        console.error('No valid OpenAPI specs found')
      }
    } catch (error) {
      console.error('Error loading OpenAPI specs:', error)
    }

    // Use the theme.
    theme.enhanceApp({ app })
  }
}

