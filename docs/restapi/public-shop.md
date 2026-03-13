---
title: Public Shop API
description: FluentCart REST API endpoints for the public-facing product catalog and shop.
---

# Public Shop API

Public endpoints for browsing the product catalog, viewing products, and searching. No authentication required.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/public`

**Policy:** `PublicPolicy` (no authentication required)

---

## List Products

<badge type="tip">GET</badge> `/fluent-cart/v2/public/products`

Retrieve a paginated list of published products with optional filtering by taxonomy terms, price range, product type, and more. Only products with `publish` status are returned. Product `post_content` and sensitive detail fields (`item_cost`, `editing_stage`, `stock`, `manage_stock`, `manage_cost`, `settings`) are hidden from the response.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `per_page` | integer | query | No | Number of products per page (default: `10`) |
| `current_page` | integer | query | No | Page number for offset-based pagination |
| `cursor` | string | query | No | Cursor token for cursor-based pagination |
| `paginate_using` | string | query | No | Pagination strategy: `cursor` for cursor-based, omit for offset-based |
| `order_type` | string | query | No | Sort direction: `ASC` or `DESC` (default: `DESC`) |
| `with` | array | query | No | Relations to eager load (e.g., `["detail"]`) |
| `allow_out_of_stock` | boolean | query | No | Include out-of-stock products (default: `false`) |
| `include_ids` | array | query | No | Only return products with these IDs (max 100 IDs) |
| `exclude_ids` | array | query | No | Exclude products with these IDs (max 100 IDs) |
| `product_type` | string | query | No | Filter by product type. Values: `physical`, `digital`, `subscription`, `onetime`, `simple`, `simple_variations` |
| `on_sale` | boolean | query | No | Only return products currently on sale (compare price > item price) |
| `default_filters` | object | query | No | Shortcode-level filters applied as defaults (see filter fields below) |
| `filters` | object | query | No | Interactive user-applied filters (override defaults). See filter fields below |

#### Filter Fields (within `default_filters` and `filters`)

| Field | Type | Description |
|-------|------|-------------|
| `wildcard` | string | Search by product title |
| `enable_wildcard_for_post_content` | integer | Set to `1` to also search product content |
| `sort_by` | string | Sort preset: `name-asc`, `name-desc`, `price-low`, `price-high`, `date-newest`, `date-oldest` |
| `price_range_from` | float | Minimum price filter (in decimal, e.g., `10.00`) |
| `price_range_to` | float | Maximum price filter (in decimal, e.g., `99.99`) |
| `{taxonomy_slug}` | string/array | Filter by taxonomy term IDs (e.g., `product-categories`) |

#### Response

```json
{
  "products": {
    "products": {
      "total": 24,
      "per_page": 10,
      "current_page": 1,
      "last_page": 3,
      "data": [
        {
          "ID": 42,
          "post_title": "Premium T-Shirt",
          "post_status": "publish",
          "post_excerpt": "High-quality cotton t-shirt",
          "guid": "https://example.com/?p=42",
          "view_url": "https://example.com/product/premium-t-shirt",
          "has_subscription": false,
          "thumbnail": "https://example.com/wp-content/uploads/tshirt.jpg",
          "detail": {
            "id": 15,
            "post_id": 42,
            "variation_type": "simple",
            "min_price": 2500,
            "max_price": 2500,
            "fulfillment_type": "physical"
          }
        }
      ]
    },
    "total": 24
  }
}
```

::: info
Product prices (`min_price`, `max_price`) are returned in **cents** (integer). Divide by 100 to get the decimal amount.
:::

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/public/products?per_page=12&filters[sort_by]=price-low&filters[price_range_from]=10&filters[price_range_to]=50"
```

---

## Get Product Views (HTML)

<badge type="tip">GET</badge> `/fluent-cart/v2/public/product-views`

Retrieve server-rendered HTML views of product listings. Used by Gutenberg blocks and shortcodes for AJAX-powered product grids. Returns pre-rendered HTML along with pagination metadata, eliminating the need for client-side template rendering.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `per_page` | integer | query | No | Number of products per page (default: `10`) |
| `current_page` | integer | query | No | Current page number (default: `1`) |
| `template_provider` | string | query | No | Template provider identifier for custom rendering via the `fluent_cart/products_views/preload_collection_{provider}` filter |
| `client_id` | string | query | No | Client identifier used to retrieve cached block markup from transients |
| _...all parameters from [List Products](#list-products)_ | | | | All product filtering parameters are also supported |

#### Response

When a template provider or cached markup is available:
```json
{
  "products": {
    "views": "<div class=\"fct-product-card\">...rendered HTML...</div>",
    "current_page": 1,
    "last_page": 3,
    "total": 24,
    "per_page": 10,
    "from": 1,
    "to": 10
  }
}
```

When falling back to default rendering:
```json
{
  "products": {
    "views": "<div class=\"fct-product-card\">...rendered HTML...</div>",
    "total": 24,
    "last_page": 3,
    "per_page": 10,
    "from": 1,
    "to": 10,
    "page": 1,
    "current_page": 1
  }
}
```

#### Rendering Priority

The endpoint uses the following priority to determine how products are rendered:

1. **Template Provider** -- If `template_provider` is set, the `fluent_cart/products_views/preload_collection_{provider}` filter is called. If a view is returned, it is used immediately.
2. **Cached Block Markup** -- If `client_id` is set and a matching transient exists (`fct_product_loop_client_{client_id}`), the cached Gutenberg block markup is processed with `do_blocks()`.
3. **Default Renderer** -- Falls back to `ProductListRenderer` for standard server-side rendering.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/public/product-views?per_page=12&current_page=2&filters[sort_by]=date-newest"
```

---

## Search Products

<badge type="tip">GET</badge> `/fluent-cart/v2/public/product-search`

Search for published products by title and return server-rendered HTML search result items. Designed for use with the storefront search bar component.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `post_title` | string | query | Yes | The search query string to match against product titles |
| `url_mode` | string | query | No | URL mode passed to the `SearchBarRenderer` to control how product links are generated |
| `termId` | integer | query | No | Filter search results to products within a specific taxonomy term (category) ID |

#### Response

```json
{
  "htmlView": "<div class=\"fct-search-result-item\"><a href=\"https://example.com/product/premium-t-shirt\">Premium T-Shirt</a></div>..."
}
```

::: info
The response contains pre-rendered HTML for direct insertion into the search results dropdown. The HTML structure is generated by `SearchBarRenderer` and includes product titles, links, and taxonomy term badges.
:::

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/public/product-search?post_title=shirt&termId=5"
```
