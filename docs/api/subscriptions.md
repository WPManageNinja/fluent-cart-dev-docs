---
title: Subscriptions API
description: FluentCart Subscriptions API documentation with complete endpoint reference and usage examples.
---

# Subscriptions API

The Subscriptions API provides comprehensive endpoints for managing subscriptions in FluentCart. This includes creating, reading, updating, and managing subscription lifecycle operations like cancellation, reactivation, and payment method updates.

## Base URL

```
https://yoursite.com/wp-json/fluent-cart/v2/subscriptions
```

## Authentication

All endpoints require authentication and appropriate permissions:

- **Authentication**: WordPress Application Password or Cookie
- **Policy**: `SubscriptionsPolicy` (Admin) / `CustomerFrontendPolicy` (Customer)
- **Permissions**: Various subscription-related permissions

## Admin Endpoints

### List Subscriptions

**GET** `/subscriptions`

Retrieve a paginated list of subscriptions with optional filtering and searching.

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
  "customer_id": 123,
  "product_id": 456,
  "date_from": "2024-01-01",
  "date_to": "2024-12-31"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "uuid": "sub_abc123",
        "customer_id": 123,
        "product_id": 456,
        "variation_id": 789,
        "status": "active",
        "billing_cycle": "monthly",
        "amount": 2500,
        "currency": "USD",
        "next_billing_date": "2024-02-01T00:00:00Z",
        "created_at": "2024-01-01T10:00:00Z",
        "customer": {
          "id": 123,
          "email": "customer@example.com",
          "first_name": "John",
          "last_name": "Doe"
        },
        "product": {
          "id": 456,
          "title": "Premium Plan",
          "sku": "PREMIUM-001"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/subscriptions?page=1&per_page=20&search=premium" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Subscription Details

**GET** `/subscriptions/{subscriptionOrderId}`

Retrieve detailed information about a specific subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscriptionOrderId` | integer | Subscription Order ID |

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "uuid": "sub_abc123",
      "customer_id": 123,
      "product_id": 456,
      "variation_id": 789,
      "status": "active",
      "billing_cycle": "monthly",
      "amount": 2500,
      "currency": "USD",
      "next_billing_date": "2024-02-01T00:00:00Z",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "customer": {
        "id": 123,
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "product": {
        "id": 456,
        "title": "Premium Plan",
        "sku": "PREMIUM-001"
      },
      "order": {
        "id": 1,
        "status": "completed",
        "payment_status": "paid"
      },
      "transactions": [
        {
          "id": 1,
          "amount": 2500,
          "status": "succeeded",
          "created_at": "2024-01-01T10:00:00Z"
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/subscriptions/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Cancel Subscription

**PUT** `/orders/{order}/subscriptions/{subscription}/cancel`

Cancel a subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID |
| `subscription` | integer | Subscription ID |

#### Request Body

```json
{
  "reason": "Customer requested cancellation",
  "cancel_immediately": false
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "status": "cancelled",
      "cancelled_at": "2024-01-15T14:30:00Z",
      "cancellation_reason": "Customer requested cancellation"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/orders/1/subscriptions/1/cancel" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested cancellation"
  }'
```

### Fetch Subscription

**PUT** `/orders/{order}/subscriptions/{subscription}/fetch`

Fetch subscription data from payment gateway.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID |
| `subscription` | integer | Subscription ID |

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "status": "active",
      "next_billing_date": "2024-02-01T00:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/orders/1/subscriptions/1/fetch" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Reactivate Subscription

**PUT** `/orders/{order}/subscriptions/{subscription}/reactivate`

Reactivate a cancelled subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID |
| `subscription` | integer | Subscription ID |

#### Request Body

```json
{
  "reactivation_date": "2024-02-01T00:00:00Z"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "status": "active",
      "reactivated_at": "2024-01-15T14:30:00Z",
      "next_billing_date": "2024-02-01T00:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/orders/1/subscriptions/1/reactivate" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "reactivation_date": "2024-02-01T00:00:00Z"
  }'
```

### Pause Subscription

**PUT** `/orders/{order}/subscriptions/{subscription}/pause`

Pause a subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID |
| `subscription` | integer | Subscription ID |

#### Request Body

```json
{
  "pause_until": "2024-03-01T00:00:00Z",
  "reason": "Customer requested pause"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "status": "paused",
      "paused_at": "2024-01-15T14:30:00Z",
      "pause_until": "2024-03-01T00:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/orders/1/subscriptions/1/pause" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "pause_until": "2024-03-01T00:00:00Z",
    "reason": "Customer requested pause"
  }'
```

### Resume Subscription

**PUT** `/orders/{order}/subscriptions/{subscription}/resume`

Resume a paused subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID |
| `subscription` | integer | Subscription ID |

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "status": "active",
      "resumed_at": "2024-01-15T14:30:00Z",
      "next_billing_date": "2024-02-01T00:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/orders/1/subscriptions/1/resume" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Customer Frontend Endpoints

### Get Customer Subscriptions

**GET** `/customer-profile/subscriptions`

Get all subscriptions for the authenticated customer.

#### Response

```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "uuid": "sub_abc123",
        "product_id": 456,
        "variation_id": 789,
        "status": "active",
        "billing_cycle": "monthly",
        "amount": 2500,
        "currency": "USD",
        "next_billing_date": "2024-02-01T00:00:00Z",
        "product": {
          "id": 456,
          "title": "Premium Plan",
          "sku": "PREMIUM-001"
        }
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Customer Subscription Details

**GET** `/customer-profile/subscriptions/{subscription_uuid}`

Get detailed information about a specific customer subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscription_uuid` | string | Subscription UUID |

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "uuid": "sub_abc123",
      "product_id": 456,
      "variation_id": 789,
      "status": "active",
      "billing_cycle": "monthly",
      "amount": 2500,
      "currency": "USD",
      "next_billing_date": "2024-02-01T00:00:00Z",
      "created_at": "2024-01-01T10:00:00Z",
      "product": {
        "id": 456,
        "title": "Premium Plan",
        "sku": "PREMIUM-001"
      },
      "transactions": [
        {
          "id": 1,
          "amount": 2500,
          "status": "succeeded",
          "created_at": "2024-01-01T10:00:00Z"
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions/sub_abc123" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Payment Method

**POST** `/customer-profile/subscriptions/{subscription_uuid}/update-payment-method`

Update the payment method for a subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscription_uuid` | string | Subscription UUID |

#### Request Body

```json
{
  "payment_method_id": "pm_1234567890",
  "payment_method_type": "card"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "payment_method_id": "pm_1234567890",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions/sub_abc123/update-payment-method" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": "pm_1234567890",
    "payment_method_type": "card"
  }'
```

### Get or Create Plan

**POST** `/customer-profile/subscriptions/{subscription_uuid}/get-or-create-plan`

Get or create a subscription plan.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscription_uuid` | string | Subscription UUID |

#### Request Body

```json
{
  "plan_id": "plan_1234567890",
  "amount": 2500,
  "billing_cycle": "monthly"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan_1234567890",
      "amount": 2500,
      "billing_cycle": "monthly",
      "created": false
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions/sub_abc123/get-or-create-plan" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "plan_1234567890",
    "amount": 2500,
    "billing_cycle": "monthly"
  }'
```

### Switch Payment Method

**POST** `/customer-profile/subscriptions/{subscription_uuid}/switch-payment-method`

Switch the payment method for a subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscription_uuid` | string | Subscription UUID |

#### Request Body

```json
{
  "new_payment_method_id": "pm_0987654321",
  "payment_method_type": "card"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "payment_method_id": "pm_0987654321",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions/sub_abc123/switch-payment-method" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "new_payment_method_id": "pm_0987654321",
    "payment_method_type": "card"
  }'
```

### Confirm Subscription Switch

**POST** `/customer-profile/subscriptions/{subscription_uuid}/confirm-subscription-switch`

Confirm a subscription payment method switch.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscription_uuid` | string | Subscription UUID |

#### Request Body

```json
{
  "confirmation_token": "conf_1234567890"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "status": "active",
      "payment_method_switched": true,
      "updated_at": "2024-01-15T14:30:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions/sub_abc123/confirm-subscription-switch" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "confirmation_token": "conf_1234567890"
  }'
```

### Confirm Subscription Reactivation

**POST** `/customer-profile/subscriptions/{subscription_uuid}/confirm-subscription-reactivation`

Confirm a subscription reactivation.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscription_uuid` | string | Subscription UUID |

#### Request Body

```json
{
  "reactivation_token": "react_1234567890"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "status": "active",
      "reactivated_at": "2024-01-15T14:30:00Z",
      "next_billing_date": "2024-02-01T00:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions/sub_abc123/confirm-subscription-reactivation" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "reactivation_token": "react_1234567890"
  }'
```

### Cancel Auto Renew

**POST** `/customer-profile/subscriptions/{subscription_uuid}/cancel-auto-renew`

Cancel auto-renewal for a subscription.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subscription_uuid` | string | Subscription UUID |

#### Request Body

```json
{
  "reason": "Customer requested cancellation",
  "cancel_at_period_end": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "auto_renew": false,
      "cancel_at_period_end": true,
      "cancellation_date": "2024-02-01T00:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customer-profile/subscriptions/sub_abc123/cancel-auto-renew" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested cancellation",
    "cancel_at_period_end": true
  }'
```

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| `subscription_not_found` | Subscription with specified ID not found |
| `invalid_subscription_status` | Subscription status does not allow this operation |
| `payment_method_invalid` | Payment method is invalid or expired |
| `insufficient_permissions` | User lacks required permissions |
| `validation_error` | Request data validation failed |
| `gateway_error` | Payment gateway error occurred |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "subscription_not_found",
    "message": "Subscription with ID 999 not found"
  }
}
```

## Rate Limiting

- **List operations**: 100 requests per hour
- **Create operations**: 50 requests per hour
- **Update operations**: 200 requests per hour
- **Cancel operations**: 20 requests per hour

## Related Documentation

- [Orders API](./orders) - Order management endpoints
- [Customers API](./customers) - Customer management endpoints
- [Products API](./products) - Product management endpoints
- [Database Models](/database/models) - Subscription data models
- [Developer Hooks](/hooks/) - Subscription-related hooks

## Next Steps

Continue with subscription management:

1. **[Orders API](./orders)** - Manage subscription orders
2. **[Customers API](./customers)** - Manage customer data
3. **[Products API](./products)** - Manage subscription products
4. **[Database Models](/database/models)** - Understand subscription data structure

## Previous/Next Navigation

- **Previous**: [Products API](./products) - Product management endpoints
- **Next**: [Authentication Guide](./authentication) - API authentication

---

