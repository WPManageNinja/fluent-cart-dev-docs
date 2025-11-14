# Instructions: Creating Separate JSON Files for API Operations

This guide explains how to create separate JSON files for each API operation, following the same pattern used for the Orders API.

## Overview

The OpenAPI documentation uses a modular structure where each API operation has its own JSON file. This allows multiple documentation writers to work independently on different operations without conflicts.

## File Structure

```
public/
├── fluentcart-base.json       # FluentCart base spec with common info, servers, security
├── orders/                    # Orders API operations
│   ├── list-orders.json
│   ├── create-order.json
│   ├── get-order.json
│   ├── update-order.json
│   ├── delete-order.json
│   ├── mark-as-paid.json
│   ├── refund-order.json
│   └── update-statuses.json
├── products/                  # Products API operations (to be created)
├── customers/                 # Customers API operations (to be created)
├── coupons/                   # Coupons API operations (to be created)
└── ...                        # Other API sections
```

## Step-by-Step Process

### Step 1: Identify API Sections

Review the files in `fluent-cart-dev-docs/docs/api/` to identify all API sections:

- `coupons.md`
- `customers.md`
- `dashboard.md`
- `email-notification.md`
- `files.md`
- `integration.md`
- `licensing.md`
- `order-bump.md`
- `orders.md` ✅ (already done)
- `products.md`
- `reports.md`
- `roles-permissions.md`
- `settings.md`
- `shipping.md`
- `subscriptions.md`
- `tax.md`

### Step 2: Read the API Documentation File

For each API section (e.g., `products.md`):

1. Open the markdown file in `fluent-cart-dev-docs/docs/api/`
2. Identify all endpoints/operations listed
3. Note the HTTP method (GET, POST, PUT, DELETE, etc.)
4. Note the endpoint path
5. Note all parameters, request bodies, and response structures

### Step 3: Create Directory Structure

For each API section, create a directory in `public/`:

```bash
mkdir -p public/products
mkdir -p public/customers
mkdir -p public/coupons
# ... etc
```

### Step 4: Create JSON File for Each Operation

For each operation in the API documentation, create a separate JSON file.

#### File Naming Convention

Use kebab-case based on the operation:
- `list-products.json` (GET /products)
- `create-product.json` (POST /products)
- `get-product.json` (GET /products/{id})
- `update-product.json` (POST /products/{id})
- `delete-product.json` (DELETE /products/{id})

#### JSON File Structure

Each JSON file should follow this structure:

```json
{
  "paths": {
    "/endpoint/path": {
      "get|post|put|delete": {
        "operationId": "camelCaseOperationName",
        "summary": "HTTP_METHOD Operation Name",
        "description": "Detailed description from the markdown file",
        "tags": ["SectionName"],
        "security": [
          {
            "ApplicationPasswords": []
          }
        ],
        "parameters": [
          // Query, path, or header parameters
        ],
        "requestBody": {
          // For POST/PUT requests
        },
        "responses": {
          "200": {
            "description": "Success description",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ResponseSchema"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      // All schemas referenced by this operation
      // Include request schemas, response schemas, and nested schemas
    }
  }
}
```

#### Key Points:

1. **operationId**: Use camelCase (e.g., `listProducts`, `createProduct`)
2. **summary**: Include HTTP method and operation name (e.g., "GET List Products")
3. **description**: Copy from the markdown file
4. **tags**: Use the API section name (e.g., "Products", "Customers")
5. **security**: Always use `"ApplicationPasswords": []`
6. **schemas**: Include ALL schemas that this operation references, even if they're shared

### Step 5: Extract Schemas

For each operation, identify and include all required schemas:

1. **Request Schemas**: For POST/PUT operations
   - Create schemas for request bodies
   - Include all nested objects

2. **Response Schemas**: 
   - Create schemas for successful responses
   - Include all nested objects (e.g., Product, Customer, OrderItem)

3. **Common Schemas**: 
   - If a schema is used by multiple operations, include it in each file
   - Common schemas like `Address`, `Customer`, `Error` can be duplicated

#### Schema Example:

```json
"components": {
  "schemas": {
    "Product": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "Product ID",
          "example": 1
        },
        "title": {
          "type": "string",
          "description": "Product title",
          "example": "Sample Product"
        }
      }
    },
    "ProductResponse": {
      "type": "object",
      "properties": {
        "success": {
          "type": "boolean"
        },
        "data": {
          "type": "object",
          "properties": {
            "product": {
              "$ref": "#/components/schemas/Product"
            }
          }
        }
      }
    }
  }
}
```

### Step 6: Add Files to Theme Configuration

After creating all JSON files for a section, update `.vitepress/theme/index.js`:

1. Find the `specFiles` array (around line 12)
2. Add all new JSON file paths:

```javascript
const specFiles = [
  '/fluentcart-base.json',  // FluentCart base spec
  // Orders (existing)
  '/orders/list-orders.json',
  '/orders/create-order.json',
  // ... other orders files
  
  // Products (new)
  '/products/list-products.json',
  '/products/create-product.json',
  '/products/get-product.json',
  // ... other products files
  
  // Customers (new)
  '/customers/list-customers.json',
  // ... other customers files
]
```

### Step 7: Create Markdown Files for Operations

For each operation, create a corresponding markdown file in `operations/`:

1. Create directory structure: `operations/products/`, `operations/customers/`, etc.
2. Create markdown file: `operations/products/list-products.md`

#### Markdown File Template:

```markdown
---
title: List Products
description: "Retrieve a paginated list of products with optional filtering and searching."
outline: false
---
<OAOperation operationId="listProducts" />
```

**Important Notes:**
- `title`: Should match the operation summary (without HTTP method)
- `description`: Must be in quotes if it contains special characters
- `operationId`: Must match the `operationId` in the JSON file

### Step 8: Update Sidebar Configuration

Update `.vitepress/config.js` to add new sections to the sidebar:

```javascript
sidebar: [
  {
    text: 'Getting Started',
    items: [
      { text: 'Introduction', link: '/' },
      { text: 'API Reference', link: '/api' }
    ]
  },
  {
    text: 'Orders',
    items: [
      { text: 'List Orders (GET)', link: '/operations/orders/list-orders' },
      // ... other orders
    ]
  },
  {
    text: 'Products',
    items: [
      { text: 'List Products (GET)', link: '/operations/products/list-products' },
      { text: 'Create Product', link: '/operations/products/create-product' },
      // ... other products
    ]
  }
  // ... other sections
]
```

## Example: Creating Products API

### 1. Read `products.md`

Identify operations:
- GET `/products` - List Products
- POST `/products` - Create Product
- GET `/products/{id}` - Get Product
- POST `/products/{id}` - Update Product
- DELETE `/products/{id}` - Delete Product

### 2. Create Directory

```bash
mkdir -p public/products
```

### 3. Create `list-products.json`

```json
{
  "paths": {
    "/products": {
      "get": {
        "operationId": "listProducts",
        "summary": "GET List Products",
        "description": "Retrieve a paginated list of products with optional filtering and searching.",
        "tags": ["Products"],
        "security": [
          {
            "ApplicationPasswords": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            },
            "description": "Page number for pagination"
          }
          // ... more parameters
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProductListResponse"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Product": {
        // ... product schema
      },
      "ProductListResponse": {
        // ... response schema
      }
    }
  }
}
```

### 4. Create `operations/products/list-products.md`

```markdown
---
title: List Products
description: "Retrieve a paginated list of products with optional filtering and searching."
outline: false
---
<OAOperation operationId="listProducts" />
```

### 5. Update `theme/index.js`

Add to `specFiles` array:
```javascript
'/products/list-products.json',
```

### 6. Update `config.js`

Add to sidebar:
```javascript
{
  text: 'Products',
  items: [
    { text: 'List Products (GET)', link: '/operations/products/list-products' }
  ]
}
```

## Checklist for Each API Section

- [ ] Read the API markdown file
- [ ] Identify all operations/endpoints
- [ ] Create directory in `public/`
- [ ] Create JSON file for each operation
- [ ] Include all required schemas in each JSON file
- [ ] Create markdown file for each operation in `operations/`
- [ ] Add JSON files to `specFiles` in `theme/index.js`
- [ ] Add operations to sidebar in `config.js`
- [ ] Test that operations load correctly
- [ ] Verify "Try it out" functionality works

## Tips

1. **Start Small**: Begin with one operation to understand the pattern
2. **Copy Structure**: Use existing `orders/` files as templates
3. **Include All Schemas**: Each JSON file should be self-contained
4. **Test Frequently**: After adding a few operations, test the documentation
5. **Consistent Naming**: Follow the naming conventions used in orders
6. **Description Quotes**: Always quote descriptions in markdown frontmatter if they contain special characters

## Common Patterns

### GET with Query Parameters
```json
"parameters": [
  {
    "name": "page",
    "in": "query",
    "schema": { "type": "integer", "default": 1 },
    "description": "Page number"
  }
]
```

### POST with Request Body
```json
"requestBody": {
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/CreateRequest"
      }
    }
  }
}
```

### Path Parameters
```json
"parameters": [
  {
    "name": "id",
    "in": "path",
    "required": true,
    "schema": { "type": "integer" },
    "description": "Resource ID"
  }
]
```

## Troubleshooting

### Operation Not Showing
- Check that the JSON file is in `specFiles` array
- Verify the `operationId` matches in JSON and markdown
- Check browser console for errors

### Schemas Not Found
- Ensure all referenced schemas are included in the JSON file
- Check for typos in `$ref` paths

### "Try it out" Not Working
- Verify server URL is set correctly
- Check that Authorization is configured
- Ensure the endpoint path is correct

## Next Steps

1. Start with `products.md` - it's similar to orders
2. Then move to `customers.md`
3. Continue with other sections
4. Test each section as you complete it

Good luck! 🚀

