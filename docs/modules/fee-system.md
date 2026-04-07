---
title: Fee System (Surcharges & Additional Charges)
description: Complete guide for developers to add custom fees and surcharges to FluentCart orders using the fee system API.
---

# Fee System (Surcharges & Additional Charges)

FluentCart provides a built-in fee system that allows developers to attach additional charges to a cart during checkout. This is useful for processing fees, handling fees, small-order surcharges, payment gateway surcharges, environmental levies, and more.

## Overview

Fees are stored as order items with `payment_type = 'fee'` and a cached `fee_total` column on the order for fast aggregation. The system provides two ways to register fees:

- **Dynamic fees** via the `fluent_cart/cart/fees` filter — recalculated on every checkout update
- **Persistent fees** via `$cart->addFee()` — stored directly on the cart and persisted to the database

Fees automatically integrate with:

- Checkout summary display
- Order totals calculation
- Email templates and PDF receipts
- Admin order view and customer portal
- Refund distribution (proportional)
- REST API responses

## Fee Data Structure

Every fee follows this structure:

```php
[
    'key'     => 'processing_fee',        // Unique slug (required)
    'label'   => 'Processing Fee',         // Customer-facing name (required)
    'amount'  => 450,                      // Amount in cents, must be positive (required)
    'taxable' => false,                    // Whether tax should be calculated (default: false)
    'source'  => 'my-addon',              // Addon identifier (default: 'custom')
    'meta'    => ['rule_id' => 42],        // Optional extra data stored in order item
]
```

**Rules:**
- `amount` must be a positive integer (in cents). Negative values are rejected.
- `key` is sanitized with `sanitize_key()`. Combined with `source`, it forms a composite dedup key (`source:key`).
- Duplicate `source:key` entries are deduplicated — the last one wins.

---

## Method 1: Dynamic Fees via Filter

Use the `fluent_cart/cart/fees` filter to add fees that are recalculated on every checkout update (quantity change, coupon applied, payment method changed, etc.).

### Hook: `fluent_cart/cart/fees`

**Parameters:**
- `$fees` (array): Current fees array (may contain fees from other addons or stored fees)
- `$context` (array): Cart context for condition evaluation

**Returns:** Modified fees array

**Context array contents:**

| Key | Type | Description |
|-----|------|-------------|
| `cart` | `Cart` | The Cart model instance |
| `cart_items` | `array` | Current cart item data |
| `cart_subtotal` | `int` | Cart subtotal in cents (before discounts) |
| `shipping_total` | `int` | Shipping total in cents |
| `customer_id` | `int` | Customer ID |
| `payment_method` | `string` | Selected payment method key |
| `checkout_data` | `array` | Full checkout data |

### Example: Small Order Surcharge

Add a $5 fee when the cart subtotal is under $25:

```php
add_filter('fluent_cart/cart/fees', function (array $fees, array $context) {
    $subtotal = $context['cart_subtotal'];

    if ($subtotal > 0 && $subtotal < 2500) {
        $fees[] = [
            'key'     => 'small_order_fee',
            'label'   => __('Small Order Fee', 'my-addon'),
            'amount'  => 500,
            'taxable' => false,
            'source'  => 'my-addon',
            'meta'    => ['reason' => 'subtotal_below_threshold'],
        ];
    }

    return $fees;
}, 10, 2);
```

### Example: Payment Method Processing Fee

Add a 2.9% processing fee for Stripe payments:

```php
add_filter('fluent_cart/cart/fees', function (array $fees, array $context) {
    if ($context['payment_method'] !== 'stripe') {
        return $fees;
    }

    $subtotal = $context['cart_subtotal'];
    if ($subtotal <= 0) {
        return $fees;
    }

    $feeAmount = (int) round($subtotal * 0.029);

    $fees[] = [
        'key'     => 'stripe_processing',
        'label'   => __('Processing Fee (2.9%)', 'my-addon'),
        'amount'  => $feeAmount,
        'taxable' => true,
        'source'  => 'my-addon',
        'meta'    => ['rate' => '2.9%'],
    ];

    return $fees;
}, 10, 2);
```

### Example: Location-Based Fee

Add a handling fee for orders shipping to remote areas:

```php
add_filter('fluent_cart/cart/fees', function (array $fees, array $context) {
    $checkoutData = $context['checkout_data'];
    $country = $checkoutData['form_data']['shipping_country'] ?? '';
    $state = $checkoutData['form_data']['shipping_state'] ?? '';

    $remoteAreas = ['AK', 'HI', 'PR']; // Alaska, Hawaii, Puerto Rico

    if ($country === 'US' && in_array($state, $remoteAreas, true)) {
        $fees[] = [
            'key'     => 'remote_handling',
            'label'   => __('Remote Area Handling Fee', 'my-addon'),
            'amount'  => 1500,
            'taxable' => false,
            'source'  => 'my-addon',
        ];
    }

    return $fees;
}, 10, 2);
```

---

## Method 2: Persistent Fees via Cart Methods

Use these methods to programmatically add or remove fees that are stored on the cart. Persistent fees survive page reloads and are included alongside dynamic fees.

### `$cart->addFee(array $fee): bool`

Adds a fee to the cart and saves immediately. If a fee with the same `source:key` already exists, it will be updated.

```php
$cart = \FluentCart\App\Models\Cart::find($cartId);

$cart->addFee([
    'key'     => 'handling_fee',
    'label'   => 'Handling Fee',
    'amount'  => 200,
    'source'  => 'my-addon',
    'taxable' => false,
    'meta'    => ['applied_by' => 'admin'],
]);
```

### `$cart->removeFee(string $key, ?string $source = null): bool`

Removes a fee by key. Optionally filter by source to avoid removing another addon's fee with the same key.

```php
// Remove a specific fee by key and source
$cart->removeFee('handling_fee', 'my-addon');

// Remove all fees with this key (regardless of source)
$cart->removeFee('handling_fee');
```

### `$cart->removeFeesBySource(string $source): void`

Removes all fees from a specific source. Useful for clearing all your addon's fees before recalculating.

```php
// Clear all fees from your addon
$cart->removeFeesBySource('my-addon');
```

### `$cart->getFees(): array`

Returns all validated fees (stored + dynamic from filter).

### `$cart->getFeeTotal(): int`

Returns the total of all fees in cents.

```php
$fees = $cart->getFees();
$total = $cart->getFeeTotal(); // e.g., 700 (= $7.00)
```

---

## How Fees Flow Through the System

```
1. REGISTRATION
   Addon registers fees via filter or $cart->addFee()

2. CHECKOUT SUMMARY
   WebCheckoutHandler recalculates on every cart change
   CartSummaryRender::renderFees() displays fee lines
   Fee total included in estimated total

3. ORDER CREATION
   CheckoutProcessor reads fees from cart
   Each fee becomes an OrderItem (payment_type = 'fee')
   fee_total cached on the Order record
   total_amount formula includes fee_total

4. POST-ORDER
   Admin view: fee rows in payment table
   Customer portal: fee rows in totals
   Emails: fee rows in items table
   PDF receipts: fee rows in summary
   Refunds: fees participate in proportional distribution
```

### Total Amount Formula

```
total_amount = subtotal
             - coupon_discount_total
             - manual_discount_total
             + fee_total
             + shipping_total
             + tax_total (if exclusive)
             + shipping_tax (if exclusive)
```

---

## Fee Display Order

Fees appear in the checkout summary and all post-order displays in this order:

```
1. Subtotal
2. Shipping
3. Fees          ← your fees appear here
4. Coupons / Discounts
5. Tax
6. Total
```

This ordering is intentional — fees are additions (like shipping), shown before subtractions (discounts).

---

## Reading Fees from Orders

After an order is placed, fees are stored as order items. Use these methods to access them:

### `$order->feeItems()`

Returns a HasMany relationship query for fee order items.

```php
$order = \FluentCart\App\Models\Order::find($orderId);

$feeItems = $order->feeItems()->get();

foreach ($feeItems as $item) {
    echo $item->title;      // "Processing Fee"
    echo $item->subtotal;   // 450 (cents)
    echo $item->tax_amount; // 36 (cents, if taxable)
}
```

### `$order->getAppliedFees()`

Returns a simplified array of applied fees.

```php
$fees = $order->getAppliedFees();
// [
//     [
//         'key'     => 'processing_fee',
//         'label'   => 'Processing Fee',
//         'amount'  => 450,
//         'source'  => 'my-addon',
//         'item_id' => 42,
//     ],
// ]
```

### `$order->getProductItems()`

Returns order items excluding fees and signup fees. Use this whenever displaying product line items to avoid showing fee rows in the product list.

```php
// Correct: excludes fee and signup_fee items
$products = $order->getProductItems();

// Also available on the order: the cached total
$feeTotal = $order->fee_total; // e.g., 650
```

---

## Fee Item Structure in Order Items

When a fee becomes an order item, it has this structure in `fct_order_items`:

| Column | Value | Notes |
|--------|-------|-------|
| `post_id` | `0` | No product |
| `object_id` | `0` | No variation |
| `title` | `"Processing Fee"` | The fee label |
| `quantity` | `1` | Always 1 |
| `unit_price` | `450` | Amount in cents |
| `subtotal` | `450` | Same as unit_price |
| `line_total` | `450` | Same as subtotal |
| `payment_type` | `'fee'` | Identifies as a fee |
| `other_info` | JSON | Contains `fee_key`, `source`, `taxable`, `meta` |

---

## Actions

### `fluent_cart/cart/fees_calculated`

Fired after fees are collected and stored on the cart during checkout summary recalculation.

```php
add_action('fluent_cart/cart/fees_calculated', function (array $fees, $cart) {
    // Log or track fee activity
    if (!empty($fees)) {
        error_log('Fees applied: ' . count($fees) . ' for cart #' . $cart->id);
    }
}, 10, 2);
```

### `fluent_cart/order/fee_items_created`

Fired after fee order items are created during order placement.

```php
add_action('fluent_cart/order/fee_items_created', function (array $feeOrderItems, $order) {
    // Post-creation processing
}, 10, 2);
```

---

## Important Behavior Notes

1. **Fees are recalculated on every checkout update.** Dynamic fees (via filter) run whenever the checkout summary refreshes — item changes, coupon application, payment method change, address change, etc.

2. **Fees are not applied to subscription renewals.** The filter is skipped when `checkout_data.renew_data.is_renewal` is `yes`.

3. **Fees are not applied to locked carts.** Custom/manual checkout carts that are locked return only stored fees without running the filter.

4. **Deduplication uses `source:key`.** Two addons can both register a fee with `key = 'processing_fee'` as long as they use different `source` values.

5. **Fees are read-only after order creation.** Once an order is placed, fee items cannot be edited from the admin panel.

6. **Fees participate in proportional refunds.** When an order is refunded, fee items are included in the proportional distribution automatically.

7. **Per-request caching.** `getFees()` caches results within a single request. Call `$cart->clearFeeCache()` if you modify fees and need to re-read within the same request.

8. **Recursion guard.** If your filter callback calls `$cart->getFees()`, it returns only stored fees (not the filter result) to prevent infinite loops.

---

## Complete Example: Tiered Handling Fee Addon

A full working example that applies tiered handling fees based on cart subtotal:

```php
<?php
/**
 * Plugin Name: FluentCart Handling Fee
 * Description: Adds tiered handling fees based on cart subtotal.
 */

add_filter('fluent_cart/cart/fees', function (array $fees, array $context) {
    $subtotal = $context['cart_subtotal'];

    if ($subtotal <= 0) {
        return $fees;
    }

    // Tiered handling fee
    $feeAmount = match (true) {
        $subtotal < 2000  => 500,  // Under $20: $5.00 fee
        $subtotal < 5000  => 300,  // $20-$49.99: $3.00 fee
        $subtotal < 10000 => 100,  // $50-$99.99: $1.00 fee
        default           => 0,    // $100+: no fee
    };

    if ($feeAmount > 0) {
        $fees[] = [
            'key'     => 'handling_fee',
            'label'   => __('Handling Fee', 'my-handling-fee'),
            'amount'  => $feeAmount,
            'taxable' => false,
            'source'  => 'handling-fee-addon',
            'meta'    => [
                'tier'     => $subtotal < 2000 ? 'small' : ($subtotal < 5000 ? 'medium' : 'large'),
                'subtotal' => $subtotal,
            ],
        ];
    }

    return $fees;
}, 10, 2);
```

---

## Related Documentation

- [Developer Hooks](/hooks/) - Complete hooks and filters reference
- [Orders API](/restapi/operations/orders/) - Order management API
- [Database Models](/database/models/) - Data model documentation
- [Ghost Product Selling](/modules/ghost-product-selling) - Custom product selling guide

---

**Next Steps:** Explore [Custom Payment Gateway Integration](/payment-methods-integration/) or return to [Getting Started](/getting-started)
