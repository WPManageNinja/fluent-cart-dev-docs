---
title: Advanced Inventory API
description: FluentCart Pro REST API endpoints for stock levels, bulk stock adjustments, the adjustment audit trail, and inventory export.
---

# Advanced Inventory API

::: info Pro Feature
All advanced inventory endpoints require FluentCart Pro to be installed and activated.
:::

Manage stock across product variants: read current levels, adjust them individually or in bulk, read the audit trail of every adjustment, and export the whole inventory as CSV.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

All routes in this group are guarded by `ProductPolicy` and require `products/view` to read or `products/edit` to write.

---

## The four stock numbers

Every variant carries four related quantities. Getting these straight is the key to using this API correctly:

| Field | Meaning |
|-------|---------|
| `total_stock` | Physical units on hand. This is what you set. |
| `committed` | Units sold and awaiting fulfillment. |
| `on_hold` | Units reserved by in-flight checkouts. |
| `available` | **Derived:** `total_stock - committed - on_hold`, floored at `0`. |

`available` is never written directly — it is recalculated on every adjustment. Because it is the derived value, it is also what the stats buckets are computed from, not `total_stock`.

Only variants with `manage_stock = 1` appear anywhere in this API.

---

## Adjustment reasons

Every write records an entry in the stock-adjustment audit trail, and every write must state a reason:

| `reason` | Label |
|----------|-------|
| `received` | Received Stock |
| `damage` | Damage/Loss |
| `return` | Return/Refund |
| `correction` | Count Correction |
| `transfer` | Inventory Transfer |
| `other` | Other |

When `reason` is `other`, `customReason` becomes **required** and is stored alongside the entry. Any other value for `reason` is rejected with `400`.

---

## Endpoints

### List Inventory

<badge type="tip">GET</badge> `/fluent-cart/v2/inventory`

Paginated list of stock-managed products with their variants. A product appears only if its detail row **and** at least one of its variants have `manage_stock = 1`.

- **Permission:** `products/view`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number. |
| `per_page` | integer | query | No | Records per page. |
| `search` | string | query | No | Matches product title, variant SKU, or variation title. Also supports operator syntax (e.g. `sku = TES-RED-XS`). |
| `sort_by` | string | query | No | Column to sort by (default: `id`). |
| `sort_type` | string | query | No | `asc` or `desc`. |
| `active_view` | string | query | No | Tab filter: `all`, `low_stock`, `out_of_stock`. |
| `filter_type` | string | query | No | `simple` (default) or `advanced`. |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded advanced filter groups. |
| `with` | string | query | No | Eager-load relations. See below. |

The `with` parameter is **allowlisted** — arbitrary relation names are rejected rather than passed through:

| Value | Effect |
|-------|--------|
| `admin_inventory_list` | Both relations, with variant columns narrowed. Used by the admin table. |
| `detail` | The catalogue detail row on its own. |
| `variants` | The variant rows on their own, unnarrowed. |

Extend it with the `fluent_cart/inventory_allowed_withs` filter.

---

### Get Inventory Stats

<badge type="tip">GET</badge> `/fluent-cart/v2/inventory/stats`

Counts of stock-managed variants bucketed by availability.

- **Permission:** `products/view`

```json
{
  "totalVariants": 24,
  "inStock": 0,
  "lowStock": 24,
  "outOfStock": 0
}
```

Buckets are computed on `available`:

- `outOfStock` — `available <= 0`
- `lowStock` — `0 < available <= threshold`
- `inStock` — `available > threshold`

The threshold defaults to **10** and is filterable:

```php
add_filter('fluent_cart/inventory_low_stock_threshold', function ($threshold) {
    return 25;
});
```

---

### Get Adjustment History

<badge type="tip">GET</badge> `/fluent-cart/v2/inventory/adjustment-history`

Audit trail for one variant, newest first, capped at the **100** most recent entries.

- **Permission:** `products/view`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `variant_id` | integer | query | **Yes** | Returns `400 Variant ID is required` without it. |

Each entry carries `old_stock`, `new_stock`, a computed `change` delta, the `reason` and its human-readable `reason_label`, and the acting `user_name` — which falls back to `System` when the user no longer exists.

---

### Update Stock

<badge type="tip">POST</badge> `/fluent-cart/v2/inventory/update-stock`

Sets the absolute stock level for one variant and records an audit entry.

- **Permission:** `products/edit`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `variant_id` | integer | **Yes** | Variant to update. |
| `post_id` | integer | **Yes** | Parent product ID. Must match the variant's own `post_id` or the request returns `404`. |
| `new_stock` | integer | **Yes** | New `total_stock`. Negative values are clamped to `0`. |
| `reason` | string | **Yes** | See reasons above. |
| `customReason` | string | Conditional | Required when `reason` is `other`. |

---

### Bulk Update Stock

<badge type="tip">POST</badge> `/fluent-cart/v2/inventory/bulk-update`

Adjusts many variants in one call.

- **Permission:** `products/edit`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | string | **Yes** | `set` writes `value` as the new absolute stock; `add` adds `value` to the current stock. |
| `value` | integer | **Yes** | The absolute value or the delta. Negative deltas subtract. |
| `reason` | string | **Yes** | See reasons above. |
| `customReason` | string | Conditional | Required when `reason` is `other`. |
| `items` | array | **Yes** | Array of `{ "id": <variant_id> }`. Only `id` is read. |

::: warning Unknown IDs are skipped silently
Variant IDs that do not resolve are ignored without an error. The response's `count` is the number of variants **actually** updated — compare it against the number of items you sent to detect a partial application. An empty `items` array is a successful no-op with `count: 0`.
:::

---

### Export Inventory

<badge type="tip">POST</badge> `/fluent-cart/v2/inventory/export`

Builds a CSV and returns it **inline as a string**. No file is written and no download URL is issued — the client is expected to turn `csvData` into a file itself.

- **Permission:** `products/view`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scope` | string | **Yes** | `all`, `current_page` (caps the query at 1000 rows), or `selected` (restricted to `items`). |
| `inventoryState` | string | **Yes** | `available` or `full`. Controls the column set. |
| `format` | string | No | `csv_spreadsheet` (default) prefixes a UTF-8 BOM so Excel opens the file correctly. Any other value omits it. |
| `items` | array | Conditional | Array of `{ "id": <variant_id> }`, read only when `scope` is `selected`. |

Columns by `inventoryState`:

- `available` — `ID, SKU, Product Title, Variation Title, Available`
- `full` — `ID, SKU, Product Title, Variation Title, Total Stock, Available, On Hold, Delivered`

Note that the `full` header labels `committed` as **Delivered**.
