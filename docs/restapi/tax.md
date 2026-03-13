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
**Policy:** `StoreSensitivePolicy`

---

### List Tax Classes

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/classes`

Retrieve all tax classes, sorted by priority (highest first), then by newest first when priority is equal.

### Parameters

No query parameters required.

### Response

```json
{
  "tax_classes": [
    {
      "id": 1,
      "title": "Standard",
      "slug": "standard",
      "description": "Standard tax rate for most products",
      "meta": {
        "categories": [],
        "priority": 10
      },
      "categories": [],
      "created_at": "2025-01-01 00:00:00",
      "updated_at": "2025-01-01 00:00:00"
    },
    {
      "id": 2,
      "title": "Reduced",
      "slug": "reduced",
      "description": "Reduced tax rate for essential goods",
      "meta": {
        "categories": [],
        "priority": 5
      },
      "categories": [],
      "created_at": "2025-01-01 00:00:00",
      "updated_at": "2025-01-01 00:00:00"
    },
    {
      "id": 3,
      "title": "Zero",
      "slug": "zero",
      "description": "Zero tax rate for exempt products",
      "meta": {
        "categories": [],
        "priority": 2
      },
      "categories": [],
      "created_at": "2025-01-01 00:00:00",
      "updated_at": "2025-01-01 00:00:00"
    }
  ]
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/classes" \
  -u "username:app_password"
```

---

### Create Tax Class

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/classes`

Create a new tax class. A unique slug is auto-generated from the title.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `title` | string | body | Yes | Tax class title (max 192 characters) |
| `description` | string | body | No | Description of the tax class |
| `categories` | array of integers | body | No | Array of product category IDs associated with this tax class |
| `priority` | integer | body | No | Sort priority (higher values appear first, default: `0`) |

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, sanitized text, max 192 characters |
| `description` | Nullable, sanitized text |
| `categories` | Nullable, array of integers |

### Response

```json
{
  "message": "Tax class has been created successfully"
}
```

### Error Response (422)

```json
{
  "errors": {
    "title": ["Tax class title is required."]
  },
  "message": "Validation failed"
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/classes" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Digital Goods",
    "description": "Tax class for digital products",
    "categories": [12, 15],
    "priority": 7
  }'
```

---

### Update Tax Class

<badge type="info">PUT</badge> `/fluent-cart/v2/tax/classes/{id}`

Update an existing tax class. The slug is automatically regenerated if the title changes.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Tax class ID |
| `title` | string | body | Yes | Tax class title (max 192 characters) |
| `description` | string | body | No | Description of the tax class |
| `categories` | array of integers | body | No | Array of product category IDs associated with this tax class |
| `priority` | integer | body | No | Sort priority (higher values appear first, default: `0`) |

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, sanitized text, max 192 characters |
| `description` | Nullable, sanitized text |
| `categories` | Nullable, array of integers |

### Response

```json
{
  "message": "Tax class has been updated successfully"
}
```

### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/tax/classes/4" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Digital Goods Updated",
    "description": "Updated description",
    "categories": [12, 15, 20],
    "priority": 8
  }'
```

---

### Delete Tax Class

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/classes/{id}`

Delete a tax class by ID.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | Tax class ID |

### Response

```json
{
  "message": "Tax class has been deleted successfully"
}
```

### Error Response

```json
{
  "message": "Failed to delete tax class"
}
```

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/classes/4" \
  -u "username:app_password"
```

---

## Tax Rates

Manage country-specific tax rates, shipping tax overrides, and country tax IDs.

**Prefix:** `/fluent-cart/v2/tax`
**Policy:** `StoreSensitivePolicy`

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

Retrieve all tax rates for a specific country, including the associated tax class and country-level configuration settings.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | path | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`, `DE`, `GB`) |

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
      "formatted_state": "",
      "tax_class": {
        "id": 1,
        "title": "Standard"
      }
    }
  ],
  "settings": {
    "compound_tax": true,
    "tax_id_label": "VAT",
    "states": {}
  }
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/rates/country/rates/DE" \
  -u "username:app_password"
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

### Delete All Rates for a Country

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/country/{country_code}`

Delete all tax rates for a specific country.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | path | Yes | ISO 3166-1 alpha-2 country code (e.g., `US`, `DE`) |

### Response

```json
{
  "message": "Country has been deleted successfully"
}
```

### Error Response

```json
{
  "message": "Failed to delete country"
}
```

### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/country/FR" \
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
**Policy:** `StoreSensitivePolicy`

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

Retrieve the current global tax configuration settings.

### Parameters

No query parameters required.

### Response

```json
{
  "settings": {
    "tax_inclusion": "included",
    "tax_calculation_basis": "shipping",
    "tax_rounding": "item",
    "enable_tax": "yes",
    "price_suffix": "",
    "eu_vat_settings": {
      "require_vat_number": "no",
      "local_reverse_charge": "yes",
      "vat_reverse_excluded_categories": [],
      "method": "oss",
      "oss_country": "DE",
      "oss_vat": "DE123456789"
    }
  }
}
```

### Settings Fields Reference

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `enable_tax` | string | `"yes"`, `"no"` | Whether tax calculation is enabled |
| `tax_inclusion` | string | `"included"`, `"excluded"` | Whether product prices include tax |
| `tax_calculation_basis` | string | `"shipping"`, `"billing"`, `"store"` | Address used for tax calculation |
| `tax_rounding` | string | `"item"`, `"subtotal"` | Whether rounding is applied per item or on the subtotal |
| `price_suffix` | string | any | Text appended after product prices (e.g., "incl. VAT") |
| `eu_vat_settings` | object | see below | EU VAT-specific configuration |

### EU VAT Settings Object

| Field | Type | Description |
|-------|------|-------------|
| `require_vat_number` | string | `"yes"` or `"no"` -- whether EU VAT number field is shown at checkout |
| `local_reverse_charge` | string | `"yes"` or `"no"` -- whether reverse charge applies for domestic B2B |
| `vat_reverse_excluded_categories` | array of integers | Product category IDs excluded from VAT reverse charge |
| `method` | string | Cross-border method: `"oss"`, `"home"`, or `"specific"` |
| `oss_country` | string | Country of OSS registration (when method is `"oss"`) |
| `oss_vat` | string | OSS VAT number (when method is `"oss"`) |
| `home_country` | string | Home country (when method is `"home"`) |
| `home_vat` | string | Home VAT number (when method is `"home"`) |
| `country_wise_vat` | array | Country-specific VAT settings (when method is `"specific"`) |

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings" \
  -u "username:app_password"
```

---

### Save Tax Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings`

Save the global tax configuration settings. If tax is enabled for the first time, initial tax classes (Standard, Reduced, Zero) are automatically created.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `settings` | object | body | Yes | Tax settings object (see fields below) |
| `settings.enable_tax` | string | body | No | `"yes"` or `"no"` to enable/disable tax |
| `settings.tax_inclusion` | string | body | No | `"included"` or `"excluded"` -- whether prices include tax |
| `settings.tax_calculation_basis` | string | body | No | `"shipping"`, `"billing"`, or `"store"` -- address basis for tax |
| `settings.tax_rounding` | string | body | No | `"item"` or `"subtotal"` -- rounding method |
| `settings.price_suffix` | string | body | No | Text appended after product prices |
| `settings.eu_vat_settings` | object | body | No | EU VAT configuration object (see EU VAT Settings Object above) |

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
      "price_suffix": "excl. VAT",
      "eu_vat_settings": {
        "require_vat_number": "yes",
        "local_reverse_charge": "yes",
        "vat_reverse_excluded_categories": [12, 15]
      }
    }
  }'
```

---

## EU VAT

Manage European Union VAT settings, OSS (One-Stop Shop) compliance, and cross-border tax configurations.

**Prefix:** `/fluent-cart/v2/tax/configuration/settings/eu-vat`
**Policy:** `StoreSensitivePolicy`

---

### Save EU VAT Cross-Border Settings

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat`

Save EU VAT cross-border registration settings. This endpoint handles the configuration of how cross-border EU VAT is managed (OSS, home country, or specific country registrations).

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `action` | string | body | Yes | Must be `"euCrossBorderSettings"` |
| `eu_vat_settings` | object | body | Yes | EU VAT configuration object |
| `eu_vat_settings.method` | string | body | Yes | Cross-border method: `"oss"`, `"home"`, or `"specific"` |
| `eu_vat_settings.oss_country` | string | body | Conditional | Country of OSS registration (required when method is `"oss"`) |
| `eu_vat_settings.oss_vat` | string | body | No | OSS VAT number |
| `eu_vat_settings.home_country` | string | body | Conditional | Home country code (required when method is `"home"`) |
| `eu_vat_settings.home_vat` | string | body | No | Home VAT number |
| `reset_registration` | string | body | No | Set to `"yes"` to clear the current method (reset registration) |

### Validation

| Condition | Error |
|-----------|-------|
| `method` not one of `oss`, `home`, `specific` | `"Select a cross-border registration type"` |
| `method` is `oss` and `oss_country` is empty | `"Select country of OSS registration"` |
| `method` is `home` and `home_country` is empty | `"Select home country of registration"` |

### Response

```json
{
  "message": "EU VAT settings saved successfully"
}
```

### Error Response (423)

```json
{
  "message": "Validation failed for EU VAT settings",
  "errors": {
    "method": "Select a cross-border registration type"
  }
}
```

### Error Response (423) - Invalid action

```json
{
  "message": "Invalid method"
}
```

### Example

```bash
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
```

---

### Get EU Tax Rates

<badge type="tip">GET</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/rates`

Retrieve all tax rates in the EU group from the database, grouped by region and country. This returns only rates where `group` is `EU`.

### Parameters

No query parameters required.

### Response

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
              "name": "standard",
              "rate": "19.0000",
              "for_shipping": null
            },
            {
              "class_id": 2,
              "name": "reduced",
              "rate": "7.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 2
        },
        {
          "country_code": "FR",
          "country_name": "France",
          "rates": [
            {
              "class_id": 1,
              "name": "standard",
              "rate": "20.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 1
        }
      ],
      "total_countries": 2
    }
  ]
}
```

### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/rates" \
  -u "username:app_password"
```

---

### Save OSS Tax Override

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/override`

Save or update OSS (One-Stop Shop) tax rate overrides for a specific EU country. This allows overriding the standard, reduced, or zero tax rates for a country within the EU group. If a rate already exists for the country and tax class, it is updated; otherwise a new rate is created.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | body | Yes | ISO 3166-1 alpha-2 country code of the EU member state |
| `overrides` | array | body | Yes | Array of override objects |
| `overrides[].type` | string | body | Yes | Tax class slug: `"standard"`, `"reduced"`, or `"zero"` |
| `overrides[].rate` | string/number | body | Yes | The overridden tax rate percentage |

### Validation

| Condition | Error |
|-----------|-------|
| `country_code` is empty | `"Select country of OSS registration"` |

### Response

```json
{
  "message": "OSS tax override saved successfully"
}
```

### Error Response (423)

```json
{
  "message": "Validation failed for OSS tax override",
  "errors": {
    "country_code": "Select country of OSS registration"
  }
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/override" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "FR",
    "overrides": [
      {"type": "standard", "rate": "20.0000"},
      {"type": "reduced", "rate": "5.5000"},
      {"type": "zero", "rate": "0.0000"}
    ]
  }'
```

---

### Save OSS Shipping Tax Override

<badge type="warning">POST</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/shipping-override`

Save or update OSS shipping tax rate overrides for a specific EU country. Similar to the tax override endpoint, but also supports the `for_shipping` field. If a rate already exists for the country and tax class, it is updated; otherwise a new rate is created.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | body | Yes | ISO 3166-1 alpha-2 country code of the EU member state |
| `overrides` | array | body | Yes | Array of override objects |
| `overrides[].type` | string | body | Yes | Tax class slug: `"standard"`, `"reduced"`, or `"zero"` |
| `overrides[].rate` | string/number | body | Yes | The overridden tax rate percentage |
| `overrides[].for_shipping` | integer | body | No | Shipping-specific tax rate override (default: `0`) |

### Validation

| Condition | Error |
|-----------|-------|
| `country_code` is empty | `"Select country of OSS registration"` |

### Response

```json
{
  "message": "OSS tax override saved successfully"
}
```

### Error Response (423)

```json
{
  "message": "Validation failed for OSS tax override",
  "errors": {
    "country_code": "Select country of OSS registration"
  }
}
```

### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/shipping-override" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "IT",
    "overrides": [
      {"type": "standard", "rate": "22.0000", "for_shipping": 10},
      {"type": "reduced", "rate": "10.0000", "for_shipping": 5}
    ]
  }'
```

---

### Delete OSS Tax Override

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/override`

Delete all EU tax rate overrides for a specific country. Optionally filter by state/region within the country.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country` | string | query | Yes | ISO 3166-1 alpha-2 country code |
| `state` | string | query | No | State/region code to narrow the deletion scope |

### Validation

| Condition | Error |
|-----------|-------|
| `country` is empty | `"Country code is required"` (HTTP 423) |

### Response

```json
{
  "message": "OSS tax override deleted successfully"
}
```

### Error Response (423)

When no matching records are found:

```json
{
  "message": "No matching OSS tax override found to delete"
}
```

### Example

```bash
# Delete all EU tax overrides for France
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/override?country=FR" \
  -u "username:app_password"

# Delete EU tax overrides for a specific French region
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/override?country=FR&state=IDF" \
  -u "username:app_password"
```

---

### Delete OSS Shipping Tax Override

<badge type="danger">DELETE</badge> `/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/shipping-override`

Delete all EU shipping tax rate overrides for a specific country. Optionally filter by state/region within the country.

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country` | string | query | Yes | ISO 3166-1 alpha-2 country code |
| `state` | string | query | No | State/region code to narrow the deletion scope |

### Validation

| Condition | Error |
|-----------|-------|
| `country` is empty | `"Country code is required"` (HTTP 423) |

### Response

```json
{
  "message": "OSS shipping override deleted successfully"
}
```

### Error Response (423)

When no matching records are found:

```json
{
  "message": "No matching OSS shipping override found to delete"
}
```

### Example

```bash
# Delete all EU shipping tax overrides for Italy
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/shipping-override?country=IT" \
  -u "username:app_password"

# Delete EU shipping tax overrides for a specific Italian region
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/tax/configuration/settings/eu-vat/oss/shipping-override?country=IT&state=RM" \
  -u "username:app_password"
```
