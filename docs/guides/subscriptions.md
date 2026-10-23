---
title: Subscription Customization
description: How to customize subscription behavior in FluentCart — grace periods, payment method timing, and expiry strictness.
---

# Subscription Customization

## Grace Periods

### What is a grace period?

When a subscription renewal payment fails or is delayed, FluentCart does not immediately mark the subscription as expired. Instead it waits a configurable number of days — the **grace period** — before changing the status to `expired`.

This matters because some payment methods are asynchronous. The payment may have been initiated and will succeed, but confirmation arrives hours or days later. Expiring the subscription the moment a payment is not instantly confirmed would incorrectly cut off access for customers who have already paid.

Default grace periods by billing interval:

| Interval | Default grace (days) |
|---|---|
| Daily | 1 |
| Weekly | 3 |
| Monthly | 7 |
| Quarterly | 15 |
| Half-yearly | 15 |
| Yearly | 15 |

---

### When should you extend the grace period?

**The clearest case: SEPA Direct Debit.**

SEPA bank transfers can take 2–3 business days to confirm. For a monthly subscriber paying via SEPA, the default 7-day grace period is sufficient — but only if the payment was initiated on time. If your site processes renewals late (e.g. a missed cron run), or if a weekend is involved, a 7-day window can become tight. Extending it to 10–14 days eliminates false expiries for SEPA customers.

Other cases where you should extend:

- **ACH / bank transfers** — US bank transfers can take 3–5 business days.
- **Slow-processing gateways** — Some regional gateways in emerging markets batch-process overnight.
- **High-value subscriptions** — For yearly plans where incorrectly expiring a subscription has a large customer impact, a 21–30 day window is safer.

```php
add_filter('fluent_cart/subscription/grace_period_days', function (array $gracePeriods): array {
    // Extend monthly grace period to 14 days to safely cover SEPA debit delays
    $gracePeriods['monthly'] = 14;

    // Give yearly subscribers a full month before expiry
    $gracePeriods['yearly'] = 30;

    return $gracePeriods;
});
```

---

### When should you reduce the grace period?

If your product delivers time-sensitive value (live access, daily content, seat-based software), you may want stricter expiry — cut off access as soon as a payment has clearly failed, not 7–15 days later.

```php
add_filter('fluent_cart/subscription/grace_period_days', function (array $gracePeriods): array {
    // Tight grace for daily content — expire after 1 missed day regardless of interval
    $gracePeriods['monthly']     = 1;
    $gracePeriods['quarterly']   = 1;
    $gracePeriods['half_yearly'] = 1;
    $gracePeriods['yearly']      = 3;

    return $gracePeriods;
});
```

::: warning
Reducing grace periods below 3 days for bank-based payment methods (SEPA, ACH) will cause valid customers to lose access before their payment has had time to settle. Only do this when your payment methods are card-only or instant-confirm.
:::

---

### Targeting grace period by payment method

If you accept both instant (card) and delayed (SEPA/ACH) payment methods, you can apply different grace periods per customer:

```php
add_filter('fluent_cart/subscription/grace_period_days', function (array $gracePeriods): array {
    // Default stays for card-based subscriptions.
    // Individual subscriptions using SEPA need more time — handled in grace_period_days_for_subscription.
    return $gracePeriods;
});
```

::: tip
The `fluent_cart/subscription/grace_period_days` filter applies globally across all subscriptions of a given billing interval. If you need per-subscription overrides (e.g. by payment method), use the subscription's `current_payment_method` field to conditionally adjust values in your filter callback, by loading the specific subscription from context.
:::

---

### Reference

- **Filter:** `fluent_cart/subscription/grace_period_days`
- **Source:** `app/Services/Payments/SubscriptionHelper.php`
- **Full filter reference:** [Customers & Subscriptions filters](/hooks/filters/customers-and-subscriptions#subscription-grace_period_days)

---

## Custom Subscription Intervals

FluentCart ships with `daily`, `weekly`, `monthly`, `quarterly`, `half_yearly`, and `yearly`. You can register additional intervals through filters.

The example below adds an **every 10th day** interval. Swap in your own values as needed.

### 1. Register the interval option

Adds the interval to the product editor dropdown. All three fields are required.

```php
add_filter('fluent_cart/available_subscription_interval_options', function ($options) {
    return array_merge($options, [
        [
            'label'     => __('Every 10th day', 'fluent-cart'), // shown in dropdown
            'value'     => 'every_tenth_day',                   // stored in database
            'map_value' => '10th Day',                          // readable format
        ],
    ]);
});
```

### 2. Define the interval in days

Used internally for trial day calculations and renewal scheduling.

```php
add_filter('fluent_cart/subscription_interval_in_days', function ($days, $args) {
    if ($args['interval'] === 'every_tenth_day') {
        return 10;
    }
    return $days;
}, 10, 2);
```

### 3. Map to gateway billing period

Required for built-in gateways (Stripe, PayPal). If you own the gateway code, handle this directly in your processor instead.

```php
add_filter('fluent_cart/subscription_billing_period', function ($billingPeriod, $args) {
    if ($args['subscription_interval'] !== 'every_tenth_day') {
        return $billingPeriod;
    }

    if ($args['payment_method'] === 'stripe') {
        $billingPeriod['interval_unit']      = 'day';
        $billingPeriod['interval_frequency'] = 10;
    }

    if ($args['payment_method'] === 'paypal') {
        $billingPeriod['interval_unit']      = 'day';
        $billingPeriod['interval_frequency'] = 10;
    }

    return $billingPeriod;
}, 10, 2);
```

### 4. Set max trial days (optional)

Caps how many trial days can be assigned to this interval.

```php
add_filter('fluent_cart/max_trial_days_allowed', function ($days, $args) {
    if ($args['repeat_interval'] === 'every_tenth_day') {
        return min($args['existing_trial_days'] + $args['interval_in_days'], 10);
    }
    return $days;
}, 10, 2);
```

### 5. License validity (Pro — licensed products only)

If the product uses the licensing module, set the expiry period for the custom interval.

```php
add_filter('fluent_cart/license/default_validity_by_variation', function ($validity, $args) {
    $interval = Arr::get($args['variation']->other_info, 'repeat_interval');
    if ($interval === 'every_tenth_day') {
        return ['unit' => 'day', 'value' => 10];
    }
    return $validity;
}, 10, 2);
```

::: tip Gateway compatibility
**Stripe** accepts any positive integer with `day`, `week`, `month`, or `year`.  
**PayPal** supports the same units but has frequency limits — check PayPal's billing plan docs for your interval.
:::

Full reference and additional snippets: [fluent-cart-snippets on GitHub](https://github.com/fluent-cart/fluent-cart-snippets/blob/main/Subscriptions/HOW_TO_ADD_CUSTOM_SUBSCRIPTION_INTERVAL.md)


## Migrating subscriptions between Stripe accounts

A merchant may use one Stripe account for WooCommerce and a separate Stripe account for FluentCart. Migrating subscription records into FluentCart does not, by itself, make the customers and saved payment methods from the WooCommerce Stripe account available in the FluentCart Stripe account.

The guidance below applies to store-managed subscriptions with automatic charging (`collection_method = system`). FluentCart owns their renewal schedule and charges the reusable payment method associated with each subscription.

### Option 1: Copy customers and payment methods to the FluentCart Stripe account

Before the next renewal, copy the relevant customers and their supported payment methods from the Stripe account used by WooCommerce to the Stripe account connected to FluentCart. Follow Stripe's official guide: [Copy customer and payment method data across Stripe accounts](https://docs.stripe.com/get-started/data-migrations/pan-copy-self-serve).

After the copy is complete, reconcile the Stripe customer and payment-method references stored in FluentCart with the destination account. Stripe preserves customer IDs during an account copy, but payment-method IDs can change. Use the mapping supplied by Stripe to update the affected references; copying customer records alone is insufficient. See [Data that can be copied between Stripe accounts](https://support.stripe.com/questions/data-that-can-be-copied-between-stripe-accounts).

Once each existing system subscription references a valid customer and reusable payment method in the Stripe account connected to FluentCart, it can continue charging future renewals automatically, subject to the usual payment authorization and decline handling. A system subscription does not require a Stripe-managed subscription object to be copied because FluentCart manages its billing schedule.

### Option 2: Collect a payment method through a manual renewal payment

If customer and payment-method data are not copied between Stripe accounts, the customer can pay an outstanding renewal through Stripe and provide a reusable payment method in the account connected to FluentCart. For system subscriptions, the renewal payment must retain the authorization to save and use that method for future automatic charges.

When saved payment methods are enabled, the renewal checkout can also offer **Save this card for faster checkout next time**. The merchant can configure whether this optional checkbox is initially selected, and the customer can change that selection. This option controls whether the card is offered for future checkout; it is separate from the automatic-renewal authorization required by a system subscription.

After a successful payment, verify that the existing system subscription is associated with both the Stripe customer and reusable payment method from the destination account. Once those billing references are valid, subsequent renewals can be charged automatically without requiring the customer to pay each invoice manually. Paying one renewal manually does not, by itself, change a system subscription to manual billing.

::: warning Verify the subscription's billing references after an account change
The current Stripe renewal confirmation path updates the subscription's `active_payment_method`, but does not replace an existing `vendor_customer_id` with the customer returned by the new payment. If that ID still belongs to the previous Stripe account, a successful manual payment or a card appearing in the saved-card list does not establish that the next automatic charge will succeed. Reconcile the subscription's customer reference as part of the account transition before relying on automatic billing.

A subscription whose collection method is already `manual` remains manual when a card is saved for future checkout. The save-card checkbox does not convert it to `system`.
:::
