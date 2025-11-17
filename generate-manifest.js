// Script to generate OpenAPI manifest for development mode
import { readdirSync, statSync, writeFileSync, existsSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sourceDir = join(__dirname, 'public', 'openapi')
const manifestPath = join(sourceDir, 'manifest.json')

// Array to store all discovered JSON file paths
const jsonFiles = []

// Recursive function to find all JSON files
function findJsonFiles(dir) {
  if (!existsSync(dir)) return
  
  const files = readdirSync(dir)
  files.forEach(file => {
    if (file === 'README.md' || file === 'manifest.json') return
    
    const fullPath = join(dir, file)
    const stats = statSync(fullPath)
    
    if (stats.isDirectory()) {
      findJsonFiles(fullPath)
    } else if (file.endsWith('.json')) {
      const relativePath = relative(sourceDir, fullPath).replace(/\\/g, '/')
      jsonFiles.push(`/openapi/public/${relativePath}`)
    }
  })
}

// Find all JSON files
findJsonFiles(sourceDir)

// Generate manifest
const manifest = {
  files: jsonFiles,
  generated: new Date().toISOString()
}

// Write manifest.json
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.log(`✓ Generated manifest with ${jsonFiles.length} OpenAPI spec files`)

