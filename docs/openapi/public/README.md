# OpenAPI Specification Files

This directory contains modular OpenAPI specification files that are automatically merged at runtime.

## File Structure

- **`openapi-base.json`** - Base specification with common info, servers, security, and shared schemas (Error)
- **`files.json`** - Files API endpoints and File schema
- **`orders.json`** - Orders API endpoints and Order-related schemas

## Adding New API Sections

To add a new API section (e.g., Products, Customers):

1. Create a new JSON file (e.g., `products.json`)
2. Include only the paths and schemas for that section:
   ```json
   {
     "paths": {
       "/products": { ... }
     },
     "components": {
       "schemas": {
         "Product": { ... }
       }
     }
   }
   ```
3. Add the filename to the `specFiles` array in `.vitepress/theme/index.js`

## Benefits

- **Modular**: Each API section is in its own file
- **Maintainable**: Easy to update individual sections
- **Scalable**: Add new sections without touching existing files
- **Automatic Merging**: All specs are merged at runtime

