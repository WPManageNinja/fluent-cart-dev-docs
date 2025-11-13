---
title: Tax API
description: FluentCart Tax API for managing tax classes, tax rates, and tax configuration including EU VAT.
---

# Tax API

The Tax API provides endpoints for managing tax classes, tax rates, country-specific tax configurations, and EU VAT settings in FluentCart.

## Base URL

All Tax API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Tax API endpoints require:
- **Policy**: `StoreSensitivePolicy`

## Tax Classes

Tax classes define categories of products that can have different tax rates applied.

### List Tax Classes

Retrieve all tax classes, sorted by priority.

**Endpoint:** `GET /tax/classes`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "tax_classes": [
      {
        "id": 1,
        "title": "Standard",
        "slug": "standard",
        "description": "Standard tax rate for most products",
        "categories": [],
        "priority": 10,
        "created_at": "2024-01-01 10:00:00",
        "updated_at": "2024-01-01 10:00:00"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/tax/classes" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Tax Class

Create a new tax class.

**Endpoint:** `POST /tax/classes`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Tax class title |
| `description` | string | No | Tax class description |
| `categories` | array | No | Array of product category IDs |
| `priority` | int | No | Display priority (default: 0) |

```json
{
  "title": "Reduced Rate",
  "description": "Reduced tax rate for essential goods",
  "categories": [1, 2],
  "priority": 5
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tax class has been created successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/tax/classes" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reduced Rate",
    "description": "Reduced tax rate for essential goods",
    "priority": 5
  }'
```

### Update Tax Class

Update an existing tax class.

**Endpoint:** `PUT /tax/classes/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Tax class ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Tax class title |
| `description` | string | No | Tax class description |
| `categories` | array | No | Array of product category IDs |
| `priority` | int | No | Display priority |

```json
{
  "title": "Reduced Rate - Updated",
  "description": "Updated description",
  "categories": [1, 2, 3],
  "priority": 6
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tax class has been updated successfully"
  }
}
```

### Delete Tax Class

Delete a tax class.

**Endpoint:** `DELETE /tax/classes/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Tax class ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tax class has been deleted successfully"
  }
}
```

## Tax Rates

### List Tax Rates

Retrieve all tax rates.

**Endpoint:** `GET /tax/rates`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "tax_rates": [
      {
        "id": 1,
        "country": "US",
        "state": "CA",
        "rate": 7.5,
        "class_id": 1,
        "priority": 1,
        "for_shipping": null
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/tax/rates" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Country Tax Rates

Retrieve tax rates for a specific country, including country configuration.

**Endpoint:** `GET /tax/rates/country/rates/{country_code}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes | ISO country code (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "tax_rates": [
      {
        "id": 1,
        "country": "US",
        "state": "CA",
        "rate": 7.5,
        "class_id": 1,
        "tax_class": {
          "id": 1,
          "title": "Standard"
        },
        "priority": 1
      }
    ],
    "settings": {
      "tax_id": "US123456789"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/tax/rates/country/rates/US" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Tax Rate

Create a new tax rate for a country.

**Endpoint:** `POST /tax/country/rate`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `class_id` | int | Yes | Tax class ID |
| `country` | string | Yes | ISO country code |
| `state` | string | No | State/province code |
| `rate` | float | Yes | Tax rate percentage |
| `priority` | int | No | Priority (default: 1) |
| `for_shipping` | int | No | Shipping tax override rate |

```json
{
  "class_id": 1,
  "country": "US",
  "state": "CA",
  "rate": 7.5,
  "priority": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "tax_rate": {
      "id": 1,
      "country": "US",
      "state": "CA",
      "rate": 7.5,
      "class_id": 1,
      "tax_class": {
        "id": 1,
        "title": "Standard"
      },
      "priority": 1
    },
    "message": "Tax rate has been created successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/tax/country/rate" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": 1,
    "country": "US",
    "state": "CA",
    "rate": 7.5,
    "priority": 1
  }'
```

### Update Tax Rate

Update an existing tax rate.

**Endpoint:** `PUT /tax/country/rate/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Tax rate ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `class_id` | int | Yes | Tax class ID |
| `country` | string | Yes | ISO country code |
| `state` | string | No | State/province code |
| `rate` | float | Yes | Tax rate percentage |
| `priority` | int | No | Priority |
| `for_shipping` | int | No | Shipping tax override rate |

```json
{
  "class_id": 1,
  "country": "US",
  "state": "CA",
  "rate": 8.0,
  "priority": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "tax_rate": {
      "id": 1,
      "country": "US",
      "state": "CA",
      "rate": 8.0,
      "class_id": 1,
      "tax_class": {
        "id": 1,
        "title": "Standard"
      }
    },
    "message": "Tax rate has been updated successfully"
  }
}
```

### Delete Tax Rate

Delete a tax rate.

**Endpoint:** `DELETE /tax/country/rate/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Tax rate ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tax rate has been deleted successfully"
  }
}
```

### Delete Country Tax Rates

Delete all tax rates for a specific country.

**Endpoint:** `DELETE /tax/country/{country_code}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes | ISO country code (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Country has been deleted successfully"
  }
}
```

### Save Shipping Override

Set a shipping tax override rate for a tax rate.

**Endpoint:** `POST /tax/rates/country/override`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Tax rate ID |
| `override_tax_rate` | int | Yes | Shipping tax override rate percentage |

```json
{
  "id": 1,
  "override_tax_rate": 5.0
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tax override has been saved successfully"
  }
}
```

### Delete Shipping Override

Remove shipping tax override from a tax rate.

**Endpoint:** `DELETE /tax/rates/country/override/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Tax rate ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Shipping override has been deleted successfully"
  }
}
```

### Get Country Tax ID

Retrieve tax ID for a specific country.

**Endpoint:** `GET /tax/country-tax-id/{country_code}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes | ISO country code (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "tax_data": {
      "tax_id": "US123456789"
    }
  }
}
```

### Save Country Tax ID

Save tax ID for a specific country.

**Endpoint:** `POST /tax/country-tax-id/{country_code}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes | ISO country code (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tax_id` | string | Yes | Tax ID for the country |

```json
{
  "tax_id": "US123456789"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tax ID has been saved successfully"
  }
}
```

## Tax Configuration

### Get Tax Rates from Configuration

Retrieve tax rates from the tax configuration file.

**Endpoint:** `GET /tax/configuration/rates`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "tax_rates": [
      {
        "country": "US",
        "rate": 7.5
      }
    ]
  }
}
```

### Save Configured Countries

Save configured countries and generate tax classes for them.

**Endpoint:** `POST /tax/configuration/countries`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `countries` | array | Yes | Array of ISO country codes |

```json
{
  "countries": ["US", "CA", "GB"]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Countries saved successfully"
  }
}
```

### Get Tax Settings

Retrieve tax module settings.

**Endpoint:** `GET /tax/configuration/settings`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "settings": {
      "enabled": true,
      "prices_include_tax": false,
      "display_prices": "excl"
    }
  }
}
```

### Save Tax Settings

Update tax module settings.

**Endpoint:** `POST /tax/configuration/settings`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

The request body should contain tax settings fields.

```json
{
  "settings": {
    "enabled": true,
    "prices_include_tax": false,
    "display_prices": "excl"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Settings saved successfully"
  }
}
```

## EU VAT Settings

### Save EU VAT Settings

Save EU VAT configuration settings.

**Endpoint:** `POST /tax/configuration/settings/eu-vat`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

The request body structure depends on EU VAT settings fields.

```json
{
  "enabled": true,
  "oss_enabled": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "EU VAT settings saved successfully"
  }
}
```

### Get EU Tax Rates

Retrieve EU tax rates.

**Endpoint:** `GET /tax/configuration/settings/eu-vat/rates`

**Permission Required**: `StoreSensitivePolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "country": "DE",
        "rate": 19.0
      }
    ]
  }
}
```

### Save OSS Tax Override

Save One Stop Shop (OSS) tax override.

**Endpoint:** `POST /tax/configuration/settings/eu-vat/oss/override`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

The request body structure depends on OSS override settings.

```json
{
  "country": "DE",
  "rate": 19.0
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "OSS tax override saved successfully"
  }
}
```

### Delete OSS Tax Override

Delete a One Stop Shop (OSS) tax override.

**Endpoint:** `DELETE /tax/configuration/settings/eu-vat/oss/override`

**Permission Required**: `StoreSensitivePolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | OSS override ID |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "OSS tax override deleted successfully"
  }
}
```

### Save OSS Shipping Override

Save One Stop Shop (OSS) shipping tax override.

**Endpoint:** `POST /tax/configuration/settings/eu-vat/oss/shipping-override`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

The request body structure depends on OSS shipping override settings.

```json
{
  "country": "DE",
  "rate": 19.0
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "OSS shipping override saved successfully"
  }
}
```

### Delete OSS Shipping Override

Delete a One Stop Shop (OSS) shipping tax override.

**Endpoint:** `DELETE /tax/configuration/settings/eu-vat/oss/shipping-override`

**Permission Required**: `StoreSensitivePolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | OSS shipping override ID |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "OSS shipping override deleted successfully"
  }
}
```

---

## Tax Filing

### List Tax Records

Retrieve a paginated list of tax records.

**Endpoint:** `GET /taxes/`

**Permission Required**: `AdminPolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search term for filtering taxes |
| `per_page` | int | No | Number of items per page (default: 10) |
| `page` | int | No | Page number (default: 1) |
| `filed` | boolean | No | Filter by filed status |
| `country` | string | No | Filter by country code |

#### Response

```json
{
  "success": true,
  "data": {
    "taxes": {
      "data": [
        {
          "id": 1,
          "order_id": 123,
          "country": "US",
          "state": "CA",
          "rate": 7.5,
          "amount": 7.50,
          "filed_at": null,
          "created_at": "2024-01-01 10:00:00"
        },
        {
          "id": 2,
          "order_id": 124,
          "country": "US",
          "state": "NY",
          "rate": 8.0,
          "amount": 8.00,
          "filed_at": "2024-01-15 10:00:00",
          "created_at": "2024-01-01 10:00:00"
        }
      ],
      "total": 100,
      "per_page": 10,
      "current_page": 1,
      "last_page": 10
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/taxes/?per_page=20&page=1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Mark Taxes as Filed

Mark one or more tax records as filed.

**Endpoint:** `POST /taxes/`

**Permission Required**: `AdminPolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | array | Yes | Array of tax record IDs to mark as filed |

```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Taxes marked as filed successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/taxes/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [1, 2, 3]
  }'
```


