---
title: Subscription Model
description: FluentCart Subscription model documentation with attributes, scopes, relationships, and methods.
---

# Subscription Model

| DB Table Name | {wp_db_prefix}_fct_subscriptions               |
| ------------- | ---------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-subscriptions-table) |
| Source File   | fluent-cart/app/Models/Subscription.php        |
| Name Space    | FluentCart\App\Models                           |
| Class         | FluentCart\App\Models\Subscription              |

## Traits

| Trait            | Provides                                                      |
| ---------------- | ------------------------------------------------------------- |
| `HasActivity`    | `activities()` morphMany relationship to `Activity` model     |
| `CanUpdateBatch` | `scopeBatchUpdate` scope for bulk-updating rows in one query  |

## Attributes

| Attribute              | Data Type | Comment                          |
| ---------------------- | --------- | -------------------------------- |
| id                     | Integer   | Primary Key                      |
| uuid                   | String    | Unique identifier (auto-generated on create via `md5(time() . wp_generate_uuid4())`) |
| customer_id            | Integer   | Customer ID                      |
| parent_order_id        | Integer   | Parent order ID                  |
| product_id             | Integer   | Product ID                       |
| item_name              | String    | Item name                        |
| variation_id           | Integer   | Product variation ID             |
| billing_interval       | String    | Billing interval (daily, weekly, monthly, quarterly, half_yearly, yearly) |
| signup_fee             | Integer   | Signup fee in cents               |
| quantity               | Integer   | Quantity                          |
| recurring_amount       | Integer   | Recurring amount in cents         |
| recurring_tax_total    | Integer   | Recurring tax total in cents      |
| recurring_total        | Integer   | Recurring total in cents          |
| bill_times             | Integer   | Number of times to bill (0 = unlimited) |
| bill_count             | Integer   | Number of times billed            |
| expire_at              | Date Time | Expiration date                   |
| trial_ends_at          | Date Time | Trial end date                    |
| canceled_at            | Date Time | Cancellation date                 |
| restored_at            | Date Time | Restoration date                  |
| collection_method      | String    | Collection method                 |
| trial_days             | Integer   | Trial days                        |
| vendor_customer_id     | String    | Vendor customer ID                |
| vendor_plan_id         | String    | Vendor plan ID                    |
| vendor_subscription_id | String    | Vendor subscription ID            |
| next_billing_date      | Date Time | Next billing date                 |
| status                 | String    | Subscription status               |
| original_plan          | JSON      | Original plan data                |
| vendor_response        | JSON      | Vendor response data              |
| current_payment_method | String    | Current payment method            |
| config                 | JSON      | Subscription configuration (auto-encoded/decoded) |
| created_at             | Date Time | Creation timestamp                |
| updated_at             | Date Time | Last update timestamp             |

## Appended Attributes

These virtual attributes are automatically appended when the model is serialized to an array or JSON.

| Attribute         | Type   | Description |
| ----------------- | ------ | ----------- |
| url               | String | Remote subscription URL from payment gateway (via `fluent_cart/subscription/url_{method}` filter) |
| payment_info      | String | Human-readable subscription billing summary (interval, amount, trial) |
| billingInfo       | Array  | Active payment method details from subscription meta |
| overridden_status | String | Display-corrected status (handles simulated trial days and actual trial period detection) |
| currency          | String | Uppercase currency code (from config or store settings fallback) |
| reactivate_url    | String | Frontend URL for reactivating a canceled/expired subscription |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$subscription = FluentCart\App\Models\Subscription::find(1);

$subscription->id; // returns subscription ID
$subscription->status; // returns subscription status
$subscription->recurring_total; // returns recurring total in cents
$subscription->billing_interval; // returns billing interval
$subscription->next_billing_date; // returns next billing date
$subscription->currency; // returns currency code (appended attribute)
$subscription->url; // returns remote subscription URL (appended attribute)
$subscription->overridden_status; // returns display-corrected status (appended attribute)
```

## Scopes

### scopeBatchUpdate (via CanUpdateBatch trait)

Perform a bulk update of multiple rows in a single query.

* Parameters: `$query` (Builder), `$values` (Array) - Array of row data to update, `$index` (String|null) - Column to match on (defaults to primary key)

```php
use FluentCart\App\Models\Subscription;

Subscription::batchUpdate([
    ['id' => 1, 'status' => 'active'],
    ['id' => 2, 'status' => 'canceled'],
]);
```

## Methods

Along with Global Model methods, this model has the following helper methods.

### getConfigAttribute($value)

Get subscription configuration. Automatically decodes JSON strings to arrays.

* Parameters: `$value` (String|Array|null) - Raw config value from database
* Returns `Array` - Decoded configuration array

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$config = $subscription->config; // returns configuration array
```

### setConfigAttribute($value)

Set subscription configuration. Automatically encodes arrays to JSON.

* Parameters: `$value` (Array|Mixed) - Configuration array (non-array values default to `[]`)

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$subscription->config = ['custom_field' => 'value'];
```

### getUrlAttribute($value)

Get the remote subscription URL from the payment gateway.

* Parameters: `$value` (String) - URL value
* Returns `String` - Subscription URL (filtered via `fluent_cart/subscription/url_{payment_method}`)

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$url = $subscription->url; // returns subscription URL
```

### getOverriddenStatusAttribute($value)

Get the display-corrected subscription status. Handles two cases:
1. If trial days were simulated (e.g., via discount/proration) and status is `trialing`, returns `active` instead.
2. If trial days exist but status is `active` and the subscription is still within the trial period, returns `trialing` instead.

* Parameters: `$value` (String) - Status value
* Returns `String` - Overridden status

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$status = $subscription->overridden_status; // returns overridden status
```

### getBillingInfoAttribute($value)

Get billing information from the `active_payment_method` subscription meta entry.

* Parameters: `$value` (String) - Billing info value
* Returns `Array` - Billing information (e.g., card brand, last 4 digits)

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$billingInfo = $subscription->billingInfo; // returns billing info array
```

### getCurrencyAttribute()

Get subscription currency. Reads from `config.currency` first, falls back to store currency settings.

* Returns `String` - Uppercase currency code (e.g., `USD`, `EUR`)

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$currency = $subscription->currency; // returns currency code
```

### getPaymentInfoAttribute()

Get a human-readable subscription billing summary string (interval, recurring total, trial days).

* Returns `String` - Payment information summary

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$paymentInfo = $subscription->payment_info; // returns payment info string
```

### getReactivateUrlAttribute()

Get the frontend reactivation URL. Returns empty string if the subscription cannot be reactivated.

* Returns `String` - Reactivation URL or empty string

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$reactivateUrl = $subscription->reactivate_url; // returns reactivation URL
```

### getPaymentMethodText()

Get a formatted payment method display string (e.g., "Visa ***4242").

* Returns `String` - Payment method text (brand + last 4 digits), or the method name if card details are unavailable

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$paymentMethodText = $subscription->getPaymentMethodText();
```

### getMeta($metaKey, $default = null)

Get a subscription meta value by key from the `fct_subscription_meta` table.

* Parameters: `$metaKey` (String) - Meta key, `$default` (Mixed) - Default value if not found
* Returns `Mixed` - Meta value or default

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$metaValue = $subscription->getMeta('custom_field', 'default');
```

### updateMeta($metaKey, $metaValue)

Create or update a subscription meta entry. If the key already exists, it updates the value; otherwise, it creates a new row.

* Parameters: `$metaKey` (String) - Meta key, `$metaValue` (Mixed) - Meta value
* Returns `Boolean` - Always returns true

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$subscription->updateMeta('custom_field', 'new_value');
```

### addLog($title, $description = '', $type = 'info', $by = '')

Add an activity log entry for this subscription.

* Parameters:
  * `$title` (String) - Log title
  * `$description` (String) - Log description (default: `''`)
  * `$type` (String) - Log type, e.g., `info`, `error` (default: `'info'`)
  * `$by` (String) - Created-by identifier (default: `''`)

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$subscription->addLog('Status Changed', 'Subscription activated', 'info');
$subscription->addLog('Payment Failed', 'Card declined', 'error', 'system');
```

### getDownloads()

Get downloadable files associated with this subscription's product. Only returns downloads when the subscription has a `variation_id` and status is `active`. Filters downloads by the subscription's variation ID.

* Returns `Collection|Array` - Collection of `ProductDownload` models with product and variation titles, or empty array

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$downloads = $subscription->getDownloads();
```

### getLatestTransaction()

Get the most recent charge transaction for this subscription.

* Returns `FluentCart\App\Models\OrderTransaction|null` - Latest charge transaction or null

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$transaction = $subscription->getLatestTransaction();
```

### canUpgrade()

Check if the subscription can be upgraded. Requires a `variant_upgrade_path` meta entry for the current variation and the subscription must be `active` or `trialing`.

* Returns `Boolean` - True if upgrade path exists and status allows it

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$canUpgrade = $subscription->canUpgrade();
```

### canUpdatePaymentMethod()

Check if the payment method can be updated (card update). The current payment gateway must support the `card_update` feature and the subscription must be in one of the allowed statuses: `active`, `trialing`, `paused`, `intended`, `past_due`, `failing`, or `expiring`.

* Returns `Boolean` - True if payment method can be updated

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$canUpdate = $subscription->canUpdatePaymentMethod();
```

### canSwitchPaymentMethod()

Check if the payment method can be switched to a different gateway entirely. The current gateway must support the `switch_payment_method` feature, and the subscription must be `active`, `trialing`, or `paused`.

* Returns `Boolean` - True if payment method can be switched

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$canSwitch = $subscription->canSwitchPaymentMethod();
```

### switchablePaymentMethods()

Get the list of payment gateways that can be switched to from the current gateway.

* Returns `Array` - Array of supported gateway identifiers, or empty array if switching is not supported

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$methods = $subscription->switchablePaymentMethods();
// e.g., ['stripe', 'paypal']
```

### canReactive()

Check if the subscription can be reactivated. Returns empty string (falsy) if:
- FluentCart Pro is not active
- The subscription was upgraded to another subscription
- The recurring amount is zero or negative
- The cancellation reason is `refunded`

Otherwise checks if status is one of: `canceled`, `failing`, `expired`, `paused`, `expiring`, or `past_due`.

* Returns `Mixed` - Filtered boolean/string value (empty string if cannot reactivate, truthy if can). Result is filtered via `fluent_cart/subscription/can_reactivate`.

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
if ($subscription->canReactive()) {
    // subscription can be reactivated
}
```

### getReactivateUrl()

Get the frontend URL for reactivating a canceled or expired subscription. Returns empty string if the subscription cannot be reactivated.

* Returns `String` - Reactivation URL with `fluent-cart=reactivate-subscription` query parameter, or empty string

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$reactivateUrl = $subscription->getReactivateUrl();
```

### getViewUrl($type = 'customer')

Get the subscription view URL for the customer portal or admin dashboard.

* Parameters: `$type` (String) - View type: `'customer'` (default) for the customer portal, or `'admin'` for the admin dashboard
* Returns `String` - View URL

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$customerUrl = $subscription->getViewUrl(); // customer portal URL
$adminUrl = $subscription->getViewUrl('admin'); // admin dashboard URL
```

### hasAccessValidity()

Check if the subscription currently grants access. Returns true for `active`, `trialing`, and `completed` statuses. Returns false for `expired`, `past_due`, `intended`, and `pending`. For other statuses (e.g., `canceled`, `failing`, `paused`, `expiring`), checks whether the next billing date (or guessed billing date) is still in the future.

* Returns `Boolean` - True if the subscription has valid access

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$hasAccess = $subscription->hasAccessValidity();
```

### reSyncFromRemote()

Re-sync subscription data from the remote payment gateway. The gateway must support the `subscriptions` feature.

* Returns `Mixed` - Sync result from the gateway, or `WP_Error` if the payment method does not support remote resync

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$result = $subscription->reSyncFromRemote();
if (is_wp_error($result)) {
    // handle error
}
```

### cancelRemoteSubscription($args = [])

Cancel the subscription both remotely (at the payment gateway) and locally. Updates the status to `canceled`, sets `canceled_at`, stores the cancellation reason in config, and dispatches the `SubscriptionCanceled` event.

* Parameters: `$args` (Array) - Cancellation arguments:
  * `reason` (String) - Cancellation reason (stored in config, default: `''`)
  * `fire_hooks` (Boolean) - Whether to dispatch the `SubscriptionCanceled` event (default: `true`)
  * `note` (String) - Cancellation note (saved to order, default: `''`)
* Returns `Array|WP_Error` - Array with `subscription` and `vendor_result` keys on success

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$result = $subscription->cancelRemoteSubscription([
    'reason'     => 'Customer request',
    'fire_hooks' => true,
    'note'       => 'Cancelled by customer'
]);
```

### getCurrentRenewalAmount()

Get the current renewal amount. Checks `config.current_renewal_amount` first (used when the renewal amount differs from the base recurring total, e.g., after a plan change), then falls back to `recurring_total`.

* Returns `Integer` - Current renewal amount in cents

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$amount = $subscription->getCurrentRenewalAmount();
```

### getRequiredBillTimes()

Get the number of remaining billing cycles. If `bill_times` is 0, returns 0 (unlimited). If the calculated remaining count is zero or negative, it re-verifies against actual successful transactions and early payment history, correcting `bill_count` if needed. Returns -1 if billing is truly complete after verification.

* Returns `Integer` - Remaining bill times (0 = unlimited, -1 = completed)

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$billTimes = $subscription->getRequiredBillTimes();
```

### getReactivationTrialDays()

Get the number of trial days to apply when reactivating this subscription. If the subscription still has valid access (i.e., the billing period has not fully elapsed), the remaining days are returned as trial days so the customer is not double-charged.

* Returns `Integer` - Number of trial days for reactivation (0 if no remaining validity)

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$trialDays = $subscription->getReactivationTrialDays();
```

### guessNextBillingDate($forced = false)

Calculate the next billing date when it is not already set (or when forced). Uses the last successful order's creation date plus the billing interval. For initial orders with trial days, adds trial days instead.

* Parameters: `$forced` (Boolean) - Force recalculation even if `next_billing_date` is already set (default: `false`)
* Returns `String` - Next billing date in `Y-m-d H:i:s` GMT format

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$nextBillingDate = $subscription->guessNextBillingDate();
$forcedDate = $subscription->guessNextBillingDate(true); // force recalculation
```

### checkAndExpireSubscriptions($batchSize = 100) (static)

Check and expire subscriptions that have missed payments beyond their grace period. Called by the hourly scheduler. Processes `active`, `trialing`, and `canceled` subscriptions whose `next_billing_date` is past the grace period threshold. Grace periods vary by billing interval (e.g., 1 day for daily, 3 for weekly, 7 for monthly, 15 for quarterly/half_yearly/yearly).

For active/trialing subscriptions, status is changed to `expired`. For canceled subscriptions, only `next_billing_date` is cleared (status remains canceled). Dispatches `SubscriptionValidityExpired` event for each affected subscription.

* Parameters: `$batchSize` (Integer) - Number of subscriptions to process per batch (default: `100`)
* Returns `Array` - Statistics with keys: `checked`, `validity_expired`, `batches`

```php
use FluentCart\App\Models\Subscription;

$stats = Subscription::checkAndExpireSubscriptions(50);
// $stats = ['checked' => 200, 'validity_expired' => 5, 'batches' => 4]
```

## Relations

This model has the following relationships that you can use.

### meta

Access the subscription metadata.

* Relation type: `HasMany`
* Returns `Collection` of `FluentCart\App\Models\SubscriptionMeta`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$meta = $subscription->meta;
```

### customer

Access the customer.

* Relation type: `BelongsTo`
* Foreign key: `customer_id`
* Returns `FluentCart\App\Models\Customer`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$customer = $subscription->customer;
```

### product

Access the product.

* Relation type: `BelongsTo`
* Foreign key: `product_id` -> `ID`
* Returns `FluentCart\App\Models\Product`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$product = $subscription->product;
```

### variation

Access the product variation.

* Relation type: `BelongsTo`
* Foreign key: `variation_id`
* Returns `FluentCart\App\Models\ProductVariation`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$variation = $subscription->variation;
```

### labels

Access the subscription labels.

* Relation type: `MorphMany`
* Returns `Collection` of `FluentCart\App\Models\LabelRelationship`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$labels = $subscription->labels;
```

### license

Access the subscription license (single). Only available when FluentCart Pro with the Licensing module is active.

* Relation type: `HasOne` (nullable -- returns `null` if `License` class does not exist)
* Returns `FluentCartPro\App\Modules\Licensing\Models\License|null`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$license = $subscription->license;
```

### licenses

Access all subscription licenses. Only available when FluentCart Pro with the Licensing module is active.

* Relation type: `HasMany` (nullable -- returns `null` if `License` class does not exist)
* Returns `Collection` of `FluentCartPro\App\Modules\Licensing\Models\License|null`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$licenses = $subscription->licenses;
```

### transactions

Access the subscription transactions.

* Relation type: `HasMany`
* Returns `Collection` of `FluentCart\App\Models\OrderTransaction`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$transactions = $subscription->transactions;
```

### billing_addresses

Access the billing addresses for the subscription's customer.

* Relation type: `HasMany` (scoped to `type = 'billing'`)
* Foreign key: `customer_id` -> `customer_id`
* Returns `Collection` of `FluentCart\App\Models\CustomerAddresses`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$addresses = $subscription->billing_addresses;
```

### product_detail

Access the product detail (variation details).

* Relation type: `BelongsTo`
* Foreign key: `variation_id` -> `id`
* Returns `FluentCart\App\Models\ProductDetail`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$productDetail = $subscription->product_detail;
```

### order

Access the parent order.

* Relation type: `BelongsTo`
* Foreign key: `parent_order_id` -> `id`
* Returns `FluentCart\App\Models\Order`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$order = $subscription->order;
```

### activities (via HasActivity trait)

Access the activity logs for this subscription.

* Relation type: `MorphMany` (ordered by `created_at DESC`, `id DESC`)
* Returns `Collection` of `FluentCart\App\Models\Activity`

```php
$subscription = FluentCart\App\Models\Subscription::find(1);
$activities = $subscription->activities;
```

## Usage Examples

### Creating a Subscription

```php
use FluentCart\App\Models\Subscription;

$subscription = Subscription::create([
    'customer_id' => 1,
    'parent_order_id' => 1,
    'product_id' => 1,
    'variation_id' => 1,
    'billing_interval' => 'monthly',
    'recurring_total' => 2999, // $29.99 in cents
    'status' => 'active'
]);
// uuid is auto-generated on create
```

### Retrieving Subscriptions

```php
// Get subscription by ID
$subscription = Subscription::find(1);

// Get subscription with customer and product
$subscription = Subscription::with(['customer', 'product'])->find(1);

// Get active subscriptions
$subscriptions = Subscription::where('status', 'active')->get();
```

### Updating a Subscription

```php
$subscription = Subscription::find(1);
$subscription->status = 'cancelled';
$subscription->canceled_at = gmdate('Y-m-d H:i:s');
$subscription->save();
```

### Deleting a Subscription

```php
$subscription = Subscription::find(1);
$subscription->delete();
```

---
