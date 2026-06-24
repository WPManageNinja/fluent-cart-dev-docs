---
title: Inventory API
description: FluentCart REST API endpoints for the Advanced Inventory module — stock statistics, stock-managed product listing, adjustment history, single and bulk stock updates, and CSV export.
---

# Inventory API

Manage stock levels for stock-managed product variations: view aggregate stock statistics, browse stock-managed products, inspect a variation's adjustment history, update stock individually or in bulk, and export inventory as CSV.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/inventory`

**Policy:** `ProductPolicy`

> **Requires the FluentCart Pro plugin with Advanced Inventory enabled.** These routes are only registered when the Advanced Inventory feature is turned on.

> Stock values (`total_stock`, `available`, `committed`, `on_hold`) are plain integer quantities, not monetary amounts.

---

## Get Inventory Stats

<badge type="tip">GET</badge> `/fluent-cart/v2/inventory/stats`

Retrieve aggregate stock counts across stock-managed variations. Only variations with `manage_stock` enabled are counted. The low-stock threshold defaults to `10` and is filterable via `fluent_cart/inventory_low_stock_threshold`.

- **Permission:** `products/view`

#### Parameters

None.

#### Response

```json
{
  "totalVariants": 120,
  "inStock": 80,
  "lowStock": 25,
  "outOfStock": 15
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/inventory/stats" \
  -u "username:app_password"
```

---

## List Inventory

<badge type="tip">GET</badge> `/fluent-cart/v2/inventory/`

Retrieve a paginated list of stock-managed products, each with its variations and current stock levels.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Matches product title, variation SKU, or variation title |
| `active_view` | string | query | No | Tab filter: `all`, `low_stock`, `out_of_stock` |
| `filter_type` | string | query | No | `simple` (default) or `advanced` |
| `sort_by` | string | query | No | Column to sort by |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `per_page` | integer | query | No | Number of results per page (default: `10`) |
| `page` | integer | query | No | Page number for pagination |

#### Response

```json
{
  "products": {
    "total": 42,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5,
    "data": [
      {
        "ID": 123,
        "post_title": "Example Product",
        "post_content": "Full product description.",
        "post_excerpt": "Short summary.",
        "post_status": "publish",
        "thumbnail": "https://example.com/wp-content/uploads/product.jpg",
        "view_url": "https://example.com/product/example-product",
        "gallery": [],
        "detail": { "fulfillment_type": "physical" },
        "variants": [
          {
            "id": 460,
            "post_id": 123,
            "variation_title": "Small",
            "sku": "EX-SM",
            "manage_stock": 1,
            "total_stock": 50,
            "available": 48,
            "committed": 2,
            "on_hold": 0,
            "stock_status": "in-stock"
          }
        ]
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/inventory/?active_view=low_stock&per_page=20" \
  -u "username:app_password"
```

---

## Get Adjustment History

<badge type="tip">GET</badge> `/fluent-cart/v2/inventory/adjustment-history`

Retrieve the stock adjustment history for a single variation, most recent first (up to 100 records).

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variant_id` | integer | query | Yes | The variation ID whose adjustment history to retrieve |

#### Response

```json
{
  "adjustments": [
    {
      "id": 12,
      "variant_id": 460,
      "post_id": 123,
      "old_stock": 30,
      "new_stock": 50,
      "change": 20,
      "reason": "received",
      "reason_label": "Received Stock",
      "custom_reason": "",
      "user_id": 1,
      "user_name": "admin",
      "created_at": "2026-06-24 12:00:00",
      "updated_at": "2026-06-24 12:00:00"
    }
  ],
  "variant_id": 460
}
```

The `reason` is one of `received`, `damage`, `return`, `correction`, `transfer`, or `other`; `reason_label` is its human-readable label.

**Error (`400` — missing `variant_id`):**

```json
{
  "message": "Variant ID is required"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/inventory/adjustment-history?variant_id=460" \
  -u "username:app_password"
```

---

## Update Stock

<badge type="warning">POST</badge> `/fluent-cart/v2/inventory/update-stock`

Set a new total stock level for a single variation and record a stock adjustment. The `available` quantity is recomputed as `max(0, new_stock - committed - on_hold)`.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variant_id` | integer | body | Yes | The variation ID to update |
| `post_id` | integer | body | Yes | The parent product ID the variation belongs to |
| `new_stock` | integer | body | Yes | New total stock level (clamped to a minimum of `0`) |
| `reason` | string | body | Yes | One of `received`, `damage`, `return`, `correction`, `transfer`, `other` |
| `customReason` | string | body | No | Free-text reason. Required only when `reason` is `other` |

#### Response

```json
{
  "message": "Stock updated successfully",
  "variant_id": 460,
  "new_stock": 50
}
```

**Errors:**

```json
{ "message": "Required parameters are missing" }
```
```json
{ "message": "Variant not found" }
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/inventory/update-stock" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": 460,
    "post_id": 123,
    "new_stock": 50,
    "reason": "received"
  }'
```

---

## Bulk Update Stock

<badge type="warning">POST</badge> `/fluent-cart/v2/inventory/bulk-update`

Add to or set the total stock level for multiple variations in one request, recording an adjustment per variation. Stock is clamped to a minimum of `0` and `available` is recomputed per variation. Variation IDs that do not exist are skipped.

- **Permission:** `products/edit`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `mode` | string | body | Yes | `add` increments each variation's stock by `value`; `set` replaces it with `value` |
| `value` | integer | body | Yes | The amount to add or the value to set |
| `reason` | string | body | Yes | One of `received`, `damage`, `return`, `correction`, `transfer`, `other` |
| `customReason` | string | body | No | Free-text reason. Required only when `reason` is `other` |
| `items` | array | body | Yes | Array of `{ "id": <variantId> }` objects |

#### Response

```json
{
  "message": "Stock updated successfully",
  "count": 3
}
```

When `items` is empty: `{ "message": "No items to update", "count": 0 }`.

**Error (`400`):**

```json
{ "message": "Invalid mode. Allowed: add, set" }
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/inventory/bulk-update" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "add",
    "value": 10,
    "reason": "received",
    "items": [{ "id": 460 }, { "id": 461 }, { "id": 462 }]
  }'
```

---

## Export Inventory

<badge type="warning">POST</badge> `/fluent-cart/v2/inventory/export`

Export stock-managed inventory as CSV data returned inline in the response. Only variations with `manage_stock` enabled are included.

- **Permission:** `products/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `scope` | string | body | Yes | `all`, `current_page`, or `selected` (uses `items`) |
| `inventoryState` | string | body | Yes | `available` (ID, SKU, Product Title, Variation Title, Available) or `full` (adds Total Stock, On Hold, Delivered) |
| `format` | string | body | No | Output format (default: `csv_spreadsheet`). `csv_spreadsheet` prepends a UTF-8 BOM |
| `items` | array | body | No | Array of `{ "id": <variantId> }` objects, used when `scope` is `selected` |

#### Response

```json
{
  "message": "Inventory exported successfully",
  "filename": "inventory-export-2026-06-24-12-00-00.csv",
  "csvData": "ID,SKU,Product Title,Variation Title,Total Stock,Available,On Hold,Delivered\n460,EX-SM,Example Product,Small,50,48,0,2\n"
}
```

**Error (`400`):**

```json
{ "message": "Invalid scope." }
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/inventory/export" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "all",
    "inventoryState": "full",
    "format": "csv_spreadsheet"
  }'
```
