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

**Permission Required**: `customers/view`

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
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/customers?page=1&per_page=20&search=john" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Customer

**POST** `/customers`

Create a new customer. The system will automatically split the `full_name` into `first_name` and `last_name`.

**Permission Required**: `customers/manage`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Customer email address (must be unique) |
| `full_name` | string | Yes | Customer's full name (max 255 characters) |
| `city` | string | No | Customer's city |
| `status` | string | No | Customer status |
| `notes` | string | No | Customer notes |
| `country` | string | No | Customer's country |
| `state` | string | No | Customer's state |
| `postcode` | string | No | Customer's postal code |
| `user_id` | integer | No | WordPress user ID to attach |
| `wp_user` | string | No | Set to "yes" to create WordPress user if email matches existing user |

#### Request Body Example

```json
{
  "email": "newcustomer@example.com",
  "full_name": "Jane Smith",
  "city": "New York",
  "status": "active",
  "notes": "VIP customer",
  "country": "US",
  "state": "NY",
  "postcode": "10001",
  "wp_user": "yes"
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
      "full_name": "Jane Smith",
      "city": "New York",
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    }
  },
  "message": "Customer created successfully!"
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/customers" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newcustomer@example.com",
    "full_name": "Jane Smith",
    "city": "New York"
  }'
```

### Get Customer Details

**GET** `/customers/{customerId}`

Retrieve detailed information about a specific customer.

**Permission Required**: `customers/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |
| `with` | array | Optional. Related data to include (e.g., `["orders", "addresses"]`) |
| `params.customer_only` | string | Optional. Set to "yes" to return only customer data without labels |

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
      "full_name": "John Doe",
      "status": "active",
      "total_spent": 5000,
      "order_count": 3,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "selected_labels": [1, 2, 3],
      "labels": [
        {
          "id": 1,
          "label_id": 1,
          "name": "VIP"
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/customers/1?with[]=orders&with[]=addresses" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Customer

**PUT** `/customers/{customerId}`

Update an existing customer's information.

**Permission Required**: `customers/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Customer email address (must be unique if changed) |
| `full_name` | string | Yes | Customer's full name (max 255 characters) |
| `city` | string | No | Customer's city |
| `status` | string | No | Customer status |
| `notes` | string | No | Customer notes |
| `country` | string | No | Customer's country |
| `state` | string | No | Customer's state |
| `postcode` | string | No | Customer's postal code |
| `user_id` | integer | No | WordPress user ID to attach |

#### Request Body Example

```json
{
  "email": "customer@example.com",
  "full_name": "John Doe Updated",
  "status": "active",
  "notes": "Updated notes",
  "city": "New York"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "email": "customer@example.com",
      "first_name": "John",
      "last_name": "Doe Updated",
      "full_name": "John Doe Updated",
      "status": "active",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  },
  "message": "Customer updated successfully!"
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/customers/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "full_name": "John Doe Updated",
    "status": "active"
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
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/additional-info" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Updated Corp",
    "notes": "Updated VIP customer"
  }'
```

### Get Customer Stats

**GET** `/customers/get-stats/{customer}`

Get statistics widgets for a specific customer. Returns filtered widgets that can be customized via the `fluent_cart/widgets/single_customer` filter.

**Permission Required**: `customers/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customer` | integer | Customer ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "title": "Total Spent",
        "value": 5000,
        "currency": "USD"
      },
      {
        "title": "Order Count",
        "value": 3
      },
      {
        "title": "Average Order Value",
        "value": 1667,
        "currency": "USD"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/customers/get-stats/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Customer Orders (Simple)

**GET** `/customers/{customerId}/order`

Get customer orders in a simplified format.

**Permission Required**: `customers/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Response

```json
{
  "data": {
    "data": [
      {
        "id": 1,
        "status": "completed",
        "payment_status": "paid",
        "total_amount": 2500,
        "currency": "USD",
        "created_at": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/order" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Customer Orders (Paginated)

**GET** `/customers/{customerId}/orders`

Get paginated orders for a specific customer with filtering support.

**Permission Required**: `customers/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (default: 10) |
| `search` | string | Search query |
| `filters` | object | Filter options |
| `order_by` | string | Sort field (default: id) |
| `order_type` | string | Sort direction: ASC or DESC (default: DESC) |

#### Response

```json
{
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
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 2,
    "total_pages": 1
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/orders?page=1&per_page=20" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Customer Addresses

**GET** `/customers/{customerId}/address`

Get all addresses for a specific customer. Optionally filter by address type.

**Permission Required**: `customers/view`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |
| `type` | string | Optional. Filter by address type: "billing" or "shipping" |

#### Response

```json
{
  "addresses": [
    {
      "id": 1,
      "type": "billing",
      "name": "John Doe",
      "email": "customer@example.com",
      "address_1": "123 Main St",
      "address_2": "",
      "city": "New York",
      "state": "NY",
      "postcode": "10001",
      "country": "US",
      "phone": "+1234567890",
      "is_primary": true,
      "label": "Home"
    },
    {
      "id": 2,
      "type": "shipping",
      "name": "John Doe",
      "email": "customer@example.com",
      "address_1": "456 Oak Ave",
      "address_2": "",
      "city": "Brooklyn",
      "state": "NY",
      "postcode": "11201",
      "country": "US",
      "phone": "+1234567890",
      "is_primary": false,
      "label": "Work"
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/address?type=billing" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Customer Address

**PUT** `/customers/{customerId}/address`

Update customer's address information.

**Permission Required**: `customers/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Yes | Address ID to update |
| `name` | string | Yes | Full name (max 255 characters) |
| `email` | string | Yes | Email address |
| `address_1` | string | Yes | Street address line 1 |
| `address_2` | string | No | Street address line 2 |
| `city` | string | Yes | City (max 255 characters) |
| `state` | string | No | State/province |
| `postcode` | string | No | Postal code |
| `country` | string | Yes | Country code |
| `phone` | string | No | Phone number |
| `type` | string | No | Address type: "billing" or "shipping" |
| `label` | string | No | Address label (max 15 characters) |
| `is_primary` | integer | No | Set to 1 for primary address |
| `order_id` | integer | No | Associated order ID |

#### Request Body Example

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "customer@example.com",
  "address_1": "123 Updated St",
  "address_2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postcode": "10001",
  "country": "US",
  "phone": "+1234567890",
  "type": "billing",
  "label": "Home",
  "is_primary": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": {
      "id": 1,
      "name": "John Doe",
      "email": "customer@example.com",
      "address_1": "123 Updated St",
      "city": "New York",
      "state": "NY",
      "postcode": "10001",
      "country": "US",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  },
  "message": "Address updated successfully!"
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/address" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "John Doe",
    "email": "customer@example.com",
    "address_1": "123 Updated St",
    "city": "New York",
    "country": "US"
  }'
```

### Create Customer Address

**POST** `/customers/{customerId}/address`

Create a new address for a customer.

**Permission Required**: `customers/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (max 255 characters) |
| `email` | string | Yes | Email address |
| `address_1` | string | Yes | Street address line 1 |
| `address_2` | string | No | Street address line 2 |
| `city` | string | Yes | City (max 255 characters) |
| `state` | string | No | State/province (required for some countries) |
| `postcode` | string | No | Postal code (required for some countries) |
| `country` | string | Yes | Country code |
| `phone` | string | No | Phone number |
| `type` | string | No | Address type: "billing" or "shipping" |
| `label` | string | No | Address label (max 15 characters) |
| `is_primary` | integer | No | Set to 1 for primary address (default: 0) |
| `order_id` | integer | No | Associated order ID |

#### Request Body Example

```json
{
  "type": "shipping",
  "name": "John Doe",
  "email": "customer@example.com",
  "address_1": "789 New St",
  "address_2": "",
  "city": "Queens",
  "state": "NY",
  "postcode": "11301",
  "country": "US",
  "phone": "+1234567890",
  "label": "Work",
  "is_primary": 0
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
      "name": "John Doe",
      "email": "customer@example.com",
      "address_1": "789 New St",
      "city": "Queens",
      "state": "NY",
      "postcode": "11301",
      "country": "US",
      "created_at": "2024-01-01T11:00:00Z"
    }
  },
  "message": "Address created successfully!"
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/address" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "shipping",
    "name": "John Doe",
    "email": "customer@example.com",
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

**Permission Required**: `customers/delete`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Request Body

```json
{
  "address": {
    "id": 2
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Address deleted successfully"
  }
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/address" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "id": 2
    }
  }'
```

### Set Primary Address

**POST** `/customers/{customerId}/address/make-primary`

Set an address as the primary address for a customer.

**Permission Required**: `customers/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `addressId` | integer | Yes | Address ID to set as primary |
| `type` | string | Yes | Address type: "billing" or "shipping" |

#### Request Body Example

```json
{
  "addressId": 2,
  "type": "billing"
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
      "type": "billing",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  },
  "message": "Primary address updated successfully!"
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/address/make-primary" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": 2,
    "type": "billing"
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
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/customers/attachable-user" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Attach User to Customer

**POST** `/customers/{customerId}/attachable-user`

Attach a WordPress user to a customer. The customer must not already have a user attached.

**Permission Required**: `customers/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | integer | Yes | WordPress user ID to attach |

#### Request Body Example

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
    "message": "User attached successfully"
  }
}
```

#### Error Response (if customer already has user)

```json
{
  "success": false,
  "data": {
    "message": "Can not attach user"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/attachable-user" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1
  }'
```

### Detach User from Customer

**POST** `/customers/{customerId}/detach-user`

Detach a WordPress user from a customer.

**Permission Required**: `customers/manage`

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `customerId` | integer | Customer ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "User detached successfully"
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/customers/1/detach-user" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Bulk Actions

**POST** `/customers/do-bulk-action`

Perform bulk actions on multiple customers.

**Permission Required**: `customers/manage`

#### Request Body

The request body structure depends on the action type. Common structure:

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

The available actions are determined by the `CustomerResource::manageCustomer()` method. Common actions include:

- `update_status` - Update status of multiple customers
- `delete` - Delete multiple customers
- Other actions as implemented in the resource

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
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/customers/do-bulk-action" \
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

---

## Address Info

### Get Countries Options

Retrieve a list of all available countries as options.

**Endpoint:** `GET /address-info/countries`

**Permission Required**: `CustomerPolicy`

#### Response

```json
{
  "success": true,
  "data": [
    {
      "value": "US",
      "label": "United States"
    },
    {
      "value": "CA",
      "label": "Canada"
    },
    {
      "value": "GB",
      "label": "United Kingdom"
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/address-info/countries" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Country Info

Retrieve detailed information about a specific country including states/provinces and address locale.

**Endpoint:** `GET /address-info/get-country-info`

**Permission Required**: `CustomerPolicy`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country_code` | string | Yes* | ISO country code (required if timezone not provided) |
| `timezone` | string | Yes* | Timezone (required if country_code not provided, used to guess country) |

#### Response

```json
{
  "success": true,
  "data": {
    "country_code": "US",
    "country_name": "United States",
    "states": [
      {
        "value": "AL",
        "label": "Alabama"
      },
      {
        "value": "AK",
        "label": "Alaska"
      },
      {
        "value": "CA",
        "label": "California"
      }
    ],
    "address_locale": {
      "format": "{{first_name}} {{last_name}}\n{{address_line_1}}\n{{city}}, {{state}} {{postal_code}}\n{{country}}"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/address-info/get-country-info?country_code=US" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

---

## Labels

### List Labels

Retrieve all available labels.

**Endpoint:** `GET /labels/`

**Permission Required**: `labels/view`

##### Response

```json
{
  "labels": [
    {
      "id": 1,
      "value": "VIP Customer",
      "color": "#FF5733",
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    },
    {
      "id": 2,
      "value": "High Priority",
      "color": "#33FF57",
      "created_at": "2024-01-01 10:00:00",
      "updated_at": "2024-01-01 10:00:00"
    }
  ]
}
```

##### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/labels/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

#### Create Label

Create a new label.

**Endpoint:** `POST /labels/`

**Permission Required**: `labels/manage`

##### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `value` | string | Yes | Label text/value |
| `color` | string | No | Label color (hex code) |

```json
{
  "value": "New Customer",
  "color": "#3366FF"
}
```

##### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "value": "New Customer",
    "color": "#3366FF",
    "created_at": "2024-01-15 11:30:00",
    "updated_at": "2024-01-15 11:30:00"
  }
}
```

##### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/labels/" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "New Customer",
    "color": "#3366FF"
  }'
```

#### Update Label Selections

Update which labels are assigned to a specific entity (order, customer, etc.).

**Endpoint:** `POST /labels/update-selections`

**Permission Required**: `labels/manage`

##### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bind_to_type` | string | Yes | Model type (e.g., `'Order'`, `'Customer'`) |
| `bind_to_id` | int | Yes | Entity ID to attach labels to |
| `selectedLabels` | array | Yes | Array of label IDs to assign |

```json
{
  "bind_to_type": "Order",
  "bind_to_id": 123,
  "selectedLabels": [1, 2, 3]
}
```

##### Response

```json
{
  "success": true,
  "data": {
    "message": "Labels Updated Successfully"
  }
}
```

##### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/labels/update-selections" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "bind_to_type": "Order",
    "bind_to_id": 123,
    "selectedLabels": [1, 2]
  }'
```

---

