---
title: Advanced Inventory API
description: FluentCart Pro REST API endpoints for stock levels, bulk stock adjustments, the adjustment audit trail, and inventory export.
---

# Advanced Inventory API

::: info Pro Feature
All advanced inventory endpoints require FluentCart Pro to be installed and activated.
:::

::: warning The routes are registered conditionally
Advanced inventory registers its routes only when **Stock Management** is active *and* its `enable_advanced_inventory` setting is `yes`. Until both are true the routes do not exist and WordPress answers `404 rest_no_route`.

Turning the module on through `POST /settings/modules` also runs the migration that creates the `fct_stock_adjustments` table, so the audit trail works from the first write. Writing the option directly skips that step.
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
| `with` | array | query | No | Eager-load relations. See below. |

::: danger Send `with` as an array
`with` must be an array — `?with[]=detail`. A bare string (`?with=detail`) is rejected by the filter's type declaration and the request fails with `500 plugin_exception`. This applies to every filtered list endpoint in the API, not just this one.
:::

The `with` parameter is **allowlisted** — arbitrary relation names are rejected rather than passed through:

| Value | Effect |
|-------|--------|
| `admin_inventory_list_v2` | Both relations, with variant columns narrowed and the variant list capped at 10 per product. What the current admin table sends. |
| `admin_inventory_list` | The legacy shape: both relations, variant columns narrowed, no cap on the variant list. Kept so an older free-plugin frontend running against a newer Pro keeps working. |
| `detail` | The catalogue detail row on its own. |
| `variants` | The variant rows on their own, unnarrowed. |

The two screen keys exist because free and Pro update independently on real stores. New integrations should use `admin_inventory_list_v2` and read the capped variant list, or ask for `variants` and page it with `GET /inventory/variants`.

Extend the allowlist with the `fluent_cart/inventory_allowed_withs` filter.

Relations outside the allowlist — `downloadable_files`, `integrations`, `licensesMeta`, `postmeta`, `wp_terms` and the order-side relations — are not reachable from this endpoint at any depth.

The list response is a paginator under `products`:

```json
{
  "products": {
    "current_page": 1,
    "data": [],
    "per_page": 10,
    "total": 0,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null
  }
}
```

---

### List Variants

<badge type="tip">GET</badge> `/fluent-cart/v2/inventory/variants`

Every variant of one product, paginated. Use this when a product has more variants than the capped `admin_inventory_list_v2` list returns.

- **Permission:** `products/view`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `post_id` | integer | query | **Yes** | The product. Returns `400 Product ID is required` without it. |
| `per_page` | integer | query | No | Default `10`, clamped into the **1–100** range. |
| `page` | integer | query | No | Offset page, from `1`. Ignored when `after_id` is sent. |
| `after_id` | integer | query | No | Keyset cursor: return the next page strictly after this variant ID. |

Prefer `after_id` when you are walking the whole list. Offset pages shift if a variant is deleted mid-walk — ranks slide down and a row can fall between two pages, which the client cannot detect. The keyset form continues past the last ID you hold, so nothing is skipped.

Both forms answer with the same read contract, a `{data, total}` object under `variants`, where `total` is the product's full variant count rather than the size of this page:

```json
{
  "variants": {
    "data": [],
    "total": 0
  }
}
```

The offset form returns the full paginator (`current_page`, `per_page`, `next_page_url` and the rest) around those two keys; the keyset form returns `data` and `total` only.

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

Invalid input across this group is rejected with `400` and a bare `message`:

| Message | Endpoint |
|---------|----------|
| `Product ID is required` | List Variants |
| `Variant ID is required` | Get Adjustment History |
| `Required parameters are missing` | Update Stock |
| `Invalid reason.` | Update Stock, Bulk Update |
| `Custom reason is required when reason is "other".` | Update Stock, Bulk Update |
| `Invalid mode. Allowed: add, set` | Bulk Update |
| `Invalid scope.` | Export |
| `Invalid inventoryState.` | Export |

`Variant not found` is the one `404` in the group: Update Stock returns it when the `variant_id` does not resolve under the given `post_id`.
