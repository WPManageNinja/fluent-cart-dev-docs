---
title: Data Export API
description: FluentCart Pro REST API endpoints for cursor-paginated, self-throttling exports of orders, customers, subscriptions and licenses.
---

# Data Export API

::: info Pro Feature
All data export endpoints require FluentCart Pro to be installed and activated.
:::

Export orders, customers, subscriptions and licenses as flat CSV records or nested JSON records. Every entity exposes the same two-endpoint shape: a **schema** endpoint that describes what can be exported, and a **batch** endpoint that streams it out in cursor-paginated chunks.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

---

## Entities and permissions

| Entity | Schema | Batch | Permission | Policy |
|--------|--------|-------|------------|--------|
| Orders | `GET /data-export/orders/schema` | `POST /data-export/orders/batch` | `orders/export` | `OrderPolicy` |
| Customers | `GET /data-export/customers/schema` | `POST /data-export/customers/batch` | `customers/export` | `CustomerPolicy` |
| Subscriptions | `GET /data-export/subscriptions/schema` | `POST /data-export/subscriptions/batch` | `subscriptions/export` | `OrderPolicy` |
| Licenses | `GET /data-export/licenses/schema` | `POST /data-export/licenses/batch` | `licenses/export` | `LicensePolicy` |
| Accounting | `GET /data-export/accounting/schema` | `POST /data-export/accounting/batch` | `reports/export` | `AccountingExportPolicy` |

::: warning Licenses are module-gated
The two license routes are only **registered** when the licensing module is active (`ModuleSettings::isActive('license')`). When the module is off the routes do not exist at all and WordPress returns `404 rest_no_route` — you will not get a friendly `409`.
:::

::: info Accounting is a different contract
The accounting entity is the Reports → Export (OSS) report, not a table dump, and its request and response differ from the four record exports. Everything below describes orders, customers, subscriptions and licenses; see [Accounting export](#accounting-export) for the accounting pair.
:::

---

## The two-step flow

**1. Call the schema endpoint first.** It returns the supported formats, the selectable flat `csv_columns`, and the selectable nested `json_modules`. The `key` values it returns are exactly what the batch endpoint accepts:

```json
{
  "export": {
    "entity": "customers",
    "schema_version": 1,
    "formats": [
      { "value": "csv", "label": "CSV file" },
      { "value": "json", "label": "JSON file" }
    ],
    "csv_columns": [
      { "key": "customer_id", "label": "Customer ID", "default_selected": true },
      { "key": "email", "label": "Email", "default_selected": true }
    ],
    "json_modules": []
  }
}
```

Unknown keys sent to the batch endpoint are **silently dropped**, so always source them from the schema rather than hardcoding.

**2. Loop the batch endpoint until `has_more` is `false`,** passing the previous response's `cursor` each time.

---

## Batch request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `format` | string | No | `csv` (default) yields flat records keyed by `columns`; `json` yields nested records keyed by `modules`. |
| `scope` | string | No | `all` (default), `current_page`, `selected`, or `search_results`. |
| `ids` | array | Conditional | Record IDs. **Required** when `scope` is `current_page` or `selected`. Deduplicated and truncated to the first 5000. |
| `columns` | array | Conditional | Column keys from `csv_columns`. Required (after filtering) when `format` is `csv`. Capped at 100. |
| `modules` | array | No | Module keys from `json_modules`. Capped at 100. |
| `filters` | object | No | Allowlisted to `filter_type`, `search`, `active_view`, `sort_by`, `sort_type`, `advanced_filters`, `user_tz`. |
| `cursor` | integer | No | Continuation token. Omit or send `0` for the first batch. |
| `max_records` | integer | No | Records to return. Clamped into the **100–1000** range (default: 500). |

::: tip `scope: "all"` ignores filters
When `scope` is `all`, the `filters` object is discarded entirely — you get every record. Use `search_results` if you want the filters honoured.
:::

---

## Batch response

```json
{
  "export": {
    "entity": "customers",
    "schema_version": 1,
    "records": [
      {
        "record_id": 1219,
        "customer_id": 1219,
        "first_name": "Alex",
        "last_name": "Morgan",
        "email": "alex.morgan@example.com",
        "status": "active",
        "purchase_count": 1
      }
    ],
    "total": 1,
    "cursor": 1219,
    "has_more": false,
    "batch": {
      "records": 1,
      "elapsed_ms": 2,
      "estimated_bytes": 671,
      "requested_max": 100,
      "next_max": 100
    }
  }
}
```

| Field | Notes |
|-------|-------|
| `records` | For `csv`, keys are exactly the selected `columns`. For `json`, records are nested per the selected `modules`. |
| `total` | Counted **only on the first call** (`cursor` absent or `0`). `null` on every continuation — cache it client-side if you are drawing a progress bar. |
| `cursor` | Pass back as `cursor` on the next call. `null` on the first page. |
| `has_more` | Keep looping until this is `false`. |
| `batch.next_max` | Server-suggested `max_records` for the next call, adapted to observed record size and elapsed time. |

---

## Self-throttling

These endpoints are **budget-bounded**, not fixed-size. A batch returns as many records as fit inside a runtime budget and a response-size budget, then stops early — so a response with fewer records than `max_records` does **not** mean the export is finished. Only `has_more` tells you that.

Honour `batch.next_max` rather than pinning `max_records` to a constant. It is the server telling you what it can sustain, and following it is what keeps you clear of `413`.

---

## Errors

| Status | Meaning |
|--------|---------|
| `403` | The user lacks the entity's export permission. |
| `409` | The module backing the entity is not active. |
| `413` | A single record exceeded the response size budget. Lower `max_records`, or reduce the selected `columns`/`modules`. |
| `422` | Invalid `format` or `scope`; `scope` of `current_page`/`selected` with no `ids`; or `format: "csv"` with no valid `columns` remaining after filtering. |

---

## Accounting export

<badge type="tip">GET</badge> `/fluent-cart/v2/data-export/accounting/schema`
<badge type="warning">POST</badge> `/fluent-cart/v2/data-export/accounting/batch`

- **Permission:** `reports/export`
- **Policy:** `AccountingExportPolicy`

This is the OSS / accounting report: one row per order tax line for each sale, and one negative row per tax line for each refund. Amounts are in the order's currency, carried alongside the sales rate frozen on the order, the base-currency amounts, and the ECB EUR rate both for the transaction date and for its quarter end — so an accounting system can apply whichever conversion rule it is required to use.

::: warning One store's data, not a return
The export covers this store only. A business running several stores files one return across all of them, so these rows are an input to a return, never the return itself. The schema response carries the same caveat in its `notice` field.
:::

### Schema

```json
{
  "export": {
    "entity": "accounting",
    "schema_version": 1,
    "formats": ["csv", "json"],
    "csv_columns": [
      { "key": "row_type", "label": "Row type" },
      { "key": "order_id", "label": "Order ID" },
      { "key": "tax_scheme", "label": "Tax scheme" },
      { "key": "sales_rate", "label": "Sales rate (per 1 base)" }
    ],
    "json_modules": [],
    "schemes": {
      "domestic": "Domestic",
      "oss": "EU OSS",
      "eu_other": "EU, other registration",
      "reverse_charge": "EU reverse charge",
      "non_eu": "Outside the EU",
      "no_tax": "No tax country"
    },
    "batching": { "initial_records": 100 },
    "base_currency": "USD",
    "notice": "This is this store's data only. …"
  }
}
```

Three things differ from the record exports: `formats` is a flat list of strings rather than `{value,label}` objects; `csv_columns` carry no `default_selected`, because the column set is fixed — you receive all 28; and the response adds `schemes`, `batching`, `base_currency` and `notice`.

The full column set is `row_type`, `order_id`, `invoice_no`, `transaction_id`, `date_utc`, `period`, `tax_country`, `tax_scheme`, `reverse_charge`, `customer_vat_number`, `store_vat_number`, `tax_label`, `tax_rate_percent`, `currency`, `taxable_amount`, `tax`, `order_net`, `order_tax`, `order_gross`, `tax_estimated`, `base_currency`, `sales_rate`, `taxable_amount_base`, `tax_base`, `order_gross_base`, `ecb_eur_rate_on_date`, `ecb_eur_rate_period_end`, `ecb_period_end_date`.

### Batch request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `format` | string | No | `csv` (default) or `json`. |
| `filters.date_from` | string | No | `Y-m-d`, UTC. |
| `filters.date_to` | string | No | `Y-m-d`, UTC. |
| `filters.scheme` | string | No | `all` (default) or one key from the schema's `schemes`. Filtering happens after the rows are built, so a narrow scheme can return an empty batch with `has_more: true`. |
| `filters.include_test` | string | No | `yes` to include test-mode orders. Any other value means `no`. |
| `cursor` | string | No | Continuation token from the previous response. Omit for the first batch. |
| `max_records` | integer | No | Source rows to read, clamped into the **1–500** range (default: 100). One source row can produce several output rows. |

`columns`, `modules`, `scope` and `ids` are not read here.

### Batch response

```json
{
  "export": {
    "records": [],
    "total": 0,
    "has_more": true,
    "cursor": "refunds:0",
    "batch": { "next_max": 100 }
  }
}
```

The cursor is a string, not an integer: `"<phase>:<last id>"`, where the phase walks `sales` (paid charge transactions), then `records` (paid orders carrying no paid charge — imported or hand-recorded), then `refunds`. An empty string means the walk is complete.

`total` is always `0` — the number of output rows per source row varies, so there is nothing meaningful to count up front. Loop on `has_more` alone, and expect batches with no records while a phase is being skipped.

### Errors

| Status | Meaning |
|--------|---------|
| `403` | The user lacks `reports/export`. |
| `422` | `format` is not `csv` or `json`, or `filters.scheme` is not `all` or a key the schema lists. |
