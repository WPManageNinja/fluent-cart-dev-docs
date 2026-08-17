---
title: Editing Subscription Vendor IDs
description: Opt-in admin repair tool for correcting vendor_subscription_id / vendor_customer_id on gateway-billed subscriptions — the enabling filter, the two REST endpoints, the gateway lookup contract, and the uniqueness guarantee.
---

# Editing Subscription Vendor IDs <Badge type="warning" text="Opt-in" />

A gateway-billed (`automatic`) subscription is addressed by two identifiers copied from the payment gateway: `vendor_subscription_id` and `vendor_customer_id`. Everything that reaches that subscription later — incoming webhooks, "Sync from gateway", cancel, card update — resolves through them.

When they are wrong, the subscription is unreachable: webhooks resolve to nothing, resync fails, and the subscription eventually expires from silence rather than from a real gateway decision. That happens after a store clone or restore, a manual migration between gateway accounts, a checkout that stamped the wrong id, or a subscription recreated by gateway support.

This feature is the narrow repair path for exactly that: correct the two identifiers, and nothing else. **It is disabled by default.**

::: tip At a glance
| Concern | Where |
|---|---|
| Enabling filter | `fluent_cart/subscription/vendor_id_editing_enabled` ([details](/hooks/filters/customers-and-subscriptions)) |
| Gate | `Subscription::canEditVendorIds()` · `Subscription::canVerifyVendorIds()` |
| Write endpoint | `PUT /orders/{order}/subscriptions/{subscription}/vendor-ids` |
| Lookup endpoint | `POST /orders/{order}/subscriptions/{subscription}/verify-vendor-ids` |
| Service | `SubscriptionService::updateVendorIds()` |
| Gateway contract | `AbstractSubscriptionModule::verifyVendorSubscription()` + the `verify_vendor_ids` capability |
:::

## Enabling it

```php
add_filter('fluent_cart/subscription/vendor_id_editing_enabled', '__return_true');
```

The filter is read as the **first statement** of `Subscription::canEditVendorIds()`, so one switch turns off the dropdown item, the permission flags sent to the admin UI, the write endpoint and the lookup endpoint together. There is no second place to check and no partially-enabled state.

Leave it off in normal operation. It writes the column gateway webhooks resolve on, so it belongs in a migration or support window, not in a store's steady state.

## When the action is available

`canEditVendorIds()` returns `true` only when all of these hold:

| Condition | Why |
|---|---|
| The filter above returns `true` | Opt-in |
| `collection_method` is `automatic` | Store-billed (`manual` / `system`) subscriptions have no gateway identifiers to repair — they get the full [terms editor](/modules/subscriptions#what-each-model-allows) instead |
| `current_payment_method` is set | There is a gateway to address |
| `status` is not `completed` | A completed subscription reached the end of its term; there is nothing left to bill |

Note what is **not** excluded: `canceled`, `expired` and `expiring` stay editable. Those are usually the states a subscription lands in *because* the id was wrong, so they are the states the repair is most needed in. (`Sync from gateway` has no status gate either.)

This is the mirror image of `canUpdateDetails()`: store-billed subscriptions can edit billing terms and not identifiers; gateway-billed subscriptions can edit identifiers and not terms. Amount, interval and next billing date on an `automatic` subscription stay gateway-owned.

Both capabilities surface on the subscription's `permissions` attribute, which is what the admin UI reads:

```php
$subscription->permissions['canEditVendorIds'];   // action available
$subscription->permissions['canVerifyVendorIds']; // gateway can preview an id
```

## What a save does — and does not do

`SubscriptionService::updateVendorIds()` is deliberately separate from `updateSubscription()`. It writes the two columns and adds one activity log entry. It does **not**:

- void or regenerate renewals
- re-sync open invoices
- dispatch `fluent_cart/payments/subscription_status_changed` or any status event
- call the payment gateway

Only keys present in the request are written, so sending `vendor_subscription_id` alone never blanks the stored customer id. A payload that changes nothing is rejected with `no_changes`.

The activity entry records both sides of the change, with `(none)` standing in for a previously empty value:

```
Vendor IDs updated
Admin updated: vendor_subscription_id: (none) → sub_1P9xyz, vendor_customer_id: cus_A → cus_B
```

### Uniqueness is enforced in the write

`fct_subscriptions` indexes `vendor_subscription_id` but does **not** make it unique, and every gateway IPN resolves its subscription through that column. Two rows holding the same id on the same payment method would route one subscription's webhooks into the other.

So the write claims the id in a single statement — an `UPDATE` with an anti-join asserting no other row on the same `current_payment_method` holds it. The check is part of the write rather than a `SELECT` before it, so two admins racing for the same id cannot both pass. Zero affected rows means the other one won, and the caller gets:

```json
{ "message": "Another subscription on this payment method is already using this Vendor Subscription ID." }
```

The collision that matters is same-gateway: a gateway does not reissue an id inside its own account, but two gateways can legitimately use the same string.

### Input format

Both ids are constrained at the request boundary (`UpdateVendorIdsRequest`), because they are interpolated into gateway API paths such as `subscriptions/{id}` and `customers/{cid}/subscriptions/{id}`:

- `^[a-zA-Z0-9_.-]+$` — letters, numbers, dots, dashes, underscores
- max 45 characters, matching the `VARCHAR(45)` columns
- both are nullable; an empty string clears the stored value

## Verification

Before saving, the admin can look the candidate id up at the gateway. The lookup is **read-only, advisory and never blocking** — a gateway can be down, or simply not implement lookup, and the correction still saves.

The gateway contract is one method on the subscription module:

```php
/**
 * @param array $args vendor_subscription_id, vendor_customer_id
 * @return array|\WP_Error
 */
public function verifyVendorSubscription(array $args, $mode = 'current')
```

`$args` carries both ids because some gateways nest the subscription under its customer. A successful lookup returns a normalized shape (any subset the gateway can fill):

```php
[
    'id'                => 'sub_1P9xyz',
    'status'            => 'active',
    'customer_id'       => 'cus_Nffr…',
    'amount'            => '29.00',
    'currency'          => 'USD',
    'next_billing_date' => '2026-09-01 00:00:00',
]
```

`AbstractSubscriptionModule` provides a default returning `WP_Error('not_implemented', …)`, so a gateway that does not implement it degrades cleanly.

### Declaring the capability

A gateway advertises lookup by adding `verify_vendor_ids` to `$supportedFeatures`:

```php
public $supportedFeatures = [
    // …
    'subscriptions',
    'verify_vendor_ids',
];
```

`canVerifyVendorIds()` requires both `subscriptions` and `verify_vendor_ids`; the endpoint refuses before touching the gateway if either is missing, and the admin UI hides the Verify button while leaving Save enabled.

| Gateway | `verify_vendor_ids` | Lookup used |
|---|---|---|
| **Stripe** | ✅ | `GET subscriptions/{id}` |
| **PayPal** | ✅ | `GET billing/subscriptions/{id}` |
| Mollie, Paddle, Authorize.net (pro) | — | inherits `not_implemented` |
| Other addon gateways | — | inherits `not_implemented` |

### What verification proves

::: warning A successful lookup is not proof of ownership
It proves only that the id exists in the merchant account whose credentials **this store** holds. One merchant account routinely backs several stores — staging beside live, or two sites sharing keys — so an id can resolve and still belong to a different store.

That is why the response returns the resolved status, amount and customer: an administrator has to recognise them. The hard protection is the uniqueness claim on the write, not the lookup.
:::

## Endpoints

Both require the `subscriptions/manage` permission and run under `OrderPolicy`, and both validate that the subscription actually belongs to the order in the path.

### Update

```
PUT /wp-json/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/vendor-ids
```

```json
{
  "vendor_subscription_id": "sub_1P9xyzABC",
  "vendor_customer_id": "cus_NffrFeUfNV2Hib"
}
```

Errors are returned as a plain message: `cannot_edit_vendor_ids` (feature off, or not an eligible subscription), `no_changes`, `vendor_subscription_id_taken`, or a validation error on format/length.

### Verify

```
POST /wp-json/fluent-cart/v2/orders/{order}/subscriptions/{subscription}/verify-vendor-ids
```

Send the **candidate** ids — the ones currently typed in the form, not the saved ones. On success the response carries `verification` with the normalized shape above; on failure it carries the gateway's own error message.

Full request/response reference: [Update Vendor IDs](/restapi/operations/subscriptions/update-vendor-ids) · [Verify Vendor IDs](/restapi/operations/subscriptions/verify-vendor-ids).

## Admin flow

With the filter on, an eligible subscription shows **Edit Vendor IDs** in the kebab menu on the subscription details card. The modal pre-fills both stored ids, offers **Verify** beside the subscription id (when the gateway supports it), renders the resolved subscription inline, and confirms before saving. The identifiers shown on the card refresh after the save.

## Related Documentation

- [Subscriptions Module](/modules/subscriptions) — collection methods and what each one allows
- [Subscription Filter Hooks](/hooks/filters/customers-and-subscriptions) — the enabling filter
- [Payment Methods Module](/modules/payment-methods) — the capability system gateways declare into
- [Subscriptions REST API](/restapi/subscriptions)
