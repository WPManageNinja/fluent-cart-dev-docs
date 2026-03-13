---
title: Products API
description: FluentCart REST API endpoints for managing products, variations, downloadables, bundles, upgrade paths, and product integrations.
---

# Products API

Manage your product catalog including creating products, managing variations, downloadable files, bundles, upgrade paths, tax/shipping classes, stock management, and product integrations.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/products`

**Policy:** `ProductPolicy`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## Product CRUD & Listing

### List Products

<badge type="tip">GET</badge> `/fluent-cart/v2/products`

Retrieve a paginated list of products with filtering, sorting, and search capabilities.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Search by product title, ID, or variation title |
| `per_page` | integer | query | No | Number of results per page (default: `10`) |
| `page` | integer | query | No | Page number for pagination |
| `sort_by` | string | query | No | Column to sort by (default: `ID`) |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | query | No | Filter tab: `publish`, `draft`, `physical`, `digital`, `subscribable`, `not_subscribable`, `bundle`, `non_bundle` |
| `filter_type` | string | query | No | `simple` or `advanced` |
| `with` | array | query | No | Relations to eager load |
| `search_groups` | array | query | No | Advanced filter groups for complex queries |

#### Response

```json
{
  "products": {
    "total": 50,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5,
    "data": [
      {
        "ID": 123,
        "post_title": "Example Product",
        "post_status": "publish",
        "post_date": "2025-01-15 12:00:00",
        "view_url": "https://example.com/product/example-product",
        "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/123"
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products?search=widget&per_page=20&active_view=publish" \
  -u "username:app_password"
```

---

### Get Product

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{product}`

Retrieve a single product by ID.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product` | integer | path | Yes | The product ID |
| `with` | array | query | No | Relations to eager load (e.g., `["detail", "variants", "product_menu"]`) |

#### Response

```json
{
  "product": {
    "ID": 123,
    "post_title": "Example Product",
    "post_status": "publish",
    "post_excerpt": "Short description",
    "post_content": "Full description"
  },
  "product_menu": []
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123?with[]=detail&with[]=variants" \
  -u "username:app_password"
```

---

### Create Product

<badge type="warning">POST</badge> `/fluent-cart/v2/products`

Create a new product. A default variation is automatically created with the product.

- **Permission:** `products/create`
- **Request Class:** `ProductCreateRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `post_title` | string | body | Yes | Product title (max 200 characters) |
| `post_status` | string | body | No | Post status (e.g., `draft`, `publish`) |
| `detail.fulfillment_type` | string | body | No | `physical` or `digital` (default: `digital`) |
| `detail.other_info.is_bundle_product` | string | body | No | `yes` or `no` (default: `no`) |

#### Response

```json
{
  "data": {
    "ID": 124,
    "variant": {
      "id": 456,
      "post_id": 124,
      "variation_title": "Example Product",
      "stock_status": "in-stock",
      "payment_type": "onetime",
      "total_stock": 1,
      "available": 1,
      "fulfillment_type": "digital"
    },
    "product_details": { ... }
  },
  "message": "Product has been created successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "post_title": "New Digital Product",
    "post_status": "draft",
    "detail": {
      "fulfillment_type": "digital"
    }
  }'
```

---

### Delete Product

<badge type="danger">DELETE</badge> `/fluent-cart/v2/products/{product}`

Delete a product and all associated data.

- **Permission:** `products/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product` | integer | path | Yes | The product ID to delete |

#### Response

```json
{
  "message": "Product deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/products/123" \
  -u "username:app_password"
```

---

### Get Product Pricing

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{productId}/pricing`

Retrieve the full product details including pricing, variants, downloadable files, and taxonomy information.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | path | Yes | The product ID |
| `with` | array | query | No | Additional relations (e.g., `["product_menu"]`) |

#### Response

```json
{
  "product": {
    "ID": 123,
    "post_title": "Example Product",
    "post_status": "publish",
    "post_excerpt": "Short description",
    "featured_image_id": 456,
    "view_url": "https://example.com/product/example",
    "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/123",
    "detail": {
      "id": 1,
      "post_id": 123,
      "fulfillment_type": "digital",
      "variation_type": "simple",
      "manage_stock": 0,
      "manage_downloadable": 0,
      "other_info": { ... }
    },
    "variants": [
      {
        "id": 789,
        "post_id": 123,
        "variation_title": "Default Plan",
        "item_price": 1000,
        "compare_price": 0,
        "stock_status": "in-stock",
        "other_info": { ... },
        "media": []
      }
    ],
    "downloadable_files": []
  },
  "product_menu": "",
  "taxonomies": [
    {
      "name": "product-categories",
      "label": "Product Categories",
      "terms": [],
      "labels": { ... }
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/pricing?with[]=product_menu" \
  -u "username:app_password"
```

---

### Update Product Pricing

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/pricing`

Update a product's pricing, details, variants, and other metadata.

- **Permission:** `products/edit`
- **Request Class:** `ProductUpdateRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `post_title` | string | body | Yes | Product title (max 200 characters) |
| `post_status` | string | body | Yes | Status: `draft`, `publish`, `future` |
| `post_date` | string | body | Conditional | Required when `post_status` is `future`. Must be a future date (GMT) |
| `post_excerpt` | string | body | No | Product short description (limited by `excerpt_length` filter, default 55 words) |
| `post_content` | string | body | No | Product long description (HTML allowed) |
| `post_name` | string | body | No | Product URL slug |
| `comment_status` | string | body | No | Comment status (max 100 chars) |
| `detail.fulfillment_type` | string | body | Yes | `physical` or `digital` |
| `detail.variation_type` | string | body | Yes | `simple` or `simple_variations` |
| `detail.manage_stock` | integer | body | No | `0` or `1` |
| `detail.manage_downloadable` | integer | body | No | `0` or `1` |
| `detail.default_variation_id` | integer | body | No | Default variation ID |
| `detail.stock_availability` | string | body | No | Stock availability status |
| `detail.other_info.group_pricing_by` | string | body | No | `payment_type`, `repeat_interval`, or `none` |
| `detail.other_info.sold_individually` | string | body | No | `yes` or `no` |
| `detail.other_info.use_pricing_table` | string | body | No | Enable pricing table display |
| `detail.other_info.shipping_class` | integer | body | No | Shipping class ID (validated) |
| `detail.other_info.tax_class` | integer | body | No | Tax class ID (validated) |
| `detail.other_info.active_editor` | string | body | No | Active editor mode |
| `variants` | array | body | Conditional | Array of variant objects (required for `simple` type when publishing) |
| `variants.*.variation_title` | string | body | Yes | Variation title (max 200 chars) |
| `variants.*.post_id` | integer | body | Yes | Parent product post ID |
| `variants.*.item_price` | number | body | No | Price in cents (min: 0) |
| `variants.*.compare_price` | number | body | No | Compare-at price in cents (must be >= `item_price`) |
| `variants.*.manage_cost` | string | body | No | Enable cost tracking |
| `variants.*.item_cost` | number | body | Conditional | Required if `manage_cost` is `true` |
| `variants.*.serial_index` | integer | body | No | Display order index |
| `variants.*.sku` | string | body | No | SKU (max 30 chars, must be unique) |
| `variants.*.fulfillment_type` | string | body | No | `physical` or `digital` |
| `variants.*.other_info.payment_type` | string | body | Yes | `onetime` or `subscription` |
| `variants.*.other_info.description` | string | body | No | Variant description (max 255 chars) |
| `variants.*.other_info.repeat_interval` | string | body | Conditional | Required for subscriptions. e.g., `monthly`, `yearly` |
| `variants.*.other_info.times` | string | body | No | Number of billing cycles |
| `variants.*.other_info.trial_days` | string | body | No | Trial period in days (max 365) |
| `variants.*.other_info.billing_summary` | string | body | No | Billing summary text (max 255 chars) |
| `variants.*.other_info.manage_setup_fee` | string | body | Conditional | Required for subscriptions: `yes` or `no` |
| `variants.*.other_info.signup_fee` | number | body | Conditional | Setup fee in cents. Required if `manage_setup_fee` is `yes` |
| `variants.*.other_info.signup_fee_name` | string | body | Conditional | Setup fee label (max 100 chars). Required if `manage_setup_fee` is `yes` |
| `variants.*.other_info.installment` | string | body | No | Enable installment: `yes` or `no` |
| `product_terms` | object | body | No | Taxonomy term IDs (e.g., `{"product-categories": [1, 2]}`) |
| `gallery` | array | body | No | Gallery images array with `id`, `url`, `title` |
| `metaValue` | mixed | body | No | Additional metadata |

#### Response

```json
{
  "data": { ... },
  "message": "Product updated successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/pricing" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "post_title": "Updated Product",
    "post_status": "publish",
    "detail": {
      "fulfillment_type": "digital",
      "variation_type": "simple"
    },
    "variants": [
      {
        "id": 789,
        "post_id": 123,
        "variation_title": "Default Plan",
        "item_price": 1999,
        "other_info": {
          "payment_type": "onetime"
        }
      }
    ]
  }'
```

---

## Product Search & Lookup

### Search Products by Name

<badge type="tip">GET</badge> `/fluent-cart/v2/products/searchProductByName`

Search for published products by name. Returns products formatted for select dropdowns.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `name` | string | query | No | Product name to search for |
| `url_mode` | string | query | No | URL mode flag |
| `termId` | integer | query | No | Filter by taxonomy term ID (product-categories) |

#### Response

```json
{
  "products": [
    {
      "ID": 123,
      "post_title": "Example Product",
      "wpTerms": [...]
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/searchProductByName?name=widget" \
  -u "username:app_password"
```

---

### Search Variants by Name

<badge type="tip">GET</badge> `/fluent-cart/v2/products/searchVariantByName`

Search for published product variants by name. Returns a hierarchical product > variants structure.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `name` | string | query | No | Product/variant name to search |
| `search` | string | query | No | Alternative search parameter (used if `name` is empty) |
| `ids` | array | query | No | Array of product IDs to include |

#### Response

```json
[
  {
    "value": 123,
    "label": "Example Product",
    "children": [
      {
        "value": 456,
        "label": "Monthly Plan"
      },
      {
        "value": 457,
        "label": "Yearly Plan"
      }
    ]
  }
]
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/searchVariantByName?name=pro" \
  -u "username:app_password"
```

---

### Search Product Variant Options

<badge type="tip">GET</badge> `/fluent-cart/v2/products/search-product-variant-options`

Search for product variants suitable for selection (e.g., in order creation). Filters out out-of-stock items.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Search term for product/variant title |
| `include_ids` | array | query | No | Variation IDs to always include in results |
| `scopes` | array | query | No | Model scopes to apply |
| `subscription_status` | string | query | No | `not_subscribable` to exclude subscription variants |

#### Response

```json
{
  "products": [
    {
      "value": "product_123",
      "label": "Example Product",
      "children": [
        {
          "value": 456,
          "label": "Monthly Plan"
        }
      ]
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/search-product-variant-options?search=pro&subscription_status=not_subscribable" \
  -u "username:app_password"
```

---

### Find Subscription Variants

<badge type="tip">GET</badge> `/fluent-cart/v2/products/findSubscriptionVariants`

Search for product variants that have a subscription payment type.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `name` | string | query | No | Variant title to search |

#### Response

```json
[
  {
    "id": 456,
    "title": "Monthly Subscription"
  },
  {
    "id": 457,
    "title": "Yearly Subscription"
  }
]
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/findSubscriptionVariants?name=monthly" \
  -u "username:app_password"
```

---

### Fetch Products by IDs

<badge type="tip">GET</badge> `/fluent-cart/v2/products/fetchProductsByIds`

Retrieve products by an array of IDs. Returns products with their detail relation.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productIds` | array | query | Yes | Array of product IDs to fetch |

#### Response

```json
{
  "products": [
    {
      "ID": 123,
      "post_title": "Example Product",
      "detail": { ... }
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/fetchProductsByIds?productIds[]=123&productIds[]=456" \
  -u "username:app_password"
```

---

### Fetch Variations by IDs

<badge type="tip">GET</badge> `/fluent-cart/v2/products/fetchVariationsByIds`

Retrieve variations by an array of IDs. Returns simplified label/value pairs.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productIds` | array | query | Yes | Array of variation IDs to fetch |

#### Response

```json
{
  "products": [
    {
      "value": 456,
      "label": "Monthly Plan"
    },
    {
      "value": 457,
      "label": "Yearly Plan"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/fetchVariationsByIds?productIds[]=456&productIds[]=457" \
  -u "username:app_password"
```

---

### Suggest SKU

<badge type="tip">GET</badge> `/fluent-cart/v2/products/suggest-sku`

Generate a unique SKU suggestion based on product and variant titles.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `title` | string | query | Yes | Product title to base SKU on |
| `variant_title` | string | query | No | Variant title to include in SKU |
| `exclude_id` | integer | query | No | Variation ID to exclude from uniqueness check |

#### Response

```json
{
  "sku": "EXA-PRO-MON"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/suggest-sku?title=Example%20Product&variant_title=Monthly" \
  -u "username:app_password"
```

---

### Get Max Excerpt Word Count

<badge type="tip">GET</badge> `/fluent-cart/v2/products/get-max-excerpt-word-count`

Returns the maximum allowed word count for product excerpts (controlled by the WordPress `excerpt_length` filter).

- **Permission:** `products/view`

#### Parameters

None.

#### Response

```json
{
  "count": 55
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/get-max-excerpt-word-count" \
  -u "username:app_password"
```

---

### Fetch Taxonomy Terms

<badge type="tip">GET</badge> `/fluent-cart/v2/products/fetch-term`

Retrieve all registered taxonomies and their terms for product categorization.

- **Permission:** `products/view`

#### Parameters

None.

#### Response

```json
{
  "taxonomies": [
    {
      "name": "product-categories",
      "label": "Product Categories",
      "terms": [
        {
          "value": 1,
          "label": "Software",
          "children": []
        }
      ]
    },
    {
      "name": "product-brands",
      "label": "Product Brands",
      "terms": []
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/fetch-term" \
  -u "username:app_password"
```

---

### Fetch Terms by Parent

<badge type="warning">POST</badge> `/fluent-cart/v2/products/fetch-term-by-parent`

Retrieve taxonomy terms filtered by parent term IDs.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `parents` | array | body | Yes | Array of parent term IDs |
| `listeners` | array | body | Yes | Array of taxonomy names to retrieve terms for |

#### Response

```json
{
  "data": {
    "product-categories": [
      {
        "value": 5,
        "label": "Sub Category"
      }
    ]
  }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/fetch-term-by-parent" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "parents": [1, 2],
    "listeners": ["product-categories"]
  }'
```

---

## Bulk Operations

### Bulk Insert Products

<badge type="warning">POST</badge> `/fluent-cart/v2/products/bulk-insert`

Insert multiple products at once. Maximum 10 products per request.

- **Permission:** `products/create`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `products` | array | body | Yes | Array of product data objects (max 10) |

#### Response

```json
{
  "message": "3 product(s) created successfully",
  "created": [ ... ],
  "errors": []
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/bulk-insert" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "post_title": "Product A",
        "detail": { "fulfillment_type": "digital" }
      },
      {
        "post_title": "Product B",
        "detail": { "fulfillment_type": "physical" }
      }
    ]
  }'
```

---

### Bulk Edit Fetch

<badge type="tip">GET</badge> `/fluent-cart/v2/products/bulk-edit-data`

Fetch products formatted for the bulk editing spreadsheet view.

- **Permission:** `products/edit`

#### Parameters

Standard filter parameters (see [List Products](#list-products)).

#### Response

```json
{
  "products": [ ... ],
  "columns": [ ... ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/bulk-edit-data" \
  -u "username:app_password"
```

---

### Bulk Update Products

<badge type="warning">POST</badge> `/fluent-cart/v2/products/bulk-update`

Update multiple products at once from the bulk edit view. Maximum 10 products per request.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `products` | array | body | Yes | Array of product data objects to update (max 10) |

#### Response

```json
{
  "message": "3 product(s) updated successfully",
  "updated": [ ... ],
  "errors": []
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/bulk-update" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "ID": 123,
        "post_title": "Updated Title A"
      }
    ]
  }'
```

---

### Do Bulk Action

<badge type="warning">POST</badge> `/fluent-cart/v2/products/do-bulk-action`

Perform bulk actions on selected products (e.g., publish, draft, delete).

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `action` | string | body | Yes | The bulk action to perform |
| `product_ids` | array | body | Yes | Array of product IDs to act on |

#### Response

```json
{
  "message": "Bulk action completed successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/do-bulk-action" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "publish",
    "product_ids": [123, 456, 789]
  }'
```

---

### Create Dummy Products

<badge type="warning">POST</badge> `/fluent-cart/v2/products/create-dummy`

Create sample/demo products for testing or onboarding purposes.

- **Permission:** `products/create`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `category` | string | body | No | Product category for dummy products |
| `index` | integer | body | No | Index for dummy product generation |

#### Response

Returns the created dummy product data.

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/create-dummy" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "digital",
    "index": 1
  }'
```

---

## Product Details & Configuration

### Duplicate Product

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{productId}/duplicate`

Duplicate a product with options to include or exclude certain settings. The new product is saved as a draft.

- **Permission:** `products/create`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | path | Yes | The product ID to duplicate |
| `import_stock_management` | string | body | No | Include stock management settings (`true`/`false`) |
| `import_license_settings` | string | body | No | Include license settings (`true`/`false`) |
| `import_downloadable_files` | string | body | No | Include downloadable files (`true`/`false`) |

#### Response

```json
{
  "product_id": 125,
  "message": "Product duplicated successfully. The new product has been saved as a draft."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/duplicate" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "import_stock_management": "true",
    "import_license_settings": "true",
    "import_downloadable_files": "false"
  }'
```

---

### Get Related Products

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{productId}/related-products`

Retrieve products related to a given product based on shared categories or brands.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | path | Yes | The product ID |
| `related_by_categories` | boolean | query | No | Include products from same categories |
| `related_by_brands` | boolean | query | No | Include products from same brands |
| `order_by` | string | query | No | Sort order (default: `title_asc`) |
| `posts_per_page` | integer | query | No | Number of related products to return (default: `6`) |

#### Response

```json
{
  "products": [
    {
      "ID": 456,
      "post_title": "Related Product",
      "post_status": "publish"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/related-products?related_by_categories=true&posts_per_page=4" \
  -u "username:app_password"
```

---

### Update Long Description Editor Mode

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/update-long-desc-editor-mode`

Switch the long description editor between modes (e.g., visual, code).

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `active_editor` | string | body | Yes | The editor mode to set |

#### Response

```json
{
  "message": "Editor mode updated successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/update-long-desc-editor-mode" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"active_editor": "visual"}'
```

---

### Update Variant Option

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/update-variant-option`

Sync variant options for a product (used when managing product attribute variations).

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `variation_type` | string | body | Yes | The variation type |
| `product_id` | integer | body | Yes | The product ID |
| `options` | array | body | Yes | Array of option objects with `id` and `variants` |

#### Response

```json
{
  "message": "Variant options synced successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/update-variant-option" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "variation_type": "simple_variations",
    "product_id": 123,
    "options": []
  }'
```

---

### Update Product Detail

<badge type="warning">POST</badge> `/fluent-cart/v2/products/detail/{detailId}`

Update a product detail record (e.g., change variation type).

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `detailId` | integer | path | Yes | The product detail ID |
| `variation_type` | string | body | No | New variation type (e.g., `simple`, `simple_variations`) |
| `variation_ids` | array | body | No | Array of variation IDs |
| `action` | string | body | No | Action to perform (default: `change_variation_type`) |

#### Response

```json
{
  "message": "Product detail updated successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/detail/456" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "variation_type": "simple_variations",
    "action": "change_variation_type"
  }'
```

---

### Add Product Terms

<badge type="warning">POST</badge> `/fluent-cart/v2/products/add-product-terms`

Create new taxonomy terms for products (categories, brands, etc.).

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `term.name` | string | body | Yes | Term name(s), comma-separated for multiple |
| `term.taxonomy` | string | body | Yes | Taxonomy name (e.g., `product-categories`, `product-brands`) |
| `term.parent` | integer | body | No | Parent term ID for hierarchical terms |

#### Response

```json
{
  "term_ids": [10, 11],
  "names": ["Category A", "Category B"]
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/add-product-terms" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "term": {
      "name": "New Category,Another Category",
      "taxonomy": "product-categories",
      "parent": 0
    }
  }'
```

---

### Sync Taxonomy Terms

<badge type="warning">POST</badge> `/fluent-cart/v2/products/sync-taxonomy-term/{postId}`

Sync (replace) taxonomy terms for a product.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `taxonomy` | string | body | Yes | Taxonomy name (e.g., `product-categories`) |
| `terms` | array | body | No | Array of term IDs to sync |

#### Response

```json
{
  "message": "Taxonomy terms synced successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/sync-taxonomy-term/123" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "taxonomy": "product-categories",
    "terms": [1, 5, 10]
  }'
```

---

### Delete Taxonomy Term

<badge type="warning">POST</badge> `/fluent-cart/v2/products/delete-taxonomy-term/{postId}`

Remove a specific taxonomy term from a product.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `taxonomy` | string | body | Yes | Taxonomy name (e.g., `product-categories`) |
| `term` | integer | body | Yes | Term ID to remove |

#### Response

```json
{
  "message": "Taxonomy term removed successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/delete-taxonomy-term/123" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "taxonomy": "product-categories",
    "term": 5
  }'
```

---

### Get Pricing Widgets

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{productId}/pricing-widgets`

Retrieve sales overview widgets for a product (all-time, last 30 days, this month).

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | path | Yes | The product ID |

#### Response

```json
{
  "widgets": [
    {
      "title": "Quick Sales Overview",
      "body": "<ul class=\"fct-lists\"><li><span>All time (5)</span><span>$50.00</span></li>...</ul>"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/pricing-widgets" \
  -u "username:app_password"
```

---

## Bundle Products

### Get Bundle Info

<badge type="tip">GET</badge> `/fluent-cart/v2/products/get-bundle-info/{productId}`

Retrieve bundle configuration information for a product, including child variant mappings.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | path | Yes | The product ID |

#### Response

```json
[
  {
    "id": 789,
    "variation_title": "Bundle Plan",
    "other_info": {
      "bundle_child_ids": [101, 102, 103]
    }
  }
]
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/get-bundle-info/123" \
  -u "username:app_password"
```

---

### Save Bundle Info

<badge type="warning">POST</badge> `/fluent-cart/v2/products/save-bundle-info/{variationId}`

Save bundle child variant IDs for a variation. Bundle products cannot be added as children of other bundles.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variationId` | integer | path | Yes | The variation ID to configure as a bundle |
| `bundle_child_ids` | array | body | Yes | Array of child variation IDs |

#### Response

```json
[true]
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/save-bundle-info/789" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "bundle_child_ids": [101, 102, 103]
  }'
```

---

## Upgrade Paths

### Get Upgrade Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{id}/upgrade-paths`

Retrieve all upgrade path configurations for a product.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The product ID |

#### Response

```json
{
  "data": [ ... ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/upgrade-paths" \
  -u "username:app_password"
```

---

### Save Upgrade Path

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{id}/upgrade-path`

Create a new upgrade path for a product.

- **Permission:** `products/edit`
- **Request Class:** `UpgradePathSettingRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The product ID |
| `from_variant` | integer | body | Yes | Source variation ID (must exist in `fct_product_variations`) |
| `to_variants` | array | body | Yes | Array of target variation IDs (each must exist in `fct_product_variations`) |
| `discount_amount` | number | body | No | Discount amount for the upgrade |
| `title` | string | body | No | Upgrade path title |
| `description` | string | body | No | Upgrade path description |
| `slug` | string | body | No | Upgrade path slug |

#### Response

```json
{
  "message": "Settings saved successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/upgrade-path" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "from_variant": 456,
    "to_variants": [457, 458],
    "discount_amount": 500
  }'
```

---

### Update Upgrade Path

<badge type="warning">POST</badge> `/fluent-cart/v2/products/upgrade-path/{id}/update`

Update an existing upgrade path.

- **Permission:** `products/edit`
- **Request Class:** `UpgradePathSettingRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The upgrade path ID |
| `from_variant` | integer | body | Yes | Source variation ID |
| `to_variants` | array | body | Yes | Array of target variation IDs |
| `discount_amount` | number | body | No | Discount amount |
| `title` | string | body | No | Upgrade path title |
| `description` | string | body | No | Upgrade path description |
| `slug` | string | body | No | Upgrade path slug |

#### Response

```json
{
  "message": "Settings updated successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/upgrade-path/10/update" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "from_variant": 456,
    "to_variants": [458, 459],
    "discount_amount": 1000
  }'
```

---

### Delete Upgrade Path

<badge type="danger">DELETE</badge> `/fluent-cart/v2/products/upgrade-path/{id}/delete`

Delete an upgrade path.

- **Permission:** `products/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The upgrade path ID |

#### Response

```json
{
  "message": "Path deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/products/upgrade-path/10/delete" \
  -u "username:app_password"
```

---

### Get Variation Upgrade Paths

<badge type="tip">GET</badge> `/fluent-cart/v2/products/variation/{variantId}/upgrade-paths`

Retrieve available upgrade paths for a specific variation (used in customer-facing upgrade flows).

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variantId` | integer | path | Yes | The variation ID |
| `params.order_hash` | string | query | Yes | The order hash to determine applicable upgrades |

#### Response

```json
{
  "upgradePaths": [ ... ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/variation/456/upgrade-paths?params[order_hash]=abc123" \
  -u "username:app_password"
```

---

## Tax & Shipping Classes

### Update Tax Class

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/tax-class`

Assign a tax class to a product.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `tax_class` | integer | body | Yes | Tax class ID |

#### Response

```json
{
  "message": "Tax Class updated successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/tax-class" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"tax_class": 5}'
```

---

### Remove Tax Class

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/tax-class/remove`

Remove the assigned tax class from a product.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |

#### Response

```json
{
  "message": "Tax Class removed successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/tax-class/remove" \
  -u "username:app_password"
```

---

### Update Shipping Class

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/shipping-class`

Assign a shipping class to a product.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `shipping_class` | integer | body | Yes | Shipping class ID |

#### Response

```json
{
  "message": "Shipping Class updated successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/shipping-class" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"shipping_class": 3}'
```

---

### Remove Shipping Class

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/shipping-class/remove`

Remove the assigned shipping class from a product.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |

#### Response

```json
{
  "message": "Shipping Class removed successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/shipping-class/remove" \
  -u "username:app_password"
```

---

## Stock Management

### Update Inventory

<badge type="info">PUT</badge> `/fluent-cart/v2/products/{postId}/update-inventory/{variantId}`

Update stock levels for a specific variant. Automatically updates stock status and product-level availability.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `variantId` | integer | path | Yes | The variant ID to update |
| `total_stock` | integer | body | Yes | Total stock quantity |
| `available` | integer | body | Yes | Available stock quantity |

#### Response

```json
{
  "message": "Inventory updated successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/products/123/update-inventory/456" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "total_stock": 100,
    "available": 80
  }'
```

---

### Update Manage Stock Setting

<badge type="info">PUT</badge> `/fluent-cart/v2/products/{postId}/update-manage-stock`

Enable or disable stock management for a product and all its variants.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `manage_stock` | integer | body | Yes | `1` to enable, `0` to disable stock management |

#### Response

```json
{
  "message": "Manage stock updated successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/products/123/update-manage-stock" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"manage_stock": 1}'
```

---

## Downloadables

### Sync Downloadable Files

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{postId}/sync-downloadable-files`

Attach multiple downloadable files to a product. Automatically enables the `manage_downloadable` flag.

- **Permission:** `products/edit`
- **Validation Class:** `ProductDownloadableBulkFileRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `postId` | integer | path | Yes | The product post ID |
| `downloadable_files` | array | body | Yes | Array of downloadable file objects |
| `downloadable_files.*.title` | string | body | Yes | File title (max 160 chars) |
| `downloadable_files.*.type` | string | body | Yes | File type (max 100 chars) |
| `downloadable_files.*.driver` | string | body | Yes | Storage driver (max 60 chars, e.g., `local`, `s3`) |
| `downloadable_files.*.file_name` | string | body | Yes | File name (max 185 chars) |
| `downloadable_files.*.file_path` | string | body | Yes | File path (max 185 chars) |
| `downloadable_files.*.file_url` | string | body | Yes | File URL (max 200 chars) |
| `downloadable_files.*.bucket` | string | body | No | Storage bucket name |
| `downloadable_files.*.file_size` | string | body | No | File size |
| `downloadable_files.*.serial` | integer | body | No | Display order serial |
| `downloadable_files.*.product_variation_id` | array | body | No | Array of variation IDs this file is associated with |
| `downloadable_files.*.settings.download_limit` | integer | body | No | Maximum number of downloads allowed |
| `downloadable_files.*.settings.download_expiry` | integer | body | No | Download expiry in days |

#### Response

```json
{
  "downloadable_files": [
    {
      "id": 1,
      "post_id": 123,
      "title": "Software v1.0",
      "type": "zip",
      "driver": "local",
      "file_name": "software-v1.zip",
      "download_identifier": "a1b2c3d4-..."
    }
  ]
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/sync-downloadable-files" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 123,
    "downloadable_files": [
      {
        "title": "Software v1.0",
        "type": "zip",
        "driver": "local",
        "file_name": "software-v1.zip",
        "file_path": "software-v1.zip",
        "file_url": "software-v1.zip",
        "product_variation_id": [456],
        "settings": {
          "download_limit": 5,
          "download_expiry": 365
        }
      }
    ]
  }'
```

---

### Update Downloadable File

<badge type="info">PUT</badge> `/fluent-cart/v2/products/{downloadableId}/update`

Update an existing downloadable file record.

- **Permission:** `products/edit`
- **Validation Class:** `ProductDownloadableFileRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `downloadableId` | integer | path | Yes | The downloadable file ID |
| `title` | string | body | Yes | File title (max 100 chars) |
| `type` | string | body | Yes | File type (max 100 chars) |
| `driver` | string | body | Yes | Storage driver (max 100 chars) |
| `file_name` | string | body | Yes | File name (max 100 chars) |
| `product_variation_id` | array | body | No | Array of variation IDs |
| `serial` | integer | body | No | Display order serial |
| `settings` | object | body | No | File settings |
| `settings.download_limit` | integer | body | No | Maximum downloads allowed |
| `settings.download_expiry` | integer | body | No | Download expiry in days |

#### Response

```json
{
  "message": "Product downloadable files updated successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/products/789/update" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software v2.0",
    "type": "zip",
    "driver": "local",
    "file_name": "software-v2.zip",
    "product_variation_id": [456, 457],
    "settings": {
      "download_limit": 10
    }
  }'
```

---

### Delete Downloadable File

<badge type="danger">DELETE</badge> `/fluent-cart/v2/products/{downloadableId}/delete`

Delete a downloadable file record.

- **Permission:** `products/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `downloadableId` | integer | path | Yes | The downloadable file ID |

#### Response

```json
{
  "message": "File deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/products/789/delete" \
  -u "username:app_password"
```

---

### Get Downloadable URL

<badge type="tip">GET</badge> `/fluent-cart/v2/products/getDownloadableUrl/{downloadableId}`

Generate a temporary download URL for a downloadable file (valid for 7 days).

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `downloadableId` | integer | path | Yes | The downloadable file ID |

#### Response

```json
{
  "url": "https://example.com/fluent-cart/download?token=..."
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/getDownloadableUrl/789" \
  -u "username:app_password"
```

---

## Variations

### List Product Variations

<badge type="tip">GET</badge> `/fluent-cart/v2/products/variants`

Retrieve a list of product variations.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params` | object | query | No | Query parameters for filtering variations |

#### Response

```json
{
  "variants": [ ... ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/variants" \
  -u "username:app_password"
```

---

### Create Variation

<badge type="warning">POST</badge> `/fluent-cart/v2/products/variants`

Create a new product variation.

- **Permission:** `products/create`
- **Request Class:** `ProductVariationRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variants.post_id` | integer | body | Yes | Parent product ID |
| `variants.variation_title` | string | body | Yes | Variation title (max 200 chars) |
| `variants.sku` | string | body | No | SKU (max 30 chars, must be unique) |
| `variants.item_price` | number | body | No | Price in cents (min: 0) |
| `variants.compare_price` | number | body | No | Compare-at price in cents (must be >= `item_price`) |
| `variants.manage_cost` | string | body | No | Enable cost tracking |
| `variants.item_cost` | number | body | Conditional | Required if `manage_cost` is `true` |
| `variants.fulfillment_type` | string | body | Yes | `physical` or `digital` |
| `variants.manage_stock` | integer | body | No | `0` or `1` |
| `variants.stock_status` | string | body | Conditional | Required if `manage_stock` is `1`. Values: `in-stock`, `out-of-stock` |
| `variants.total_stock` | integer | body | Yes | Total stock quantity |
| `variants.available` | integer | body | Yes | Available stock |
| `variants.committed` | integer | body | Yes | Committed stock |
| `variants.on_hold` | integer | body | Yes | Stock on hold |
| `variants.serial_index` | integer | body | No | Display order index |
| `variants.downloadable` | string | body | No | Downloadable flag |
| `variants.other_info.payment_type` | string | body | Yes | `onetime` or `subscription` |
| `variants.other_info.description` | string | body | No | Description (max 255 chars) |
| `variants.other_info.repeat_interval` | string | body | Conditional | Required for subscriptions (e.g., `monthly`, `yearly`) |
| `variants.other_info.times` | number | body | No | Number of billing cycles |
| `variants.other_info.trial_days` | number | body | No | Trial days (max 365) |
| `variants.other_info.billing_summary` | string | body | No | Billing summary (max 255 chars) |
| `variants.other_info.manage_setup_fee` | string | body | Conditional | Required for subscriptions: `yes` or `no` |
| `variants.other_info.signup_fee` | number | body | Conditional | Setup fee in cents. Required if `manage_setup_fee` is `yes` |
| `variants.other_info.signup_fee_name` | string | body | Conditional | Setup fee label (max 100 chars). Required if `manage_setup_fee` is `yes` |
| `variants.media` | array | body | No | Media images array with `id`, `url`, `title` |

#### Response

```json
{
  "variant": {
    "id": 460,
    "post_id": 123,
    "variation_title": "Pro Plan",
    "item_price": 2999,
    "sku": "PRO-PLN",
    "stock_status": "in-stock"
  },
  "message": "Variation created successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/variants" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "variants": {
      "post_id": 123,
      "variation_title": "Pro Plan",
      "item_price": 2999,
      "sku": "PRO-PLN",
      "fulfillment_type": "digital",
      "total_stock": 1,
      "available": 1,
      "committed": 0,
      "on_hold": 0,
      "other_info": {
        "payment_type": "onetime"
      }
    }
  }'
```

---

### Update Variation

<badge type="warning">POST</badge> `/fluent-cart/v2/products/variants/{variantId}`

Update an existing product variation.

- **Permission:** `products/edit`
- **Request Class:** `ProductVariationRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variantId` | integer | path | Yes | The variation ID to update |

All body parameters are the same as [Create Variation](#create-variation).

#### Response

```json
{
  "variant": { ... },
  "message": "Variation updated successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/variants/460" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "variants": {
      "id": 460,
      "post_id": 123,
      "variation_title": "Pro Plan - Updated",
      "item_price": 3999,
      "fulfillment_type": "digital",
      "total_stock": 1,
      "available": 1,
      "committed": 0,
      "on_hold": 0,
      "other_info": {
        "payment_type": "onetime"
      }
    }
  }'
```

---

### Delete Variation

<badge type="danger">DELETE</badge> `/fluent-cart/v2/products/variants/{variantId}`

Delete a product variation.

- **Permission:** `products/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variantId` | integer | path | Yes | The variation ID to delete |

#### Response

```json
{
  "message": "Variation deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/products/variants/460" \
  -u "username:app_password"
```

---

### Set Variation Media

<badge type="warning">POST</badge> `/fluent-cart/v2/products/variants/{variantId}/setMedia`

Set media/images for a variation.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variantId` | integer | path | Yes | The variation ID |
| `media` | array | body | Yes | Array of media objects |
| `media.*.id` | integer | body | Yes | WordPress attachment ID |
| `media.*.title` | string | body | No | Image title |
| `media.*.url` | string | body | No | Image URL |

#### Response

```json
{
  "message": "Media set successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/variants/460/setMedia" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "media": [
      {
        "id": 101,
        "title": "Product Image",
        "url": "https://example.com/wp-content/uploads/product.jpg"
      }
    ]
  }'
```

---

### Update Variation Pricing Table

<badge type="info">PUT</badge> `/fluent-cart/v2/products/variants/{variantId}/pricing-table`

Update the pricing table description for a variation.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variantId` | integer | path | Yes | The variation ID |
| `description` | string | body | Yes | Pricing table description text (newlines preserved) |

#### Response

```json
{
  "message": "Pricing table updated successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/products/variants/460/pricing-table" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Includes:\n- Feature A\n- Feature B\n- Priority Support"
  }'
```

---

## Variants (VariantController)

### List All Variants

<badge type="tip">GET</badge> `/fluent-cart/v2/variants`

Retrieve all product variations across all products (separate route group using `VariantController`).

- **Permission:** `products/view`
- **Policy:** `ProductPolicy`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `params` | object | query | No | Query parameters for filtering |

#### Response

Returns an array of all product variation objects.

```json
[
  {
    "id": 456,
    "post_id": 123,
    "variation_title": "Default Plan",
    "item_price": 1000,
    "sku": null,
    "stock_status": "in-stock",
    "payment_type": "onetime",
    "other_info": { ... }
  }
]
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/variants" \
  -u "username:app_password"
```

---

## Product Integrations

### Get Product Integration Feeds

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{productId}/integrations`

Retrieve all integration feeds configured for a product, along with available integrations.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `productId` | integer | path | Yes | The product ID |

#### Response

```json
{
  "feeds": [
    {
      "id": 10,
      "name": "Add to FluentCRM List",
      "enabled": "yes",
      "provider": "fluentcrm",
      "feed": { ... },
      "scope": "product"
    }
  ],
  "available_integrations": {
    "fluentcrm": {
      "title": "FluentCRM",
      "logo": "...",
      "enabled": true,
      "scopes": ["product", "order"]
    }
  },
  "all_module_config_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/integrations" \
  -u "username:app_password"
```

---

### Get Product Integration Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/products/{product_id}/integrations/{integration_name}/settings`

Retrieve settings for a specific integration type on a product. Returns the integration form configuration, existing settings, and product variations.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID |
| `integration_name` | string | path | Yes | Integration provider name (e.g., `fluentcrm`) |
| `integration_id` | integer | query | No | Existing integration feed ID to load for editing |

#### Response

```json
{
  "settings": {
    "conditional_variation_ids": [],
    ...
  },
  "fields": [ ... ],
  "product_variations": [
    {
      "id": 456,
      "title": "Monthly Plan"
    }
  ],
  "scope": "product"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/products/123/integrations/fluentcrm/settings" \
  -u "username:app_password"
```

---

### Save Product Integration

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{product_id}/integrations`

Create or update an integration feed for a product.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID |
| `integration_name` | string | body | Yes | Integration provider name |
| `integration_id` | integer | body | No | Existing feed ID (for updates) |
| `integration` | string (JSON) | body | Yes | JSON-encoded integration settings object |

#### Response

```json
{
  "message": "Integration has been successfully saved",
  "integration_id": 10,
  "integration_name": "fluentcrm",
  "created": true,
  "feedData": { ... }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/integrations" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "integration_name": "fluentcrm",
    "integration": "{\"name\":\"Add to List\",\"list_id\":1,\"enabled\":\"yes\"}"
  }'
```

---

### Delete Product Integration

<badge type="danger">DELETE</badge> `/fluent-cart/v2/products/{product_id}/integrations/{integration_id}`

Delete a product integration feed.

- **Permission:** `products/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID |
| `integration_id` | integer | path | Yes | The integration feed ID to delete |

#### Response

```json
{
  "message": "Integration deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/products/123/integrations/10" \
  -u "username:app_password"
```

---

### Change Integration Status

<badge type="warning">POST</badge> `/fluent-cart/v2/products/{product_id}/integrations/feed/change-status`

Enable or disable a product integration feed.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `product_id` | integer | path | Yes | The product ID |
| `notification_id` | integer | body | Yes | The integration feed ID |
| `status` | string | body | Yes | `yes` to enable, `no` to disable |

#### Response

```json
{
  "message": "Integration status has been updated"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/products/123/integrations/feed/change-status" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 123,
    "notification_id": 10,
    "status": "yes"
  }'
```
