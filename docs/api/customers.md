---
title: Customers API
description: FluentCart Customers API documentation with complete endpoint reference and usage examples.
---

# Customers API

The Customers API provides comprehensive endpoints for managing customers in FluentCart. This includes creating, reading, updating, and deleting customers, as well as managing customer addresses, orders, and user attachments.

## Base URL

```
https://yoursite.com/wp-json/fluent-cart/v2/customers
```

## Authentication

All endpoints require authentication and appropriate permissions:

- **Authentication**: WordPress Application Password or Cookie
- **Policy**: `CustomerPolicy`
- **Permissions**: Various customer-related permissions

## Endpoints

### List Customers

**GET** `/customers`

Retrieve a paginated list of customers with optional filtering and searching.

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
  "date_from": "2024-01-01",
  "date_to": "2024-12-31",
  "total_spent_min": 1000,
  "total_spent_max": 5000
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 1,
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "total_spent": 5000,
        "order_count": 3,
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-15T14:30:00Z"
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
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customers?page=1&per_page=20&search=john" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Customer

**POST** `/customers`

Create a new customer.

#### Request Body

```json
{
  "email": "newcustomer@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "status": "active",
  "additional_info": {
    "company": "Example Corp",
    "notes": "VIP customer"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "email": "newcustomer@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "phone": "+1234567890",
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customers" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newcustomer@example.com",
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

### Get Customer Details

**GET** `/customers/{customerId}`

Retrieve detailed information about a specific customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Response

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "email": "customer@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "status": "active",
      "total_spent": 5000,
      "order_count": 3,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "addresses": [
        {
          "id": 1,
          "type": "billing",
          "first_name": "John",
          "last_name": "Doe",
          "address_1": "123 Main St",
          "city": "New York",
          "state": "NY",
          "postcode": "10001",
          "country": "US",
          "is_primary": true
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customers/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Customer

**PUT** `/customers/{customerId}`

Update an existing customer's information.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Request Body

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "status": "active"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "status": "active",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/customers/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  }'
```

### Update Customer Additional Info

**PUT** `/customers/{customerId}/additional-info`

Update customer's additional information.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Request Body

```json
{
  "company": "Updated Corp",
  "notes": "Updated VIP customer",
  "custom_field_1": "Custom value"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "additional_info": {
        "company": "Updated Corp",
        "notes": "Updated VIP customer",
        "custom_field_1": "Custom value"
      },
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/additional-info" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Updated Corp",
    "notes": "Updated VIP customer"
  }'
```

### Get Customer Stats

**GET** `/customers/get-stats/{customer}`

Get statistics for a specific customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customer` | integer | Customer ID |

#### Response

```json
{
  "success": true,
  "data": {
    "stats": {
      "total_spent": 5000,
      "order_count": 3,
      "average_order_value": 1667,
      "last_order_date": "2024-01-15T14:30:00Z",
      "first_order_date": "2024-01-01T10:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customers/get-stats/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Customer Orders

**GET** `/customers/{customerId}/orders`

Get all orders for a specific customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Response

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "status": "completed",
        "payment_status": "paid",
        "total_amount": 2500,
        "currency": "USD",
        "created_at": "2024-01-01T10:00:00Z"
      },
      {
        "id": 2,
        "status": "processing",
        "payment_status": "paid",
        "total_amount": 2500,
        "currency": "USD",
        "created_at": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/orders" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Customer Addresses

**GET** `/customers/{customerId}/address`

Get all addresses for a specific customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Response

```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": 1,
        "type": "billing",
        "first_name": "John",
        "last_name": "Doe",
        "address_1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postcode": "10001",
        "country": "US",
        "is_primary": true
      },
      {
        "id": 2,
        "type": "shipping",
        "first_name": "John",
        "last_name": "Doe",
        "address_1": "456 Oak Ave",
        "city": "Brooklyn",
        "state": "NY",
        "postcode": "11201",
        "country": "US",
        "is_primary": false
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/address" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Customer Address

**PUT** `/customers/{customerId}/address`

Update customer's address information.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Request Body

```json
{
  "address_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "address_1": "123 Updated St",
  "city": "New York",
  "state": "NY",
  "postcode": "10001",
  "country": "US"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "address_1": "123 Updated St",
      "city": "New York",
      "state": "NY",
      "postcode": "10001",
      "country": "US",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/address" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": 1,
    "address_1": "123 Updated St",
    "city": "New York"
  }'
```

### Create Customer Address

**POST** `/customers/{customerId}/address`

Create a new address for a customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Request Body

```json
{
  "type": "shipping",
  "first_name": "John",
  "last_name": "Doe",
  "address_1": "789 New St",
  "city": "Queens",
  "state": "NY",
  "postcode": "11301",
  "country": "US"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": {
      "id": 3,
      "type": "shipping",
      "first_name": "John",
      "last_name": "Doe",
      "address_1": "789 New St",
      "city": "Queens",
      "state": "NY",
      "postcode": "11301",
      "country": "US",
      "created_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/address" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "shipping",
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "789 New St",
    "city": "Queens",
    "state": "NY",
    "postcode": "11301",
    "country": "US"
  }'
```

### Delete Customer Address

**DELETE** `/customers/{customerId}/address`

Delete a customer's address.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Request Body

```json
{
  "address_id": 2
}
```

#### Response

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/address" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": 2
  }'
```

### Set Primary Address

**POST** `/customers/{customerId}/address/make-primary`

Set an address as the primary address for a customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Request Body

```json
{
  "address_id": 2
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": {
      "id": 2,
      "is_primary": true,
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/address/make-primary" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": 2
  }'
```

### Get Attachable Users

**GET** `/customers/attachable-user`

Get WordPress users that can be attached to customers.

#### Response

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "display_name": "John Doe",
        "user_email": "john@example.com",
        "user_login": "johndoe"
      },
      {
        "id": 2,
        "display_name": "Jane Smith",
        "user_email": "jane@example.com",
        "user_login": "janesmith"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/customers/attachable-user" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Attach User to Customer

**POST** `/customers/{customerId}/attachable-user`

Attach a WordPress user to a customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Request Body

```json
{
  "user_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "user_id": 1,
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/attachable-user" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1
  }'
```

### Detach User from Customer

**POST** `/customers/{customerId}/detach-user`

Detach a WordPress user from a customer.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID |

#### Response

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "user_id": null,
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customers/1/detach-user" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Bulk Actions

**POST** `/customers/do-bulk-action`

Perform bulk actions on multiple customers.

#### Request Body

```json
{
  "action": "update_status",
  "customer_ids": [1, 2, 3],
  "data": {
    "status": "inactive"
  }
}
```

#### Available Actions

- `update_status` - Update status of multiple customers
- `delete` - Delete multiple customers
- `export` - Export multiple customers

#### Response

```json
{
  "success": true,
  "data": {
    "processed": 3,
    "failed": 0,
    "results": [
      {
        "customer_id": 1,
        "success": true
      },
      {
        "customer_id": 2,
        "success": true
      },
      {
        "customer_id": 3,
        "success": true
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/customers/do-bulk-action" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_status",
    "customer_ids": [1, 2, 3],
    "data": {
      "status": "inactive"
    }
  }'
```

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| `customer_not_found` | Customer with specified ID not found |
| `invalid_email` | Email address is invalid or already exists |
| `invalid_user` | WordPress user ID is invalid |
| `insufficient_permissions` | User lacks required permissions |
| `validation_error` | Request data validation failed |
| `address_not_found` | Address with specified ID not found |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "customer_not_found",
    "message": "Customer with ID 999 not found"
  }
}
```

## Rate Limiting

- **List operations**: 100 requests per hour
- **Create operations**: 50 requests per hour
- **Update operations**: 200 requests per hour
- **Delete operations**: 20 requests per hour

## Related Documentation

- [Orders API](./orders) - Order management endpoints
- [Products API](./products) - Product management endpoints
- [Database Models](/database/models) - Customer data models
- [Developer Hooks](/hooks/) - Customer-related hooks

## Next Steps

Continue with customer management:

1. **[Orders API](./orders)** - Manage customer orders
2. **[Products API](./products)** - Manage product catalog
3. **[Database Models](/database/models)** - Understand customer data structure
4. **[Developer Hooks](/hooks/)** - Customer-related hooks

## Previous/Next Navigation

- **Previous**: [Orders API](./orders) - Order management endpoints
- **Next**: [Products API](./products) - Product management endpoints

---

