---
title: Orders API
description: FluentCart Orders API documentation with complete endpoint reference and usage examples.
---

# Orders API

The Orders API provides comprehensive endpoints for managing orders in FluentCart. This includes creating, reading, updating, and deleting orders, as well as managing order statuses, payments, and related operations.

## Base URL

```
https://yoursite.com/wp-json/fluent-cart/v2/orders
```

## Authentication

All endpoints require authentication and appropriate permissions:

- **Authentication**: WordPress Application Password or Cookie
- **Policy**: `OrderPolicy`
- **Permissions**: Various order-related permissions

## Endpoints

### List Orders

**GET** `/orders`

Retrieve a paginated list of orders with optional filtering and searching.

**Permission Required**: `orders/view`

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
  "status": "completed",
  "payment_status": "paid",
  "customer_id": 123,
  "date_from": "2024-01-01",
  "date_to": "2024-12-31"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "uuid": "abc123",
        "status": "completed",
        "payment_status": "paid",
        "customer_id": 123,
        "total_amount": 5000,
        "currency": "USD",
        "created_at": "2024-01-01T10:00:00Z",
        "customer": {
          "id": 123,
          "email": "customer@example.com",
          "first_name": "John",
          "last_name": "Doe"
        },
        "order_items": [
          {
            "id": 1,
            "product_id": 456,
            "variation_id": 789,
            "quantity": 2,
            "price": 2500
          }
        ]
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
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders?page=1&per_page=20&search=john" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Order

**POST** `/orders`

Create a new order with items and customer information. Note: Subscription orders are not supported via manual order creation.

**Permission Required**: `orders/create`

#### Request Body

```json
{
  "customer_id": 123,
  "items": [
    {
      "product_id": 456,
      "variation_id": 789,
      "quantity": 2
    }
  ],
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "address_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US"
  },
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US"
  },
  "payment_method": "stripe",
  "note": "Special delivery instructions"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "uuid": "abc123",
      "status": "pending",
      "payment_status": "pending",
      "total_amount": 5000,
      "currency": "USD",
      "created_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 123,
    "items": [
      {
        "product_id": 456,
        "variation_id": 789,
        "quantity": 2
      }
    ],
    "payment_method": "stripe"
  }'
```

### Get Order Details

**GET** `/orders/{order_id}`

Retrieve detailed information about a specific order.

**Permission Required**: `orders/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | integer | Order ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "uuid": "abc123",
      "status": "completed",
      "payment_status": "paid",
      "customer_id": 123,
      "total_amount": 5000,
      "currency": "USD",
      "created_at": "2024-01-01T10:00:00Z",
      "customer": {
        "id": 123,
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "order_items": [
        {
          "id": 1,
          "product_id": 456,
          "variation_id": 789,
          "quantity": 2,
          "price": 2500,
          "product": {
            "id": 456,
            "title": "Sample Product",
            "sku": "SP-001"
          }
        }
      ],
      "transactions": [
        {
          "id": 1,
          "payment_method": "stripe",
          "status": "succeeded",
          "amount": 5000,
          "transaction_id": "txn_123456"
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Order

**POST** `/orders/{order_id}`

Update an existing order's information. Note: Subscription orders cannot be edited. Completed orders cannot have their status updated.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | integer | Order ID (route parameter) |

#### Request Body

```json
{
  "status": "processing",
  "note": "Updated order note",
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "status": "processing",
      "note": "Updated order note",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "note": "Updated order note"
  }'
```

### Delete Order

**DELETE** `/orders/{order_id}`

Delete an order.

**Permission Required**: `orders/delete`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | integer | Order ID (route parameter) |

#### Response

```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/orders/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Mark Order as Paid

**POST** `/orders/{order}/mark-as-paid`

Mark an order as paid manually.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |

#### Request Body

```json
{
  "payment_method": "manual",
  "transaction_id": "manual_123",
  "note": "Manual payment confirmation"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "payment_status": "paid",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/mark-as-paid" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "manual",
    "transaction_id": "manual_123"
  }'
```

### Generate Missing Licenses

**POST** `/orders/{order}/generate-missing-licenses`

Generate missing licenses for an order.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Licenses generated successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/generate-missing-licenses" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Refund Order

**POST** `/orders/{order_id}/refund`

Process a refund for an order.

**Permission Required**: `orders/can_refund`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | integer | Order ID (route parameter) |

#### Request Body

```json
{
  "amount": 2500,
  "reason": "Customer requested refund",
  "refund_method": "original_payment_method"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "refund": {
      "id": 1,
      "order_id": 1,
      "amount": 2500,
      "status": "completed",
      "refund_id": "ref_123456",
      "created_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/refund" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "reason": "Customer requested refund"
  }'
```

### Update Order Statuses

**PUT** `/orders/{order}/statuses`

Update order statuses (payment status, shipping status, order status).

**Permission Required**: `orders/manage_statuses`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |

#### Request Body

```json
{
  "payment_status": "paid",
  "shipping_status": "shipped",
  "order_status": "processing"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "payment_status": "paid",
      "shipping_status": "shipped",
      "order_status": "processing",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/statuses" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_status": "paid",
    "shipping_status": "shipped"
  }'
```

### Change Order Customer

**POST** `/orders/{order_id}/change-customer`

Change the customer associated with an order.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | integer | Order ID (route parameter) |

#### Request Body

```json
{
  "customer_id": 456
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "customer_id": 456,
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/change-customer" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 456
  }'
```

### Create and Change Customer

**POST** `/orders/{order_id}/create-and-change-customer`

Create a new customer and associate them with the order.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | integer | Order ID (route parameter) |

#### Request Body

```json
{
  "email": "newcustomer@example.com",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "customer_id": 789,
      "updated_at": "2024-01-01T11:00:00Z"
    },
    "customer": {
      "id": 789,
      "email": "newcustomer@example.com",
      "first_name": "Jane",
      "last_name": "Smith"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/create-and-change-customer" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newcustomer@example.com",
    "full_name": "Jane Smith"
  }'
```

### Update Order Address ID

**POST** `/orders/{order_id}/update-address-id`

Update the address ID associated with an order.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order_id` | integer | Order ID (route parameter) |

#### Request Body

```json
{
  "address_id": 123,
  "address_type": "billing"
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/update-address-id" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": 123,
    "address_type": "billing"
  }'
```

### Bulk Actions

**POST** `/orders/do-bulk-action`

Perform bulk actions on multiple orders.

**Permission Required**: `orders/manage`

#### Request Body

```json
{
  "action": "update_status",
  "order_ids": [1, 2, 3],
  "data": {
    "status": "completed"
  }
}
```

#### Available Actions

- `update_status` - Update status of multiple orders
- `delete` - Delete multiple orders
- `export` - Export multiple orders

#### Response

```json
{
  "success": true,
  "data": {
    "processed": 3,
    "failed": 0,
    "results": [
      {
        "order_id": 1,
        "success": true
      },
      {
        "order_id": 2,
        "success": true
      },
      {
        "order_id": 3,
        "success": true
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/do-bulk-action" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_status",
    "order_ids": [1, 2, 3],
    "data": {
      "status": "completed"
    }
  }'
```

### Calculate Shipping

**POST** `/orders/calculate-shipping`

Calculate shipping costs for an order.

#### Request Body

```json
{
  "items": [
    {
      "product_id": 456,
      "variation_id": 789,
      "quantity": 2
    }
  ],
  "shipping_address": {
    "country": "US",
    "state": "NY",
    "postcode": "10001"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_methods": [
      {
        "id": "standard",
        "name": "Standard Shipping",
        "cost": 500,
        "estimated_days": "3-5"
      },
      {
        "id": "express",
        "name": "Express Shipping",
        "cost": 1000,
        "estimated_days": "1-2"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/calculate-shipping" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 456,
        "variation_id": 789,
        "quantity": 2
      }
    ],
    "shipping_address": {
      "country": "US",
      "state": "NY",
      "postcode": "10001"
    }
  }'
```

### Get Shipping Methods

**GET** `/orders/shipping_methods`

Get available shipping methods.

**Permission Required**: `orders/manage`

#### Response

```json
{
  "success": true,
  "data": {
    "shipping_methods": [
      {
        "id": "standard",
        "name": "Standard Shipping",
        "description": "Standard ground shipping",
        "cost": 500,
        "estimated_days": "3-5"
      },
      {
        "id": "express",
        "name": "Express Shipping",
        "description": "Express shipping",
        "cost": 1000,
        "estimated_days": "1-2"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders/shipping_methods" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Order Address

**PUT** `/orders/{order}/address/{id}`

Update an order address.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |
| `id` | integer | Address ID (route parameter) |

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/address/5" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "address_1": "123 Updated St",
    "city": "New York"
  }'
```

### Create Custom Order

**POST** `/orders/{order}/create-custom`

Create a custom order.

**Permission Required**: `orders/create`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/create-custom" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_data": "value"
  }'
```

### Get Order Transactions

**GET** `/orders/{order}/transactions`

Get transactions for a specific order.

**Permission Required**: `orders/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/transactions" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Transaction Details

**GET** `/orders/{id}/transactions/{transaction_id}`

Get details of a specific transaction.

**Permission Required**: `orders/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Order ID (route parameter) |
| `transaction_id` | integer | Transaction ID (route parameter) |

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/transactions/123" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Transaction Status

**PUT** `/orders/{order}/transactions/{transaction}/status`

Update the status of a transaction.

**Permission Required**: `orders/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |
| `transaction` | integer | Transaction ID (route parameter) |

#### Request Body

```json
{
  "status": "completed"
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/transactions/123/status" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Accept Dispute

**POST** `/orders/{order}/transactions/{transaction_id}/accept-dispute/`

Accept a dispute for a transaction.

**Permission Required**: `orders/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `order` | integer | Order ID (route parameter) |
| `transaction_id` | integer | Transaction ID (route parameter) |

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/orders/1/transactions/123/accept-dispute/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

---

## Notes

### Attach Note to Order

Attach or update a note on an order.

**Endpoint:** `POST /notes/attach`

**Permission Required**: `AdminPolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order_id` | int | Yes | Order ID |
| `note` | string | Yes | Note text content |

```json
{
  "order_id": 123,
  "note": "Customer requested expedited shipping. Contacted via email."
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Order Note Updated successfully."
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/notes/attach" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 123,
    "note": "Customer requested expedited shipping."
  }'
```

---

## Activity

### List Activities

Retrieve a paginated list of activity logs.

**Endpoint:** `GET /activity/`

**Permission Required**: `AdminPolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search term for filtering activities |
| `per_page` | int | No | Number of items per page (default: 10) |
| `page` | int | No | Page number (default: 1) |
| `log_type` | string | No | Filter by log type |
| `module_name` | string | No | Filter by module name |
| `module_id` | int | No | Filter by module ID |

#### Response

```json
{
  "success": true,
  "data": {
    "activities": {
      "data": [
        {
          "id": 1,
          "title": "Order Created",
          "description": "Order #1234 was created",
          "log_type": "info",
          "module_name": "order",
          "module_id": 1234,
          "read_status": "unread",
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
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/activity/?per_page=20&page=1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Delete Activity

Delete a specific activity log entry.

**Endpoint:** `DELETE /activity/{id}`

**Permission Required**: `AdminPolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Activity ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Activity Deleted Successfully"
  }
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/activity/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Mark Activity as Read/Unread

Update the read status of an activity log entry.

**Endpoint:** `PUT /activity/{id}/mark-read`

**Permission Required**: `AdminPolicy`

#### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Activity ID (route parameter) |

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | Status: `'read'` or `'unread'` |

```json
{
  "status": "read"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Activity Marked as Read"
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/activity/1/mark-read" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "read"
  }'
```

---

## Templates

### Get Print Templates

Retrieve all available print templates.

**Endpoint:** `GET /templates/print-templates`

**Permission Required**: `AdminPolicy`

#### Response

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "key": "invoice_template",
        "title": "Invoice Template",
        "content": "<html>...</html>"
      },
      {
        "key": "packing_slip",
        "title": "Packing Slip Template",
        "content": "<html>...</html>"
      },
      {
        "key": "delivery_slip",
        "title": "Delivery Slip Template",
        "content": "<html>...</html>"
      },
      {
        "key": "shipping_slip",
        "title": "Shipping Slip Template",
        "content": "<html>...</html>"
      },
      {
        "key": "dispatch_slip",
        "title": "Dispatch Slip Template",
        "content": "<html>...</html>"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/templates/print-templates" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Save Print Templates

Update print template content.

**Endpoint:** `PUT /templates/print-templates`

**Permission Required**: `AdminPolicy`

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templates` | array | Yes | Array of template objects |

Each template object should contain:
- `key` (string, required): Template key identifier
- `content` (string, required): HTML content of the template

```json
{
  "templates": [
    {
      "key": "invoice_template",
      "content": "<html><body><h1>Invoice</h1>...</body></html>"
    },
    {
      "key": "packing_slip",
      "content": "<html><body><h1>Packing Slip</h1>...</body></html>"
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Template saved successfully"
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/templates/print-templates" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "templates": [
      {
        "key": "invoice_template",
        "content": "<html><body><h1>Invoice</h1></body></html>"
      }
    ]
  }'
```

#### Available Template Keys

- `invoice_template` - Invoice template
- `packing_slip` - Packing slip template
- `delivery_slip` - Delivery slip template
- `shipping_slip` - Shipping slip template
- `dispatch_slip` - Dispatch slip template

---

