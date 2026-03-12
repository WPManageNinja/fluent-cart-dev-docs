---
title: Order Transaction Model
description: FluentCart OrderTransaction model documentation with attributes, scopes, relationships, and methods.
---

# Order Transaction Model

| DB Table Name | {wp_db_prefix}_fct_order_transactions        |
| ------------- | -------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-order-transactions-table) |
| Source File   | fluent-cart/app/Models/OrderTransaction.php |
| Name Space    | FluentCart\App\Models                        |
| Class         | FluentCart\App\Models\OrderTransaction       |

## Traits

- **CanSearch** (`FluentCart\App\Models\Concerns\CanSearch`) -- Provides `search`, `groupSearch`, `whereLike`, `whereBeginsWith`, and `whereEndsWith` scopes for flexible querying.

## Appends

The model automatically appends the following computed attributes to its array/JSON output:

- `url` -- Transaction URL generated via the `getUrlAttribute` accessor

## Boot

On the `creating` event the model auto-generates a `uuid` when one is not already set:

```php
$model->uuid = md5(time() . wp_generate_uuid4());
```

## Searchable Fields

The following columns are searchable via the `CanSearch` trait:

`id`, `total`, `status`, `payment_method`, `currency`, `created_at`, `updated_at`

## Attributes

| Attribute           | Data Type | Comment |
| ------------------- | --------- | ------- |
| id                  | Integer   | Primary Key |
| order_id            | Integer   | Reference to order |
| order_type          | String    | Order type (onetime, subscription, signup_fee) |
| vendor_charge_id    | String    | Payment gateway transaction ID |
| payment_method      | String    | Payment method key |
| payment_mode        | String    | Payment mode (live, test) |
| payment_method_type | String    | Payment method type (card, bank, etc.) |
| currency            | String    | Transaction currency |
| transaction_type    | String    | Transaction type (charge, refund, partial_refund, dispute) |
| subscription_id     | Integer   | Reference to subscription (if applicable) |
| card_last_4         | String    | Last 4 digits of card |
| card_brand          | String    | Card brand (visa, mastercard, etc.) |
| status              | String    | Transaction status |
| total               | Bigint    | Transaction amount in cents |
| rate                | Bigint    | Exchange rate |
| meta                | JSON      | Additional transaction data (stored as JSON, accessed as array via accessor/mutator) |
| uuid                | String    | Unique transaction identifier (auto-generated on create) |
| created_at          | Date Time | Creation timestamp |
| updated_at          | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$transaction = FluentCart\App\Models\OrderTransaction::find(1);

$transaction->id; // returns id
$transaction->order_id; // returns order ID
$transaction->total; // returns total amount in cents
$transaction->status; // returns status
$transaction->payment_method; // returns payment method
$transaction->meta; // returns array (auto-decoded from JSON)
$transaction->url; // returns computed transaction URL (appended attribute)
```

## Scopes

This model has the following scopes that you can use

### ofStatus($status)

Filter transactions by status

* Parameters
   * $status - string

#### Usage:

```php
// Get all successful transactions
$transactions = FluentCart\App\Models\OrderTransaction::ofStatus('succeeded')->get();
```

### ofPaymentMethod($methodName)

Filter transactions by payment method

* Parameters
   * $methodName - string

#### Usage:

```php
// Get all Stripe transactions
$transactions = FluentCart\App\Models\OrderTransaction::ofPaymentMethod('stripe')->get();
```

### searchByPayerEmail($data)

Filter transactions by the payer email address stored in the `meta` JSON column at `$.payer.email_address`. Supports multiple operators.

* Parameters
   * $data - array with keys:
      * `value` (string) - The email or partial email to search for
      * `operator` (string, optional) - One of `contains` (default), `starts_with`, `ends_with`, `equals`, `not_like`

#### Usage:

```php
// Find transactions where payer email contains "example.com"
$transactions = FluentCart\App\Models\OrderTransaction::searchByPayerEmail([
    'value'    => 'example.com',
    'operator' => 'contains',
])->get();

// Find transactions where payer email starts with "john"
$transactions = FluentCart\App\Models\OrderTransaction::searchByPayerEmail([
    'value'    => 'john',
    'operator' => 'starts_with',
])->get();

// Find transactions where payer email exactly matches
$transactions = FluentCart\App\Models\OrderTransaction::searchByPayerEmail([
    'value'    => 'john@example.com',
    'operator' => 'equals',
])->get();
```

## Relations

This model has the following relationships that you can use

### order

Access the associated order (belongsTo)

* return `FluentCart\App\Models\Order` Model

#### Example:

```php
// Accessing Order
$order = $transaction->order;

// For Filtering by order relationship
$transactions = FluentCart\App\Models\OrderTransaction::whereHas('order', function($query) {
    $query->where('status', 'completed');
})->get();
```

### orders

Access the associated order via hasOne (alternative to `order` relationship)

* return `FluentCart\App\Models\Order` Model (HasOne)

#### Example:

```php
// Accessing Order via hasOne
$order = $transaction->orders;
```

### subscription

Access the associated subscription (hasOne)

* return `FluentCart\App\Models\Subscription` Model

#### Example:

```php
// Accessing Subscription
$subscription = $transaction->subscription;

// For Filtering by subscription relationship
$transactions = FluentCart\App\Models\OrderTransaction::whereHas('subscription', function($query) {
    $query->where('status', 'active');
})->get();
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getMetaAttribute($value)

Get meta as array (accessor). Automatically decodes the JSON string stored in the database into a PHP array.

* Parameters
   * $value - mixed (raw JSON string from database)
* Returns `array`

#### Usage

```php
$meta = $transaction->meta; // Returns array
```

### setMetaAttribute($value)

Set meta from array/object (mutator). Automatically encodes the value to a JSON string for storage.

* Parameters
   * $value - array|object
* Returns `void`

#### Usage

```php
$transaction->meta = ['gateway_response' => 'success', 'fee' => 2.9];
```

### getUrlAttribute($value)

Get transaction URL (accessor). Applies the `fluent_cart/transaction/url_{payment_method}` filter to generate a gateway-specific URL.

* Parameters
   * $value - mixed
* Returns `string`

#### Usage

```php
$url = $transaction->url; // Returns filtered transaction URL
```

### updateStatus($newStatus, $otherData = [])

Update the transaction status. If the new status is the same as the current status, no update is performed. Optionally fills additional data before saving.

* Parameters
   * $newStatus - string - The new status to set
   * $otherData - array (optional) - Additional fillable attributes to update
* Returns `OrderTransaction` - The current model instance

#### Usage

```php
// Update status only
$transaction->updateStatus('succeeded');

// Update status with additional data
$transaction->updateStatus('succeeded', [
    'vendor_charge_id' => 'ch_abc123',
    'card_last_4'      => '4242',
    'card_brand'       => 'visa',
]);
```

### bulkDeleteByOrderIds($ids, $params = [])

Delete all transactions associated with the given order IDs. This is a static method.

* Parameters
   * $ids - array - Array of order IDs
   * $params - array (optional) - Currently unused
* Returns `mixed` - Result of the delete query

#### Usage

```php
// Delete all transactions for specific orders
FluentCart\App\Models\OrderTransaction::bulkDeleteByOrderIds([123, 456, 789]);
```

### getMaxRefundableAmount()

Calculate the maximum refundable amount for this transaction. Returns 0 if the transaction status is not `succeeded`. Subtracts any already-refunded amount (from `meta.refunded_total`) from the transaction total.

* Parameters
   * none
* Returns `int` - The maximum refundable amount in cents

#### Usage

```php
$maxRefund = $transaction->getMaxRefundableAmount();
// If total is 5000 (cents) and 2000 has been refunded, returns 3000
```

### getPaymentMethodText()

Get a human-readable payment method description. If card brand and last 4 digits are available, returns a formatted string like "visa ***4242". Otherwise returns the raw payment method key.

* Parameters
   * none
* Returns `string`

#### Usage

```php
$text = $transaction->getPaymentMethodText();
// Returns "visa ***4242" or "stripe" (fallback)
```

### getReceiptPageUrl($filtered = false)

Generate the receipt page URL for this transaction. Appends the `trx_hash` query parameter (the transaction's uuid) to the store's configured receipt page URL.

* Parameters
   * $filtered - boolean (optional, default `false`) - When `true`, applies the `fluentcart/transaction/receipt_page_url` filter
* Returns `string` - The full receipt page URL

#### Usage

```php
// Get basic receipt URL
$url = $transaction->getReceiptPageUrl();

// Get filtered receipt URL (allows plugins to modify)
$url = $transaction->getReceiptPageUrl(true);
```

### acceptDispute($args = [])

Accept a payment dispute for this transaction. Only works on transactions where `transaction_type` is `dispute`. Calls the payment gateway's remote dispute handler, updates the transaction status to `dispute_lost`, adjusts the order's `total_paid` and `payment_status`, and logs the action.

* Parameters
   * $args - array (optional) - Accepts:
      * `dispute_note` (string) - Optional note about the dispute acceptance
* Returns `void|\WP_Error` - Returns `WP_Error` if the transaction is not a dispute, the payment method does not support remote dispute management, or the remote handler fails

#### Usage

```php
$result = $transaction->acceptDispute([
    'dispute_note' => 'Customer claim accepted, refund approved.',
]);

if (is_wp_error($result)) {
    // Handle error
    echo $result->get_error_message();
}
```

## Transaction Statuses

Common transaction statuses in FluentCart:

- `pending` - Transaction is pending
- `processing` - Transaction is being processed
- `succeeded` - Transaction succeeded
- `failed` - Transaction failed
- `cancelled` - Transaction was cancelled
- `refunded` - Transaction was refunded
- `partially_refunded` - Transaction was partially refunded
- `dispute_lost` - Dispute accepted/lost

## Transaction Types

Common transaction types in FluentCart:

- `charge` - Initial charge/payment
- `refund` - Full refund
- `partial_refund` - Partial refund
- `dispute` - Payment dispute

## Usage Examples

### Get Order Transactions

```php
$order = FluentCart\App\Models\Order::find(123);
$transactions = $order->transactions()->orderBy('created_at', 'desc')->get();

foreach ($transactions as $transaction) {
    echo "Transaction #{$transaction->id}: {$transaction->total} cents - {$transaction->status}";
}
```

### Get Successful Transactions for Date Range

```php
$transactions = FluentCart\App\Models\OrderTransaction::ofStatus('succeeded')
    ->whereBetween('created_at', ['2024-01-01', '2024-01-31'])
    ->get();
```

### Get Refund Transactions

```php
$refunds = FluentCart\App\Models\OrderTransaction::whereIn('transaction_type', ['refund', 'partial_refund'])
    ->get();
```

### Get Subscription Transactions

```php
$subscriptionTransactions = FluentCart\App\Models\OrderTransaction::whereNotNull('subscription_id')
    ->get();
```

### Calculate Refundable Amount

```php
$transaction = FluentCart\App\Models\OrderTransaction::find(1);
$maxRefund = $transaction->getMaxRefundableAmount();
echo "Max refundable: " . $maxRefund . " cents";
```

### Search by Payer Email

```php
$transactions = FluentCart\App\Models\OrderTransaction::searchByPayerEmail([
    'value'    => 'customer@example.com',
    'operator' => 'equals',
])->get();
```

---
