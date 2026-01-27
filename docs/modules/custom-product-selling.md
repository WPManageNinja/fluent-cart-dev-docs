---
title: Custom Product Selling Options
description: Complete guide for developers to implement custom product selling options using FluentCart hooks.
---

# Custom Product Selling Options

FluentCart provides a powerful hook system that allows developers to sell custom products that don't exist in the product catalog. This feature enables selling add-ons, gift wrapping, custom subscriptions, and any other custom items through your store.

## Overview

Custom product selling allows you to add items to the cart that are not stored as regular products in the database. This is useful for:

- **Add-on Products** - Gift wrapping, insurance, custom options
- **Custom Subscriptions** - Recurring billing for non-catalog items
- **Dynamic Products** - Products created on-the-fly based on user selections
- **Service-Based Items** - One-time or recurring service purchases

## Implementation Flow

The complete implementation follows this flow:

```
Add Button → Add Validation Hook → Handle Quantity Change Hook → Checkout Validation Hook
```

---

## Step 1: Add Button (Frontend)

Add the appropriate button to your page based on the item type.

### One-Time Custom Item (Add to Cart)

For one-time purchases that are added to the cart:

```html
<button 
    data-cart-id="1000"
    data-quantity="1"
    data-is-custom="true"
    data-fluent-cart-add-to-cart-button
>
  Add Gift Wrapping
</button>
```

### Subscription Custom Item (Instant Checkout)

For subscription items that go directly to checkout:

```html
<a href="https://yourstore.com/?fluent-cart=instant_checkout&item_id=3001&quantity=1&is_custom=true">
  Buy Now
</a>
```

**Note:** Replace `https://yourstore.com` with your actual site URL and `3001` with your custom item ID.

---

## Step 2: Add Validation Hook (Backend)

Use this filter to validate and return the custom product item when it's added to the cart.

### Hook: `fluent_cart/cart/validate_custom_item`

**Parameters:**
- `$variation` (object/array): The variation object to be modified
- `$item` (array): The item data from the request

**Returns:** The modified variation object

### Example: Validate New Custom Item

```php
add_filter('fluent_cart/cart/validate_custom_item', 
function($variation, $item) {
    if ((bool)$item['is_custom']) {
        $variation = (object) [
            'item_id'      => absint($item['item_id']),
            'object_id'    => absint($item['item_id']),
            'post_id'      => 5000,
            'quantity'     => max(1, (int)$item['quantity']),
            'price'        => floatval(5000),
            'unit_price'   => floatval(5000),
            'line_total'   => floatval(5000) * max(1, (int)$item['quantity']),
            'post_title'   => sanitize_text_field('Weekly Protein Pack'),
            'title'        => sanitize_text_field('Subscription Version 1'),
            'is_custom'    => true,
            'payment_type' => 'subscription',
            "other_info"       => [
                "payment_type"      => "subscription",
                "repeat_interval"   => "monthly",
                "installment"     => "no",
                "manage_setup_fee" => "yes",
                 "signup_fee"       => 500
            ],

        ];
    }
    return $variation;
}, 10, 2);
```

---

## Step 3: Handle Quantity Changes (Cart)

This step applies only to one-time items for quantity increment/decrement actions.

### Hook: `fluent_cart/cart/custom_item_quantity_changed`

**Parameters:**
- `$variation` (object/array): The variation object to be updated
- `$item` (array): Item data including quantity changes

**Returns:** The modified variation object with updated quantity and totals

### Example: Change Existing Item Quantity

```php
add_filter('fluent_cart/cart/custom_item_quantity_changed', function ($variation, $item) {

    if (empty($item['is_custom'])) {
        return $variation;
    }

    // Ensure array
    $variation = (array) $variation;

    $newQty  = (int) ($item['new_quantity'] ?? 1);
    $oldQty  = (int) ($item['old_quantity'] ?? 1);
    $byInput = (bool) ($item['by_input'] ?? false);

    /**
     * If quantity changed via increment, decrement or delete buttons
     */
    if (!$byInput) {
        $newQty = $newQty == 0 ? 0 : ($oldQty+$newQty);
    }

    $price = (float) ($variation['price'] ?? 0);

    $variation['quantity']   = $newQty;
    $variation['line_total'] = $price * $newQty;

    return $variation;

}, 10, 2);
```

---

## Step 4: Checkout Validation

This hook runs before payment processing for both one-time and subscription items.

### Hook: `fluent_cart/payment/validate_custom_item`

**Parameters:**
- `$items` (array): Array containing product and variation objects
- `$data` (array): Additional checkout data

**Returns:** Modified items array

### Example: Payment Validate Item

```php
add_filter('fluent_cart/payment/validate_custom_item', function ($items, $data) {

    [$product, $variation] = $items;

    // Mark the item as custom visually
    $variation->title    .= ' (Custom Item)';
    $product->post_title .= ' [Custom]';

    return [$product, $variation];

}, 10, 2);
```

---

## Step 5: Admin Order Update Handling (Optional)

Handle custom item updates from the WordPress admin panel after an order is placed.

### Order Item Changed

**Action:** `fluent_cart/order/custom_item_changed`

**Parameters:**
- `$oldItem` (array): The original item data
- `$item` (array): The updated item data

**Returns:** The item to be saved

#### Example: Order Item Changed

```php
add_filter('fluent_cart/order/custom_item_changed', function ($oldItem, $item) {

    $oldItem = (array) $oldItem;
    $item    = (array) $item;

    $isCustom = (bool) ($item['is_custom'] ?? false);
    $newQuantity  = (int) ($item['quantity'] ?? 1);
    $oldQuantity  = (int) ($oldItem['quantity'] ?? 1);

    /**
     * If item is a Custom Item → always save updated changes
     */
    if ($isCustom) {
        return $item;
    }

    /**
     * If quantity is unchanged → return old item (no update)
     */
    if ($oldQuantity === $newQuantity) {
        return $oldItem;
    }

    /**
     * If quantity changed → allow update
     */
    return $item;

}, 10, 2);
```

### Before Custom Items Are Deleted

**Action:** `fluent_cart/order/before_custom_items_deleted`

**Parameters:**
- `$customItems` (array): Array of custom items to be deleted
- `$order` (object): The order object

#### Example: Before Order Item Deleted

```php
add_action('fluent_cart/order/before_custom_items_deleted', function ($customItems, $order) {

    foreach ($customItems as $item) {
        error_log(
            sprintf(
                'Custom item about to be deleted. Order #%d | Item ID: %d | Qty: %d',
                $order->id,
                $item->id,
                $item->quantity
            )
        );

        // Restore external stock if needed
    }

}, 10, 2);
```

### After Custom Items Are Deleted

**Action:** `fluent_cart/order/after_custom_items_deleted`

**Parameters:**
- `$customItems` (array): Array of deleted custom items
- `$order` (object): The order object

#### Example: After Order Item Deleted

```php
add_action('fluent_cart/order/after_custom_items_deleted', function ($customItems, $order) {

    foreach ($customItems as $item) {
        error_log(
            sprintf(
                'Custom item deleted. Order #%d | Item ID: %d | Qty: %d',
                $order->id,
                $item->id,
                $item->quantity
            )
        );

        // Analytics or internal counters
        // Notify admin
        // wp_mail('admin@example.com', 'Custom Item Deleted', 'Item ID ' . $item->id . ' was deleted');
    }

}, 10, 2);
```

---

## Sample Datasets

### One-Time Item

```php
$item = [
    "item_id"          => 1000,
    "object_id"       => 1000,
    "post_id"          => 10000,
    "quantity"        => 1,
    "is_custom"      => true,
    "post_title"        => "Air Max 1 running shoe",
    "title"                 => "Version 1",
    "price"               => 2000,
    "unit_price"      => 2000,
    "line_total"        => 2000 * 1, // quantity is 1
    "payment_type"     => "onetime",
    "fulfillment_type" => "digital",
    "featured_media"   => "http://wordpress.test/wp-content/uploads/2025/11/white-navy-athletic-shoe-4-1.jpeg",
    "sold_individually"=> 0,
    "other_info"       => [
        "payment_type" => "onetime"
    ],
    "view_url"         => "https://www.abelandcole.co.uk/turkey-breast-joint-high-welfare-kellybronze?cid=9427"
];
```

### Subscription Item

```php
$item = [
    "item_id"          => 2000,
    "object_id"       => 2000,
    "post_id"          => 20000,
    "quantity"        => 1, // always 1 for subscription
    "is_custom"      => true,
    "post_title"        => "Weekly Protein Pack",
    "title"                 => "Subscription Version 1",
    "price"               => 2500,
    "unit_price"      => 2500,
    "line_total"       => 2500 * 1,
    "payment_type"     => "subscription",
    "fulfillment_type" => "digital",
    "featured_media"   => "http://wordpress.test/wp-content/uploads/2025/11/protein-pack-1.jpeg",
    "sold_individually"=> 1, // enforce quantity = 1
    "other_info"       => [
        "payment_type"      => "subscription",
        "repeat_interval"   => "monthly",
        "installment"     => "no",
        "manage_setup_fee" => "yes",
         "signup_fee"       => 500
    ],
    "view_url"         => "https://www.abelandcole.co.uk/weekly-protein-pack?cid=9428"
];
```

### Payment Gateway Validation During Checkout

```php
$variation = (object)[
    "item_id"          => 1000,
    "object_id"        => 1000,
    "post_id"          => 10000,
    "quantity"         => 1,
    "is_custom"        => true,
    "post_title"       => "Air Max 1 running shoe",
    "title"            => "Version 1",
    "price"            => 2000,
    "unit_price"       => 2000,
    "line_total"       => 2000 * 1,
    "payment_type"     => "onetime",
    "fulfillment_type" => "digital",
    "featured_media"   => "http://wordpress.test/wp-content/uploads/2025/11/white-navy-athletic-shoe-4-1.jpeg",
    "sold_individually"=> 0,
    "other_info"       => [
        "payment_type" => "onetime"
    ],
    "view_url"         => "https://www.example.com/product/air-max-1-running-shoe"
];

$product = (object)[
    "ID"           => 148,
    "post_title"   => "Air Max 1 running shoe",
    "post_status"  => "publish",
];
```

---

## Key Properties Reference

### Item Object Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `item_id` | integer | Unique identifier for the custom item | `1000` |
| `object_id` | integer | Reference ID for the item | `1000` |
| `post_id` | integer | WordPress post ID reference | `5000` |
| `quantity` | integer | Item quantity | `1` |
| `is_custom` | boolean | Marks item as custom | `true` |
| `post_title` | string | Product title | `"Air Max 1 running shoe"` |
| `title` | string | Variation title | `"Version 1"` |
| `price` | float | Unit price | `2000` |
| `unit_price` | float | Unit price (same as price) | `2000` |
| `line_total` | float | Total price (price × quantity) | `2000` |
| `payment_type` | string | `onetime` or `subscription` | `"onetime"` |
| `fulfillment_type` | string | `digital` or `physical` | `"digital"` |
| `featured_media` | string | Media URL | `"http://..."` |
| `sold_individually` | integer | `0` for no, `1` for yes | `0` |
| `other_info` | array | Additional information | See below |

### other_info Properties for Subscriptions

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `payment_type` | string | Type of payment | `"subscription"` |
| `repeat_interval` | string | Billing frequency | `"monthly"` |
| `installment` | string | Installment plan | `"no"` |
| `manage_setup_fee` | string | Enable setup fee | `"yes"` |
| `signup_fee` | float | Setup fee amount | `500` |

---

## Best Practices

1. **Always Validate Data**: Use the validation hook to ensure item data is correct before adding to cart
2. **Handle Quantity Changes**: Implement quantity change handlers for one-time items
3. **Mark Custom Items**: Use `is_custom` flag to distinguish custom items from regular products
4. **Set Correct Payment Type**: Ensure `payment_type` is set correctly (`onetime` or `subscription`)
5. **Calculate Totals**: Always calculate `line_total` as `price × quantity`
6. **Use Sanitization**: Apply `sanitize_text_field()` and `absint()` for security
7. **Handle Admin Actions**: Implement order update handlers if admins will modify orders

---

## Related Documentation

- [Developer Hooks](/hooks/) - Complete hooks and filters reference
- [Products API](/api/products/) - Product management API
- [Orders API](/api/orders/) - Order management API
- [Database Models](/database/models/) - Data model documentation

---

**Next Steps:** Explore [Payment Methods Module](/modules/payment-methods) or return to [Modules Overview](/modules/)