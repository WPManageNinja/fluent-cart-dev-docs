---
title: Refunds
description: How a FluentCart refund works end to end — remote-first admin refunds, item and shipping refunds, forced local refunds, webhook refunds, recovery of half-saved refunds, and the MCP refund tool.
---

# Refunds

A refund in FluentCart is **remote first**: the payment gateway is called before anything is written. A refund transaction row exists only once the refund is real, meaning the gateway accepted it or an admin deliberately recorded it locally.

::: tip At a glance
| Concern | Where |
|---|---|
| Admin endpoint | `POST /orders/{order}/refund` · `OrderController::refundOrder()` |
| Re-sync endpoint | `POST /orders/{order}/refund/{transaction}/resync` · `OrderController::resyncRefund()` |
| Engine | `FluentCart\App\Services\Payments\Refund::processRefund()` |
| Webhook recorder | `Refund::createOrRecordRefund()` |
| Event | `FluentCart\App\Events\Order\OrderRefund` |
| Per-order lock | MySQL `GET_LOCK('fct_refund_<order_id>')` |
| Permission | `orders/can_refund` |
:::

For the gateway side of the contract (what `processRefund()` must return and what a webhook handler must call), see [Refunds in Quick Implementation](/payment-methods-integration/quick-implementation).

## Two kinds of refund

| Kind | Sent when | Amount comes from |
|---|---|---|
| Item and shipping | `refunded_items` is not empty, or `shipping_amount` is greater than 0 | The server, in `RefundPlanner::plan()`. Each line's charge left (line total plus any tax added on top, minus `refund_total`) divided by its units left. Refunding every unit left takes the whole remainder. |
| Amount only | Neither is sent | The `amount` the admin typed. Used for goodwill and dispute refunds. No unit or stock changes; the money is spread over the lines' `refund_total`. |

A line keeps what was sold: `quantity`, `line_total` and `tax_amount` never change. An item refund adds the units to `line_meta.refunded_quantity` and caps `fulfilled_quantity` at the units left. The `OrderRefund` listener adds each line's refunded money to `refund_total`. An amount refund is spread over the lines by what each has left, and any part the lines cannot take is counted as shipping, only when the lines plus shipping make up the whole order total. Shipping is tracked as a running total in order meta `shipping_refunded_amount`; `shipping_refunded` is set to `1` once the whole shipping amount is returned.

## The admin refund, step by step

```
Refund modal ── POST orders/{id}/refund ──▶ OrderController::refundOrder()
  1. order must be refundable                       else 400
  2. Refund::withOrderRefundLock(order, wait 0)      else 409 "another refund in progress"
     └ refundOrderUnderLock():
  3. RefundPlanner::plan(): amount, units per line,  else 422
     shipping, refund_intent (the item + shipping writes)
  4. Refund::processRefund(charge, amount, refund_info, refund_intent)
       a. validate amount against order and charge limits
       b. pick a route (remote / local / forced_local / unavailable)
       c. remote: call the gateway          ── fails ──▶ activity log entry only, 422 force-local payload
       d. save: refund row + item/shipping writes, one DB transaction
       e. dispatch OrderRefund: order totals, line refund_total, charge refunded_total
  5. optional: cancel the subscription (never on a forced local refund)
  6. release the lock
```

### Routes

| Route | Chosen when | Gateway called |
|---|---|---|
| `remote` | The gateway has the `refund` feature and the charge has a `vendor_charge_id` | Yes |
| `local` | `fluent_cart/order_refund_manually` returned `yes`, or the gateway has `local_refund_only` (Cash on Delivery), `offline`, or no `refund` feature. The admin returns the money outside FluentCart. | Only for Cash on Delivery, so `fluent_cart/offline_payment_refund_id` still fires |
| `forced_local` | The request carried `refund_info.force_local` | No |
| `unavailable` | Gateway not registered, gateway without the `payment` feature (a deactivated Pro or add-on gateway), or the charge has no `vendor_charge_id` | No. Same prompt as a failure. |

Whatever status the gateway returns, a non-error return is success. `pending` is normal on Stripe, Paddle and PayPal.

### When the gateway fails

Nothing is saved except an error entry in the order activity log. The endpoint answers **422**:

```json
{
  "code": "remote_refund_failed",
  "message": "Refund failed on Stripe.",
  "gateway": "Stripe",
  "gateway_message": "Charge ch_… has already been refunded.",
  "can_force_local": true,
  "impact": {
    "amount": 4000,
    "shipping_amount": 0,
    "items": [{ "id": 12, "refund_qty": 1, "restore_quantity": 1 }],
    "manage_stock": true,
    "payment_status_after": "partially_refunded",
    "cancel_subscription": false
  }
}
```

`code` is `remote_refund_failed` (the gateway returned a `WP_Error` or threw) or `gateway_unavailable`. The admin UI shows the gateway message and the impact list. If the admin picks **Record locally only**, the UI resends the exact failed payload with `refund_info.force_local = true`. It is validated against the current order state like any refund.

### Forced local refund

- Records the refund row, updates totals, stock, payment status and sends the customer refund email (subject to the `order_refunded_customer` notification setting).
- Does not call the gateway and returns no money. The order log gets a warning saying so.
- Does not cancel the subscription.
- Skips `fluent_cart/order_refund_manually`.

## What gets written

| Store | Key | When |
|---|---|---|
| `fct_order_transactions` | new row: `transaction_type = refund`, `status = refunded`, `total`, `vendor_charge_id` = gateway refund id, `meta.parent_id`, `meta.reason`, `meta.created_by`, `meta.refund_route`, `meta.is_item_refund`, `meta.refunded_items`, `meta.manage_stock` | Once the refund is real |
| `fct_order_transactions` (charge row) | `meta.refunded_total` | Every refund. Recounted from linked refund rows, never lowered. |
| `fct_orders` | `total_refund`, `payment_status` | By the `OrderRefund` listener |
| `fct_order_items` | `line_meta.refunded_quantity`, `fulfilled_quantity` | Item refunds |
| `fct_order_items` | `refund_total` | By the `OrderRefund` listener: the line's own amount on an item refund, a spread on an amount refund. Capped at the line's charge inside the `UPDATE`. |
| `fct_order_meta` | `shipping_refunded_amount`, `shipping_refunded` | Shipping refunds |
| Stock tables | `available`, `on_hold`, `committed`, `stock_status`, movement ledger | Item refunds with restock on and stock management enabled |

## Recording a refund once

Several things can try to record the same refund: the admin request, a webhook, a webhook redelivery. The rules that keep it to one row and one announcement:

1. **Match by gateway refund id first.** Then adopt a row that has no gateway id yet but the same charge and total. Otherwise create a row. This is `Refund::createOrRecordRefund()`.
2. **A webhook that beats the admin request.** Before the gateway call, the admin refund snapshots the refund row ids on the order. After the gateway answers, it adopts a row with the returned refund id only if that row was created during the call. A row that already existed before the call, or one for another charge or amount, is not adopted and gives `refund_not_recorded`.
3. **Pending to final is one conditional update.** A pending refund moves to `refunded` or `failed` with a single `UPDATE ... WHERE status = 'pending'`. Only the delivery that moved the row counts the refund and dispatches `OrderRefund`. A late failure cannot overwrite a completed refund.
4. **Redelivery repairs.** A redelivered webhook for an already `refunded` row re-runs the order accounting under the `fct_refund_<order_id>` lock. `OrderRefund` applies only the part the order has not counted.
5. **Charge total recount.** After every refund the `OrderRefunded` listener recounts each charge's `meta.refunded_total` from its linked refund rows with one atomic `JSON_SET` that keeps the higher value. This keeps the per-charge cap correct when a webhook created the row without adding its amount.
6. **Announce once.** The admin path reloads the order before dispatching, so a refund a webhook already announced is not announced twice. When the event stays silent for that reason, `OrderRefund` restocks the refunded items itself, once.

## When saving fails after the gateway succeeded

The money has moved, so the refund must not be lost.

1. The full save (row plus item and shipping writes) is tried twice.
2. Then a **bare refund row** is written without item and shipping changes. When the refund had such changes, the row gets `meta.local_sync = pending` and `meta.refund_intent`, and the order log gets a warning. The response carries a `local_sync` warning. Pending rows are left out of order refund totals and payment status.
3. If the row and line writes saved but counting the refund failed (`OrderRefund` threw), the row is marked pending with an empty `refund_intent.items`, since the units are already written, and the log says "Refund recorded without order totals".
4. The admin runs **Re-sync refund** from the transaction list. It reapplies the stored item and shipping changes in one DB transaction, marks `local_sync = done` and counts the refund once.
5. If even the bare row cannot be written, the endpoint returns a `refund_not_recorded` error carrying the gateway refund id and amount, and the order log gets an error entry. The admin must not refund again.

Re-sync answers:

| Code | Status | When |
|---|---|---|
| `nothing_to_resync` | 400 | The row is not `refunded` or is not awaiting re-sync |
| `refund_lock_timeout` | 409 | Another refund holds the order's lock |
| `refund_order_changed` | 409 | A line is gone, or its units left differ from the stored `pre_refund_qty`. Reconcile by hand. |
| `resync_failed` | 500 | A write or the count failed. The row stays pending; a retry applies only what is still missing and counts the refund once. |

## Webhook refunds

Every gateway records refunds the same way:

```php
\FluentCart\App\Services\Payments\Refund::createOrRecordRefund([
    'vendor_charge_id' => $refundId,      // the provider's refund id
    'total'            => $refundAmount,  // cents
    'status'           => 'refunded',     // refunded | pending | failed
    'reason'           => $reason,
], $parentTransaction);
```

A `pending` row adds nothing until it becomes `refunded`. A `failed` report never adopts a locally recorded row. Gateways must not keep their own matcher, status ranking or `OrderRefund` dispatch.

The recorder takes the same `fct_refund_<order_id>` lock as the admin refund and waits up to 10 seconds for it. If the lock stays busy it records nothing and returns `WP_Error('refund_lock_timeout')`. The webhook must answer a non-2xx for that code (Stripe, Authorize.Net, Mollie and the addons answer 503, PayPal and Paddle 500) so the gateway redelivers. Redelivery is idempotent because the refund matches by vendor refund id. Other error codes (`missing_vendor_refund_id`, `invalid_refund_amount`) are not retryable and keep their current handling.

## Events and hooks

| Hook | Fires |
|---|---|
| `fluent_cart/order_refunded` | After every counted refund (stock, reminders, email) |
| `fluent_cart/order_fully_refunded` · `fluent_cart/order_partially_refunded` | By resulting payment status |
| `fluent_cart/order_refund_manually` (filter) | Lets an integration declare a refund manual. Skipped for forced local. |
| `fluent_cart/offline_payment_refund_id` (filter) | Cash on Delivery refund id |

`OrderRefund` stays silent when the refunded amount was already announced, so listeners run once per refund.

## MCP refund tool

`fluent-cart/refund-order` follows the same rules as the admin request and never forces a local refund.

- It takes the same `fct_refund_<order_id>` lock before reading the order, so the confirm step checks its fingerprint against totals no other refund can change.
- If the gateway refunded but FluentCart could not record it, the result is cached under the idempotency key and the order is marked (`_mcp_unrecorded_refund`). Preview and confirm then refuse with `unrecorded_refund_pending` until a store admin reconciles.
- The marker clears only for the lost refund: a refund row carrying the same gateway refund id, or, when the id is unknown, a row with the same amount recorded after the failure.

## Not covered by this page

- Writing a gateway: [Quick Implementation](/payment-methods-integration/quick-implementation).
- The REST schema: [Refund Order](/restapi/operations/orders/refund-order).
