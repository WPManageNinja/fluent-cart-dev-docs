---
title: Order Model
description: FluentCart Order model documentation with attributes, scopes, relationships, and methods.
---

# Order Model

| DB Table Name | {wp_db_prefix}_fct_orders               |
| ------------- | --------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-orders-table) |
| Source File   | fluent-cart/app/Models/Order.php        |
| Name Space    | FluentCart\App\Models                    |
| Class         | FluentCart\App\Models\Order              |

## Traits

`CanSearch`, `HasActivity` and `CanUpdateBatch`. `HasActivity` supplies the `activities`
relation; `CanSearch` supplies the search scopes; `CanUpdateBatch` supplies
`Order::batchUpdate()`.

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| status             | String    | Order status (draft, pending, processing, completed, etc.) |
| parent_id          | Integer   | Parent order ID (for renewals/child orders) |
| receipt_number     | Integer   | Receipt number |
| invoice_no         | String    | Invoice number |
| fulfillment_type   | String    | Fulfillment type (physical, digital) |
| type               | String    | Order type (subscription, renewal, etc.) |
| mode               | String    | Order mode (live, test) |
| shipping_status    | String    | Shipping status |
| customer_id        | Integer   | Customer ID (cast to integer) |
| payment_method     | String    | Payment method |
| payment_status     | String    | Payment status |
| payment_method_title | String | Payment method title |
| currency           | String    | Currency code |
| fee_total          | Double    | Surcharges on the order, in cents (cast to double) |
| rate               | Decimal   | DECIMAL(24,12) base-to-presentment exchange rate, frozen at order time |
| tax_behavior       | Integer   | Cast to integer |
| subtotal           | Integer   | Subtotal in cents (cast to double) |
| discount_tax       | Integer   | Discount tax in cents (cast to double) |
| manual_discount_total | Integer | Manual discount total in cents (cast to double) |
| coupon_discount_total | Integer | Coupon discount total in cents (cast to double) |
| shipping_tax       | Integer   | Shipping tax in cents (cast to double) |
| shipping_total     | Integer   | Shipping total in cents (cast to double) |
| tax_total          | Integer   | Tax total in cents (cast to double) |
| total_amount       | Integer   | Total amount in cents (cast to double) |
| total_paid         | Integer   | Total paid in cents |
| total_refund       | Integer   | Total refund in cents |
| rate               | Decimal   | Exchange rate |
| tax_behavior       | Integer   | Tax behavior (0=no_tax, 1=exclusive, 2=inclusive) |
| note               | Text      | Order notes |
| ip_address         | Text      | Customer IP address |
| completed_at       | Date Time | Completion timestamp |
| refunded_at        | Date Time | Refund timestamp |
| uuid               | String    | Unique identifier |
| config             | JSON      | Order configuration (auto-encoded/decoded via accessor/mutator) |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$order = FluentCart\App\Models\Order::find(1);

$order->id; // returns order ID
$order->status; // returns order status
$order->total_amount; // returns total amount in cents
$order->currency; // returns currency code
$order->customer_id; // returns customer ID
```

## Methods

Along with Global Model methods, this model has few helper methods.

### updateStatus($key, $newStatus)

Set the given status column and save. Returns early without saving when the value has not
changed. Stamps `completed_at` when `status` becomes `completed`, and `refunded_at` when
`payment_status` becomes `refunded`. It fires no hooks — use `StatusHelper` when listeners
should run.

* Parameters: `$key` (String) - the status column, `status` or `payment_status`,
  `$newStatus` (String) - New status
* Returns `FluentCart\App\Models\Order` - the order instance

```php
$order = FluentCart\App\Models\Order::find(1);
$order->updateStatus('status', 'completed');
```

### updatePaymentStatus($newStatus)

Update payment status

* Parameters: `$newStatus` (String) - New payment status
* Returns `FluentCart\App\Models\Order` - Updated order instance

```php
$order = FluentCart\App\Models\Order::find(1);
$order->updatePaymentStatus('paid');
```

### getMeta($metaKey, $defaultValue = false)

Get order meta value

* Parameters: `$metaKey` (String) - Meta key, `$defaultValue` (Mixed) - Default value
* Returns `Mixed` - Meta value or default

```php
$order = FluentCart\App\Models\Order::find(1);
$metaValue = $order->getMeta('custom_field', 'default');
```

### updateMeta($metaKey, $value)

Update order meta value

* Parameters: `$metaKey` (String) - Meta key, `$value` (Mixed) - Meta value
* Returns `FluentCart\App\Models\OrderMeta` - Meta instance

```php
$order = FluentCart\App\Models\Order::find(1);
$meta = $order->updateMeta('custom_field', 'new_value');
```

### deleteMeta($metaKey)

Delete order meta

* Parameters: `$metaKey` (String) - Meta key
* Returns `Boolean` - True if deleted

```php
$order = FluentCart\App\Models\Order::find(1);
$deleted = $order->deleteMeta('custom_field');
```

### getTotalPaidAmount()

Get total paid amount from succeeded transactions

* Returns `Integer` - Total paid amount in cents

```php
$order = FluentCart\App\Models\Order::find(1);
$totalPaid = $order->getTotalPaidAmount();
```

### getTotalRefundAmount()

Get total refund amount from refunded transactions

* Returns `Integer` - Total refund amount in cents

```php
$order = FluentCart\App\Models\Order::find(1);
$totalRefund = $order->getTotalRefundAmount();
```

### recountTotalPaidAndRefund()

Recount total paid and refund amounts. Updates `total_refund` and sets `payment_status` to refunded or partially refunded as appropriate.

* Returns `FluentCart\App\Models\Order` - Updated order instance

```php
$order = FluentCart\App\Models\Order::find(1);
$order->recountTotalPaidAndRefund();
```

### syncOrderAfterRefund($type, $refundedAmount)

Sync order after refund

* Parameters: `$type` (String) - Refund type ('full' or 'partial'), `$refundedAmount` (Integer) - Refund amount
* Returns `FluentCart\App\Models\Order` - Updated order instance

```php
$order = FluentCart\App\Models\Order::find(1);
$order->syncOrderAfterRefund('full', 1000);
```

### updateRefundedItems($refundedItemIds, $refundedAmount)

Update refunded items. Distributes refund amount proportionally across the specified order items.

* Parameters: `$refundedItemIds` (Array) - Order item IDs, `$refundedAmount` (Integer) - Refund amount

```php
$order = FluentCart\App\Models\Order::find(1);
$order->updateRefundedItems([1, 2, 3], 1000);
```

### recountTotalPaid()

Recount total paid amount (paid minus refunded)

* Returns `FluentCart\App\Models\Order` - Updated order instance

```php
$order = FluentCart\App\Models\Order::find(1);
$order->recountTotalPaid();
```

### getLatestTransactionAttribute()

Get latest non-refund transaction (accessor, accessed as `latest_transaction` attribute)

* Returns `FluentCart\App\Models\OrderTransaction|null` - Latest transaction

```php
$order = FluentCart\App\Models\Order::find(1);
$transaction = $order->latest_transaction;
```

### isSubscription()

Check if order is subscription

* Returns `Boolean` - True if order has subscription items

```php
$order = FluentCart\App\Models\Order::find(1);
$isSubscription = $order->isSubscription();
```

### getViewUrl($type = 'customer')

Get order view URL

* Parameters: `$type` (String) - View type ('customer' or 'admin')
* Returns `String` - View URL

```php
$order = FluentCart\App\Models\Order::find(1);
$viewUrl = $order->getViewUrl('admin');
```

### getLatestTransaction()

Get latest non-refund transaction (method call, unlike the accessor attribute)

* Returns `FluentCart\App\Models\OrderTransaction|null` - Latest transaction

```php
$order = FluentCart\App\Models\Order::find(1);
$transaction = $order->getLatestTransaction();
```

### currentSubscription()

Get current active subscription for this order

* Returns `FluentCart\App\Models\Subscription|null` - Current active subscription

```php
$order = FluentCart\App\Models\Order::find(1);
$subscription = $order->currentSubscription();
```

### getDownloads($scope = 'email')

Get order downloads. Returns downloadable files associated with the order items, filtered by product variation authorization.

* Parameters: `$scope` (String) - Download scope
* Returns `Array` - Download data

```php
$order = FluentCart\App\Models\Order::find(1);
$downloads = $order->getDownloads('email');
```

### getLicenses($with = ['product', 'productVariant'])

Get order licenses (requires Pro and active license module)

* Parameters: `$with` (Array) - Relationships to eager load (default: `['product', 'productVariant']`)
* Returns `Illuminate\Database\Eloquent\Collection|null` - Licenses collection or null if module inactive

```php
$order = FluentCart\App\Models\Order::find(1);
$licenses = $order->getLicenses(['product', 'productVariant']);
```

### getDownloadsById($orderId)

Get downloads for a specific order by ID

* Parameters: `$orderId` (Integer) - Order ID
* Returns `Array` - Download data

```php
$order = FluentCart\App\Models\Order::find(1);
$downloads = $order->getDownloadsById(42);
```

### getReceiptViewUrl() and getReceiptDownloadUrl()

Build the customer-facing receipt links — one to view the receipt in the browser, one to
download it.

* Returns `String`

```php
$order = FluentCart\App\Models\Order::find(1);

$view     = $order->getReceiptViewUrl();
$download = $order->getReceiptDownloadUrl();
```

### addLog($title, $description = '', $type = 'info', $by = '')

Add order log

* Parameters: `$title` (String) - Log title, `$description` (String) - Description, `$type` (String) - Log type, `$by` (String) - Created by

```php
$order = FluentCart\App\Models\Order::find(1);
$order->addLog('Status Updated', 'Order status changed to completed', 'info', 'admin');
```

### canBeRefunded()

Check if order can be refunded. Returns false if the order has been upgraded to another order.

* Returns `Boolean` - True if order can be refunded

```php
$order = FluentCart\App\Models\Order::find(1);
$canBeRefunded = $order->canBeRefunded();
```

### generateReceiptNumber()

Claims the next receipt number atomically, so concurrent requests cannot take the same
one. A losing request discards its candidate, which means the sequence can contain gaps.
Fires `fluent_cart/order/invoice_number_added` once a number is assigned.

Generate receipt number and invoice number if not already set

* Returns `FluentCart\App\Models\Order` - Updated order instance

```php
$order = FluentCart\App\Models\Order::find(1);
$order->generateReceiptNumber();
```

### canBeDeleted()

Check if order can be deleted. Test-mode orders can always be deleted. For live orders:

- the status must be `canceled` or `on-hold`, otherwise a `WP_Error` names the status
- a successfully-paid order is blocked unless its `total_amount` is `0`, so free and
  unpaid cancelled orders delete but a paid one does not
- an order of `type = 'subscription'` is blocked while a subscription on its
  `parent_order_id` is still `active`

The result passes through the `fluent_cart/order_can_be_deleted` filter, so an
integration can relax or tighten any of it.

* Returns `Boolean|WP_Error` - True if order can be deleted, or WP_Error with reason

```php
$order = FluentCart\App\Models\Order::find(1);
$canBeDeleted = $order->canBeDeleted();
if (is_wp_error($canBeDeleted)) {
    echo $canBeDeleted->get_error_message();
}
```

### Items and fees

| Method | Returns |
|---|---|
| `getProductItems()` | the order's product line items, excluding fee lines |
| `getAppliedFees()` | applied fees as a plain array, for display |

Fee lines are `order_items` rows with `payment_type = 'fee'`, also reachable as the
`feeItems` relation.

### Review links

| Method | Returns |
|---|---|
| `getOrderReviewUrl()` | the review link for this order |
| `Order::reviewUrlForHash($hash)` | the same link built from an order hash, for email and webhook contexts where no order instance is loaded |

### Tax and B2B

Thirteen helpers read the order's frozen tax snapshot rather than recomputing it:

| Method | Returns |
|---|---|
| `getBusinessInfo()` | the buyer's business details |
| `getStoreBusinessInfo()` | five seller fields from the order's `store_business_info` meta snapshot, each falling back to live store settings |
| `isB2BOrder()` | whether the order was placed as a business |
| `getPrimaryOrderTaxRate()` | the main tax rate applied |
| `getReversedTaxTotal()` | tax reversed under a reverse charge |
| `isReverseChargeTaxOrder()` | whether reverse charge applied |
| `getOrderRcMode()` | the reverse-charge mode |
| `getDisplayTaxLines()` | tax lines for display |
| `getDisplayShippingTaxLines()` | shipping tax lines for display |
| `getCustomerTaxNumber()` | the buyer's tax number |
| `hasValidatedCustomerTaxNumber()` | whether that number was validated |
| `getCustomerTaxName()` | the label for the buyer's tax number in their country |
| `getMoRVatRemovedAmount()` | VAT removed under a merchant-of-record arrangement |
| `netAmount()` | the order total net of tax |

### generateOrderUuid()

Static. Produces the order's public `uuid`, and runs on the `creating` event, so a new
order gets one without the caller doing anything.

## Relations

This model has the following relationships that you can use

### parentOrder

Access the parent order.

*   Returns `FluentCart\App\Models\Order`

```php
$order = FluentCart\App\Models\Order::find(1);
$parentOrder = $order->parentOrder;
```

### children

Access the child orders.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\Order`

```php
$order = FluentCart\App\Models\Order::find(1);
$children = $order->children;
```

### transactions

Access the order transactions.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\OrderTransaction`

```php
$order = FluentCart\App\Models\Order::find(1);
$transactions = $order->transactions;
```

### subscriptions

Access the order subscriptions.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\Subscription`

```php
$order = FluentCart\App\Models\Order::find(1);
$subscriptions = $order->subscriptions;
```

### order_items

Access the order items.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\OrderItem`

```php
$order = FluentCart\App\Models\Order::find(1);
$items = $order->order_items;
```

### filteredOrderItems

Access the filtered order items based on priority rules for payment_type (onetime > subscription > adjustment).

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\OrderItem`

```php
$order = FluentCart\App\Models\Order::find(1);
$filteredItems = $order->filteredOrderItems;
```

### customer

Access the customer.

*   Returns `FluentCart\App\Models\Customer`

```php
$order = FluentCart\App\Models\Order::find(1);
$customer = $order->customer;
```

### orderMeta

Access the order metadata.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\OrderMeta`

```php
$order = FluentCart\App\Models\Order::find(1);
$meta = $order->orderMeta;
```

### orderTaxRates

Access the order tax rates.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\OrderTaxRate`

```php
$order = FluentCart\App\Models\Order::find(1);
$taxRates = $order->orderTaxRates;
```

### appliedCoupons

Access the applied coupons.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\AppliedCoupon`

```php
$order = FluentCart\App\Models\Order::find(1);
$appliedCoupons = $order->appliedCoupons;
```

### usedCoupons

Access the used coupons (through the applied coupons intermediate table).

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\Coupon`

```php
$order = FluentCart\App\Models\Order::find(1);
$usedCoupons = $order->usedCoupons;
```

### shipping_address

Access the shipping address.

*   Returns `FluentCart\App\Models\OrderAddress`

```php
$order = FluentCart\App\Models\Order::find(1);
$address = $order->shipping_address;
```

### billing_address

Access the billing address.

*   Returns `FluentCart\App\Models\OrderAddress`

```php
$order = FluentCart\App\Models\Order::find(1);
$address = $order->billing_address;
```

### order_addresses

Access the order addresses.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\OrderAddress`

```php
$order = FluentCart\App\Models\Order::find(1);
$addresses = $order->order_addresses;
```

### licenses

Access the order licenses.

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCartPro\App\Modules\Licensing\Models\License`

```php
$order = FluentCart\App\Models\Order::find(1);
$licenses = $order->licenses;
```

### labels

Access the order labels (morph many relationship).

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\LabelRelationship`

```php
$order = FluentCart\App\Models\Order::find(1);
$labels = $order->labels;
```

### renewals

Access the order renewals (child orders of type 'renewal', excluding canceled, failed, and on-hold).

*   Returns `Illuminate\Database\Eloquent\Collection` of `FluentCart\App\Models\Order`

```php
$order = FluentCart\App\Models\Order::find(1);
$renewals = $order->renewals;
```

### orderOperation

Access the order operation record.

*   Returns `FluentCart\App\Models\OrderOperation`

```php
$order = FluentCart\App\Models\Order::find(1);
$operation = $order->orderOperation;
```

## Scopes

This model has the following scopes that you can use

### searchBy($search)

Search orders by query. Searches across order ID, status, total amount, payment status, payment method, invoice number, order item titles, and customer name/email.

* Parameters: `$search` (String) - Search query

```php
$orders = FluentCart\App\Models\Order::searchBy('john')->get();
```

### ofPaymentStatus($status)

Get orders by payment status

* Parameters: `$status` (String) - Payment status

```php
$orders = FluentCart\App\Models\Order::ofPaymentStatus('paid')->get();
```

### ofOrderStatus($status)

Get orders by order status

* Parameters: `$status` (String) - Order status

```php
$orders = FluentCart\App\Models\Order::ofOrderStatus('completed')->get();
```

### ofShippingStatus($status)

Get orders by shipping status

* Parameters: `$status` (String) - Shipping status

```php
$orders = FluentCart\App\Models\Order::ofShippingStatus('shipped')->get();
```

### ofOrderType($type)

Get orders by order type

* Parameters: `$type` (String) - Order type

```php
$orders = FluentCart\App\Models\Order::ofOrderType('payment')->get();
```

### ofPaymentMethod($methodName)

Get orders by payment method

* Parameters: `$methodName` (String) - Payment method name

```php
$orders = FluentCart\App\Models\Order::ofPaymentMethod('stripe')->get();
```

### applyCustomFilters($filters)

Apply custom filters

* Parameters: `$filters` (Array) - Filter array

```php
$orders = FluentCart\App\Models\Order::applyCustomFilters([
    'status' => ['value' => ['completed', 'processing']]
])->get();
```

## Usage Examples

### Creating an Order

```php
use FluentCart\App\Models\Order;

$order = Order::create([
    'customer_id' => 1,
    'status' => 'pending',
    'payment_method' => 'stripe',
    'currency' => 'USD',
    'total_amount' => 9999 // $99.99 in cents
]);
```

### Retrieving Orders

```php
// Get orders by payment status
$orders = Order::ofPaymentStatus('paid')->get();

// Get order by ID
$order = Order::find(1);

// Get order with items and customer
$order = Order::with(['order_items', 'customer'])->find(1);
```

### Updating an Order

```php
$order = Order::find(1);
$order->status = 'completed';
$order->completed_at = now();
$order->save();
```

### Deleting an Order

```php
$order = Order::find(1);
$order->delete();
```

---