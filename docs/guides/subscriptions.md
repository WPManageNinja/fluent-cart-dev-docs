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
