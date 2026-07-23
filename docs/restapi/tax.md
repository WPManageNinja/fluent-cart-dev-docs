---
title: Tax API
description: FluentCart REST API endpoints for managing tax classes, rates, configuration, and EU VAT settings.
---

# Tax API

Configure tax classes, manage country-specific tax rates, set up tax configuration, and handle EU VAT/OSS compliance.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## Tax Filing

Manage order-level tax records for filing and reporting purposes.

**Prefix:** `/fluent-cart/v2/taxes`
**Policy:** `AdminPolicy`

---

### List Tax Records

<badge type="tip">GET</badge> `/fluent-cart/v2/taxes`

Retrieve a paginated list of order tax rate records with optional filtering, sorting, and search. Records represent taxes applied to individual orders.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination |
| `per_page` | integer | query | No | Number of records per page (default: 10, max: 200) |
| `search` | string | query | No | Search term. If numeric, searches by `id` or `order_id`. Also searches related tax rate `country`, `state`, `postcode`, and `name` fields. Supports operator syntax (e.g., `id = 5`, `order_id > 100`) |
| `sort_by` | string | query | No | Column to sort by (default: `id`). Must be a fillable column on the OrderTaxRate model |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | query | No | Tab filter. One of: `filed` (records with `filed_at` set), `not_filed` (records without `filed_at`) |
| `filter_type` | string | query | No | Filter mode: `simple` (default) or `advanced` |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded array of advanced filter groups. Supports filtering by country, region, tax name, and filed status |
| `with` | array/string | query | No | Eager-load relations (e.g., `order`, `tax_rate`) |
| `select` | array/string | query | No | Comma-separated list of columns to select |
| `include_ids` | array/string | query | No | Comma-separated IDs that must always be included in results |
| `user_tz` | string | query | No | User timezone for date filtering (e.g., `America/New_York`) |

### Advanced Filter Options

| Category | Field | Column | Type | Description |
|----------|-------|--------|------|-------------|
| Tax Property | Country | `country` | selections (relation: `tax_rate`) | Filter by tax rate country code |
| Tax Property | Region | `state` | selections (relation: `tax_rate`) | Filter by tax rate state/region |
| Tax Property | Tax Name | `name` | text (relation: `tax_rate`) | Filter by tax rate name |
| Tax Property | Filed | `filed_at` | selections | `filed` or `not_filed` |

### Response

```json
{
  "taxes": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "order_id": 42,
        "tax_rate_id": 5,
        "shipping_tax": 150,
        "order_tax": 1000,
        "total_tax": 1150,
        "meta": {
          "rates": [],
          "tax_country": "US",
          "store_vat_number": ""
        },
        "filed_at": null,
        "created_at": "2025-06-01 12:00:00",
        "updated_at": "2025-06-01 12:00:00"
      }
    ],
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/taxes?page=1&per_page=20&active_view=not_filed" \
  -u "username:app_password"
```

---

### Mark Taxes as Filed

<badge type="warning">POST</badge> `/fluent-cart/v2/taxes`

Mark one or more order tax records as filed by setting their `filed_at` timestamp. Only records that have not yet been filed will be updated.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `ids` | array of integers | body | Yes | Array of `OrderTaxRate` record IDs to mark as filed |

### Response

```json
{
  "message": "Taxes marked as filed successfully"
}
```

### Error Response (400)

```json
{
  "message": "No IDs provided to mark!"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/taxes" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3, 5]}'
```

---

## Tax Classes

Manage tax classes that group tax rates by category (e.g., Standard, Reduced, Zero).

**Prefix:** `/fluent-cart/v2/tax/classes`
**Policy:** `StoreSettingsPolicy`

A maximum of **6** tax classes is allowed. The built-in `standard` class always exists and cannot be deleted; `reduced` and `zero` are built-in classes that can be created on demand.

---

### List Tax Classes

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/classes`

Retrieve all tax classes ordered by ID (oldest first), along with the maximum allowed number of classes and the next built-in class (`reduced` or `zero`) that has not been created yet.

### Parameters

No query parameters required.

### Response

```json
{
  "classes": [
    {
      "id": 1,
      "title": "Standard",
      "slug": "standard",
      "meta": [],
      "created_at": "2025-01-01 00:00:00",
      "updated_at": "2025-01-01 00:00:00"
    },
    {
      "id": 2,
      "title": "Reduced",
      "slug": "reduced",
      "meta": [],
      "created_at": "2025-01-01 00:00:00",
      "updated_at": "2025-01-01 00:00:00"
    }
  ],
  "max_classes": 6,
  "next_builtin": {
    "slug": "zero",
    "title": "Zero"
  }
}
```

`next_builtin` is `null` when both built-in classes (`reduced`, `zero`) already exist.

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/classes" \
  -u "username:app_password"
```

---

### Create Tax Class

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/classes`

Create a new tax class. A unique slug is auto-generated from the title. Pass `slug` `"reduced"` or `"zero"` to create one of the built-in classes (the title is then set automatically).

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `title` | string | body | Yes* | Tax class title (max 30 characters). Required unless a built-in `slug` is passed |
| `slug` | string | body | No | Pass a built-in slug (`reduced` or `zero`) to create that built-in class; otherwise the slug is auto-generated from the title |

### Constraints

| Condition | Status | Error |
|-----------|--------|-------|
| 6 tax classes already exist | 423 | `"Maximum of 6 tax classes allowed"` |
| Built-in class already exists | 423 | `"This tax class already exists"` |
| Title missing (non-built-in) | 423 | `"Tax class name is required"` |
| Title longer than 30 characters | 422 | `"Tax class name must be 30 characters or fewer"` |
| A class with the same slug exists | 423 | `"A tax class with this name already exists"` |

### Response

```json
{
  "class": {
    "id": 4,
    "title": "Digital Goods",
    "slug": "digital-goods",
    "meta": [],
    "created_at": "2025-06-01 12:00:00",
    "updated_at": "2025-06-01 12:00:00"
  },
  "message": "Tax class created successfully"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/classes" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"title": "Digital Goods"}'
```

---

### Delete Tax Class

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/classes/{id}`

Delete a tax class by ID. The built-in `standard` class cannot be deleted. Products, variations, EU registrations, product overrides, and tax rates referencing the deleted class fall back to the Standard class.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Tax class ID |

### Response

```json
{
  "message": "Tax class deleted successfully"
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 423 | `"Cannot delete the Standard tax class"` |
| 423 | `"Standard tax class could not be found"` |
| 400 | `"Failed to delete tax class"` |

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/classes/4" \
  -u "username:app_password"
```

---

## Tax Rates

Manage country-specific tax rates, shipping tax overrides, and country tax IDs.

**Prefix:** `/fluent-cart/v2/tax`
**Policy:** `StoreSettingsPolicy`

---

### List All Tax Rates

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/rates`

Retrieve all tax rates from the database, grouped by continent/region and country.

### Parameters

No query parameters required.

### Response

Returns tax rates grouped by geographic region, with each group containing countries and their respective rates.

```json
{
  "tax_rates": [
    {
      "group_name": "European Union",
      "group_code": "EU",
      "countries": [
        {
          "country_code": "DE",
          "country_name": "Germany",
          "rates": [
            {
              "class_id": 1,
              "name": "DE Standard Tax",
              "rate": "19.0000",
              "for_shipping": null
            },
            {
              "class_id": 2,
              "name": "DE Reduced Tax",
              "rate": "7.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 2
        }
      ],
      "total_countries": 1
    },
    {
      "group_name": "North America",
      "group_code": "NA",
      "countries": [
        {
          "country_code": "US",
          "country_name": "United States",
          "rates": [
            {
              "class_id": 1,
              "name": "US Standard Tax",
              "rate": "10.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 1
        }
      ],
      "total_countries": 1
    }
  ]
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/rates" \
  -u "username:app_password"
```

---

### Get Country Tax Rates

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/rates/country/rates/{country_code}`

Retrieve all tax rates for a specific country (ordered by priority, then ID), the country-level form configuration, and whether tax is enabled for the country.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | path | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`, `DE`, `GB`) |
| `class_id` | integer | query | No | Filter rates by tax class ID |

### Response

```json
{
  "tax_rates": [
    {
      "id": 5,
      "class_id": 1,
      "country": "DE",
      "state": "",
      "postcode": "",
      "city": "",
      "rate": "19.0000",
      "name": "DE Standard Tax",
      "group": "EU",
      "priority": 1,
      "is_compound": 0,
      "for_shipping": null,
      "for_order": 0,
      "formatted_state": ""
    }
  ],
  "settings": {
    "hidden": ["city", "zip", "state"]
  },
  "tax_enabled": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tax_rates` | array | Tax rate rows for the country |
| `settings` | object/null | Country-level form configuration from the built-in tax config. `hidden` lists address fields hidden in the rate form. Falls back to the continent configuration (e.g., `EU`); `null` when neither defines one |
| `tax_enabled` | boolean | Whether tax collection is enabled for this country (default: `true`) |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/rates/country/rates/DE" \
  -u "username:app_password"
```

---

### Update Country Tax Status

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/country-status/{country_code}`

Enable or disable tax collection for a specific country. Accepts an ISO country code or the special code `EU` to toggle the whole EU group. By default every country is enabled; disabling stores a flag in the `fct_meta` table.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | path | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`, `DE`) or `EU` for the EU group |
| `enabled` | integer | body | Yes | `1` to enable tax for the country, `0` to disable |

### Response

```json
{
  "enabled": true,
  "message": "Tax has been enabled successfully"
}
```

### Error Response (422)

```json
{
  "message": "Invalid country code"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/country-status/DE" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"enabled": 0}'
```

---

### Create Tax Rate

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/country/rate`

Create a new tax rate entry for a country.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `class_id` | integer | body | Yes | ID of the tax class this rate belongs to |
| `country` | string | body | No | ISO 3166-1 alpha-2 country code (max 45 characters) |
| `state` | string | body | No | State/province code (max 45 characters) |
| `postcode` | string | body | No | Postcode/ZIP code (max 45 characters) |
| `city` | string | body | No | City name (max 45 characters) |
| `rate` | string | body | No | Tax rate percentage (e.g., `"19.0000"`, max 45 characters) |
| `name` | string | body | No | Display name for the tax rate (max 45 characters) |
| `group` | string | body | No | Geographic group/continent code, e.g., `EU`, `NA` (max 45 characters) |
| `priority` | integer | body | No | Priority for rate application order (min: 1) |
| `is_compound` | integer | body | No | Whether this rate is compound (applied on top of other taxes). `0` or `1` (default: `0`) |
| `for_shipping` | integer | body | No | Shipping tax override rate. `null` means no override |
| `for_order` | integer | body | No | Whether this rate applies at order level. `0` or `1` (default: `0`) |

### Validation Rules

| Field | Rules |
|-------|-------|
| `class_id` | Required, minimum 0 |
| `country` | Nullable, sanitized text, max 45 characters |
| `state` | Nullable, sanitized text, max 45 characters |
| `postcode` | Nullable, sanitized text, max 45 characters |
| `city` | Nullable, sanitized text, max 45 characters |
| `rate` | Nullable, sanitized text, max 45 characters |
| `name` | Nullable, sanitized text, max 45 characters |
| `group` | Nullable, sanitized text, max 45 characters |
| `priority` | Nullable, numeric, minimum 1 |
| `is_compound` | Nullable, numeric, minimum 0 |
| `for_shipping` | Nullable, numeric, minimum 0 |
| `for_order` | Nullable, numeric, minimum 0 |

### Response

```json
{
  "tax_rate": {
    "id": 10,
    "class_id": 1,
    "country": "FR",
    "state": "",
    "postcode": "",
    "city": "",
    "rate": "20.0000",
    "name": "FR Standard Tax",
    "group": "EU",
    "priority": 1,
    "is_compound": 0,
    "for_shipping": null,
    "for_order": 0,
    "formatted_state": "",
    "tax_class": {
      "id": 1,
      "title": "Standard"
    }
  },
  "message": "Tax rate has been created successfully"
}
```

### Error Response

```json
{
  "message": "Tax class is required"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/country/rate" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": 1,
    "country": "FR",
    "rate": "20.0000",
    "name": "FR Standard Tax",
    "group": "EU",
    "priority": 1
  }'
```

---

### Update Tax Rate

<badge type="info">PUT</badge> `/fluent-cart/v2/tax/country/rate/{id}`

Update an existing tax rate.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Tax rate ID |
| `class_id` | integer | body | Yes | ID of the tax class this rate belongs to |
| `country` | string | body | No | ISO 3166-1 alpha-2 country code (max 45 characters) |
| `state` | string | body | No | State/province code (max 45 characters) |
| `postcode` | string | body | No | Postcode/ZIP code (max 45 characters) |
| `city` | string | body | No | City name (max 45 characters) |
| `rate` | string | body | No | Tax rate percentage (e.g., `"19.0000"`) |
| `name` | string | body | No | Display name for the tax rate (max 45 characters) |
| `group` | string | body | No | Geographic group/continent code (max 45 characters) |
| `priority` | integer | body | No | Priority for rate application order (min: 1) |
| `is_compound` | integer | body | No | Whether this rate is compound. `0` or `1` |
| `for_shipping` | integer | body | No | Shipping tax override rate |
| `for_order` | integer | body | No | Whether this rate applies at order level. `0` or `1` |

### Response

```json
{
  "tax_rate": {
    "id": 10,
    "class_id": 1,
    "country": "FR",
    "state": "",
    "postcode": "",
    "city": "",
    "rate": "20.0000",
    "name": "FR Standard Tax",
    "group": "EU",
    "priority": 1,
    "is_compound": 0,
    "for_shipping": null,
    "for_order": 0,
    "formatted_state": "",
    "tax_class": {
      "id": 1,
      "title": "Standard"
    }
  },
  "message": "Tax rate has been updated successfully"
}
```

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/tax/country/rate/10" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": 1,
    "rate": "21.0000",
    "name": "FR Standard Tax (Updated)"
  }'
```

---

### Delete Tax Rate

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/country/rate/{id}`

Delete a single tax rate by ID.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Tax rate ID |

### Response

```json
{
  "message": "Tax rate has been deleted successfully"
}
```

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/country/rate/10" \
  -u "username:app_password"
```

---

### Save Shipping Tax Override

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/rates/country/override`

Set a shipping-specific tax override on an existing tax rate. This allows a different tax rate to be applied for shipping calculations.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | body | Yes | Tax rate ID to apply the shipping override to |
| `override_tax_rate` | integer | body | Yes | The override tax rate value to use for shipping |

### Response

```json
{
  "message": "Tax override has been saved successfully"
}
```

### Error Response

```json
{
  "message": "Tax rate not found"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/rates/country/override" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 5,
    "override_tax_rate": 7
  }'
```

---

### Delete Shipping Tax Override

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/rates/country/override/{id}`

Remove the shipping tax override from a tax rate, resetting `for_shipping` to `null`.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Tax rate ID to remove the shipping override from |

### Response

```json
{
  "message": "Shipping override has been deleted successfully"
}
```

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/rates/country/override/5" \
  -u "username:app_password"
```

---

### Get Product Category Tax Overrides

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/product-overrides/{country_code}`

Retrieve all product category tax overrides for a specific country. Each override is a meta row whose `meta_value` holds the location, category, rate, and tax class data; `class_id` and `class_label` are appended for convenience.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | path | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`, `DE`) |

### Response

```json
{
  "overrides": [
    {
      "id": 12,
      "object_type": "tax_override",
      "object_id": 15,
      "meta_key": "product_category_override",
      "meta_value": {
        "country": "DE",
        "state": "",
        "city": "",
        "postcode": "",
        "category_id": 15,
        "category_name": "Books",
        "tax_label": "Reduced VAT",
        "override_state_tax": "no",
        "rate": 7,
        "class_id": 1
      },
      "class_id": 1,
      "class_label": "Standard",
      "created_at": "2025-06-01 12:00:00",
      "updated_at": "2025-06-01 12:00:00"
    }
  ]
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/product-overrides/DE" \
  -u "username:app_password"
```

---

### Save Product Category Tax Override

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/product-overrides`

Create or update a product category tax override. Pass `id` to update an existing override. Without `id`, an existing override matching the same category, location, and tax class is updated in place; otherwise a new override is created.

Pass `source_type` `"shipping"` together with `source_id` (a tax rate ID) to convert an existing shipping tax override into a product override — the shipping override is removed on success.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country` | string | body | Yes | ISO 3166-1 alpha-2 country code |
| `category_id` | integer | body | Yes | Product category (`product-categories` term) ID |
| `id` | integer | body | No | Existing override ID to update |
| `state` | string | body | No | State/province code |
| `city` | string | body | No | City name (max 45 characters) |
| `postcode` | string | body | No | Postcode/ZIP code |
| `tax_label` | string | body | No | Display label for the override tax |
| `override_state_tax` | string | body | No | `"yes"` or `"no"` — whether the override replaces state-level tax (default: `"no"`) |
| `rate` | number | body | No | Override tax rate percentage (negative values are clamped to `0`) |
| `class_id` | integer | body | No | Tax class ID the override applies to (`0` = none; must exist when non-zero) |
| `source_type` | string | body | No | Set to `"shipping"` with `source_id` to convert a shipping override |
| `source_id` | integer | body | No | Tax rate ID of the shipping override being converted |

### Response

```json
{
  "override": {
    "id": 12,
    "object_type": "tax_override",
    "object_id": 15,
    "meta_key": "product_category_override",
    "meta_value": {
      "country": "DE",
      "state": "",
      "city": "",
      "postcode": "",
      "category_id": 15,
      "category_name": "Books",
      "tax_label": "Reduced VAT",
      "override_state_tax": "no",
      "rate": 7,
      "class_id": 1
    }
  },
  "message": "Product category tax override saved"
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 422 | `"Country and category are required"` |
| 422 | `"Invalid country code"` |
| 422 | `"Invalid tax class"` |
| 422 | `"Invalid product category"` |
| 422 | `"An override already exists for the selected category, location, and tax class"` |
| 404 | `"Override not found"` (when `id` does not match an existing override) |

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/product-overrides" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "DE",
    "category_id": 15,
    "tax_label": "Reduced VAT",
    "override_state_tax": "no",
    "rate": 7,
    "class_id": 1
  }'
```

---

### Delete Product Category Tax Override

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/product-overrides/{id}`

Delete a product category tax override by its ID.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Override (meta row) ID |

### Response

```json
{
  "message": "Product category tax override deleted"
}
```

### Error Response (422)

```json
{
  "message": "Override not found"
}
```

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/product-overrides/12" \
  -u "username:app_password"
```

---

### Get Country Tax ID

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/country-tax-id/{country_code}`

Retrieve the store's tax identification number (VAT/GST/EIN) for a specific country. This is stored in the `fct_meta` table.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | path | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`, `DE`) |

### Response

When a tax ID exists:

```json
{
  "tax_data": {
    "tax_id": "DE123456789"
  }
}
```

When no tax ID is set:

```json
{
  "tax_data": {
    "tax_id": ""
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/country-tax-id/DE" \
  -u "username:app_password"
```

---

### Save Country Tax ID

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/country-tax-id/{country_code}`

Save or update the store's tax identification number for a specific country. Creates a new meta entry if one does not exist, or updates the existing one.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | path | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`, `DE`) |
| `tax_id` | string | body | Yes | The tax identification number (e.g., VAT number, EIN, GST number) |

### Response

```json
{
  "message": "Tax ID has been saved successfully"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/country-tax-id/DE" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"tax_id": "DE123456789"}'
```

---

## Tax Configuration

Manage global tax settings including enabling/disabling tax, inclusion/exclusion behavior, calculation basis, and rounding.

**Prefix:** `/fluent-cart/v2/tax/configuration`
**Policy:** `StoreSettingsPolicy`

---

### Get Preconfigured Tax Rates

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/configuration/rates`

Retrieve the full list of preconfigured tax rates from the built-in tax rates data file (`tax.php`). These are the default rates organized by continent/region and country that can be used when initially setting up tax for a country.

### Parameters

No query parameters required.

### Response

Returns tax rate data grouped by geographic region, including all rate types (standard, reduced, zero) for each country.

```json
{
  "tax_rates": {
    "EU": {
      "group_name": "European Union",
      "group_code": "EU",
      "countries": [
        {
          "country_code": "DE",
          "country_name": "Germany",
          "total_rates": 3,
          "rates": {
            "standard": {
              "rate": 19,
              "name": "DE Standard Tax",
              "type": "standard",
              "compound": false,
              "shipping": false
            },
            "reduced": {
              "rate": 7,
              "name": "DE Reduced Tax",
              "type": "reduced",
              "compound": false,
              "shipping": false
            },
            "zero": {
              "rate": 0,
              "name": "DE Zero Tax",
              "type": "zero",
              "compound": false,
              "shipping": false
            }
          }
        }
      ],
      "total_countries": 27
    },
    "NA": {
      "group_name": "North America",
      "group_code": "NA",
      "countries": [],
      "total_countries": 0
    }
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/configuration/rates" \
  -u "username:app_password"
```

---

### Save Configured Countries

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/countries`

Generate tax classes and import tax rates for the specified countries from the built-in rates data. This creates the standard tax class structure (Standard, Reduced, Zero) and populates rates for each selected country. Countries that already have rates in the database are skipped.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `countries` | array of strings | body | Yes | Array of ISO 3166-1 alpha-2 country codes to configure (e.g., `["DE", "FR", "US"]`) |

### Response

```json
{
  "message": "Countries saved successfully"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/countries" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"countries": ["DE", "FR", "IT", "ES"]}'
```

---

### Get Tax Settings

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/configuration/settings`

Retrieve the current global tax configuration settings along with the store country.

### Parameters

No query parameters required.

### Response

```json
{
  "settings": {
    "tax_inclusion": "included",
    "tax_calculation_basis": "shipping",
    "tax_rounding": "item",
    "checkout_tax_breakdown_display": "itemized",
    "tax_display_label": "Tax",
    "enable_tax": "yes",
    "price_suffix_included": "",
    "price_suffix_excluded": "",
    "eu_vat_settings": {
      "require_vat_number": "no",
      "local_reverse_charge": "yes",
      "reverse_charge_price_mode": "fixed",
      "vat_reverse_excluded_categories": [],
      "method": "oss",
      "oss_country": "DE",
      "oss_vat": "DE123456789",
      "country_wise_vat": [],
      "country_registrations": [
        {
          "country": "DE",
          "vat": "DE123456789",
          "rate": 19,
          "rates": {
            "standard": {"rate": 19, "label": "VAT"},
            "reduced": {"rate": 7, "label": "Reduced VAT"}
          },
          "tax_label": "VAT"
        }
      ]
    }
  },
  "store_country": "DE"
}
```

### Settings Fields Reference

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `enable_tax` | string | `"yes"`, `"no"` | Whether tax calculation is enabled |
| `tax_inclusion` | string | `"included"`, `"excluded"` | Whether product prices include tax |
| `tax_calculation_basis` | string | `"shipping"`, `"billing"`, `"store"` | Address used for tax calculation |
| `tax_rounding` | string | `"item"`, `"total"`, `"subtotal"` | Where tax rounding is applied |
| `checkout_tax_breakdown_display` | string | `"itemized"`, `"simplified"` | How the tax breakdown is displayed at checkout |
| `tax_display_label` | string | any | Label used when displaying tax amounts (default: `"Tax"`) |
| `price_suffix_included` | string | any | Text appended after prices that include tax (e.g., "incl. VAT") |
| `price_suffix_excluded` | string | any | Text appended after prices that exclude tax (e.g., "excl. VAT") |
| `eu_vat_settings` | object | see below | EU VAT-specific configuration |

The top-level `store_country` key holds the store country code from store settings (empty string when unset).

### EU VAT Settings Object

| Field | Type | Description |
|-------|------|-------------|
| `require_vat_number` | string | `"yes"` or `"no"` -- whether EU VAT number field is shown at checkout |
| `local_reverse_charge` | string | `"yes"` or `"no"` -- whether reverse charge applies for domestic B2B |
| `reverse_charge_price_mode` | string | `"fixed"` (default) or `"dynamic"` -- how reverse-charged prices are displayed: `fixed` keeps the tax-inclusive price, `dynamic` removes the VAT amount |
| `vat_reverse_excluded_categories` | array of integers | Product category IDs excluded from VAT reverse charge |
| `method` | string | Cross-border method: `"oss"`, `"home"`, or `"specific"` |
| `oss_country` | string | Country of OSS registration (when method is `"oss"`) |
| `oss_vat` | string | OSS VAT number (when method is `"oss"`) |
| `home_country` | string | Home country (when method is `"home"`) |
| `home_vat` | string | Home VAT number (when method is `"home"`) |
| `country_wise_vat` | array | Country-specific VAT settings (when method is `"specific"`) |
| `country_registrations` | array | Per-country EU VAT registrations (`{country, vat, rate, rates, tax_label}`), stored in `fct_meta` and injected into GET responses only |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings" \
  -u "username:app_password"
```

---

### Save Tax Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings`

Save the global tax configuration settings. Invalid enum values are silently replaced with their defaults. If tax is enabled, initial tax classes are automatically created.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `settings` | object | body | Yes | Tax settings object (see fields below) |
| `settings.enable_tax` | string | body | No | `"yes"` or `"no"` to enable/disable tax |
| `settings.tax_inclusion` | string | body | No | `"included"` or `"excluded"` -- whether prices include tax |
| `settings.tax_calculation_basis` | string | body | No | `"shipping"`, `"billing"`, or `"store"` -- address basis for tax |
| `settings.tax_rounding` | string | body | No | `"item"`, `"total"`, or `"subtotal"` -- where rounding is applied |
| `settings.checkout_tax_breakdown_display` | string | body | No | `"itemized"` or `"simplified"` -- how the tax breakdown is displayed at checkout |
| `settings.tax_display_label` | string | body | No | Label used when displaying tax amounts |
| `settings.price_suffix_included` | string | body | No | Text appended after prices that include tax |
| `settings.price_suffix_excluded` | string | body | No | Text appended after prices that exclude tax |
| `settings.eu_vat_settings` | object | body | No | EU VAT configuration object (see EU VAT Settings Object above). `reverse_charge_price_mode` accepts `"fixed"` or `"dynamic"` (invalid values become `"fixed"`) |

### Response

```json
{
  "message": "Settings saved successfully"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "enable_tax": "yes",
      "tax_inclusion": "excluded",
      "tax_calculation_basis": "billing",
      "tax_rounding": "subtotal",
      "checkout_tax_breakdown_display": "itemized",
      "tax_display_label": "VAT",
      "price_suffix_included": "incl. VAT",
      "price_suffix_excluded": "excl. VAT",
      "eu_vat_settings": {
        "require_vat_number": "yes",
        "local_reverse_charge": "yes",
        "reverse_charge_price_mode": "fixed",
        "vat_reverse_excluded_categories": [12, 15]
      }
    }
  }'
```

---

## EU VAT

Manage European Union VAT settings, OSS (One-Stop Shop) compliance, and cross-border tax configurations.

**Prefix:** `/fluent-cart/v2/tax/configuration/settings/eu-vat`
**Policy:** `StoreSettingsPolicy`

---

### Save EU VAT Cross-Border Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat`

Multi-action endpoint for EU VAT settings, dispatched by the `action` field:

| Action | Purpose |
|--------|---------|
| `euCrossBorderSettings` | Save the cross-border registration configuration (OSS, home country, or specific country registrations) |
| `saveCountryRegistration` | Create or update a per-country VAT registration with per-class rates |
| `deleteCountryRegistration` | Remove a per-country VAT registration |

### Parameters — `euCrossBorderSettings`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `action` | string | body | Yes | `"euCrossBorderSettings"` |
| `eu_vat_settings` | object | body | Yes | EU VAT configuration object (merged into the stored settings) |
| `eu_vat_settings.method` | string | body | Yes | Cross-border method: `"oss"`, `"home"`, or `"specific"` |
| `eu_vat_settings.oss_country` | string | body | Conditional | Country of OSS registration (required when method is `"oss"`; must be an EU VAT country) |
| `eu_vat_settings.oss_vat` | string | body | No | OSS VAT number |
| `eu_vat_settings.home_country` | string | body | Conditional | Home country code (required when method is `"home"`; must be an EU VAT country) |
| `eu_vat_settings.home_vat` | string | body | No | Home VAT number |
| `reset_registration` | string | body | No | Set to `"yes"` to clear the current method (reset registration) |

### Parameters — `saveCountryRegistration`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `action` | string | body | Yes | `"saveCountryRegistration"` |
| `country` | string | body | Yes | ISO 3166-1 alpha-2 code of an EU VAT country |
| `vat` | string | body | No | VAT registration number (max 50 characters) |
| `rates` | object | body | Yes | Per-class rates keyed by tax class slug: `{"standard": {"rate": 19, "label": "VAT"}}`. At least one rate must be greater than `0` and every slug must reference an existing tax class |

### Parameters — `deleteCountryRegistration`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `action` | string | body | Yes | `"deleteCountryRegistration"` |
| `country` | string | body | Yes | ISO 3166-1 alpha-2 code of an EU VAT country |

### Validation

| Condition | Error |
|-----------|-------|
| Unknown `action` | `"Invalid method"` (HTTP 422) |
| `method` not one of `oss`, `home`, `specific` | `"Select a cross-border registration type"` |
| `method` is `oss` and `oss_country` is empty or not an EU VAT country | `"Select country of OSS registration"` / `"Select a valid EU VAT country"` |
| `method` is `home` and `home_country` is empty or not an EU VAT country | `"Select home country of registration"` / `"Select a valid EU VAT country"` |
| `country` missing or not an EU VAT country | `"Select a registration country"` / `"Select a valid EU VAT registration country"` |
| `vat` longer than 50 characters | `"VAT number is too long"` |
| No rate greater than 0 | `"At least one tax rate must be greater than 0%"` |
| Rate slug references a missing tax class | `"Tax class \"{slug}\" could not be found. Create the class first and try again."` |

### Response

Depending on the action, `message` is `"EU VAT settings saved successfully"`, `"Country VAT registration saved successfully"`, or `"Country registration removed successfully"`.

```json
{
  "message": "EU VAT settings saved successfully"
}
```

### Error Response (422)

```json
{
  "message": "Validation failed for EU VAT settings",
  "errors": {
    "method": "Select a cross-border registration type"
  }
}
```

### Examples

```bash
# Save cross-border configuration
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "euCrossBorderSettings",
    "eu_vat_settings": {
      "method": "oss",
      "oss_country": "DE",
      "oss_vat": "DE123456789"
    }
  }'

# Save a per-country VAT registration
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "saveCountryRegistration",
    "country": "DE",
    "vat": "DE123456789",
    "rates": {
      "standard": {"rate": 19, "label": "VAT"},
      "reduced": {"rate": 7, "label": "Reduced VAT"}
    }
  }'

# Delete a per-country VAT registration
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"action": "deleteCountryRegistration", "country": "DE"}'
```

---

### Reset EU VAT Rates

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/reset-rates`

Reset all country-level EU standard VAT rates back to the built-in defaults. Custom rate values and auto-generated labels are overwritten; state-specific entries and shipping overrides on the rows are preserved.

### Parameters

No request body required.

### Response

```json
{
  "message": "EU tax rates have been reset to defaults"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/reset-rates" \
  -u "username:app_password"
```

---

### Get EU VAT Product Overrides

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/product-overrides`

Retrieve product category tax overrides for all EU countries, plus every EU tax rate that has a shipping tax override set. `class_id` and `class_label` are appended to each row for convenience.

### Parameters

No query parameters required.

### Response

```json
{
  "overrides": [
    {
      "id": 12,
      "object_type": "tax_override",
      "object_id": 15,
      "meta_key": "product_category_override",
      "meta_value": {
        "country": "DE",
        "state": "",
        "city": "",
        "postcode": "",
        "category_id": 15,
        "category_name": "Books",
        "tax_label": "Reduced VAT",
        "override_state_tax": "no",
        "rate": 7,
        "class_id": 1
      },
      "class_id": 1,
      "class_label": "Standard",
      "created_at": "2025-06-01 12:00:00",
      "updated_at": "2025-06-01 12:00:00"
    }
  ],
  "shipping_overrides": [
    {
      "id": 8,
      "class_id": 1,
      "country": "DE",
      "state": "",
      "postcode": "",
      "city": "",
      "rate": "19.0000",
      "name": "DE Standard Tax",
      "group": "EU",
      "priority": 1,
      "is_compound": 0,
      "for_shipping": "7.0000",
      "for_order": 0,
      "class_label": "Standard"
    }
  ]
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/product-overrides" \
  -u "username:app_password"
```

---

### Get OSS Country Rates

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/oss-rates`

Retrieve per-country EU VAT rates for every tax class. Each country entry includes the effective rate per class (custom database value or built-in default), plus top-level standard-class values for backward compatibility, and the list of tax classes.

### Parameters

No query parameters required.

### Response

```json
{
  "rates": [
    {
      "country": "DE",
      "label": "Germany",
      "rate": 19,
      "tax_label": "VAT",
      "default_rate": 19,
      "has_custom": true,
      "class_rates": {
        "standard": {"rate": 19, "default_rate": 19, "has_custom": true, "label": ""},
        "reduced": {"rate": 7, "default_rate": 7, "has_custom": true, "label": ""},
        "zero": {"rate": 0, "default_rate": 0, "has_custom": false, "label": ""}
      }
    }
  ],
  "classes": [
    {"slug": "standard", "title": "Standard", "id": 1},
    {"slug": "reduced", "title": "Reduced", "id": 2},
    {"slug": "zero", "title": "Zero", "id": 3}
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `rates[].country` | string | ISO 3166-1 alpha-2 country code |
| `rates[].label` | string | Country display name |
| `rates[].rate` | number | Standard-class effective rate (backward compatibility) |
| `rates[].tax_label` | string | Standard-class label, defaults to `"VAT"` |
| `rates[].default_rate` | number | Built-in default standard rate |
| `rates[].has_custom` | boolean | Whether the standard class has a custom rate row |
| `rates[].class_rates` | object | Per-class rates keyed by tax class slug: `{rate, default_rate, has_custom, label}` |
| `classes` | array | All tax classes: `{slug, title, id}` |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss-rates" \
  -u "username:app_password"
```

---

### Save OSS Country Rates

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/oss-rates`

Save per-country EU VAT rates. Each entry may provide `class_rates` keyed by tax class slug (`{rate, label}`); rates are upserted per country and class in the `EU` group. When `class_rates` is omitted, the single `rate` value is applied to the standard class (backward compatibility). Entries with unknown tax class slugs or without a country are skipped.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `rates` | array | body | Yes | Array of country rate entries |
| `rates[].country` | string | body | Yes | ISO 3166-1 alpha-2 code of an EU VAT country |
| `rates[].tax_label` | string | body | No | Shared label fallback for classes without their own label |
| `rates[].rate` | number | body | No | Standard-class rate (used only when `class_rates` is omitted) |
| `rates[].class_rates` | object | body | No | Per-class rates keyed by tax class slug: `{"standard": {"rate": 19, "label": "VAT"}}` |

### Response

```json
{
  "message": "OSS country rates saved successfully"
}
```

### Error Response (422)

```json
{
  "message": "Validation failed for OSS country rates",
  "errors": {
    "rates.0.country": "Select a valid EU VAT country"
  }
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss-rates" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "rates": [
      {
        "country": "DE",
        "tax_label": "VAT",
        "class_rates": {
          "standard": {"rate": 19, "label": "VAT"},
          "reduced": {"rate": 7, "label": "Reduced VAT"}
        }
      }
    ]
  }'
```
