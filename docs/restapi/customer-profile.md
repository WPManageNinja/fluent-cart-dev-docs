---
title: Customer Profile API
description: FluentCart REST API endpoints for the customer-facing portal including profile management, orders, addresses, and downloads.
---

# Customer Profile API

Customer-facing endpoints for managing profiles, viewing orders, handling addresses, and accessing downloads. These endpoints are used by the storefront customer portal.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

**Policy:** `CustomerFrontendPolicy` (requires authenticated customer)

> These are frontend endpoints accessed by logged-in customers, not admin users. The policy checks `is_user_logged_in()` and each endpoint verifies that the authenticated user matches the requested customer record.

> All monetary values are in **cents** (e.g., `$10.00` = `1000`).

---

## Customer Management

Endpoints under the `customers` prefix for retrieving and updating the current customer's details.

### Get Customer Details

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/{customerId}`

Retrieve the details of the currently authenticated customer. The `customerId` must match the logged-in customer's record.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID. Must belong to the authenticated user. |
| `with` | array | query | No | Relationships to eager-load (e.g., `billing_address`, `shipping_address`, `orders`) |

#### Response

**Success (200):**

```json
{
    "customer": {
        "id": 1,
        "user_id": 5,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "purchase_value": {},
        "purchase_count": 3,
        "ltv": 15000,
        "country": "US",
        "city": "New York",
        "state": "NY",
        "postcode": "10001",
        "created_at": "2025-01-10 08:00:00",
        "updated_at": "2025-06-20 14:00:00"
    }
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to view this customer"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/1?with[]=billing_address" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Update Customer Details

<badge type="warning">PUT</badge> `/fluent-cart/v2/customers/{customerId}`

Update the authenticated customer's profile details. The `customerId` must match the logged-in customer's record.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID. Must belong to the authenticated user. |
| `email` | string | body | Yes | Customer email address. Must be unique and valid. Max 255 characters. |
| `first_name` | string | body | Conditional | Customer first name. Required when store uses separate name fields. Max 255 characters. |
| `last_name` | string | body | No | Customer last name. Max 255 characters. |
| `full_name` | string | body | Conditional | Customer full name. Required when store uses full name mode. Max 255 characters. |
| `city` | string | body | No | Customer city |
| `state` | string | body | No | Customer state/province code |
| `postcode` | string | body | No | Customer postal/zip code |
| `country` | string | body | No | Customer country code (e.g., `US`, `GB`) |
| `notes` | string | body | No | Internal notes about the customer |
| `status` | string | body | No | Customer status |

#### Response

**Success (200):**

```json
{
    "message": "Customer updated successfully!",
    "data": {
        "id": 1,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to update this customer"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/customers/1" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Smith", "email": "john@example.com"}' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Get Customer Orders (Customer Prefix)

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/{customerId}/orders`

Retrieve a paginated list of orders for the specified customer. The `customerId` must match the logged-in user.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID. Must belong to the authenticated user. |
| `per_page` | integer | query | No | Number of items per page (default: 15) |

#### Response

**Success (200):**

```json
{
    "orders": {
        "total": 25,
        "per_page": 15,
        "current_page": 1,
        "last_page": 2,
        "data": [
            {
                "id": 101,
                "invoice_no": "INV-000101",
                "total_amount": 4999,
                "uuid": "abc-123-def",
                "type": "one-time",
                "status": "completed",
                "created_at": "2025-06-15 10:30:00"
            }
        ]
    }
}
```

**Error (returns empty when unauthorized):**

```json
{
    "orders": []
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/1/orders?per_page=10" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

## Address Management (Customer Prefix)

Endpoints under the `customers` prefix for managing customer addresses during checkout and in the customer account.

### Select Address for Checkout

<badge type="tip">GET</badge> `/fluent-cart/v2/customers/{customerAddressId}/update-address-select`

Select an existing address and apply it to the current cart/checkout session. Updates the cart's checkout data with the selected address and returns the rendered address HTML along with updated checkout fragments.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerAddressId` | integer | path | Yes | The address record ID to select |
| `with` | array | query | No | Relationships to eager-load on the address |
| `fct_cart_hash` | string | query | No | Cart hash identifier to locate the active cart session |

#### Response

**Success (200):**

```json
{
    "message": "Address Attached",
    "data": "<div class=\"fct-address-info\">...</div>",
    "fragments": {
        ".fct-checkout-summary": "<div>...updated summary HTML...</div>"
    }
}
```

**Error (404):**

```json
{
    "message": "Address not found"
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to view this address"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customers/5/update-address-select?fct_cart_hash=abc123" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Create Address (Checkout)

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/add-address`

Create a new address for the currently authenticated customer. Used during checkout to add a new billing or shipping address. After creation, returns updated address selector HTML for the checkout form.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `type` | string | body | Yes | Address type: `billing` or `shipping` |
| `product_type` | string | body | No | Product fulfillment type (e.g., `physical`, `digital`). Used for field validation rules. |
| `label` | string | body | No | Short label for the address (max 15 characters, e.g., `Home`, `Office`) |
| `billing_name` or `shipping_name` | string | body | No | Contact name (prefixed with address type) |
| `billing_address_1` or `shipping_address_1` | string | body | Yes | Primary street address (prefixed with address type) |
| `billing_address_2` or `shipping_address_2` | string | body | No | Secondary address line (prefixed with address type) |
| `billing_city` or `shipping_city` | string | body | Yes | City (prefixed with address type) |
| `billing_state` or `shipping_state` | string | body | Conditional | State/province code. Required if the country has states. (prefixed with address type) |
| `billing_postcode` or `shipping_postcode` | string | body | Conditional | Postal/zip code. Validated against country format. (prefixed with address type) |
| `billing_country` or `shipping_country` | string | body | Yes | Country code (e.g., `US`, `GB`). (prefixed with address type) |
| `billing_phone` or `shipping_phone` | string | body | No | Phone number (prefixed with address type) |
| `billing_email` or `shipping_email` | string | body | No | Email address (prefixed with address type) |

> **Note:** All address fields are prefixed with the address `type` (e.g., `billing_address_1` for a billing address, `shipping_city` for shipping). The prefix is stripped before storage.

#### Response

**Success (200):**

```json
{
    "message": "Customer address created successfully!",
    "fragment": [
        {
            "selector": "[data-fluent-cart-checkout-page-form-address-modal-address-selector-button-wrapper]",
            "content": "<div>...updated address selector HTML...</div>",
            "type": "replace"
        }
    ]
}
```

**Error (422 - validation):**

```json
{
    "status": "failed",
    "errors": {
        "billing_country": {
            "required": "Country is required."
        }
    }
}
```

**Error (no customer):**

```json
{
    "message": "You don't have any associated account"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/add-address" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "billing",
    "billing_name": "John Doe",
    "billing_address_1": "123 Main St",
    "billing_city": "New York",
    "billing_state": "NY",
    "billing_postcode": "10001",
    "billing_country": "US",
    "billing_phone": "+1234567890",
    "label": "Home"
  }' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Update Address (Checkout)

<badge type="warning">PUT</badge> `/fluent-cart/v2/customers/{customerId}/address`

Update an existing address for the authenticated customer. The address ID is passed in the request body.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID. Must belong to the authenticated user. |
| `address.id` | integer | body | Yes | The address record ID to update |
| `type` | string | body | Yes | Address type: `billing` or `shipping` |
| `billing_label` or `shipping_label` | string | body | Yes | Short label (max 15 characters). Prefixed with address type. |
| `billing_name` or `shipping_name` | string | body | No | Contact name (prefixed with address type) |
| `billing_address_1` or `shipping_address_1` | string | body | Yes | Primary street address (prefixed with address type) |
| `billing_address_2` or `shipping_address_2` | string | body | No | Secondary address line (prefixed with address type) |
| `billing_city` or `shipping_city` | string | body | Yes | City (prefixed with address type) |
| `billing_state` or `shipping_state` | string | body | Conditional | State/province code (prefixed with address type) |
| `billing_postcode` or `shipping_postcode` | string | body | Conditional | Postal/zip code (prefixed with address type) |
| `billing_country` or `shipping_country` | string | body | Yes | Country code (prefixed with address type) |

#### Response

**Success (200):**

```json
{
    "message": "Address updated successfully"
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to update this address"
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/customers/1/address" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "billing",
    "address": {"id": 5},
    "billing_name": "John Doe",
    "billing_address_1": "456 Oak Ave",
    "billing_city": "Boston",
    "billing_state": "MA",
    "billing_postcode": "02101",
    "billing_country": "US",
    "billing_label": "Work"
  }' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Delete Address (Checkout)

<badge type="danger">DELETE</badge> `/fluent-cart/v2/customers/{customerId}/address`

Delete an existing address for the authenticated customer. The address ID is passed in the request body.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID. Must belong to the authenticated user. |
| `address.id` | integer | body | Yes | The address record ID to delete |

#### Response

**Success (200):**

```json
{
    "message": "Address deleted successfully"
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to delete this address"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/customers/1/address" \
  -H "Content-Type: application/json" \
  -d '{"address": {"id": 5}}' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Set Address as Primary

<badge type="warning">POST</badge> `/fluent-cart/v2/customers/{customerId}/address/make-primary`

Mark a specific address as the primary address for its type (billing or shipping). All other addresses of the same type are demoted.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `customerId` | integer | path | Yes | The customer ID. Must belong to the authenticated user. |
| `address.id` | integer | body | Yes | The address record ID to set as primary |
| `address.type` | string | body | Yes | Address type: `billing` or `shipping` |

#### Response

**Success (200):**

```json
{
    "message": "Address successfully set as the primary"
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to update this address"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customers/1/address/make-primary" \
  -H "Content-Type: application/json" \
  -d '{"address": {"id": 5, "type": "billing"}}' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

## Profile Management

Endpoints under the `customer-profile` prefix for the customer portal dashboard and profile settings.

### Dashboard Overview

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/`

Retrieve the customer's dashboard overview including the 5 most recent orders. This is the landing page data for the customer portal.

#### Parameters

No parameters required.

#### Response

**Success (200):**

```json
{
    "message": "Success",
    "dashboard_data": {
        "orders": [
            {
                "created_at": "2025-06-15 10:30:00",
                "invoice_no": "INV-000101",
                "total_amount": 4999,
                "uuid": "abc-123-def",
                "type": "one-time",
                "status": "completed",
                "renewals_count": 0,
                "order_items": [
                    {
                        "id": 1,
                        "post_title": "Premium Plugin",
                        "title": "Premium Plugin - Single Site",
                        "quantity": 1,
                        "payment_type": "one-time",
                        "line_meta": {
                            "bundle_parent_item_id": null
                        }
                    }
                ]
            }
        ]
    },
    "sections_parts": {
        "before_orders_table": "",
        "after_orders_table": ""
    }
}
```

> The `sections_parts` object contains HTML strings injected by extensions via the `fluent_cart/customer_dashboard_data` filter.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Get Profile Details

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/profile`

Retrieve the authenticated customer's profile details including name, email, and associated addresses. If the logged-in user does not yet have a customer record, basic WordPress user data is returned instead.

#### Parameters

No parameters required.

#### Response

**Success (200) - Existing customer:**

```json
{
    "message": "Success",
    "data": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "billing_address": [
            {
                "id": 1,
                "customer_id": 1,
                "type": "billing",
                "name": "John Doe",
                "address_1": "123 Main St",
                "address_2": "",
                "city": "New York",
                "state": "NY",
                "postcode": "10001",
                "country": "US",
                "is_primary": "1",
                "status": "active"
            }
        ],
        "shipping_address": []
    }
}
```

**Success (200) - User without customer record:**

```json
{
    "message": "Success",
    "data": {
        "first_name": "Jane",
        "last_name": "Smith",
        "user_login": "janesmith",
        "user_email": "jane@example.com",
        "email": "jane@example.com",
        "user_nicename": "janesmith",
        "display_name": "Jane Smith",
        "billing_address": [],
        "shipping_address": [],
        "not_a_customer": true
    }
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/profile" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Update Profile Details

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/update`

Update the authenticated customer's profile name. Also updates the associated WordPress user's `first_name`, `last_name`, and `display_name`.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `first_name` | string | body | No | Customer first name. Max 255 characters. |
| `last_name` | string | body | No | Customer last name. Max 255 characters. |
| `email` | string | body | Yes | Customer email address. Must be valid. |
| `current_password` | string | body | No | Current password (for password change flow) |
| `new_password` | string | body | No | New password (for password change flow) |
| `confirm_new_password` | string | body | No | Confirm new password (for password change flow) |

#### Response

**Success (200):**

```json
{
    "message": "Profile updated successfully"
}
```

**Error (customer not found):**

```json
{
    "message": "Customer not found"
}
```

**Error (not logged in):**

```json
{
    "message": "You are not logged in"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/update" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Smith", "email": "john@example.com"}' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

## Address Management (Profile)

Endpoints under the `customer-profile` prefix for managing addresses from the customer portal profile page. These use a simpler interface compared to the checkout address endpoints.

### Create Profile Address

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/create-address`

Create a new address for the authenticated customer from the profile management page.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `type` | string | body | Yes | Address type: `billing` or `shipping` |
| `name` | string | body | Yes | Contact name. Max 255 characters. |
| `label` | string | body | No | Short label for the address (max 15 characters, e.g., `Home`, `Work`) |
| `address_1` | string | body | No | Primary street address |
| `address_2` | string | body | No | Secondary address line |
| `city` | string | body | No | City. Max 255 characters. |
| `state` | string | body | No | State/province code. Max 255 characters. |
| `postcode` | string | body | Yes | Postal/zip code |
| `country` | string | body | Yes | Country code (e.g., `US`, `GB`) |
| `phone` | string | body | No | Phone number |
| `email` | string | body | Yes | Email address |
| `company_name` | string | body | No | Company name. Max 255 characters. |
| `is_primary` | integer | body | No | Set to `1` to make this the primary address. Defaults to `0`. Automatically set to `1` if no primary address exists. |

#### Response

**Success (200):**

```json
{
    "message": "Customer address created successfully!",
    "data": {
        "is_created": {
            "id": 10,
            "customer_id": 1,
            "type": "billing",
            "name": "John Doe",
            "address_1": "123 Main St",
            "city": "New York",
            "state": "NY",
            "postcode": "10001",
            "country": "US",
            "is_primary": "1",
            "status": "active"
        },
        "total_address_count": 2
    }
}
```

**Error (validation):**

```json
{
    "message": "Name field is required."
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/create-address" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "billing",
    "name": "John Doe",
    "address_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US",
    "phone": "+1234567890",
    "email": "john@example.com",
    "label": "Home"
  }' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Update Profile Address

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/edit-address`

Update an existing address from the profile management page. The address must belong to the authenticated customer.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `id` | integer | body | Yes | The address record ID to update |
| `type` | string | body | Yes | Address type: `billing` or `shipping` |
| `name` | string | body | Yes | Contact name. Max 255 characters. |
| `label` | string | body | No | Short label (max 15 characters) |
| `address_1` | string | body | No | Primary street address |
| `address_2` | string | body | No | Secondary address line |
| `city` | string | body | No | City. Max 255 characters. |
| `state` | string | body | No | State/province code. Max 255 characters. |
| `postcode` | string | body | Yes | Postal/zip code |
| `country` | string | body | Yes | Country code (e.g., `US`, `GB`) |
| `phone` | string | body | No | Phone number |
| `email` | string | body | Yes | Email address |
| `company_name` | string | body | No | Company name. Max 255 characters. |

#### Response

**Success (200):**

```json
{
    "message": "Customer address updated successfully!",
    "data": {
        "id": 5,
        "customer_id": 1,
        "type": "billing",
        "name": "John Smith",
        "address_1": "456 Oak Ave",
        "city": "Boston",
        "state": "MA",
        "postcode": "02101",
        "country": "US"
    }
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to update this address"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/edit-address" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 5,
    "type": "billing",
    "name": "John Smith",
    "address_1": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "postcode": "02101",
    "country": "US",
    "email": "john@example.com"
  }' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Make Profile Address Primary

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/make-primary-address`

Set a specific address as the primary address for its type. All other addresses of the same type for the customer are demoted.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `addressId` | integer | body | Yes | The address record ID to set as primary |
| `type` | string | body | Yes | Address type: `billing` or `shipping` |

#### Response

**Success (200):**

```json
{
    "message": "Address successfully set as the primary"
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to update this address"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/make-primary-address" \
  -H "Content-Type: application/json" \
  -d '{"addressId": 5, "type": "billing"}' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Delete Profile Address

<badge type="warning">POST</badge> `/fluent-cart/v2/customer-profile/delete-address`

Delete an address from the customer's profile. The address must belong to the authenticated customer. Primary addresses and the last remaining address cannot be deleted.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `addressId` | integer | body | Yes | The address record ID to delete |

#### Response

**Success (200):**

```json
{
    "message": "Address successfully deleted."
}
```

**Error (address is primary):**

```json
{
    "message": "Primary address cannot be deleted!"
}
```

**Error (last address):**

```json
{
    "message": "At least one address must remain. Address deletion failed!"
}
```

**Error (403):**

```json
{
    "message": "You are not authorized to update this address"
}
```

**Error (missing ID):**

```json
{
    "message": "Address ID is required"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/customer-profile/delete-address" \
  -H "Content-Type: application/json" \
  -d '{"addressId": 5}' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

## Orders

Endpoints under the `customer-profile` prefix for viewing orders and managing order-related data in the customer portal.

### List Orders

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/orders`

Retrieve a paginated list of the authenticated customer's orders. Excludes renewal orders that have a parent subscription order. Supports text search across order fields.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `per_page` | integer | query | No | Number of items per page (default: 10) |
| `page` | integer | query | No | Page number for pagination (default: 1) |
| `search` | string | query | No | Search text to filter orders |

#### Response

**Success (200):**

```json
{
    "orders": {
        "total": 25,
        "per_page": 10,
        "current_page": 1,
        "last_page": 3,
        "data": [
            {
                "created_at": "2025-06-15 10:30:00",
                "invoice_no": "INV-000101",
                "total_amount": 4999,
                "uuid": "abc-123-def",
                "type": "one-time",
                "status": "completed",
                "renewals_count": 0,
                "order_items": [
                    {
                        "id": 1,
                        "post_title": "Premium Plugin",
                        "title": "Premium Plugin - Single Site",
                        "quantity": 1,
                        "payment_type": "one-time",
                        "line_meta": {
                            "bundle_parent_item_id": null
                        }
                    }
                ]
            }
        ]
    }
}
```

> The `created_at` timestamp is converted to the user's timezone (stored in `order.config.user_tz`, falling back to the site timezone).

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/orders?per_page=10&page=1&search=plugin" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Get Order Details

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/orders/{order_uuid}`

Retrieve full details for a specific order including line items, transactions, subscriptions, downloads, and addresses. The order must belong to the authenticated customer.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_uuid` | string | path | Yes | The UUID of the order (alphanumeric with dashes) |

#### Response

**Success (200):**

```json
{
    "order": {
        "id": 101,
        "fulfillment_type": "digital",
        "type": "one-time",
        "created_at": "2025-06-15 10:30:00",
        "invoice_no": "INV-000101",
        "currency": "USD",
        "uuid": "abc-123-def",
        "status": "completed",
        "payment_status": "paid",
        "shipping_status": "",
        "billing_address_text": "John Doe, 123 Main St, New York, NY 10001, US",
        "shipping_address_text": "",
        "subtotal": 4999,
        "total_amount": 4999,
        "total_paid": 4999,
        "total_refund": 0,
        "shipping_total": 0,
        "coupon_discount_total": 0,
        "manual_discount_total": 0,
        "tax_total": 0,
        "tax_behavior": "exclusive",
        "shipping_tax": 0,
        "payment_method": "stripe",
        "order_items": [
            {
                "id": 1,
                "variation_id": 10,
                "product_id": 5,
                "post_title": "Premium Plugin",
                "title": "Premium Plugin - Single Site",
                "quantity": 1,
                "unit_price": 4999,
                "subtotal": 4999,
                "payment_type": "one-time",
                "meta_lines": [],
                "extra_amount": 0,
                "image": "https://example.com/wp-content/uploads/product.jpg",
                "variant_image": "",
                "url": "https://example.com/product/premium-plugin/",
                "line_meta": {},
            }
        ],
        "subscriptions": [],
        "downloads": [
            {
                "file_size": "2.5 MB",
                "title": "premium-plugin-v2.zip",
                "download_url": "https://example.com/?fct_download=..."
            }
        ],
        "transactions": [
            {
                "id": 50,
                "uuid": "txn-abc-123",
                "order_id": 101,
                "amount": 4999,
                "status": "succeeded",
                "payment_method": "stripe",
                "created_at": "2025-06-15 10:30:00"
            }
        ]
    },
    "section_parts": {
        "before_summary": "",
        "after_summary": "",
        "after_licenses": "",
        "after_subscriptions": "",
        "after_downloads": "",
        "after_transactions": "",
        "end_of_order": ""
    }
}
```

> The `section_parts` object contains HTML strings injected by extensions via the `fluent_cart/customer/order_details_section_parts` filter.

**Error (renewal order redirect):**

```json
{
    "message": "This is a renewal order. Please check the parent order details.",
    "parent_order": {
        "uuid": "parent-abc-123"
    }
}
```

**Error (order not found):**

```json
{
    "message": "Order not found"
}
```

**Error (not logged in):**

```json
{
    "message": "You are not logged in"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/orders/abc-123-def" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Get Upgrade Paths

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/orders/{order_uuid}/upgrade-paths`

Retrieve available upgrade/downgrade paths for a specific product variation within an order. Used to show plan switching options in the customer portal.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `order_uuid` | string | path | Yes | The UUID of the order (alphanumeric with dashes) |
| `variation_id` | integer | query | Yes | The product variation ID to find upgrade paths for |

#### Response

**Success (200):**

```json
{
    "upgradePaths": [
        {
            "variation_id": 15,
            "title": "Premium Plugin - 5 Sites",
            "price": 9999,
            "billing_interval": "year",
            "upgrade_type": "upgrade",
            "prorated_amount": 5000
        },
        {
            "variation_id": 20,
            "title": "Premium Plugin - Unlimited Sites",
            "price": 19999,
            "billing_interval": "year",
            "upgrade_type": "upgrade",
            "prorated_amount": 15000
        }
    ]
}
```

**Error (not logged in):**

```json
{
    "message": "You must be logged in to view upgrade paths."
}
```

**Error (order not found):**

```json
{
    "message": "Order not found or you do not have permission to view it."
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/orders/abc-123-def/upgrade-paths?variation_id=10" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Get Transaction Billing Address

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/orders/{transaction_uuid}/billing-address`

Retrieve the billing address associated with a specific transaction. Used for invoice/receipt editing in the customer portal.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `transaction_uuid` | string | path | Yes | The UUID of the transaction (alphanumeric with dashes) |

#### Response

**Success (200):**

```json
{
    "message": "Success",
    "data": {
        "address_1": "123 Main St",
        "address_2": "",
        "city": "New York",
        "state": "NY",
        "postcode": "10001",
        "country": "US",
        "name": "John Doe",
        "vat_tax_id": "EU123456789",
        "address_id": 15
    }
}
```

**Success (200) - No billing address found:**

```json
{
    "message": "",
    "data": {
        "address_1": "",
        "address_2": "",
        "city": "",
        "state": "",
        "postcode": "",
        "country": "",
        "name": "",
        "vat_tax_id": "",
        "address_id": ""
    }
}
```

**Error (customer not found):**

```json
{
    "message": "Customer not found"
}
```

**Error (transaction not found):**

```json
{
    "message": "Transaction not found"
}
```

**Error (order not found):**

```json
{
    "message": "Order not found"
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/orders/txn-abc-123/billing-address" \
  --cookie "wordpress_logged_in_xxx=..."
```

---

### Save Transaction Billing Address

<badge type="warning">PUT</badge> `/fluent-cart/v2/customer-profile/orders/{transaction_uuid}/billing-address`

Create or update the billing address for a specific transaction's order. Also stores the VAT/Tax ID as order metadata. Validates address fields against country-specific rules.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `transaction_uuid` | string | path | Yes | The UUID of the transaction (alphanumeric with dashes) |
| `address_id` | string | body | No | Existing order address ID to update. If empty, a new address is created. |
| `name` | string | body | Yes | Contact name |
| `address_1` | string | body | Conditional | Primary street address. Required based on country validation rules. |
| `address_2` | string | body | No | Secondary address line |
| `city` | string | body | Conditional | City. Required based on country validation rules. |
| `state` | string | body | Conditional | State/province code. Required for countries with states. |
| `postcode` | string | body | Conditional | Postal/zip code. Validated against country-specific format. |
| `country` | string | body | Yes | Country code (e.g., `US`, `GB`) |
| `vat_tax_id` | string | body | No | VAT or Tax ID. Stored as order meta. |

#### Response

**Success (200) - Address created:**

```json
{
    "message": "Billing address created successfully",
    "address_id": 25
}
```

**Success (200) - Address updated:**

```json
{
    "message": "Billing address updated successfully",
    "formatted_address": "John Doe, 123 Main St, New York, NY 10001, US"
}
```

**Error (order not found):**

```json
{
    "message": "Order not found"
}
```

**Error (validation):**

```json
{
    "errors": {
        "country": ["The country field is required."]
    }
}
```

#### Example

```bash
curl -X PUT "https://example.com/wp-json/fluent-cart/v2/customer-profile/orders/txn-abc-123/billing-address" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": "15",
    "name": "John Doe",
    "address_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US",
    "vat_tax_id": "EU123456789"
  }' \
  --cookie "wordpress_logged_in_xxx=..."
```

---

## Downloads

Endpoints for accessing downloadable products from the customer portal.

### List Downloads

<badge type="tip">GET</badge> `/fluent-cart/v2/customer-profile/downloads`

Retrieve a paginated list of downloadable files available to the authenticated customer. Only includes downloads from orders with a successful payment status. Filters downloads based on purchased product variations.

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `page` | integer | query | No | Page number for pagination (default: 1) |
| `per_page` | integer | query | No | Number of items per page (default: 10) |

#### Response

**Success (200):**

```json
{
    "message": "Success",
    "downloads": {
        "data": [
            {
                "file_size": "2.5 MB",
                "title": "premium-plugin-v2.0.1.zip",
                "download_url": "https://example.com/?fct_download=eyJ0eXAi..."
            },
            {
                "file_size": "1.2 MB",
                "title": "starter-theme-v1.5.zip",
                "download_url": "https://example.com/?fct_download=eyJ0eXAi..."
            }
        ],
        "total": 5,
        "per_page": 10,
        "current_page": 1,
        "last_page": 1
    }
}
```

**Success (200) - Not logged in (empty result):**

```json
{
    "message": "Success",
    "downloads": {
        "data": [],
        "total": 0,
        "per_page": 10,
        "current_page": 1,
        "last_page": 1
    }
}
```

> The `download_url` contains a signed/encoded token that authorizes the download. These URLs are generated by `Helper::generateDownloadFileLink()` and are time-limited.

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/customer-profile/downloads?per_page=20&page=1" \
  --cookie "wordpress_logged_in_xxx=..."
```
