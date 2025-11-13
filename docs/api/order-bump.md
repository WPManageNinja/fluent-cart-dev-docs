---
title: Order Bump API
description: FluentCart Order Bump API for promotional order bump management and upselling features.
---

# Order Bump API

The Order Bump system provides promotional tools for increasing average order value through strategic product offers during the checkout process. Order bumps are primarily implemented through AJAX endpoints and hooks/filters rather than REST API endpoints.

## Base URL

Order bump functionality is accessed through AJAX endpoints:

```
/wp-admin/admin-ajax.php
```

## Authentication

Order bump AJAX endpoints require:
- WordPress nonce verification
- Active cart session
- No authentication required for public checkout (handled via `wp_ajax_nopriv_`)

## Order Bump AJAX Endpoint

### Apply/Remove Order Bump

Apply or remove an order bump (upgrade) from the cart during checkout.

**Endpoint:** `POST /wp-admin/admin-ajax.php`

**Action:** `fluent_cart_checkout_routes` with `fc_checkout_action=apply_order_bump`

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Must be `fluent_cart_checkout_routes` |
| `fc_checkout_action` | string | Yes | Must be `apply_order_bump` |
| `upgrade_form` | int | Yes | Variation ID to upgrade from |
| `upgrade_to` | int | Yes | Target variation ID to upgrade to |
| `is_upgraded` | string | Yes | `'yes'` to apply bump, `'no'` to remove |
| `bump_id` | int | No | Order bump ID (if using bump-based system) |

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=fluent_cart_checkout_routes" \
  -d "fc_checkout_action=apply_order_bump" \
  -d "upgrade_form=123" \
  -d "upgrade_to=456" \
  -d "is_upgraded=yes"
```

#### Example Request (JavaScript)

```javascript
const formData = new FormData();
formData.append('action', 'fluent_cart_checkout_routes');
formData.append('fc_checkout_action', 'apply_order_bump');
formData.append('upgrade_form', '123');
formData.append('upgrade_to', '456');
formData.append('is_upgraded', 'yes');

const response = await fetch('/wp-admin/admin-ajax.php', {
    method: 'POST',
    body: formData,
    credentials: 'include'
});

const data = await response.json();
```

#### Response

**Success Response** (200):

```json
{
  "message": "Item has been applied successfully"
}
```

Or when removing:

```json
{
  "message": "Item has been reverted successfully"
}
```

**Error Response** (422):

```json
{
  "message": "No active cart found"
}
```

#### Error Codes

| Error | Description |
|-------|-------------|
| `no_cart` | No active cart found |
| `invalid_request` | Cart is locked, already has an upgrade, or invalid upgrade request |
| `invalid_variation` | The selected product variation is not available for purchase |
| `invalid_bump` | Could not apply item at this time (when using bump_id) |

## Order Bump Hooks and Filters

### Apply Order Bump Filter

This filter allows you to customize the order bump application logic when using `bump_id`.

**Filter Hook:** `fluent_cart/apply_order_bump`

**Parameters:**
- `$response` (WP_Error): Default error response
- `$data` (array): Array containing:
  - `bump_id` (int): The ID of the order bump
  - `cart` (object): The current cart object
  - `request_data` (array): Request data including `is_upgraded`

**Return:** A success message (string) or a `WP_Error` object if the operation fails.

**Example Usage:**

```php
add_filter('fluent_cart/apply_order_bump', function($response, $data) {
    $cart = $data['cart'];
    $bumpId = $data['bump_id'] ?? 0;
    $willAdd = ($data['request_data']['is_upgraded'] ?? '') === 'yes';

    // Custom validation logic: Prevent adding bump if cart total is too high
    if ($willAdd && $cart->total > 500) {
        return new WP_Error('bump_limit_exceeded', 'This order bump cannot be added to orders over $500.');
    }

    // Custom tracking or logging
    if ($willAdd) {
        error_log("Order Bump #{$bumpId} added to cart for customer {$cart->customer_id}");
    } else {
        error_log("Order Bump #{$bumpId} removed from cart for customer {$cart->customer_id}");
    }

    return "Order bump processed successfully";
}, 10, 2);
```

### Order Bump Success Action

This action fires when an order with an order bump is successfully placed.

**Action Hook:** `fluent_cart/order_bump_succeed`

**Parameters:**
- `$data` (array): Array containing:
  - `cart` (object): The cart object
  - `order` (object): The order object

**Example Usage:**

```php
add_action('fluent_cart/order_bump_succeed', function ($data) {
    $cart = $data['cart'];
    $order = $data['order'];
    
    // Track order bump conversion
    error_log("Order bump succeeded in order #{$order->id}");
    
    // Send notification
    wp_mail(
        get_option('admin_email'),
        'Order Bump Applied',
        "Order #{$order->id} includes an order bump upgrade"
    );
});
```

### Checkout Cart Amount Updated Action

This action fires when the cart amount is updated, including when order bumps are applied.

**Action Hook:** `fluent_cart/checkout/cart_amount_updated`

**Parameters:**
- `$data` (array): Array containing:
  - `cart` (object): The updated cart object

**Example Usage:**

```php
add_action('fluent_cart/checkout/cart_amount_updated', function ($data) {
    $cart = $data['cart'];
    
    // Update cart display or trigger custom logic
    error_log("Cart amount updated: {$cart->total}");
});
```

## How Order Bumps Work

Order bumps allow customers to upgrade their purchase during checkout by replacing a product variation with a higher-tier variation. The system:

1. **Upgrade Process**: Replaces one variation with another (e.g., Basic → Pro)
2. **Cart Modification**: Removes the original variation and adds the upgraded variation
3. **Order Tracking**: Stores upgrade information in order meta (`_order_bump`)
4. **Order Logs**: Records the upgrade in order logs

### Order Bump Data Structure

When an order bump is applied, the following data is stored in the cart's `checkout_data`:

```php
$checkoutData['order_bump'] = [
    'upgraded_from' => 123, // Original variation ID
    'upgraded_to'   => 456  // Upgraded variation ID
];
```

This data is then:
- Stored in order meta as `_order_bump`
- Logged in order logs
- Triggered via `fluent_cart/order_bump_succeed` action when order is placed

## Order Bump Filter Service

FluentCart includes an `OrderBumpFilter` service for filtering order bumps in admin interfaces. This is used for:
- Searching order bumps by title or ID
- Filtering by active/inactive status
- Advanced filtering by product, customer, or license properties

**Note**: Full order bump management features (CRUD operations, conditions, settings) may be available in FluentCart Pro through the `OrderPromotion` model.

---

**Related Documentation:**
- [Licensing API](./licensing) - Software license management
- [Roles & Permissions API](./roles-permissions) - User role management
- [REST API Overview](../api/) - General API information
