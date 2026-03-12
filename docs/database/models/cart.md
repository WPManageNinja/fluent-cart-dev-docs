---
title: Cart Model
description: FluentCart Cart model documentation with attributes, scopes, relationships, and methods.
---

# Cart Model

| DB Table Name | {wp_db_prefix}_fct_carts               |
| ------------- | -------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-carts-table) |
| Source File   | fluent-cart/app/Models/Cart.php        |
| Name Space    | FluentCart\App\Models                   |
| Class         | FluentCart\App\Models\Cart              |

## Primary Key

The Cart model uses `cart_hash` (a string) as its primary key instead of the usual auto-incrementing `id`. The model sets `$incrementing = false` to reflect this. When creating a new Cart without providing a `cart_hash`, the `boot()` method auto-generates one using `md5('fct_global_cart_' . wp_generate_uuid4() . time())`.

## Traits

- **CanSearch** - Adds search scope capabilities to the model.

## Hidden Attributes

The following attributes are hidden from array/JSON serialization: `order_id`, `customer_id`, `user_id`.

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| cart_hash          | String    | Primary Key (non-incrementing) - Unique cart hash, auto-generated on creation |
| customer_id        | Integer   | Customer ID (nullable, hidden) |
| user_id            | Integer   | WordPress user ID (nullable, hidden) |
| order_id           | Integer   | Associated order ID (nullable, hidden) |
| checkout_data      | JSON      | Checkout data (auto JSON encoded/decoded via accessor/mutator) |
| cart_data          | JSON      | Cart items data (auto JSON encoded/decoded via accessor/mutator, loads bundle children on read) |
| utm_data           | JSON      | UTM tracking data (auto JSON encoded/decoded via accessor/mutator) |
| coupons            | JSON      | Applied coupon codes (auto JSON encoded/decoded via accessor/mutator) |
| first_name         | String    | Customer first name |
| last_name          | String    | Customer last name |
| email              | String    | Customer email |
| stage              | String    | Cart stage (e.g. `completed`) |
| cart_group         | String    | Cart group identifier |
| user_agent         | Text      | User agent string |
| ip_address         | String    | Customer IP address |
| completed_at       | Date Time | Completion timestamp |
| deleted_at         | Date Time | Soft delete timestamp |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');

$cart->cart_hash; // returns cart hash (primary key)
$cart->customer_id; // returns customer ID
$cart->cart_data; // returns decoded cart items array (with bundle children loaded)
$cart->checkout_data; // returns decoded checkout data array
$cart->coupons; // returns decoded coupon codes array
$cart->utm_data; // returns decoded UTM data array
```

## Methods

Along with Global Model methods, this model has the following helper methods.

### Attribute Accessors / Mutators

#### setCheckoutDataAttribute($settings)

Set checkout data with JSON encoding.

* Parameters: `$settings` (Array) - Checkout settings

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->checkout_data = ['shipping_method' => 'standard'];
```

#### getCheckoutDataAttribute($settings)

Get checkout data with JSON decoding. Returns an empty array if value is falsy or not valid JSON.

* Parameters: `$settings` (String) - Raw JSON settings from database
* Returns `Array` - Decoded checkout data

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$checkoutData = $cart->checkout_data; // returns array
```

#### setCouponsAttribute($coupons)

Set coupons with JSON encoding. Non-array values are reset to an empty array.

* Parameters: `$coupons` (Array) - Coupon codes

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->coupons = ['SAVE10', 'WELCOME20'];
```

#### getCouponsAttribute($coupons)

Get coupons with JSON decoding. Returns an empty array if value is falsy or not valid JSON.

* Parameters: `$coupons` (String) - Raw JSON coupons from database
* Returns `Array` - Decoded coupon codes

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$coupons = $cart->coupons; // returns array
```

#### setCartDataAttribute($settings)

Set cart data with JSON encoding. Also invalidates the internal static cache for this cart.

* Parameters: `$settings` (Array) - Cart item data

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->cart_data = [['product_id' => 1, 'quantity' => 2]];
```

#### getCartDataAttribute($data)

Get cart data with JSON decoding. Uses an internal static cache keyed by `cart_hash` for performance. Automatically loads bundle child items via `Helper::loadBundleChild()`.

* Parameters: `$data` (String) - Raw JSON data from database
* Returns `Array` - Decoded cart data with bundle children resolved

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cartData = $cart->cart_data; // returns array with bundle children loaded
```

#### setUtmDataAttribute($utmData)

Set UTM data with JSON encoding.

* Parameters: `$utmData` (Array) - UTM data

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->utm_data = ['utm_source' => 'google', 'utm_campaign' => 'summer'];
```

#### getUtmDataAttribute($utmData)

Get UTM data with JSON decoding. Returns an empty array if value is falsy.

* Parameters: `$utmData` (String) - Raw JSON UTM data from database
* Returns `Array` - Decoded UTM data

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$utmData = $cart->utm_data; // returns array
```

### Cart State Methods

#### isLocked()

Check if cart is locked. A cart is locked when `checkout_data.is_locked` is `'yes'` AND the cart has an associated `order_id`.

* Returns `Boolean` - True if cart is locked

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$isLocked = $cart->isLocked();
```

#### isZeroPayment()

Check if the cart has a zero payment amount and does not contain subscription items. Useful for determining if payment processing can be skipped.

* Returns `Boolean` - True if estimated total is zero and no subscription items exist

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
if ($cart->isZeroPayment()) {
    // No payment processing needed
}
```

#### isShipToDifferent()

Check if the customer has opted to ship to a different address than the billing address.

* Returns `Boolean` - True if `checkout_data.form_data.ship_to_different` is `'yes'`

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
if ($cart->isShipToDifferent()) {
    // Use separate shipping address
}
```

#### hasSubscription()

Check if cart contains any subscription items by inspecting `other_info.payment_type` in each cart data item.

* Returns `Boolean` - True if any item has a `subscription` payment type

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$hasSubscription = $cart->hasSubscription();
```

#### requireShipping()

Check if cart requires shipping by inspecting `fulfillment_type` in each cart data item.

* Returns `Boolean` - True if any item has a `physical` fulfillment type

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$requiresShipping = $cart->requireShipping();
```

### Cart Item Methods

#### addItem($item = [], $replacingIndex = null)

Add an item to the cart. If the cart is locked, returns a `WP_Error`. If `$replacingIndex` is provided and exists, replaces that item; otherwise appends the item. Saves the cart, re-validates coupons, and fires `fluent_cart/cart/item_added` and `fluent_cart/cart/cart_data_items_updated` actions.

* Parameters:
  - `$item` (Array) - Cart item data
  - `$replacingIndex` (Integer|null) - Index of existing item to replace
* Returns `FluentCart\App\Models\Cart|WP_Error` - Cart instance or error if locked

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->addItem(['product_id' => 1, 'quantity' => 2]);
```

#### removeItem($variationId, $extraArgs = [], $triggerEvent = true)

Remove an item from the cart by variation ID. Uses `findExistingItemAndIndex()` to locate the item. If the cart is locked, returns a `WP_Error`. When `$triggerEvent` is true, re-validates coupons and fires `fluent_cart/cart/item_removed`; otherwise fires `fluent_cart/checkout/cart_amount_updated`. Always fires `fluent_cart/cart/cart_data_items_updated`.

* Parameters:
  - `$variationId` (Integer) - Variation/object ID to remove
  - `$extraArgs` (Array) - Additional matching arguments for identifying the item
  - `$triggerEvent` (Boolean) - Whether to trigger item_removed event (default: true)
* Returns `FluentCart\App\Models\Cart|WP_Error` - Cart instance or error if locked

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->removeItem(1, [], true);
```

#### addByVariation(ProductVariation $variation, $config = [])

Add a product variation to the cart with full business logic. Handles quantity adjustments, existing item replacement, promotional price locking, stock validation, and purchase eligibility checks via `canPurchase()`. Uses `CartHelper::generateCartItemFromVariation()` to build the cart item. If quantity is 0, removes the item instead.

* Parameters:
  - `$variation` (ProductVariation) - Product variation model instance
  - `$config` (Array) - Configuration options:
    - `quantity` (int) - Desired quantity (default: 1; 0 removes the item)
    - `by_input` (bool) - If true, sets quantity directly instead of incrementing
    - `will_validate` (bool) - If true, runs stock/purchase validation
    - `replace` (bool) - If true, removes existing item before adding
    - `remove_args` (array) - Extra args for matching when removing
    - `matched_args` (array) - Extra args for matching existing items
    - `other_info` (array) - Additional info merged into item's `other_info`
* Returns `FluentCart\App\Models\Cart|WP_Error` - Cart instance or error

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$variation = FluentCart\App\Models\ProductVariation::find(1);
$cart->addByVariation($variation, ['quantity' => 2, 'will_validate' => true]);
```

#### addByCustom(array $variation, array $config = [])

Add a custom (non-standard) item to the cart. Normalizes the item via `CartHelper::normalizeCustomFields()`, validates required fields (`id`, `object_id`, `post_id`, `post_title`, `price`, `unit_price`, `payment_type`), and rejects subscription items (which must use direct checkout). Uses `CartHelper::generateCartItemCustomItem()` to build the cart item.

* Parameters:
  - `$variation` (Array) - Custom item data with required fields
  - `$config` (Array) - Configuration options:
    - `quantity` (int) - Desired quantity (default: 1; 0 removes the item)
    - `remove_args` (array) - Extra args for matching when removing
    - `matched_args` (array) - Extra args for matching existing items
* Returns `FluentCart\App\Models\Cart|WP_Error` - Cart instance or error

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->addByCustom([
    'id' => 100,
    'object_id' => 100,
    'post_id' => 50,
    'post_title' => 'Custom Item',
    'price' => 1500,
    'unit_price' => 1500,
    'payment_type' => 'one_time',
], ['quantity' => 1]);
```

#### findExistingItemAndIndex($objectId, $extraArgs = [])

Find an existing cart item and its index by `object_id`. Optionally matches additional arguments against the item using dot-notation keys.

* Parameters:
  - `$objectId` (Integer) - The object ID to search for
  - `$extraArgs` (Array) - Additional key-value pairs to match against the item
* Returns `Array|null` - `[$index, $item]` tuple if found, or null

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$result = $cart->findExistingItemAndIndex(100, ['other_info.color' => 'red']);
if ($result) {
    [$index, $item] = $result;
}
```

### Coupon Methods

#### applyCoupon($codes = [])

Apply coupon codes to the cart. If the cart is locked, returns a `WP_Error`. Creates a `DiscountService` instance to calculate discounts, updates `cart_data`, `coupons`, and `checkout_data.__per_coupon_discounts`, then saves. Fires `fluent_cart/checkout/cart_amount_updated` and `fluent_cart/cart/cart_data_items_updated` actions.

* Parameters: `$codes` (Array) - Coupon codes to apply
* Returns `Mixed` - Discount service result or `WP_Error` if locked/invalid

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$result = $cart->applyCoupon(['SAVE10', 'WELCOME20']);
```

#### removeCoupon($removeCodes = [])

Remove specific coupon codes from the cart. Accepts a single code string or an array. Re-validates remaining coupons via `DiscountService` and updates `cart_data`, `coupons`, and `checkout_data.__per_coupon_discounts`. If the cart is locked, returns a `WP_Error`.

* Parameters: `$removeCodes` (Array|String) - Coupon code(s) to remove
* Returns `FluentCart\App\Models\Cart|WP_Error` - Cart instance or error if locked

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->removeCoupon(['SAVE10']);
```

#### reValidateCoupons()

Re-validate all currently applied coupons against the current cart state. Recalculates discounts via `DiscountService`, updates `cart_data`, `coupons`, and `checkout_data.__per_coupon_discounts`. Fires `fluent_cart/checkout/cart_amount_updated` and conditionally fires `fluent_cart/cart/cart_data_items_updated` if discount totals changed.

* Returns `FluentCart\App\Models\Cart|WP_Error` - Cart instance or error if locked

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$cart->reValidateCoupons();
```

#### getDiscountLines($revalidate = false)

Get formatted discount line items for all applied coupons. Each line includes coupon ID, code, type, discount amount, formatted price HTML, and formatted title. When only one coupon is applied, sums `coupon_discount` from each cart item. When multiple coupons are applied, reads per-coupon breakdowns from `checkout_data.__per_coupon_discounts`.

* Parameters: `$revalidate` (Boolean) - If true, re-applies coupons before calculating (default: false)
* Returns `Array` - Associative array keyed by coupon code, each containing `id`, `code`, `type`, `discount`, `formatted_discount`, `actual_formatted_discount`, `formatted_title`

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$discountLines = $cart->getDiscountLines();
// Example output:
// ['SAVE10' => ['id' => 1, 'code' => 'SAVE10', 'discount' => 500, ...]]
```

### Totals & Calculation Methods

#### getShippingTotal()

Get the shipping total for the cart. Returns 0 if the cart does not require shipping.

* Returns `Integer` - Shipping total in cents

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$shippingTotal = $cart->getShippingTotal();
```

#### getItemsSubtotal()

Get the items subtotal (before discounts) by combining one-time and subscription items via `CheckoutService` and `OrderService::getItemsAmountWithoutDiscount()`.

* Returns `Integer` - Items subtotal in cents

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$subtotal = $cart->getItemsSubtotal();
```

#### getEstimatedTotal($extraAmount = 0)

Get the estimated cart total including item totals, shipping, and custom checkout adjustments. Combines one-time and subscription items via `CheckoutService`, calculates item totals via `OrderService::getItemsAmountTotal()`, adds shipping charges, handles custom checkout shipping amounts, and ensures the total is never negative. Applies the `fluent_cart/cart/estimated_total` filter.

* Parameters: `$extraAmount` (Integer) - Extra amount in cents to include (default: 0)
* Returns `Integer` - Estimated total in cents (minimum 0)

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$total = $cart->getEstimatedTotal(1000); // $10.00 extra
```

#### getEstimatedRecurringTotal()

Get the estimated recurring total for subscription items only. Sums each subscription item's `subtotal` minus its `recurring_discounts.amount`.

* Returns `Integer` - Estimated recurring total in cents

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$recurringTotal = $cart->getEstimatedRecurringTotal();
```

### Address Methods

#### getBillingAddress()

Get the billing address from checkout form data.

* Returns `Array` - Associative array with keys: `full_name`, `company`, `address_1`, `address_2`, `city`, `state`, `postcode`, `country`

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$billing = $cart->getBillingAddress();
// ['full_name' => 'John Doe', 'company' => '', 'address_1' => '123 Main St', ...]
```

#### getShippingAddress()

Get the shipping address. If the customer opted to ship to a different address (`isShipToDifferent()`), returns the separate shipping address fields from form data. Otherwise, falls back to `getBillingAddress()`.

* Returns `Array` - Associative array with keys: `full_name`, `company`, `address_1`, `address_2`, `city`, `state`, `postcode`, `country`

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$shipping = $cart->getShippingAddress();
```

### Customer Methods

#### guessCustomer()

Attempt to find the associated customer by checking (in order): `customer_id`, `user_id`, then `email`. Returns the first matching `Customer` model found, or null if none match.

* Returns `FluentCart\App\Models\Customer|null` - Customer instance or null

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$customer = $cart->guessCustomer();
```

### Action Hook Helper Methods

#### addDraftCreatedActions($hooks)

Build a response array for actions to execute after a draft order is created. Deduplicates the hooks array.

* Parameters: `$hooks` (Array) - Hook identifiers
* Returns `Array` - `['__after_draft_created_actions__' => [...]]`

#### addSuccessActions($hooks)

Build a response array for actions to execute on successful checkout. Deduplicates the hooks array.

* Parameters: `$hooks` (Array) - Hook identifiers
* Returns `Array` - `['__on_success_actions__' => [...]]`

#### addCartNotices($notices)

Build a response array for cart notices to display. Deduplicates by notice `id`.

* Parameters: `$notices` (Array) - Array of notice arrays, each with an `id` key
* Returns `Array` - `['__cart_notices' => [...]]`

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$actions = $cart->addSuccessActions(['redirect_to_thank_you', 'clear_cart']);
$notices = $cart->addCartNotices([
    ['id' => 'stock_warning', 'message' => 'Limited stock remaining']
]);
```

## Relations

This model has the following relationships that you can use.

### customer

Access the associated customer (BelongsTo).

* Returns `FluentCart\App\Models\Customer`
* Foreign Key: `customer_id`

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$customer = $cart->customer;
```

### order

Access the associated order (BelongsTo).

* Returns `FluentCart\App\Models\Order`
* Foreign Key: `order_id`

```php
$cart = FluentCart\App\Models\Cart::find('cart_hash_123');
$order = $cart->order;
```

## Scopes

This model has the following scopes that you can use.

### stageNotCompleted()

Get carts where the `stage` column is not `completed`.

```php
$carts = FluentCart\App\Models\Cart::stageNotCompleted()->get();
```

## Usage Examples

### Creating a Cart

The `cart_hash` is auto-generated if not provided:

```php
use FluentCart\App\Models\Cart;

// Auto-generated cart_hash
$cart = Cart::create([
    'customer_id' => 1,
    'email' => 'customer@example.com',
]);

// Or with explicit cart_hash
$cart = Cart::create([
    'cart_hash' => 'unique_cart_hash_123',
    'customer_id' => 1,
    'email' => 'customer@example.com',
]);
```

### Retrieving Carts

```php
// Get cart by hash (primary key)
$cart = Cart::find('cart_hash_123');

// Get carts that are not completed
$carts = Cart::stageNotCompleted()->get();

// Get cart with customer eager-loaded
$cart = Cart::with('customer')->find('cart_hash_123');
```

### Working with Cart Items

```php
$cart = Cart::find('cart_hash_123');

// Add by variation with validation
$variation = \FluentCart\App\Models\ProductVariation::find(1);
$cart->addByVariation($variation, [
    'quantity' => 2,
    'will_validate' => true,
]);

// Remove an item
$cart->removeItem($variation->id);

// Check totals
$subtotal = $cart->getItemsSubtotal();
$total = $cart->getEstimatedTotal();
$recurringTotal = $cart->getEstimatedRecurringTotal();
```

### Working with Coupons

```php
$cart = Cart::find('cart_hash_123');

// Apply coupons
$result = $cart->applyCoupon(['SAVE10']);

// Get discount lines for display
$discountLines = $cart->getDiscountLines();

// Remove a coupon
$cart->removeCoupon(['SAVE10']);
```

### Updating a Cart

```php
$cart = Cart::find('cart_hash_123');
$cart->email = 'newemail@example.com';
$cart->save();
```

### Deleting a Cart

```php
$cart = Cart::find('cart_hash_123');
$cart->delete(); // Soft delete
```

---
