---
title: Shipping API
description: FluentCart Shipping API for managing shipping zones, methods, and classes.
---

# Shipping API

The Shipping API provides endpoints for managing shipping zones, shipping methods, and shipping classes in FluentCart.

## Base URL

All Shipping API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Shipping API endpoints require:
- **Policy**: `StoreSensitivePolicy`
- **Authentication**: WordPress Application Passwords or Cookie Authentication

## Shipping Zones

Shipping zones define geographic regions where specific shipping methods are available.

### List Shipping Zones

Retrieve a paginated list of all shipping zones.

**Endpoint:** `GET /shipping/zones`

**Permission Required**: `StoreSensitivePolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search term for filtering zones |
| `per_page` | int | No | Number of items per page (default: 10) |
| `page` | int | No | Page number (default: 1) |

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_zones": {
      "data": [
        {
          "id": 1,
          "name": "United States",
          "region": "US",
          "order": 0,
          "created_at": "2024-01-01 10:00:00",
          "updated_at": "2024-01-01 10:00:00"
        }
      ],
      "total": 1,
      "per_page": 10,
      "current_page": 1,
      "last_page": 1
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Shipping Zone

Retrieve details for a specific shipping zone, including its shipping methods.

**Endpoint:** `GET /shipping/zones/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Shipping zone ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_zone": {
      "id": 1,
      "name": "United States",
      "region": "US",
      "order": 0,
      "methods": [
        {
          "id": 1,
          "zone_id": 1,
          "title": "Standard Shipping",
          "type": "flat_rate",
          "amount": "5.00",
          "is_enabled": 1
        }
      ],
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Shipping Zone

Create a new shipping zone.

**Endpoint:** `POST /shipping/zones`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Zone name (max 192 characters) |
| `region` | string | Yes | Region code (country code or 'all' for whole world) |
| `order` | int | No | Display order (default: 0) |

**Note**: Only one zone with `region = 'all'` is allowed.

```json
{
  "name": "United States",
  "region": "US",
  "order": 0
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_zone": {
      "id": 1,
      "name": "United States",
      "region": "US",
      "order": 0,
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    },
    "message": "Shipping zone has been created successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "United States",
    "region": "US",
    "order": 0
  }'
```

### Update Shipping Zone

Update an existing shipping zone.

**Endpoint:** `PUT /shipping/zones/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Shipping zone ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Zone name (max 192 characters) |
| `region` | string | Yes | Region code (country code or 'all' for whole world) |
| `order` | int | No | Display order |

**Note**: If the region is changed, all shipping methods in this zone will have their states cleared.

```json
{
  "name": "United States & Canada",
  "region": "US",
  "order": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_zone": {
      "id": 1,
      "name": "United States & Canada",
      "region": "US",
      "order": 1,
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-15 11:30:00"
    },
    "message": "Shipping zone has been updated successfully"
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "United States & Canada",
    "region": "US",
    "order": 1
  }'
```

### Delete Shipping Zone

Delete a shipping zone and all its associated shipping methods.

**Endpoint:** `DELETE /shipping/zones/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Shipping zone ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Shipping zone has been deleted successfully"
  }
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Shipping Zones Order

Update the display order of multiple shipping zones.

**Endpoint:** `POST /shipping/zones/update-order`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `zones` | array | Yes | Array of zone IDs in the desired order |

```json
{
  "zones": [3, 1, 2]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Shipping zones order has been updated"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones/update-order" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "zones": [3, 1, 2]
  }'
```

### Get Zone States

Get state/province information for a specific country.

**Endpoint:** `GET /shipping/zone/states`

**Permission Required**: `StoreSensitivePolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes | ISO country code (e.g., 'US', 'CA') |

#### Response

```json
{
  "success": true,
  "data": {
    "data": {
      "code": "US",
      "name": "United States",
      "states": [
        {
          "code": "AL",
          "name": "Alabama"
        },
        {
          "code": "AK",
          "name": "Alaska"
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zone/states?country_code=US" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Shipping Methods

Shipping methods define how products are shipped within a shipping zone.

### Create Shipping Method

Create a new shipping method for a shipping zone.

**Endpoint:** `POST /shipping/methods`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `zone_id` | int | Yes | Shipping zone ID |
| `title` | string | Yes | Method title (max 192 characters) |
| `type` | string | Yes | Method type (e.g., 'flat_rate', 'free_shipping') |
| `amount` | string | No | Shipping cost amount |
| `is_enabled` | int | No | Whether method is enabled (0 or 1, default: 0) |
| `settings` | object | No | Method-specific settings |
| `states` | array | No | Array of state codes where method applies |

```json
{
  "zone_id": 1,
  "title": "Standard Shipping",
  "type": "flat_rate",
  "amount": "5.00",
  "is_enabled": 1,
  "settings": {
    "configure_rate": "per_order",
    "class_aggregation": "sum"
  },
  "states": ["CA", "NY", "TX"]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Shipping method has been created successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/shipping/methods" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "zone_id": 1,
    "title": "Standard Shipping",
    "type": "flat_rate",
    "amount": "5.00",
    "is_enabled": 1
  }'
```

### Update Shipping Method

Update an existing shipping method.

**Endpoint:** `PUT /shipping/methods`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method_id` | int | Yes | Shipping method ID |
| `zone_id` | int | Yes | Shipping zone ID |
| `title` | string | Yes | Method title (max 192 characters) |
| `type` | string | Yes | Method type |
| `amount` | string | No | Shipping cost amount |
| `is_enabled` | int | No | Whether method is enabled (0 or 1) |
| `settings` | object | No | Method-specific settings |
| `states` | array | No | Array of state codes where method applies |

```json
{
  "method_id": 1,
  "zone_id": 1,
  "title": "Express Shipping",
  "type": "flat_rate",
  "amount": "10.00",
  "is_enabled": 1,
  "states": ["CA", "NY"]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Shipping method has been updated successfully"
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/shipping/methods" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "method_id": 1,
    "zone_id": 1,
    "title": "Express Shipping",
    "type": "flat_rate",
    "amount": "10.00",
    "is_enabled": 1
  }'
```

### Delete Shipping Method

Delete a shipping method.

**Endpoint:** `DELETE /shipping/methods/{method_id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method_id` | int | Yes | Shipping method ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Shipping method has been deleted successfully"
  }
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/shipping/methods/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Shipping Classes

Shipping classes allow you to set different shipping costs for different types of products.

### List Shipping Classes

Retrieve a paginated list of all shipping classes.

**Endpoint:** `GET /shipping/classes`

**Permission Required**: `StoreSensitivePolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search term for filtering classes |
| `per_page` | int | No | Number of items per page (default: 10) |
| `page` | int | No | Page number (default: 1) |

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_classes": {
      "data": [
        {
          "id": 1,
          "name": "Heavy Items",
          "cost": "10.00",
          "type": "fixed",
          "per_item": 0,
          "created_at": "2024-01-01 10:00:00",
          "updated_at": "2024-01-01 10:00:00"
        }
      ],
      "total": 1,
      "per_page": 10,
      "current_page": 1,
      "last_page": 1
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Shipping Class

Retrieve details for a specific shipping class.

**Endpoint:** `GET /shipping/classes/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Shipping class ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_class": {
      "id": 1,
      "name": "Heavy Items",
      "cost": "10.00",
      "type": "fixed",
      "per_item": 0,
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Shipping Class

Create a new shipping class.

**Endpoint:** `POST /shipping/classes`

**Permission Required**: `StoreSensitivePolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Class name (max 192 characters) |
| `cost` | numeric | Yes | Shipping cost (must be >= 0) |
| `type` | string | Yes | Cost type: `'fixed'` or `'percentage'` |
| `per_item` | int | No | Whether cost applies per item (0 or 1, default: 0) |

```json
{
  "name": "Heavy Items",
  "cost": "10.00",
  "type": "fixed",
  "per_item": 0
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_class": {
      "id": 1,
      "name": "Heavy Items",
      "cost": "10.00",
      "type": "fixed",
      "per_item": 0,
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    },
    "message": "Shipping class has been created successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Heavy Items",
    "cost": "10.00",
    "type": "fixed",
    "per_item": 0
  }'
```

### Update Shipping Class

Update an existing shipping class.

**Endpoint:** `PUT /shipping/classes/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Shipping class ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Class name (max 192 characters) |
| `cost` | numeric | Yes | Shipping cost (must be >= 0) |
| `type` | string | Yes | Cost type: `'fixed'` or `'percentage'` |
| `per_item` | int | No | Whether cost applies per item (0 or 1) |

```json
{
  "name": "Heavy Items - Updated",
  "cost": "15.00",
  "type": "fixed",
  "per_item": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_class": {
      "id": 1,
      "name": "Heavy Items - Updated",
      "cost": "15.00",
      "type": "fixed",
      "per_item": 1,
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-15 11:30:00"
    },
    "message": "Shipping class has been updated successfully"
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Heavy Items - Updated",
    "cost": "15.00",
    "type": "fixed",
    "per_item": 1
  }'
```

### Delete Shipping Class

Delete a shipping class.

**Endpoint:** `DELETE /shipping/classes/{id}`

**Permission Required**: `StoreSensitivePolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Shipping class ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Shipping class has been deleted successfully"
  }
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Notes

- Shipping zones define geographic regions where shipping methods are available
- Only one shipping zone with `region = 'all'` is allowed
- When a shipping zone's region is updated, all associated shipping methods' states are cleared
- Deleting a shipping zone also deletes all its associated shipping methods
- Shipping classes can be assigned to products to apply different shipping costs
- Shipping method types may vary (e.g., 'flat_rate', 'free_shipping', etc.)

