---
title: Shipping API
description: FluentCart REST API endpoints for managing shipping zones, methods, and classes.
---

# Shipping API

Configure shipping zones, manage shipping methods within zones, and organize products with shipping classes.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/shipping`

**Policy:** `StoreSensitivePolicy`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## Shipping Zones

Shipping zones define geographic regions (countries) to which specific shipping methods apply. Each zone contains a country code (or `all` for worldwide) and can hold multiple shipping methods.

### List Shipping Zones

<badge type="tip">GET</badge> `/fluent-cart/v2/shipping/zones`

Retrieve a paginated list of shipping zones with filtering and sorting capabilities.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Search zones by name |
| `per_page` | integer | query | No | Number of results per page (default: `10`, max: `200`) |
| `page` | integer | query | No | Page number for pagination |
| `sort_by` | string | query | No | Column to sort by (default: `order`) |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `asc`) |
| `filter_type` | string | query | No | `simple` or `advanced` |

#### Response

```json
{
  "shipping_zones": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Domestic",
        "region": "US",
        "order": 0,
        "formatted_region": "United States",
        "created_at": "2025-01-15 12:00:00",
        "updated_at": "2025-01-15 12:00:00"
      },
      {
        "id": 2,
        "name": "Rest of World",
        "region": "all",
        "order": 1,
        "formatted_region": "Whole World",
        "created_at": "2025-01-16 10:00:00",
        "updated_at": "2025-01-16 10:00:00"
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/shipping/zones?per_page=20&search=domestic" \
  -u "username:app_password"
```

---

### Create Shipping Zone

<badge type="warning">POST</badge> `/fluent-cart/v2/shipping/zones`

Create a new shipping zone.

- **Permission:** `store/sensitive`
- **Request Class:** `ShippingZoneRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `name` | string | body | Yes | Zone name (max 192 characters) |
| `region` | string | body | No | ISO 3166-1 alpha-2 country code (e.g., `US`, `GB`) or `all` for worldwide. Only one `all` zone is allowed. |
| `order` | integer | body | No | Sort order for display priority |

#### Response

```json
{
  "shipping_zone": {
    "id": 3,
    "name": "Europe",
    "region": "DE",
    "order": 2,
    "formatted_region": "Germany",
    "created_at": "2025-02-01 08:00:00",
    "updated_at": "2025-02-01 08:00:00"
  },
  "message": "Shipping zone has been created successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/shipping/zones" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Europe",
    "region": "DE",
    "order": 2
  }'
```

---

### Get Shipping Zone

<badge type="tip">GET</badge> `/fluent-cart/v2/shipping/zones/{id}`

Retrieve a single shipping zone by ID, including its associated shipping methods.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The shipping zone ID |

#### Response

```json
{
  "shipping_zone": {
    "id": 1,
    "name": "Domestic",
    "region": "US",
    "order": 0,
    "formatted_region": "United States",
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-01-15 12:00:00",
    "methods": [
      {
        "id": 10,
        "zone_id": 1,
        "title": "Standard Shipping",
        "type": "flat_rate",
        "amount": 500,
        "is_enabled": true,
        "states": [],
        "settings": {},
        "meta": {},
        "order": 0,
        "formatted_states": [],
        "created_at": "2025-01-15 12:30:00",
        "updated_at": "2025-01-15 12:30:00"
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/shipping/zones/1" \
  -u "username:app_password"
```

---

### Update Shipping Zone

<badge type="info">PUT</badge> `/fluent-cart/v2/shipping/zones/{id}`

Update an existing shipping zone. If the `region` changes, all associated shipping method `states` are reset to empty.

- **Permission:** `store/sensitive`
- **Request Class:** `ShippingZoneRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The shipping zone ID |
| `name` | string | body | Yes | Zone name (max 192 characters) |
| `region` | string | body | No | ISO 3166-1 alpha-2 country code or `all`. Only one `all` zone is allowed. |
| `order` | integer | body | No | Sort order for display priority |

::: warning Region Change Side Effect
When the `region` value changes, all shipping methods in the zone have their `states` arrays reset to `[]`. This is because states/provinces are country-specific.
:::

#### Response

```json
{
  "shipping_zone": {
    "id": 1,
    "name": "United States",
    "region": "US",
    "order": 0,
    "formatted_region": "United States",
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-02-01 09:00:00"
  },
  "message": "Shipping zone has been updated successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/shipping/zones/1" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "United States",
    "region": "US",
    "order": 0
  }'
```

---

### Delete Shipping Zone

<badge type="danger">DELETE</badge> `/fluent-cart/v2/shipping/zones/{id}`

Delete a shipping zone and all its associated shipping methods.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The shipping zone ID |

::: danger Cascading Delete
Deleting a zone will also permanently delete all shipping methods associated with that zone.
:::

#### Response

```json
{
  "message": "Shipping zone has been deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/shipping/zones/1" \
  -u "username:app_password"
```

---

### Update Zone Order

<badge type="warning">POST</badge> `/fluent-cart/v2/shipping/zones/update-order`

Reorder shipping zones by providing an array of zone IDs in the desired order. Each zone's `order` field is updated to match its index position.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `zones` | array | body | Yes | Array of zone IDs in the desired display order |

#### Response

```json
{
  "message": "Shipping zones order has been updated"
}
```

#### Error Response

```json
{
  "message": "Invalid data provided"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/shipping/zones/update-order" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "zones": [3, 1, 2]
  }'
```

In this example, zone `3` gets `order: 0`, zone `1` gets `order: 1`, and zone `2` gets `order: 2`.

---

### Get Zone States

<badge type="tip">GET</badge> `/fluent-cart/v2/shipping/zone/states`

Retrieve state/province options and address locale configuration for a given country. Useful for populating state selectors when configuring shipping methods within a zone.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `country_code` | string | query | No | ISO 3166-1 alpha-2 country code (e.g., `US`, `CA`, `GB`) |

#### Response

```json
{
  "data": {
    "country_code": "US",
    "states": {
      "AL": "Alabama",
      "AK": "Alaska",
      "AZ": "Arizona",
      "CA": "California",
      "NY": "New York"
    },
    "address_locale": {
      "state": {
        "label": "State",
        "required": true
      },
      "postcode": {
        "label": "ZIP Code",
        "required": true
      }
    }
  }
}
```

When no country code is provided or the country has no states:

```json
{
  "data": {
    "country_code": "",
    "states": [],
    "address_locale": []
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/shipping/zone/states?country_code=US" \
  -u "username:app_password"
```

---

## Shipping Methods

Shipping methods define how items are shipped within a zone. Each method belongs to a zone and can be scoped to specific states/provinces within that zone's country.

### Create Shipping Method

<badge type="warning">POST</badge> `/fluent-cart/v2/shipping/methods`

Create a new shipping method within a shipping zone.

- **Permission:** `store/sensitive`
- **Request Class:** `ShippingMethodRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `zone_id` | integer | body | Yes | ID of the parent shipping zone |
| `title` | string | body | Yes | Method display title (max 192 characters) |
| `type` | string | body | Yes | Shipping method type (max 192 characters), e.g., `flat_rate`, `free_shipping`, `local_pickup` |
| `amount` | string | body | No | Shipping cost in cents (e.g., `500` for $5.00) |
| `is_enabled` | integer | body | No | Enable/disable the method: `1` (enabled) or `0` (disabled). Default: `1` |
| `states` | array | body | No | Array of state/province codes to restrict this method to (e.g., `["CA", "NY"]`). Empty array means all states. |
| `settings` | object | body | No | Additional settings for the method |
| `settings.configure_rate` | string | body | No | Rate configuration type |
| `settings.class_aggregation` | string | body | No | How shipping classes are aggregated |
| `meta` | object | body | No | Additional metadata key-value pairs (string values only) |

#### Response

```json
{
  "message": "Shipping method has been created successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/shipping/methods" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "zone_id": 1,
    "title": "Standard Shipping",
    "type": "flat_rate",
    "amount": "500",
    "is_enabled": 1,
    "states": ["CA", "NY"],
    "settings": {
      "configure_rate": "per_order",
      "class_aggregation": "per_class"
    }
  }'
```

---

### Update Shipping Method

<badge type="info">PUT</badge> `/fluent-cart/v2/shipping/methods`

Update an existing shipping method. The method ID is passed in the request body.

- **Permission:** `store/sensitive`
- **Request Class:** `ShippingMethodRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `method_id` | integer | body | Yes | ID of the shipping method to update |
| `zone_id` | integer | body | Yes | ID of the parent shipping zone |
| `title` | string | body | Yes | Method display title (max 192 characters) |
| `type` | string | body | Yes | Shipping method type (max 192 characters), e.g., `flat_rate`, `free_shipping`, `local_pickup` |
| `amount` | string | body | No | Shipping cost in cents (e.g., `500` for $5.00) |
| `is_enabled` | integer | body | No | Enable/disable the method: `1` (enabled) or `0` (disabled) |
| `states` | array | body | No | Array of state/province codes to restrict this method to. Empty array means all states. |
| `settings` | object | body | No | Additional settings for the method |
| `settings.configure_rate` | string | body | No | Rate configuration type |
| `settings.class_aggregation` | string | body | No | How shipping classes are aggregated |
| `meta` | object | body | No | Additional metadata key-value pairs (string values only) |

#### Response

```json
{
  "message": "Shipping method has been updated successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/shipping/methods" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "method_id": 10,
    "zone_id": 1,
    "title": "Express Shipping",
    "type": "flat_rate",
    "amount": "1200",
    "is_enabled": 1,
    "states": []
  }'
```

---

### Delete Shipping Method

<badge type="danger">DELETE</badge> `/fluent-cart/v2/shipping/methods/{method_id}`

Delete a shipping method by ID.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `method_id` | integer | path | Yes | The shipping method ID |

#### Response

```json
{
  "message": "Shipping method has been deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/shipping/methods/10" \
  -u "username:app_password"
```

---

## Shipping Classes

Shipping classes allow you to group products with similar shipping requirements. Each class defines a cost (fixed or percentage) that can be applied per order or per item.

### List Shipping Classes

<badge type="tip">GET</badge> `/fluent-cart/v2/shipping/classes`

Retrieve a paginated list of shipping classes with filtering and sorting capabilities.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Search classes by name |
| `per_page` | integer | query | No | Number of results per page (default: `10`, max: `200`) |
| `page` | integer | query | No | Page number for pagination |
| `sort_by` | string | query | No | Column to sort by (default: `id`) |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `filter_type` | string | query | No | `simple` or `advanced` |

#### Response

```json
{
  "shipping_classes": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Heavy Items",
        "cost": 15.00,
        "type": "fixed",
        "per_item": 1,
        "created_at": "2025-01-20 09:00:00",
        "updated_at": "2025-01-20 09:00:00"
      },
      {
        "id": 2,
        "name": "Fragile Items",
        "cost": 10.00,
        "type": "percentage",
        "per_item": 0,
        "created_at": "2025-01-21 10:00:00",
        "updated_at": "2025-01-21 10:00:00"
      }
    ]
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/shipping/classes?search=heavy&per_page=20" \
  -u "username:app_password"
```

---

### Create Shipping Class

<badge type="warning">POST</badge> `/fluent-cart/v2/shipping/classes`

Create a new shipping class.

- **Permission:** `store/sensitive`
- **Request Class:** `ShippingClassRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `name` | string | body | Yes | Class name (max 192 characters) |
| `cost` | numeric | body | Yes | Cost value (minimum: `0`). For `fixed` type, this is a flat amount. For `percentage` type, this is a percentage value. |
| `type` | string | body | Yes | Cost type: `fixed` or `percentage` |
| `per_item` | integer | body | No | Apply cost per item (`1`) or per order (`0`). Default: `0` |

#### Response

```json
{
  "shipping_class": {
    "id": 3,
    "name": "Oversized Items",
    "cost": 25.00,
    "type": "fixed",
    "per_item": 1,
    "created_at": "2025-02-01 11:00:00",
    "updated_at": "2025-02-01 11:00:00"
  },
  "message": "Shipping class has been created successfully"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/shipping/classes" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Oversized Items",
    "cost": 25.00,
    "type": "fixed",
    "per_item": 1
  }'
```

---

### Get Shipping Class

<badge type="tip">GET</badge> `/fluent-cart/v2/shipping/classes/{id}`

Retrieve a single shipping class by ID.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The shipping class ID |

#### Response

```json
{
  "shipping_class": {
    "id": 1,
    "name": "Heavy Items",
    "cost": 15.00,
    "type": "fixed",
    "per_item": 1,
    "created_at": "2025-01-20 09:00:00",
    "updated_at": "2025-01-20 09:00:00"
  }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/shipping/classes/1" \
  -u "username:app_password"
```

---

### Update Shipping Class

<badge type="info">PUT</badge> `/fluent-cart/v2/shipping/classes/{id}`

Update an existing shipping class.

- **Permission:** `store/sensitive`
- **Request Class:** `ShippingClassRequest`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The shipping class ID |
| `name` | string | body | Yes | Class name (max 192 characters) |
| `cost` | numeric | body | Yes | Cost value (minimum: `0`) |
| `type` | string | body | Yes | Cost type: `fixed` or `percentage` |
| `per_item` | integer | body | No | Apply cost per item (`1`) or per order (`0`). Default: `0` |

#### Response

```json
{
  "shipping_class": {
    "id": 1,
    "name": "Heavy Items",
    "cost": 20.00,
    "type": "fixed",
    "per_item": 1,
    "created_at": "2025-01-20 09:00:00",
    "updated_at": "2025-02-05 14:00:00"
  },
  "message": "Shipping class has been updated successfully"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/shipping/classes/1" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Heavy Items",
    "cost": 20.00,
    "type": "fixed",
    "per_item": 1
  }'
```

---

### Delete Shipping Class

<badge type="danger">DELETE</badge> `/fluent-cart/v2/shipping/classes/{id}`

Delete a shipping class by ID.

- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | path | Yes | The shipping class ID |

#### Response

```json
{
  "message": "Shipping class has been deleted successfully"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/shipping/classes/1" \
  -u "username:app_password"
```

---

## Data Models

### Shipping Zone Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique zone identifier |
| `name` | string | Zone display name |
| `region` | string | ISO 3166-1 alpha-2 country code or `all` for worldwide |
| `order` | integer | Sort order for display priority |
| `formatted_region` | string | Human-readable region name (computed) |
| `methods` | array | Associated shipping methods (included when using `show` endpoint) |
| `created_at` | string | Creation timestamp (UTC) |
| `updated_at` | string | Last update timestamp (UTC) |

### Shipping Method Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique method identifier |
| `zone_id` | integer | Parent shipping zone ID |
| `title` | string | Method display title |
| `type` | string | Method type (e.g., `flat_rate`, `free_shipping`, `local_pickup`) |
| `amount` | integer | Shipping cost in cents |
| `is_enabled` | boolean | Whether the method is active |
| `states` | array | State/province codes this method applies to (empty = all states) |
| `settings` | object | Additional configuration settings |
| `meta` | object | Additional metadata |
| `order` | integer | Sort order within the zone |
| `formatted_states` | array | Human-readable state names (computed) |
| `created_at` | string | Creation timestamp (UTC) |
| `updated_at` | string | Last update timestamp (UTC) |

### Shipping Class Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique class identifier |
| `name` | string | Class display name |
| `cost` | float | Cost value (flat amount or percentage, depending on `type`) |
| `type` | string | Cost type: `fixed` or `percentage` |
| `per_item` | integer | `1` = cost applied per item, `0` = cost applied per order |
| `created_at` | string | Creation timestamp (UTC) |
| `updated_at` | string | Last update timestamp (UTC) |
