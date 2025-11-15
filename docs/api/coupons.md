---
title: Coupons API
description: FluentCart Coupons API documentation with complete endpoint reference and usage examples.
---

# Coupons API

The Coupons API provides comprehensive endpoints for managing discount coupons in FluentCart. This includes creating, reading, updating, and deleting coupons, as well as applying and managing coupon usage.

## Base URL

```
https://yoursite.com/wp-json/fluent-cart/v2/coupons
```

## Authentication

All endpoints require authentication and appropriate permissions:

- **Authentication**: WordPress Application Password or Cookie
- **Policy**: `CouponPolicy`
- **Permissions**: Various coupon-related permissions

## Endpoints

### List Coupons

**GET** `/coupons`

Retrieve a paginated list of coupons with optional filtering and searching.

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `per_page` | integer | Items per page (max 100) | 10 |
| `search` | string | Search query | - |
| `filters` | object | Filter options | - |
| `order_by` | string | Sort field | id |
| `order_type` | string | Sort direction (ASC/DESC) | DESC |

#### Filter Options

```json
{
  "status": "active",
  "type": "percentage",
  "date_from": "2024-01-01",
  "date_to": "2024-12-31"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "SAVE10",
        "name": "10% Off Discount",
        "type": "percentage",
        "value": 10,
        "status": "active",
        "usage_limit": 100,
        "used_count": 25,
        "minimum_amount": 5000,
        "maximum_amount": 50000,
        "valid_from": "2024-01-01T00:00:00Z",
        "valid_until": "2024-12-31T23:59:59Z",
        "created_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/coupons?page=1&per_page=20&search=SAVE10" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### List Coupons (Alternative)

**GET** `/coupons/listCoupons`

Alternative endpoint for listing coupons with different permissions.

#### Response

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "SAVE10",
        "name": "10% Off Discount",
        "type": "percentage",
        "value": 10,
        "status": "active"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/coupons/listCoupons" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Coupon

**POST** `/coupons`

Create a new discount coupon.

#### Request Body

```json
{
  "code": "SAVE20",
  "name": "20% Off Discount",
  "type": "percentage",
  "value": 20,
  "status": "active",
  "usage_limit": 50,
  "minimum_amount": 1000,
  "maximum_amount": 10000,
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2024-12-31T23:59:59Z",
  "applicable_products": [1, 2, 3],
  "applicable_categories": [1, 2],
  "customer_restrictions": {
    "new_customers_only": true,
    "customer_ids": [1, 2, 3]
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": 2,
      "code": "SAVE20",
      "name": "20% Off Discount",
      "type": "percentage",
      "value": 20,
      "status": "active",
      "usage_limit": 50,
      "used_count": 0,
      "minimum_amount": 1000,
      "maximum_amount": 10000,
      "valid_from": "2024-01-01T00:00:00Z",
      "valid_until": "2024-12-31T23:59:59Z",
      "created_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/coupons" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "name": "20% Off Discount",
    "type": "percentage",
    "value": 20,
    "status": "active"
  }'
```

### Get Coupon Details

**GET** `/coupons/{id}`

Retrieve detailed information about a specific coupon.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Coupon ID |

#### Response

```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": 1,
      "code": "SAVE10",
      "name": "10% Off Discount",
      "type": "percentage",
      "value": 10,
      "status": "active",
      "usage_limit": 100,
      "used_count": 25,
      "minimum_amount": 5000,
      "maximum_amount": 50000,
      "valid_from": "2024-01-01T00:00:00Z",
      "valid_until": "2024-12-31T23:59:59Z",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "applicable_products": [
        {
          "id": 1,
          "title": "Product 1"
        }
      ],
      "applicable_categories": [
        {
          "id": 1,
          "name": "Electronics"
        }
      ],
      "usage_history": [
        {
          "id": 1,
          "order_id": 1,
          "customer_id": 1,
          "discount_amount": 500,
          "used_at": "2024-01-15T14:30:00Z"
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/coupons/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Coupon

**PUT** `/coupons/{id}`

Update an existing coupon.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Coupon ID |

#### Request Body

```json
{
  "name": "Updated 10% Off Discount",
  "value": 15,
  "usage_limit": 150,
  "status": "active"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": 1,
      "name": "Updated 10% Off Discount",
      "value": 15,
      "usage_limit": 150,
      "status": "active",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/coupons/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated 10% Off Discount",
    "value": 15
  }'
```

### Delete Coupon

**DELETE** `/coupons/{id}`

Delete a coupon.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Coupon ID |

#### Response

```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/coupons/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Apply Coupon

**POST** `/coupons/apply`

Apply a coupon to an order or cart.

#### Request Body

```json
{
  "coupon_code": "SAVE10",
  "order_id": 1,
  "cart_items": [
    {
      "product_id": 1,
      "variation_id": 1,
      "quantity": 2,
      "price": 2500
    }
  ],
  "customer_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": 1,
      "code": "SAVE10",
      "type": "percentage",
      "value": 10
    },
    "discount": {
      "amount": 500,
      "percentage": 10,
      "applied_to": "order"
    },
    "order": {
      "id": 1,
      "subtotal": 5000,
      "discount": 500,
      "total": 4500
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/coupons/apply" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_code": "SAVE10",
    "order_id": 1,
    "customer_id": 1
  }'
```

### Cancel Coupon

**POST** `/coupons/cancel`

Cancel/remove a coupon from an order.

#### Request Body

```json
{
  "coupon_code": "SAVE10",
  "order_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "subtotal": 5000,
      "discount": 0,
      "total": 5000
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/coupons/cancel" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_code": "SAVE10",
    "order_id": 1
  }'
```

### Re-apply Coupon

**POST** `/coupons/re-apply`

Re-apply a coupon to an order.

#### Request Body

```json
{
  "coupon_code": "SAVE10",
  "order_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": 1,
      "code": "SAVE10",
      "type": "percentage",
      "value": 10
    },
    "discount": {
      "amount": 500,
      "percentage": 10
    },
    "order": {
      "id": 1,
      "subtotal": 5000,
      "discount": 500,
      "total": 4500
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/coupons/re-apply" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_code": "SAVE10",
    "order_id": 1
  }'
```

### Check Product Eligibility

**POST** `/coupons/checkProductEligibility`

Check if a product is eligible for a coupon.

#### Request Body

```json
{
  "coupon_code": "SAVE10",
  "product_id": 1,
  "variation_id": 1,
  "quantity": 2,
  "price": 2500
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "eligible": true,
    "coupon": {
      "id": 1,
      "code": "SAVE10",
      "type": "percentage",
      "value": 10
    },
    "discount": {
      "amount": 500,
      "percentage": 10
    },
    "restrictions": {
      "minimum_amount_met": true,
      "maximum_amount_met": true,
      "product_eligible": true,
      "category_eligible": true
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/coupons/checkProductEligibility" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_code": "SAVE10",
    "product_id": 1,
    "quantity": 2,
    "price": 2500
  }'
```

### Get Coupon Settings

**GET** `/coupons/getSettings`

Get global coupon settings and configuration.

#### Response

```json
{
  "success": true,
  "data": {
    "settings": {
      "auto_apply_coupons": false,
      "allow_multiple_coupons": false,
      "coupon_usage_tracking": true,
      "coupon_expiry_notifications": true,
      "default_coupon_restrictions": {
        "minimum_amount": 0,
        "maximum_amount": 0,
        "usage_limit": 0
      }
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/coupons/getSettings" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Store Coupon Settings

**POST** `/coupons/storeCouponSettings`

Update global coupon settings.

#### Request Body

```json
{
  "auto_apply_coupons": true,
  "allow_multiple_coupons": false,
  "coupon_usage_tracking": true,
  "coupon_expiry_notifications": true,
  "default_coupon_restrictions": {
    "minimum_amount": 1000,
    "maximum_amount": 10000,
    "usage_limit": 100
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "settings": {
      "auto_apply_coupons": true,
      "allow_multiple_coupons": false,
      "coupon_usage_tracking": true,
      "coupon_expiry_notifications": true,
      "default_coupon_restrictions": {
        "minimum_amount": 1000,
        "maximum_amount": 10000,
        "usage_limit": 100
      },
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/coupons/storeCouponSettings" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "auto_apply_coupons": true,
    "allow_multiple_coupons": false,
    "coupon_usage_tracking": true
  }'
```

## Coupon Types

### Percentage Discount

```json
{
  "type": "percentage",
  "value": 10
}
```

### Fixed Amount Discount

```json
{
  "type": "fixed",
  "value": 500
}
```

### Free Shipping

```json
{
  "type": "free_shipping",
  "value": 0
}
```

## Coupon Restrictions

### Product Restrictions

```json
{
  "applicable_products": [1, 2, 3],
  "excluded_products": [4, 5, 6]
}
```

### Category Restrictions

```json
{
  "applicable_categories": [1, 2],
  "excluded_categories": [3, 4]
}
```

### Customer Restrictions

```json
{
  "customer_restrictions": {
    "new_customers_only": true,
    "customer_ids": [1, 2, 3],
    "excluded_customer_ids": [4, 5, 6]
  }
}
```

### Amount Restrictions

```json
{
  "minimum_amount": 5000,
  "maximum_amount": 50000
}
```

### Usage Restrictions

```json
{
  "usage_limit": 100,
  "usage_limit_per_customer": 1
}
```

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| `coupon_not_found` | Coupon with specified code not found |
| `coupon_expired` | Coupon has expired |
| `coupon_inactive` | Coupon is not active |
| `coupon_usage_limit_reached` | Coupon usage limit exceeded |
| `coupon_minimum_amount_not_met` | Order amount below minimum requirement |
| `coupon_maximum_amount_exceeded` | Order amount exceeds maximum limit |
| `coupon_product_not_eligible` | Product not eligible for coupon |
| `coupon_customer_not_eligible` | Customer not eligible for coupon |
| `insufficient_permissions` | User lacks required permissions |
| `validation_error` | Request data validation failed |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "coupon_not_found",
    "message": "Coupon with code 'INVALID' not found"
  }
}
```

## Rate Limiting

- **List operations**: 100 requests per hour
- **Create operations**: 50 requests per hour
- **Update operations**: 200 requests per hour
- **Delete operations**: 20 requests per hour
- **Apply operations**: 1000 requests per hour

## Related Documentation

- [Orders API](./orders) - Order management endpoints
- [Customers API](./customers) - Customer management endpoints
- [Products API](./products) - Product management endpoints
- [Database Models](/database/models) - Coupon data models
- [Developer Hooks](/hooks/) - Coupon-related hooks

## Next Steps

Continue with coupon management:

1. **[Orders API](./orders)** - Apply coupons to orders
2. **[Customers API](./customers)** - Customer-specific coupon restrictions
3. **[Products API](./products)** - Product-specific coupon eligibility
4. **[Database Models](/database/models)** - Understand coupon data structure

## Previous/Next Navigation

- **Previous**: [Authentication Guide](./authentication) - API authentication
- **Next**: [Orders API](./orders) - Order management endpoints

---

