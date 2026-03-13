---
title: Customers API
description: FluentCart REST API endpoints for managing customers, addresses, and user associations.
---

# Customers API

Manage customer records including creating customers, managing addresses, associating WordPress users, and viewing customer order history.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2/customers`

**Policy:** `CustomerPolicy`

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## Customer CRUD

### List Customers

<badge type="tip">GET</badge> `/fluent-cart/v2/customers`

Retrieve a paginated list of customers with support for searching, sorting, and advanced filtering.

- **Permission:** `customers/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `search` | string | query | No | Search by customer name, email, or ID. Supports operator syntax (e.g., `id=5`, `ltv>1000`). |
| `per_page` | integer | query | No | Number of items per page (1-199, default: 10) |
| `page` | integer | query | No | Page number for pagination |
| `sort_by` | string | query | No | Column to sort by. Must be a fillable field on the Customer model (default: `id`) |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `filter_type` | string | query | No | Filter mode: `simple` or `advanced` (default: `simple`) |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded array of advanced filter groups (Pro only). Supports filtering by order items, purchase count, purchase dates, customer name, email, LTV, and labels. |
| `with` | array | query | No | Relationships to eager-load (e.g., `orders`, `labels`, `billing_address`, `shipping_address`) |
| `select` | string/array | query | No | Comma-separated column names or array of columns to select |
| `include_ids` | string/array | query | No | Comma-separated IDs or array of IDs that must be included in results |
| `active_view` | string | query | No | Active tab/view filter |
| `user_tz` | string | query | No | User timezone for date filter conversion |

#### Response

```json
{
    "customers": {
        "total": 150,
        "per_page": 10,
        "current_page": 1,
        "last_page": 15,
        "data": [
            {
                "id": 1,
                "user_id": 5,
                "contact_id": null,
                "email": "john@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "status": "active",
                "purchase_value": { ... },
                "purchase_count": 3,
                "ltv": 15000,
                "first_purchase_date": "2025-01-15 10:30:00",
                "last_purchase_date": "2025-06-20 14:00:00",
                "aov": 5000,
                "notes": "",
                "uuid": "a1b2c3d4...",
                "country": "US",
                "city": "New York",
                "state": "NY",
                "postcode": "10001",
                "created_at": "2025-01-10 08:00:00",
                "updated_at": "2025-06-20 14:00:00",
                "full_name": "John Doe",
                "photo": "https://gravatar.com/avatar/...",
                "country_name": "United States",
                "formatted_address": { ... },
                "user_link": "https://example.com/wp-admin/user-edit.php?user_id=5"
            }
        ]
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers?per_page=20&search=john&sort_by=created_at&sort_type=desc" \
  -u "username:app_password"
```

---

### Create Customer

<badge type="warning">POST</badge> `/fluent-cart/v2/customers`

Create a new customer record. Automatically links to an existing WordPress user if a matching email is found.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `email` | string | body | Yes | Customer email address. Must be unique and valid. Max 255 characters. |
| `first_name` | string | body | Conditional | Customer first name. Required when store is not configured for full name mode. Max 255 characters. |
| `last_name` | string | body | No | Customer last name. Max 255 characters. |
| `full_name` | string | body | Conditional | Customer full name. Required when store is configured for full name mode. Max 255 characters. Automatically split into `first_name` and `last_name`. |
| `city` | string | body | No | Customer city |
| `state` | string | body | No | Customer state/province code |
| `postcode` | string | body | No | Customer postal/zip code |
| `country` | string | body | No | Customer country code (e.g., `US`, `GB`) |
| `notes` | string | body | No | Internal notes about the customer |
| `status` | string | body | No | Customer status |
| `user_id` | integer | body | No | WordPress user ID to associate |
| `wp_user` | string | body | No | Set to `yes` to create a new WordPress user account for this customer |
| `aov` | string | body | No | Average order value |
| `user_url` | string | body | No | Customer website URL |

#### Response

**Success (200):**

```json
{
    "message": "Customer created successfully!",
    "data": {
        "id": 42,
        "user_id": null,
        "email": "jane@example.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "status": "active",
        "purchase_value": [],
        "uuid": "e5f6g7h8...",
        "country": "US",
        "city": "Boston",
        "state": "MA",
        "postcode": "02101",
        "created_at": "2025-06-20 14:00:00",
        "updated_at": "2025-06-20 14:00:00"
    }
}
```

**Error (email already exists):**

```json
{
    "code": 400,
    "message": "Customer already exists.",
    "data": ""
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "country": "US",
    "city": "Boston",
    "state": "MA",
    "postcode": "02101",
    "wp_user": "yes"
  }'
```

---

### Get Customer

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/{customerId}`

Retrieve a single customer by ID with optional eager-loaded relationships.

- **Permission:** `customers/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `with` | array | query | No | Relationships to eager-load (e.g., `orders`, `labels`, `billing_address`, `shipping_address`, `subscriptions`, `wpUser`) |
| `params[customer_only]` | string | query | No | Set to `yes` to return the customer without labels processing |

#### Response

```json
{
    "customer": {
        "id": 1,
        "user_id": 5,
        "contact_id": null,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "purchase_value": { ... },
        "purchase_count": 3,
        "ltv": 15000,
        "first_purchase_date": "2025-01-15 10:30:00",
        "last_purchase_date": "2025-06-20 14:00:00",
        "aov": 5000,
        "notes": "",
        "uuid": "a1b2c3d4...",
        "country": "US",
        "city": "New York",
        "state": "NY",
        "postcode": "10001",
        "created_at": "2025-01-10 08:00:00",
        "updated_at": "2025-06-20 14:00:00",
        "full_name": "John Doe",
        "photo": "https://gravatar.com/avatar/...",
        "country_name": "United States",
        "formatted_address": {
            "country": "United States",
            "state": "New York",
            "city": "New York",
            "postcode": "10001",
            "first_name": "John",
            "last_name": "Doe",
            "full_name": "John Doe"
        },
        "user_link": "https://example.com/wp-admin/user-edit.php?user_id=5",
        "selected_labels": [1, 3, 7],
        "labels": [ ... ]
    }
}
```

**Error (404):**

```json
{
    "message": "Customer not found",
    "back_text": "Back to Customer List",
    "back_url": "/customers"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/1?with[]=labels&with[]=billing_address" \
  -u "username:app_password"
```

---

### Update Customer

<badge type="info">PUT</badge> `/fluent-cart/v2/customers/{customerId}`

Update an existing customer. If the customer is linked to a WordPress user, the corresponding WP user profile is also updated.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `email` | string | body | Yes | Customer email address. Must be unique (excluding current customer). Max 255 characters. |
| `first_name` | string | body | Conditional | Customer first name. Required when store is not configured for full name mode. Max 255 characters. |
| `last_name` | string | body | No | Customer last name. Max 255 characters. |
| `full_name` | string | body | Conditional | Customer full name. Required when store is configured for full name mode. Max 255 characters. |
| `city` | string | body | No | Customer city |
| `state` | string | body | No | Customer state/province code |
| `postcode` | string | body | No | Customer postal/zip code |
| `country` | string | body | No | Customer country code |
| `notes` | string | body | No | Internal notes about the customer |
| `status` | string | body | No | Customer status |
| `user_id` | integer | body | No | WordPress user ID |
| `aov` | string | body | No | Average order value |
| `user_url` | string | body | No | Customer website URL |
| `username` | string | body | No | Username |
| `user_nicename` | string | body | No | User nicename |
| `display_name` | string | body | No | Display name |

#### Response

**Success (200):**

```json
{
    "message": "Customer updated successfully!",
    "data": {
        "id": 1,
        "user_id": 5,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "...": "..."
    }
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/customers/1" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "city": "San Francisco",
    "state": "CA",
    "country": "US"
  }'
```

---

### Update Additional Info (Labels)

<badge type="info">PUT</badge> `/fluent-cart/v2/customers/{customerId}/additional-info`

Update a customer's labels/tags. Manages the label relationships for a customer by syncing provided label IDs with existing ones.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `labels` | array | body | Yes | Array of label IDs to assign to the customer. Existing labels not in this array will be removed. |

#### Response

**Success (200):**

```json
{
    "message": "Customer updated successfully!",
    "data": { ... }
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/customers/1/additional-info" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "labels": [1, 3, 7]
  }'
```

---

### Bulk Actions

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/do-bulk-action`

Perform bulk operations on multiple customers such as deletion or status change.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `action` | string | body | Yes | The action to perform. Supported values: `delete_customers`, `change_customer_status` |
| `customer_ids` | array | body | Yes | Array of customer IDs to act upon |
| `new_status` | string | body | Conditional | Required when action is `change_customer_status`. The new status to apply to the selected customers. Must be a valid editable customer status. |

#### Response

**Success (delete_customers):**

```json
{
    "message": "Selected Customers has been deleted permanently",
    "data": ""
}
```

**Success (change_customer_status):**

```json
{
    "message": "Customer Status has been changed",
    "data": ""
}
```

**Error (missing selection):**

```json
{
    "code": 403,
    "message": "Customers selection is required",
    "data": ""
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/do-bulk-action" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "change_customer_status",
    "customer_ids": [1, 2, 3],
    "new_status": "archived"
  }'
```

---

## Customer Stats & Orders

### Get Customer Stats

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/get-stats/{customer}`

Retrieve widget/stats data for a specific customer. Results are extensible via the `fluent_cart/widgets/single_customer` filter.

- **Permission:** `customers/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customer` | integer | path | Yes | The customer ID |

#### Response

```json
{
    "widgets": []
}
```

> The `widgets` array is populated by modules and extensions that hook into the `fluent_cart/widgets/single_customer` filter.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/get-stats/1" \
  -u "username:app_password"
```

---

### Get Customer Orders

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/{customerId}/orders`

Retrieve a paginated list of orders belonging to a specific customer. Supports the same filtering and sorting parameters as the main Orders list.

- **Permission:** `customers/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `search` | string | query | No | Search orders by invoice number, customer name/email, or order item title |
| `per_page` | integer | query | No | Number of items per page (1-199, default: 10) |
| `page` | integer | query | No | Page number for pagination |
| `sort_by` | string | query | No | Column to sort by (default: `id`) |
| `sort_type` | string | query | No | Sort direction: `asc` or `desc` (default: `desc`) |
| `filter_type` | string | query | No | Filter mode: `simple` or `advanced` (default: `simple`) |
| `advanced_filters` | string (JSON) | query | No | JSON-encoded array of advanced filter groups |
| `active_view` | string | query | No | Active tab filter (e.g., `on-hold`, `paid`, `completed`, `processing`) |

#### Response

```json
{
    "orders": {
        "total": 5,
        "per_page": 10,
        "current_page": 1,
        "last_page": 1,
        "data": [
            {
                "id": 101,
                "invoice_no": "FCT-0101",
                "customer_id": 1,
                "status": "completed",
                "payment_status": "paid",
                "total_amount": 5000,
                "...": "..."
            }
        ]
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/1/orders?per_page=10&sort_by=created_at&sort_type=desc" \
  -u "username:app_password"
```

---

### Find Customer Order

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/{customerId}/order`

Retrieve all orders for a customer with their filtered order items (line items) eager-loaded.

- **Permission:** `customers/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |

#### Response

```json
{
    "data": {
        "data": [
            {
                "id": 101,
                "customer_id": 1,
                "invoice_no": "FCT-0101",
                "total_amount": 5000,
                "filtered_order_items": [
                    {
                        "id": 1,
                        "order_id": 101,
                        "title": "Product Name",
                        "quantity": 2,
                        "unit_price": 2500,
                        "...": "..."
                    }
                ],
                "...": "..."
            }
        ]
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/1/order" \
  -u "username:app_password"
```

---

### Recalculate Lifetime Value

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/{customerId}/recalculate-ltv`

Recalculate a customer's lifetime value (LTV) by summing net payments from all successful orders. Also updates `purchase_count`, `first_purchase_date`, `last_purchase_date`, and `aov` (average order value).

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |

#### Response

**Success (200):**

```json
{
    "message": "Lifetime value recalculated successfully",
    "customer": {
        "id": 1,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "purchase_count": 5,
        "ltv": 25000,
        "aov": 5000,
        "first_purchase_date": "2025-01-15 10:30:00",
        "last_purchase_date": "2025-06-20 14:00:00",
        "...": "..."
    }
}
```

**Error (404):**

```json
{
    "message": "Customer not found."
}
```

> The LTV calculation sums `total_paid - total_refund` for each order with a successful payment status. Only net-positive amounts are counted.

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/1/recalculate-ltv" \
  -u "username:app_password"
```

---

## Address Management

### Get Customer Addresses

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/{customerId}/address`

Retrieve addresses for a customer, optionally filtered by address type. Results are sorted with the primary address first.

- **Permission:** `customers/view`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `type` | string | query | No | Address type filter: `billing` or `shipping` (default: `billing`) |

#### Response

```json
{
    "addresses": [
        {
            "id": 1,
            "customer_id": 1,
            "is_primary": 1,
            "type": "billing",
            "status": "active",
            "label": "Home",
            "name": "John Doe",
            "address_1": "123 Main Street",
            "address_2": "Apt 4B",
            "city": "New York",
            "state": "NY",
            "postcode": "10001",
            "country": "US",
            "phone": "+1-555-0100",
            "email": "john@example.com",
            "meta": { ... },
            "created_at": "2025-01-10 08:00:00",
            "updated_at": "2025-06-20 14:00:00",
            "formatted_address": {
                "country": "United States",
                "state": "New York",
                "city": "New York",
                "postcode": "10001",
                "address_1": "123 Main Street",
                "address_2": "Apt 4B",
                "type": "billing",
                "name": "John Doe",
                "company_name": "Acme Inc",
                "label": "Home",
                "phone": "+1-555-0100",
                "full_address": "Acme Inc, 123 Main Street, Apt 4B, New York, New York, United States"
            },
            "company_name": "Acme Inc"
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/1/address?type=billing" \
  -u "username:app_password"
```

---

### Create Address

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/{customerId}/address`

Create a new address for a customer. If no primary address exists for the given type, this address is automatically set as primary. Optionally syncs with an associated order address.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `name` | string | body | Yes | Full name for the address. Max 255 characters. |
| `email` | string | body | Yes | Email for the address. Max 255 characters. |
| `address_1` | string | body | Yes | Primary street address |
| `address_2` | string | body | No | Secondary address line (apartment, suite, etc.) |
| `city` | string | body | Yes | City. Max 255 characters. |
| `state` | string | body | Conditional | State/province code. May be required depending on store localization settings. |
| `postcode` | string | body | Conditional | Postal/zip code. May be required depending on store localization settings. |
| `country` | string | body | Yes | Country code (e.g., `US`, `GB`) |
| `phone` | string | body | No | Phone number |
| `type` | string | body | Yes | Address type: `billing` or `shipping` |
| `label` | string | body | No | Custom label for the address (e.g., `Home`, `Office`). Max 15 characters. |
| `status` | string | body | No | Address status (default: `active`) |
| `is_primary` | integer | body | No | Set to `1` to make this the primary address (default: `0`) |
| `company_name` | string | body | No | Company name. Max 255 characters. |
| `order_id` | integer | body | No | Order ID to sync this address with. When provided with a primary address, the corresponding order address is also created/updated. |

#### Response

**Success (200):**

```json
{
    "message": "Billing address created successfully!",
    "data": {
        "id": 5,
        "customer_id": 1,
        "is_primary": 0,
        "type": "billing",
        "status": "active",
        "label": "Office",
        "name": "John Doe",
        "address_1": "456 Business Ave",
        "address_2": "",
        "city": "New York",
        "state": "NY",
        "postcode": "10002",
        "country": "US",
        "phone": "+1-555-0200",
        "email": "john@example.com",
        "...": "..."
    }
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/1/address" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "address_1": "456 Business Ave",
    "city": "New York",
    "state": "NY",
    "postcode": "10002",
    "country": "US",
    "phone": "+1-555-0200",
    "type": "billing",
    "label": "Office",
    "company_name": "Acme Inc"
  }'
```

---

### Update Address

<badge type="info">PUT</badge> `/fluent-cart/v2/customers/{customerId}/address`

Update an existing customer address by its address record ID. Optionally syncs changes to an associated order address.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `id` | integer | body | Yes | The address record ID to update |
| `name` | string | body | Yes | Full name for the address. Max 255 characters. |
| `email` | string | body | Yes | Email for the address. Max 255 characters. |
| `address_1` | string | body | Yes | Primary street address |
| `address_2` | string | body | No | Secondary address line |
| `city` | string | body | Yes | City. Max 255 characters. |
| `state` | string | body | Conditional | State/province code. May be required depending on store localization settings. |
| `postcode` | string | body | Conditional | Postal/zip code. May be required depending on store localization settings. |
| `country` | string | body | Yes | Country code |
| `phone` | string | body | No | Phone number |
| `type` | string | body | Yes | Address type: `billing` or `shipping` |
| `label` | string | body | No | Custom label. Max 15 characters. |
| `status` | string | body | No | Address status |
| `is_primary` | integer | body | No | Set to `1` for primary address |
| `company_name` | string | body | No | Company name. Max 255 characters. |
| `order_id` | integer | body | No | Order ID to sync address changes with |

#### Response

**Success (200):**

```json
{
    "message": "Billing address updated successfully!",
    "data": {
        "id": 5,
        "customer_id": 1,
        "is_primary": 0,
        "type": "billing",
        "name": "John Doe",
        "address_1": "789 Updated Street",
        "...": "..."
    }
}
```

**Error (404):**

```json
{
    "code": 404,
    "message": "Address not found, please reload the page and try again!",
    "data": ""
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/customers/1/address" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "address_1": "789 Updated Street",
    "city": "New York",
    "state": "NY",
    "postcode": "10003",
    "country": "US",
    "type": "billing"
  }'
```

---

### Delete Address

<badge type="danger">DELETE</badge> `/fluent-cart/v2/customers/{customerId}/address`

Delete a customer address. Primary addresses and the last remaining address cannot be deleted.

- **Permission:** `customers/delete`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `address[id]` | integer | body/query | Yes | The address record ID to delete |

#### Response

**Success (200):**

```json
{
    "message": "Address successfully deleted.",
    "data": ""
}
```

**Error (primary address):**

```json
{
    "code": 403,
    "message": "Primary address cannot be deleted!",
    "data": ""
}
```

**Error (last address):**

```json
{
    "code": 403,
    "message": "At least one address must remain. Address deletion failed!",
    "data": ""
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/customers/1/address" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "id": 5
    }
  }'
```

---

### Set Primary Address

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/{customerId}/address/make-primary`

Set a specific address as the primary address for its type. The previous primary address of the same type is automatically demoted.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `addressId` | integer | body | Yes | The address record ID to make primary |
| `type` | string | body | Yes | Address type: `billing` or `shipping` |

#### Response

**Success (200):**

```json
{
    "message": "Address successfully set as the primary",
    "data": ""
}
```

**Error (400):**

```json
{
    "code": 400,
    "message": "Address set as primary failed.",
    "data": ""
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/1/address/make-primary" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": 5,
    "type": "billing"
  }'
```

---

## User Association

### Get Attachable Users

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/attachable-user`

Retrieve a list of WordPress users that are not yet associated with any FluentCart customer. Useful for linking existing WP users to customer records.

- **Permission:** `customers/manage`

#### Parameters

No parameters required.

#### Response

```json
{
    "users": [
        {
            "ID": 10,
            "display_name": "Alice Johnson",
            "user_email": "alice@example.com"
        },
        {
            "ID": 15,
            "display_name": "Bob Wilson",
            "user_email": "bob@example.com"
        }
    ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/attachable-user" \
  -u "username:app_password"
```

---

### Attach WordPress User

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/{customerId}/attachable-user`

Link a WordPress user to an existing customer record. The customer must not already have a linked user, and the target user must not already be linked to another customer.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |
| `user_id` | integer | body | Yes | The WordPress user ID to attach. Max 50 characters. Must reference an existing user who is not already linked to a customer. |

#### Response

**Success (200):**

```json
{
    "message": "User attached successfully"
}
```

**Error (customer already has user):**

```json
{
    "message": "Can not attach user"
}
```

**Error (user already linked):**

```json
{
    "code": "rest_request_validation",
    "message": "User already linked to a customer."
}
```

**Error (user not found):**

```json
{
    "code": "rest_request_validation",
    "message": "User not found."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/1/attachable-user" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 10
  }'
```

---

### Detach WordPress User

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/{customerId}/detach-user`

Remove the WordPress user association from a customer record. The customer record itself is preserved; only the `user_id` link is cleared.

- **Permission:** `customers/manage`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID |

#### Response

**Success (200):**

```json
{
    "message": "User detached successfully"
}
```

**Error (customer not found):**

```json
{
    "message": "Customer not found."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/1/detach-user" \
  -u "username:app_password"
```
