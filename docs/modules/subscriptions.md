---
title: Subscriptions Module
description: FluentCart's subscription engine — the three collection methods (automatic, manual, system), the store-managed renewal engine, system auto-charge, dunning, the shared write-spine both billing models converge on, and how first payments that differ from renewals (signup fee, trial, coupon, upgrade credit) become simulated trials on each gateway.
---

# Subscriptions Module

FluentCart's subscription engine bills recurring products through **two competing models** — one where the payment gateway owns the schedule, and one where FluentCart owns it — unified behind a single database column and a single shared write-spine. This document is the architectural map: how the model is chosen, what machinery each one uses, and where they converge.

::: tip Where subscriptions live
| Concern | Location |
|---|---|
| Model + attributes | [`Subscription` model](/database/models/subscription) · [`SubscriptionMeta`](/database/models/subscription-meta) |
| Lifecycle hooks | [Action hooks](/hooks/actions/subscriptions) · [Filter hooks](/hooks/filters/customers-and-subscriptions) |
| REST endpoints | [Subscriptions API](/api/subscriptions) · [REST operations](/restapi/subscriptions) |
| Core code | `app/Modules/Subscriptions/` · `app/Modules/StoreManagedRenewal/` |
:::

## The one idea

Every subscription answers a single question: **who owns the billing schedule — the payment gateway, or FluentCart?**

That answer is the `fct_subscriptions.collection_method` column, and it decides everything downstream: whether a renewal is a webhook you receive or a renewal you generate, whether dunning is Stripe's retry ladder or FluentCart's grace period, whether an admin can edit the recurring amount.

| `collection_method` | Who bills | Renewal arrives as | Dunning owned by |
|---|---|---|---|
| `automatic` | The **gateway**, via a vendor subscription object (Stripe `sub_…`, PayPal `I-…`) | An inbound **webhook** | The gateway |
| `manual` | **FluentCart**, via the renewal engine; the customer pays each renewal by hand | A **renewal** you generate on a cron | FluentCart (reminders → past_due → expired) |
| `system` | **FluentCart**, via the renewal engine; a saved token is charged automatically | A **renewal** you generate, then charge off-session | FluentCart (retries → past_due → expired) |

`manual` and `system` are the **same engine**. `system` just adds a saved payment method and an automatic charge attempt per renewal. The predicate that groups them is `Subscription::usesRenewalEngine()` — **that method, not `collection_method` itself, is the real store-managed test**, and it appears as a guard throughout the codebase.

```mermaid
flowchart TD
  CM["collection_method"] --> AUTO["<b>automatic</b><br/>gateway-managed"]
  CM --> RE{"usesRenewalEngine()"}
  AUTO --> V["vendor subscription<br/>gateway bills it<br/>webhook tells us"]
  RE --> MAN["<b>manual</b><br/>customer pays<br/>each renewal"]
  RE --> SYS["<b>system</b><br/>token charged<br/>automatically"]
  classDef auto fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f;
  classDef store fill:#dcfce7,stroke:#22c55e,color:#14532d;
  class AUTO,V auto;
  class MAN,SYS store;
```

**Reading by type:** `automatic` → [Gateway-managed](#gateway-managed-automatic). `manual` → [the renewal engine](#store-managed-the-renewal-engine-manual-system) (it is the base — there is no separate "manual" section). `system` → the renewal engine **plus** [the auto-charge delta](#store-managed-auto-charge-system). [The capability matrix](#what-each-model-allows) compares all three side by side.

## How the method is decided

Exactly one place, exactly once — at checkout. `CheckoutProcessor::determineCollectionMethod()`:

```mermaid
flowchart TD
  START["Checkout · determineCollectionMethod()"] --> MODE{"Management mode?"}
  MODE -->|store_managed| RES["resolveCollectionMethodFor(gateway)"]
  MODE -->|gateway_managed| GHAS{"gateway has<br/>'subscriptions'?"}
  RES --> SHAS{"system_charge = yes<br/>AND gateway has<br/>'system_subscription'?"}
  SHAS -->|yes| SYS["system"]
  SHAS -->|no| MAN1["manual"]
  GHAS -->|yes| AUTO["automatic"]
  GHAS -->|no · COD, bank| MAN2["manual"]
  SYS --> FILT["filter:<br/>subscription_collection_method_{gateway}"]
  MAN1 --> FILT
  AUTO --> FILT
  MAN2 --> FILT
  FILT --> STAMP["stamp config.management_mode<br/>onto the subscription row"]
  classDef auto fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f;
  classDef store fill:#dcfce7,stroke:#22c55e,color:#14532d;
  class AUTO auto;
  class SYS,MAN1,MAN2 store;
```

Two inputs: a **store setting** and a **gateway capability**.

### The setting

`SubscriptionManagementMode` (`app/Modules/Subscriptions/Services/SubscriptionManagementMode.php`) reads from the `fluent_cart_store_settings` option blob, rendered on the Subscriptions settings tab and sanitized by whitelist in the meta request.

| Key | Values | Default |
|---|---|---|
| `subscription_management_mode` | `gateway_managed` \| `store_managed` | `gateway_managed` |
| `subscription_system_charge` | `yes` \| `no` | `no` |
| `subscription_manual_fallback` | `yes` \| `no` | `no` |

`subscription_system_charge` is inert under `gateway_managed` — `isSystemChargeEnabled()` returns `false` outright unless the mode is store-managed.

`subscription_manual_fallback` is inert under `store_managed` — `isManualFallbackEnabled()` returns `false` outright unless the mode is gateway-managed. When on, gateways without `subscriptions` support are offered on a gateway-managed subscription cart instead of being hidden, and the resulting subscription is created with `collection_method = manual` — invoiced by FluentCart, paid by hand each cycle.

### The full decision matrix

| Mode | System charge | Gateway | Result |
|---|---|---|---|
| gateway_managed | (ignored) | has `subscriptions` | `automatic` |
| gateway_managed, manual fallback **on** | (ignored) | no `subscriptions` (COD, bank transfer) | `manual` |
| store_managed | off | any | `manual` |
| store_managed | on | has `system_subscription` (Stripe, PayPal) | `system` |
| store_managed | on | no `system_subscription` (COD, bank transfer…) | `manual` |

A per-gateway filter gets the last word: `fluent_cart/subscription_collection_method_{gateway}`.

::: tip Both Stripe and PayPal do `system`
Off-session auto-charge is the `system_subscription` capability, and **both Stripe and PayPal declare it** (each overrides `chargeRenewal()` / `reconcileRenewalCharge()`). The Stripe-only axis is a *narrower* one — `zero_recurring` / `supportsSetupWithoutCharge()`, the ability to vault a card at **\$0 on a free-trial cart**. PayPal must take a payable-now charge to vault its token, so it can run `system` on a paid-now cart but **cannot start a `system` sub from a \$0 trial**.
:::

### The durable stamp — why flipping the setting is safe

A store-managed subscription also gets `config['management_mode'] = 'store_managed'` written onto its row.

This exists because **payment paths must consult the stamp, not the live setting**. Gateways contain legacy logic that converts a `manual` subscription to `automatic` when it is paid through a subscription-capable gateway. Without the stamp, a merchant who flipped back to `gateway_managed` would silently convert every store-managed subscription into a vendor subscription the next time a customer paid a renewal.

An unstamped `manual` subscription — one born on a gateway-managed store — can still convert, and that is intentional. When it may is covered under [which gateways appear on a renewal](#which-gateways-appear-on-a-renewal-or-reactivation).

`AbstractPaymentGateway::shouldChargeSubscriptionAsOneTime()` is the enforcement point:

- `automatic` subscription → `false` (keeps billing at the vendor, untouched by a flip to store-managed)
- **stamped** store-managed subscription → `true` **regardless of the current setting** — it can never be converted
- unstamped `manual` (pre-feature legacy) → follows the live setting

::: warning The single most important invariant
**Flipping the mode affects new checkouts only.** No existing subscription ever changes its billing model.
:::

### Gateway capability flags

Declared as `$supportedFeatures` on each gateway; tested with `AbstractPaymentGateway::has()`.

| Gateway | `subscriptions` | `manual_subscription` | `system_subscription` | `zero_recurring` | `switch_payment_method` | `card_update` |
|---|---|---|---|---|---|---|
| **Stripe** | ✅ | ✅ | ✅ | ✅ **(only one)** | ✅ | ✅ |
| **PayPal** | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| COD / offline | — | — | — | — | — | — |
| Authorize.net, Mollie, Paddle (pro) | ✅ | ✅ | — | — | — | Paddle only |
| Square, Paystack, Flutterwave, Razorpay (addons) | ✅ | — | — | — | — | — |
| MercadoPago, SSLCommerz (addons) | — | ✅ | — | — | — | — |

`zero_recurring` (backed by `supportsSetupWithoutCharge()`) is what lets a gateway vault a card at **\$0** — the free-trial `system` case. Only Stripe has it; PayPal does `system` but only when the cart charges something now.

`manual_subscription` is independent of `system_subscription` — it only claims a gateway routes a store-managed subscription's first payment through its existing one-time-charge path instead of creating a vendor subscription (`shouldChargeSubscriptionAsOneTime()`, below). COD/offline don't need it: `storeBilledOnly()` already admits them via `has('offline')` / `!has('subscriptions')`. MercadoPago and SSLCommerz declare it anyway even though the same `!has('subscriptions')` short-circuit already admits them — it's redundant, not load-bearing.

A seventh flag, `verify_vendor_ids`, is unrelated to billing: it claims the gateway can look a subscription id up read-only, which the [vendor-id repair tool](/modules/subscription-vendor-ids) uses to preview a correction before it is saved. Only Stripe and PayPal declare it; every other gateway inherits `AbstractSubscriptionModule::verifyVendorSubscription()`, which returns `not_implemented`.

The actual admit/hide decision for store-managed checkout lives in `SubscriptionGatewayGate::storeBilledOnly()` (`app/Modules/Subscriptions/Services/SubscriptionGatewayGate.php`):

```php
return $gateway->has('offline')
    || !$gateway->has('subscriptions')
    || $gateway->has('manual_subscription');
```

A gateway is eligible if it's offline, or doesn't declare `subscriptions` at all, or declares `subscriptions` **and** `manual_subscription`. That third branch is the only case where `manual_subscription` changes anything — it's what lets Stripe/PayPal/Authorize.net/Mollie/Paddle (subscription-capable gateways) also be offered on a store-managed cart instead of being excluded.

Two traps worth knowing:

1. **`has('subscriptions')` is auto-appended** by the constructor whenever a subscription module is injected — so the literal `$supportedFeatures` array under-reports it.
2. **`has('switch_payment_method')` always returns `false`.** It is an *associative* entry, and `has()` does `in_array` over values. Every call site reads it with `Arr::get($gateway->supportedFeatures, 'switch_payment_method')` instead.

### `manual_subscription` — wiring a third-party gateway for store-managed billing

A gateway earns `manual_subscription` by proving it can take a subscription's first payment as a plain one-time charge, with no vendor subscription object created. Two changes, both in the gateway class:

1. Add `'manual_subscription'` to `$supportedFeatures`.
2. In `makePaymentFromPaymentInstance()`, consult `shouldChargeSubscriptionAsOneTime()` **before** any vendor-subscription/conversion logic, routing to the gateway's existing single-payment path when it returns `true`:

```php
// AuthorizeDotNet.php — makePaymentFromPaymentInstance()
if ($this->shouldChargeSubscriptionAsOneTime($paymentInstance)) {
    return (new AuthorizeDotNetProcessor($this->authorizeSettings))->handleSinglePayment($paymentInstance);
}
```

That's the whole pattern — Mollie and Paddle (fluent-cart-pro) mirror it, each calling their own existing `handleSinglePayment()`. Don't add `system_subscription` alongside it unless the gateway also overrides `chargeRenewal()` / `reconcileRenewalCharge()` — `manual_subscription` alone only unlocks the non-zero-payable case; a gateway with no auto-charge implementation correctly stays hidden on \$0-due carts.

### Which gateways appear on a new subscription cart

`SubscriptionGatewayGate` capability-gates the payment methods on every subscription cart, on `fluent_cart/checkout_active_payment_methods`. It is the only filter on that list. **Both modes gate, in opposite directions** — store-managed keeps schedule-owning gateways out, gateway-managed keeps them in.

| Mode | Amount due today | Gateways offered |
|---|---|---|
| `gateway_managed` | any | Gateways **with** `subscriptions` only — a gateway-managed store has no renewal engine, so a subscription needs a gateway that can run its own schedule. Turn on the `subscription_manual_fallback` setting (default `no`) and gateways without it are offered again, billing `manual` |
| `store_managed` | > 0 | Gateways **without** `subscriptions` (COD, bank transfer, MercadoPago, SSLCommerz) — they can't auto-bill anyway — **plus** `manual_subscription` gateways (Stripe, PayPal, Authorize.net, Mollie, Paddle), which take a single charge here because `shouldChargeSubscriptionAsOneTime()` forces it. Vendor-billing-only gateways hidden |
| `store_managed`, auto-charge **on** | 0 (free trial) | Offline methods, plus a `system_subscription` gateway that can vault without charging (`supportsSetupWithoutCharge()`) — Stripe in `onsite` mode, PayPal in `paypal_pro` mode. Either gateway in another checkout mode drops off |
| `store_managed`, auto-charge **off** | 0 (free trial) | Offline methods only — nothing would ever charge a saved token |

Admission under `store_managed` is deliberately **opt-in**: a gateway is shown only when it is known not to run its own schedule. An unrecognised third-party gateway is hidden rather than trusted, because a gateway that creates a vendor subscription inside its own payment flow would bill in parallel with the renewals the engine generates.

Renewal and reactivation carts follow the *subscription*, not the store setting — see [which gateways appear on a renewal](#which-gateways-appear-on-a-renewal-or-reactivation).

**None of this is a security boundary.** The same filter re-runs server-side against the single posted gateway at order placement and returns `423` on a mismatch, so hiding a method in the UI is not what enforces it.

## Gateway-managed (`automatic`)

FluentCart hands the schedule to the gateway and becomes a mirror.

### Creation

The three subscription-capable gateways behave differently at creation — a critical detail, because two of them produce the `vendor_subscription_id` asynchronously:

```mermaid
sequenceDiagram
  participant C as Checkout
  participant G as Gateway
  participant B as Browser
  C->>C: create Subscription (status=pending)<br/>flip to 'intended'
  C->>G: makePaymentFromPaymentInstance()
  alt Stripe (server-side)
    G->>G: customer → price → SUBSCRIPTION<br/>(default_incomplete)
    G-->>C: writes vendor_subscription_id + vendor_customer_id
    B->>C: client confirms → status=active
  else PayPal (client-side)
    G->>G: product + billing PLAN
    G-->>C: writes vendor_plan_id only
    B->>B: PayPal JS SDK creates subscription
    B->>C: AJAX confirm → writes vendor_subscription_id
  else Paddle (webhook)
    G->>G: product + price + customer
    G-->>C: writes vendor_plan_id + vendor_customer_id
    B->>B: Paddle.js creates subscription
    G-->>C: vendor_subscription_id arrives via WEBHOOK only
  end
```

::: warning
Any code that assumes `vendor_subscription_id` exists right after checkout is wrong for **two of the three** gateways.
:::

### Renewal — the gateway tells you

All webhooks enter at `?fluent-cart=fct_payment_listener_ipn&method={slug}` → `GlobalPaymentHandler` → `$gateway->handleIPN()`.

| Gateway | Renewal event | Handler |
|---|---|---|
| Stripe | `invoice.paid` with `billing_reason = subscription_cycle` | `Webhook::processSubscriptionRenewal()` |
| PayPal | `PAYMENT.SALE.COMPLETED` **with** `billing_agreement_id` | `IPN::processRecurringPaymentReceived()` |
| Paddle | `subscription.payment_received` | Re-syncs from remote, which then records the payment |

All three converge on **`SubscriptionService::recordRenewalPayment()`**:

1. Takes a MySQL lock on `fc_webhook_{vendor_charge_id}` and checks for an existing transaction — **idempotency**, because gateways retry webhooks.
2. **If a pending renewal already exists for the parent order, it settles that renewal** instead of creating a new order. This is the seam where a converted subscription's renewal gets closed out by a gateway webhook.
3. Otherwise creates a child renewal `Order` (`type = renewal`, `parent_id` = the parent order) + `OrderItem` + a succeeded `OrderTransaction`.
4. Calls `syncSubscriptionStates()` with the gateway's own data.
5. Dispatches `SubscriptionRenewed`.

**`next_billing_date` is copied from the gateway** (`current_period_end`, `billing_info.next_billing_time`, `next_billed_at`) — never computed locally. `guessNextBillingDate()` is only a fallback for when the gateway supplies nothing.

### Status sync

Gateway-side changes (canceled, past_due, paused) reach the local row two ways:

- **Webhooks:** `customer.subscription.updated` / `.deleted` (Stripe), `BILLING.SUBSCRIPTION.*` (PayPal), `subscription.updated|past_due|paused|resumed` (Paddle).
- **`Subscription::reSyncFromRemote()`** — pull, not push. Called by the webhook handlers, and by the admin **Fetch** button (`SubscriptionController::fetchSubscription()`), gated on `canFetch` = not renewal-engine + has a vendor id.

Status mapping is per-gateway and **not** one-to-one. Stripe's (`StripeHelper::transformSubscriptionStatus()`):

| Stripe | FluentCart | Note |
|---|---|---|
| `active` | `active` | |
| `trialing` | `trialing` | |
| `incomplete`, `incomplete_expired` | `intended` | |
| **`past_due`** | **`expiring`** | not `past_due`! That local status is store-managed-only |
| `unpaid` | `expired` | |
| `canceled` | `canceled` | → `expired` if `cancellation_details.reason = payment_failed` |
| `paused` | `paused` | |

### What gateway-managed does **not** do locally

This is the cleanest way to understand the split:

1. **The renewal cron never touches it.** Every query in `RenewalService` is `whereIn('collection_method', ['manual','system'])`. No renewal order is pre-created; it appears reactively when the webhook lands.
2. **No local dunning or retries.** Retry ladders are the gateway's. FluentCart mirrors the resulting status.
3. **The recurring amount is not editable** — `canUpdateDetails()` is renewal-engine-only, and `recurring_total` is overwritten from the gateway's plan amount on every sync.
4. **The one local cron that does touch it** is a safety net: `Subscription::checkAndExpireSubscriptions()` (queried `whereNotIn('collection_method', ['manual','system'])`) expires a subscription whose `next_billing_date` is past the grace period — i.e. the webhook never arrived or the gateway silently stopped billing. It charges nothing; it only marks the row expired.

## First payments and simulated trials

A subscription's first payment is often not the same as its renewals. A signup fee makes it bigger. A free trial makes it zero. A first-payment coupon or an upgrade credit makes it smaller. FluentCart supports all of these on every gateway that runs subscriptions, including gateways that have no signup fee, cannot charge a different first amount, or have no trial at all.

The way FluentCart fills that gap can make a subscription look like it is on a trial, in the FluentCart admin and in the gateway's dashboard. **That "Trialing" status is expected. It is not a bug.**

::: tip At a glance
| Question | Short answer |
|---|---|
| Why does admin show "Trialing" when I never offered a trial? | The first payment was lower than the renewal price. FluentCart charged that amount at checkout and told the gateway to wait one billing period before its first renewal. Most gateways call that wait a trial. |
| What does the customer see? | "Active". The customer portal hides a trial that FluentCart created this way. |
| Is the customer charged twice? | No. The first period is paid once, at checkout. The gateway's first charge is for the second period. |
| When does it go away? | On the next billing date, when the gateway starts billing. |
:::

### The two numbers

Every subscription checkout ends with two numbers: **what the customer pays now**, and **what the customer pays on each renewal**. FluentCart works both out first, then compares the cost of the first period with the renewal price:

| First period costs… | Example | What FluentCart sets up |
|---|---|---|
| The same as a renewal | Plain $20/month | Nothing special. |
| More than a renewal | $20/month + $15 signup fee | A $35 first payment, then $20 renewals. |
| Less than a renewal | $20/month with a 50% first-month coupon | A $10 first payment. The first renewal waits one full billing period. FluentCart marks this wait as a **simulated trial**. |
| Nothing | Free trial, 100% coupon, full upgrade credit | No charge (or a card check). The first renewal waits for the trial, or for one billing period. |

A simulated trial is the wait after a first payment that was lower than the renewal price. Nobody offered it as a trial. FluentCart uses it because "charge something now, start billing later" is the one tool almost every gateway has.

These lower the first payment and can create one:

- A coupon that applies to the first payment only.
- A plan upgrade's prorated credit, or an upgrade discount.
- A shipping discount on the first order only, when renewals bill full shipping.
- A 100% discount.

A coupon that applies to every renewal lowers the renewal price instead, so it creates no simulated trial.

**Length:** one billing period in days. Monthly uses the number of days in the month of checkout, yearly 365, quarterly 90, weekly 7. A real free trial on the same plan is added on top. The total is capped at 365 days by default (filter `fluent_cart/max_trial_days_allowed`).

### Example: a first-month coupon

A customer buys a $20/month plan on 10 March with a coupon for 50% off the first month.

1. FluentCart charges **$10** at checkout.
2. The first period costs less than a renewal, so it adds a simulated trial of **31 days** (March has 31).
3. The gateway is told to start billing on **10 April**, at $20.
4. Until 10 April, the admin and the gateway dashboard may show **Trialing**. The customer portal shows **Active**.
5. On 10 April the gateway charges $20, and the status becomes Active everywhere.

### Example: a plan upgrade

A customer on a $10/month plan upgrades to a $30/month plan. The unused part of their current month is worth $5, so FluentCart gives a $5 upgrade credit.

1. FluentCart charges **$25** at checkout.
2. $25 is less than the $30 renewal, so the new subscription gets a simulated trial of one billing period.
3. The gateway first bills $30 one month later.
4. Until then the new subscription may show **Trialing** in the admin, even though the customer has paid and never saw a trial.

### How gateways carry it out

FluentCart sends the gateway the same plan whatever the gateway can do. Each gateway uses the closest tool it has:

| Gateway can… | What FluentCart does |
|---|---|
| Run a trial and add a one-off first charge | Uses both. The wait is the gateway's own trial, and the first payment is an extra charge on the first invoice. |
| Run a trial, but has no signup fee | Uses a trial period priced at the first payment. |
| Neither | Charges the first payment itself as a one-time payment, then creates the gateway subscription with a later start date. |
| Not delay the start at all | Can still take a lower or higher first payment, but cannot run a real free trial. FluentCart refuses that checkout. |

Whatever the tool, the gateway reports its own status, and FluentCart shows that status in the admin. Gateways that model the wait as a trial report **Trialing**. Gateways that model it as a later start date may report either **Trialing** or **Active** until billing starts.

### Why the admin and the portal differ

The admin shows the status the gateway reports. The customer portal reads a corrected status (`overridden_status`):

| Subscription | Admin shows | Customer portal shows |
|---|---|---|
| Simulated trial, gateway reports trialing | Trialing | **Active** |
| Real free trial, gateway reports active, still inside the trial | Active | **Trialing** |
| Everything else | The stored status | The same |

So the admin always shows what the gateway reports, and the customer sees what they bought.

Other places that tell the two kinds of trial apart:

- **Product and checkout labels.** "Free Trial: N days" is never shown for a simulated trial.
- **Reminders.** A simulated trial gets renewal reminders, like any paid subscription. Only a real trial gets trial-ending reminders.
- **Subscription reports.** A trialing subscription with a simulated trial is counted as "discounted", not as a trial.
- **Plan upgrades.** A subscription on a real trial gets no prorated credit when it upgrades. One on a simulated trial does, because the customer paid for that period.

### Installments

On a plan with a fixed number of payments, the first payment at checkout already covers the first period. So the gateway must bill one fewer time (`getInitialRemoteBillTimes()`). Gateways that take a payment count get the reduced count. Gateways that do not are ended by FluentCart: when the last payment is recorded, the subscription completes and `SubscriptionEOT` cancels it at the gateway (see [Events](#events)).

### Reactivation

A canceled or expired subscription that is reactivated usually gets a **new** gateway subscription. If the customer still has paid days left, the new one waits until they run out (`getReactivationTrialDays()`). That wait is a simulated trial too, so it can show "Trialing" in the admin.

If the reactivation payment is the last installment, most gateways create no new gateway subscription, and FluentCart completes the subscription locally.

### Store-managed subscriptions

A [store-managed](#store-managed-the-renewal-engine-manual-system) subscription has no gateway subscription. FluentCart runs the schedule itself, so it needs no trial trick. On first activation:

- A real free trial starts as **Trialing**.
- A simulated trial starts as **Active**.

### For support

When a merchant reports "Trialing" on a subscription with no trial:

1. Open the order. If the first payment was lower than the renewal price (coupon, upgrade, discount), this is a simulated trial.
2. Check the next billing date. It should be one billing period after the first payment.
3. Check that the customer portal shows "Active".
4. Nothing to fix. The status follows the gateway and becomes "Active" when the gateway starts billing.

### Code reference

Paths are relative to `fluent-cart/`. Each gateway's own handling lives in its `Processor` / `Confirmations` classes.

| What | Where |
|---|---|
| First payment vs renewal, simulated trial decision | `app/Helpers/CheckoutProcessor.php` · `convertToSubscriptionFormat()` (config flag `is_trial_days_simulated`) |
| Discounts that lower the first payment (coupon, `prorate_credit`, `upgrade_discount`) | `app/Helpers/CheckoutProcessor.php` discount total |
| First-order-only shipping discount | `app/Helpers/CheckoutProcessor.php` (`billRenewalsFullShipping`) |
| Simulated trial length, 365-day cap | `app/Helpers/Helper.php` · `calculateAdjustedTrialDaysForInterval()` |
| Interval days | `app/Services/Payments/PaymentHelper.php` · `getIntervalDays()` |
| Customer-facing status | `app/Models/Subscription.php` · `getOverriddenStatusAttribute()` |
| Payment count sent to the gateway | `app/Models/Subscription.php` · `getInitialRemoteBillTimes()` |
| Paid days left on reactivation | `app/Models/Subscription.php` · `getReactivationTrialDays()` |
| $0 first period counting | `app/Helpers/CheckoutProcessor.php` · `syncInitialCycleCounting()` (`billed_cycles_offset`) |
| Store-managed first status | `app/Helpers/StatusHelper.php` |
| "Free Trial" label | `app/Helpers/Helper.php` · `generateTrialInfo()` |
| Reminders | `app/Services/Reminders/ReminderService.php` |
| Reports ("discounted") | `app/Services/Report/SubscriptionReportService.php` |
| Upgrade credit and real trials | `app/Services/PlanUpgradeService.php` |
| Admin list status | `resources/admin/Modules/Subscriptions/Components/SubscriptionsTable.vue` (raw `status`) |
| Portal status | `resources/public/customer-profile/Vue/parts/SubscriptionTable.vue` (`overridden_status`) |

## Store-managed: the renewal engine (`manual` + `system`)

FluentCart owns the schedule. One hourly cron drives everything.

```mermaid
flowchart LR
  CRON["fluent_cart/scheduler/hourly_tasks<br/>RenewalScheduler::handle()"] --> DUE["processDueSubscriptions(20)"]
  CRON --> OVER["processOverdueRenewals(20)"]
  DUE --> GEN["createRenewalOrders()<br/>GET_LOCK('fc_renewal_{id}')<br/>type=renewal, due_date meta"]
  GEN -->|manual| EMAIL["fluent_cart/renewal_created<br/>→ Pay Now email"]
  GEN -->|system| SCHED["system_renewal_scheduled<br/>→ scheduleCharge() · no email"]
  OVER --> DUNN["active → past_due → expired<br/>(two passes, grace-gated)"]
  classDef store fill:#dcfce7,stroke:#22c55e,color:#14532d;
  class GEN,EMAIL,SCHED,DUNN store;
```

### The cron

`fluent_cart/scheduler/hourly_tasks` (Action Scheduler, 3600s) → `RenewalScheduler::handle()`, which does exactly two things — generate renewals coming due, and escalate renewals that were not paid. Batch size **20 each, per hour**.

### Generating the renewal

`RenewalService::processDueSubscriptions()` selects renewal-engine subscriptions whose `next_billing_date` falls inside an **advance window** — the renewal is created *before* it is due:

| Interval | Advance days | Grace days |
|---|---|---|
| daily | 0 | 1 |
| weekly | 3 | 3 |
| monthly | 7 | 7 |
| quarterly / half-yearly / yearly | 15 | 15 |

(Advance: `getAdvanceCreationDaysMap()`. Grace: `SubscriptionHelper::getSubscriptionsGracePeriodDays()`. Both filterable — see [Hook inventory](#hook-inventory).)

`createRenewalOrders()` takes a MySQL advisory lock (`GET_LOCK('fc_renewal_{sub_id}')`), re-checks that no open renewal exists, and creates a child `Order` inside a transaction:

- `type = renewal`, `parent_id` = parent order, `status = pending`
- **`payment_status` = `payment_scheduled` if the subscription `isSystem()`, else `pending`** — this single line is the fork between the two store-managed modes
- order meta **`due_date` = the subscription's `next_billing_date`** — the anchor for every downstream dunning calculation
- a pending `OrderTransaction`

Then:

- **`manual`** → fires `fluent_cart/renewal_created` → the customer gets a renewal email with a Pay Now link.
- **`system`** → fires `fluent_cart/subscriptions/system_renewal_scheduled` and calls `SystemChargeService::scheduleCharge()`. **No email.** The customer is not asked to pay something that is about to be charged.

### Reminders

A separate subsystem (`RenewalReminderService`), **off by default** (`reminders_enabled` / `renewal_reminders_enabled` both default `no`).

Anchored on `due_date`: one reminder at the due date, then overdue reminders at **1, 3, 7 days** past it (filterable). It deliberately skips system renewals that are still waiting on their scheduled charge.

### Dunning — past_due, then expired

`processOverdueRenewals()` walks unpaid renewals (`pending` or `payment_scheduled`) and computes `renewalAge = now - due_date` in days:

```
renewalAge >= 0          and status ∈ [active, trialing]  →  past_due
renewalAge >= graceDays  and status == past_due           →  expired
```

**It takes two cron passes to expire** — active → past_due, then (grace elapsed) past_due → expired. Expiry calls `syncSubscriptionStates(['status' => expired, 'next_billing_date' => null])`.

The scanner stands down for a system subscription whose charge engine still owns the renewal — either an async charge is settling, or an attempt is still queued (`hasQueuedCharge()`). **A queued retry suppresses expiry**, so a subscription can never die out from under an armed charge.

### Paying — the Pay Now path

```mermaid
flowchart LR
  LINK["Pay Now link<br/>?fluent-cart=custom_checkout&order_hash={uuid}"] --> CC["CustomCheckout<br/>cart bound to the renewal order"]
  CC --> PAY["customer pays with<br/>ANY enabled gateway"]
  PAY --> SYNC["StatusHelper::syncOrderStatuses()<br/>atomic → paid claim"]
  SYNC --> HOOK["do_action('fluent_cart/renewal_paid')<br/>the ONLY fire site"]
  HOOK --> L1["handleRenewalPaid() · prio 10"]
  HOOK --> L2["cancelPendingCharge() · prio 20"]
  classDef store fill:#dcfce7,stroke:#22c55e,color:#14532d;
  class SYNC,HOOK store;
```

`StatusHelper::syncOrderStatuses()` is the order-side chokepoint. It derives payment status from transaction rows, and **atomically claims** the `→ paid` transition with a conditional UPDATE. If another process (webhook vs. browser confirmation) already claimed it, this one returns early. That claim is what makes the renewal-paid hook fire exactly once:

```php
// StatusHelper — the ONLY fire site for fluent_cart/renewal_paid
if ($this->order->type === Status::ORDER_TYPE_RENEWAL
    && $oldPaymentStatus !== $this->order->payment_status
    && $this->order->payment_status === Status::PAYMENT_PAID) {
    do_action('fluent_cart/renewal_paid', ['order' => $this->order]);
}
```

Edge-triggered: `renewal && (pending|payment_scheduled|failed) → paid`. Two listeners: `RenewalService::handleRenewalPaid()` (priority 10) and `SystemChargeService::cancelPendingCharge()` (priority 20 — paying early cancels the queued charge).

**`handleRenewalPaid()`** is where a store-managed renewal completes:

- Idempotent via a `renewal_processed` order meta flag.
- **Cadence-preserving `next_billing_date`:** paid on or before the due date → `due_date + interval` (the schedule does not drift). Paid late → `now + interval`.
- Accepts an **`expired`** subscription and brings it back — a late payment revives.
- Calls `syncSubscriptionStates()`, then dispatches `SubscriptionRenewed` — unless the sync just completed the subscription (EOT), in which case it returns first.

### Which gateways appear on a renewal or reactivation

The same `SubscriptionGatewayGate` handles these, but the decision comes from the *subscription* — its `collection_method` and how it was **born** (the `management_mode` stamp) — never from the store's current setting for an already-stamped subscription. Nothing in the renewal engine gates the list separately.

| Subscription | Gateways offered |
|---|---|
| `automatic` | Gateways with `subscriptions` only — it owns a vendor schedule, and a one-time gateway would strand it. Ignores the `subscription_manual_fallback` setting |
| `manual`, unstamped, store `gateway_managed`, invoice **not yet due** | One-time gateways only — see below |
| `manual`, unstamped, store `gateway_managed`, invoice **due or overdue** | The conversion window: capable gateways offered, and paying through one converts the subscription to `automatic` |
| `manual` stamped `store_managed`, or unstamped while the store is store-managed today | One-time only: `manual_subscription` gateways plus gateways with no `subscriptions` support. Never converts |
| `system` | Same one-time-only list; no conversion path exists for `system` at all |

Whatever survives is reordered so the subscription's `current_payment_method` renders first. A cart naming a subscription that cannot be resolved is left **ungated** — there is nothing to reason about, and the charge itself fails safely with `no_subscription` before any gateway API call.

#### Why an early renewal payment is restricted

Renewal invoices are generated days *ahead* of their due date so the customer has time to pay, and `handleRenewalPaid()` anchors the next date to `due_date` when they pay on or before it — the cadence is preserved and the advance days are honoured.

The legacy manual→automatic conversion cannot honour them. It creates a vendor subscription anchored to **now** (no trial anchor is set unless the plan itself carries trial days), so an early payer is charged immediately and their `next_billing_date` is reset to `today + interval`, forfeiting every day between now and the original due date. So the gate closes that window until the due date arrives, when there is nothing left to lose.

Two consequences worth knowing:

- The restriction uses a strict "no `subscriptions` support" test, not the store-billed list above. Stripe and PayPal declare `manual_subscription`, but the one-time routing that flag implies does not apply to an unstamped `manual` subscription on a gateway-managed store — `shouldChargeSubscriptionAsOneTime()` returns `false` there, so they would still take the subscription route and convert.
- If such a store has no one-time gateway active, that one checkout renders **no** payment methods. Deliberate: the customer pays from the due date onward instead of silently losing days.

A reactivation rarely hits this rule — a reactivation cart only reaches checkout when payment is already due, so its invoice is not in advance.

## Store-managed + auto-charge (`system`)

Everything above still applies. `system` adds a saved token and an automatic charge per renewal. Same renewal engine, same dunning, same admin actions — it just tries to pay the renewal for the customer first.

### Token storage — no new table

```
customer id (cus_…)  →  fct_subscriptions.vendor_customer_id      (existing column)
token       (pm_…)   →  active_payment_method SubscriptionMeta    (existing key)
```

**Two shapes in the wild.** `active_payment_method` is written top-level (`vendor_method_id`) by the checkout/confirmation paths, but nested (`details.payment_method_id`) by the card-update/switch-payment-method flow. **Every reader must check both** — e.g. `Arr::get($meta, 'vendor_method_id') ?: Arr::get($meta, 'details.payment_method_id')`. A single-shape read risks re-persisting a stale token or wrongly demoting a subscription whose current token came from a card update.

At checkout the first payment is a **one-time charge that also vaults the method** — not a vendor subscription. On **Stripe** that is a PaymentIntent with `setup_future_usage = off_session`; on **PayPal** the initial capture is taken vault-enabled and the resulting token is stored the same way (later charged via `Processor::chargeVaultedRenewal()`). The card is saved with explicit consent copy. **The token is read at charge time, never snapshotted** into the scheduled action, so a card updated mid-dunning is picked up by the next retry automatically.

**Webhook fallback for vaulting.** The zero-payable trial SetupIntent confirm normally completes via AJAX. If that call is lost (network drop, closed tab), the `setup_intent.succeeded` webhook recovers it — same write path, same demote-to-manual fallback if the gateway returns no token. Self-idempotent: a duplicate/late webhook after the AJAX call already succeeded fails its `vendor_charge_id` lookup and no-ops.

### The charge lifecycle

```mermaid
flowchart TD
  CREATE["Renewal created<br/>(payment_scheduled, no email)"] --> SC["scheduleCharge()<br/>Action Scheduler at the DUE DATE<br/>hook: system_charge_due (order_id, attempt)"]
  SC --> EXEC["executeCharge(orderId, attempt)"]
  EXEC --> T{"result"}
  T -->|true| OK["confirmPaymentSuccess<br/>→ syncOrderStatuses<br/>→ renewal_paid → handleRenewalPaid"]
  T -->|'processing'| PROC["renewal stays scheduled<br/>reconcile daily (max 7)<br/>then fail back to pending"]
  T -->|WP_Error| ERR["renewal → pending<br/>charge-failed email<br/>schedule next retry → dunning resumes"]
  classDef ok fill:#dcfce7,stroke:#22c55e,color:#14532d;
  classDef warn fill:#fef3c7,stroke:#d29922,color:#713f12;
  classDef err fill:#fee2e2,stroke:#ef4444,color:#7f1d1d;
  class OK ok;
  class PROC warn;
  class ERR err;
```

The gateway contract is two methods on `AbstractPaymentGateway`, both defaulting to `WP_Error('not_supported')` so a capability/implementation mismatch degrades instead of fataling:

| Method | Returns |
|---|---|
| `chargeRenewal(PaymentInstance, $args)` | `true` \| `'processing'` \| `WP_Error` |
| `reconcileRenewalCharge(PaymentInstance)` | same three |

Stripe's implementation is a PaymentIntent with `customer` + `payment_method` + `off_session: true, confirm: true`, keyed `Idempotency-Key: fct_system_charge_{order_id}_{attempt}`.

### Retries are anchored to the grace period, not to fixed days

```
offsets = [0.25, 0.6, 0.9] × graceDays      → 3 retries + the due-date attempt = 4 total
```

| Interval | Grace | Attempt 1 | Retries |
|---|---|---|---|
| daily | 1 day | due date | +6h, +14.4h, +21.6h |
| weekly | 3 days | due date | +0.75d, +1.8d, +2.7d |
| monthly | 7 days | due date | +1.75d, +4.2d, +6.3d |
| quarterly / yearly | 15 days | due date | +3.75d, +9d, +13.5d |

The first attempt always fires **on the due date itself** — no grace maths touches it. Only the retries scale.

Why not fixed days? Because the grace period is per-interval, so a fixed schedule delivers a *different number of retries per interval*. Anchoring to grace guarantees all intervals land their retries inside the dunning window.

Two invariants hold the schedule and the scanner together:

- The overdue scanner **will not expire a subscription while an attempt is queued**, so even a filter that pushes an offset past the grace period cannot kill a subscription mid-retry.
- Offsets are sorted, and **truncated to `MAX_ATTEMPT_SLOTS - 1`**. Attempt numbers key both the scheduler lookups and the gateway idempotency key, so an attempt scheduled outside the swept slot range would be invisible to `hasQueuedCharge()` and `unscheduleCharges()` — left armed to charge a renewal that had already been paid or voided.

The retry offsets are filterable (`fluent_cart/subscriptions/system_charge_retry_offsets`), and the charge-failed email defaults to **first failure only** so retries don't spam the customer.

### Admin-triggered charges — off the scheduler

Two admin actions charge on demand, both through `SystemChargeService::chargeNow()` — one immediate off-session attempt that first **unschedules the queued due-date attempt**, so the manual and automatic charge can never both run:

- **Charge Now** charges an *existing* open renewal. Gated `canChargeNow`: `system`, open renewal exists, chargeable status, not currently settling (`processing`). After exhaustion the click clears `exhausted`, runs one attempt, and re-records exhaustion on a fresh failure — no ladder restart, nothing re-queued.
- **Charge Next Renewal Now** is the create-renewal action (`SubscriptionController::createRenewalNow()`) on a `system` sub: `createRenewalOrders()` **then** `chargeNow()` on the fresh renewal, in one call. Manual subs take the create-only branch (pay-now email, no charge). Gated `canCreateRenewal` (`usesRenewalEngine()` + active/trialing + `next_billing_date` + **no** open renewal), so it and Charge Now are mutually exclusive by open-renewal state.

A decline returns `status = 'failed'` (HTTP 200) and drops the renewal onto the normal retry/dunning ladder; a state violation returns `WP_Error`.

### Losing the capability — demotion to `manual`

`collection_method` is resolved once, at checkout. But `current_payment_method` can move afterwards — most commonly when a customer pays a **failed** renewal with a **different gateway** via Pay Now. That is a one-off renewal payment; no vendor subscription is created. The subscription is now `system` on a gateway that cannot token-charge.

`SystemChargeService::reconcileGatewayCapability()` runs from `syncSubscriptionStates()` whenever `current_payment_method` comes back dirty. If the new gateway lacks `system_subscription`, `demoteToManual()` hands the subscription back to plain manual invoicing: flip `collection_method`, drop `system_charge_state`, unschedule queued attempts, release any waiting renewal to `pending` **with the pay-now email that was previously withheld**, log it, and fire `system_charge_disabled`.

A second trigger fires **at initial checkout**: if the first capture returns no vaultable token at all (Stripe: no `payment_method` on the response; PayPal: capture isn't vault-enabled), the confirmation path demotes immediately rather than leaving a `system` subscription with nothing to charge.

::: tip Manual is the floor
In store-managed mode, `resolveCollectionMethodFor()` has no `automatic` branch. A store-managed subscription that loses auto-charge falls back to **manual invoicing** — it never falls back to gateway billing.
:::

## The shared spine

Both models write through the same two functions. This is why the lifecycle events fire consistently no matter how a subscription is billed.

```mermaid
flowchart TD
  RRP["recordRenewalPayment()<br/><i>gateway-managed</i>"] --> SS
  HRP["handleRenewalPaid()<br/><i>store-managed</i>"] --> SS
  ADMIN["admin cancel / pause / resume"] --> SS
  SS["SubscriptionService::syncSubscriptionStates()"] --> R1["1 · recompute bill_count from DB"]
  SS --> R2["2 · EOT rule → completed"]
  SS --> R3["3 · normalize companion fields"]
  SS --> R4["4 · capture dirty diff → reconcileGatewayCapability"]
  SS --> R5["5 · dispatch lifecycle events ONCE"]
  classDef spine fill:#f3e8ff,stroke:#a855f7,color:#581c87;
  class SS spine;
```

### `syncSubscriptionStates()` — the subscription-side chokepoint

`app/Modules/Subscriptions/Services/SubscriptionService.php`. Every meaningful subscription write funnels through it.

1. **Recomputes `bill_count` from the database** — counts succeeded charge transactions with `total > 0`, plus `early_payment_history`, plus a `billed_cycles_offset` meta, minus `billed_cycles_deduction`. **A caller-supplied `bill_count` is always overwritten.** The column is derived, never incremented.
2. **Owns the EOT rule:** `isEot = bill_times > 0 && bill_count >= bill_times` → forces `status = completed`, `next_billing_date = NULL`. (`bill_times = 0` means unlimited and never completes.)
3. Normalizes companion fields (`canceled_at`, `validity_expired_at`).
4. Captures the **dirty diff** before saving — that diff is what the update hook publishes, and what triggers `reconcileGatewayCapability()` when `current_payment_method` changes.
5. Compares old status to new and dispatches lifecycle events **exactly once**.

Two paths deliberately bypass it — admin **edit** and admin **reactivate** — precisely because step 1 would override an explicit admin choice. Both re-implement the event fan-out by hand.

### Events

| Event | Fires when | Gateway-managed | Store-managed |
|---|---|---|---|
| `SubscriptionActivated` | First payment lands | ✅ | ✅ |
| `SubscriptionRenewed` | A renewal is paid | ✅ via `recordRenewalPayment()` | ✅ via `handleRenewalPaid()` |
| `SubscriptionCanceled` | Cancel | ✅ | ✅ |
| `SubscriptionEOT` | `bill_count >= bill_times` | ✅ | ✅ |
| `SubscriptionValidityExpired` | → expired | ✅ (+ expiry cron) | ✅ (via the overdue scanner) |
| `SubscriptionReactivated` | canceled/expired → active | ✅ | ✅ |
| `SubscriptionPaused` / `Resumed` | pause/resume | ✅ (gateway must support it) | ✅ (local, immediate) |
| `SubscriptionUpdated` | Admin edits the terms | ❌ **never** | ✅ only |
| `SubscriptionPeriodSkipped` | Admin skips a period | ❌ **never** | ✅ only |
| `fluent_cart/subscription_past_due` | Renewal overdue | ❌ **never** | ✅ only |
| `system_charge_failed` | Auto-charge declined | ❌ | ✅ `system` only |

`SubscriptionEOT` has a `beforeDispatch()` that cancels the vendor subscription with `fire_hooks => false` — so ending a term tears down the gateway side **without** also emitting `SubscriptionCanceled`.

See [Subscription action hooks](/hooks/actions/subscriptions) for payloads and priorities.

## What each model allows

| Action | `automatic` | `manual` | `system` | Guard |
|---|---|---|---|---|
| Cancel | ✅ (calls gateway) | ✅ (local) | ✅ (local) | — |
| Fetch / resync from gateway | ✅ | ❌ | ❌ | `canFetch` |
| Pause / Resume | ⚠️ gateway must support it | ✅ | ✅ | `canPause` / `canResume` |
| **Edit terms** (amount, interval, bill_times, next date) | ❌ | ✅ | ✅ | `canUpdateDetails()` = `usesRenewalEngine()` |
| **Reactivate** | ❌ | ✅ | ✅ | `usesRenewalEngine()` + `canReactivate()` |
| **Create renewal now** | ❌ | ✅ (create + email) | ✅ **create + charge** | `canCreateRenewal` |
| **Skip next period** | ❌ | ✅ | ✅ | `usesRenewalEngine()` |
| **Charge an open renewal now** | ❌ | ❌ | ✅ (one off-session attempt) | `canChargeNow` |
| Update card on file | ✅ | ✅ | ✅ | `canUpdatePaymentMethod()` |
| **Switch gateway** | ✅ | ❌ | ❌ | `canSwitchPaymentMethod()` |
| **[Edit vendor IDs](/modules/subscription-vendor-ids)** | ✅ opt-in | ❌ | ❌ | `canEditVendorIds()` — off unless `fluent_cart/subscription/vendor_id_editing_enabled` returns `true` |
| Pay Now on an open renewal | n/a | ✅ | ✅ (cancels the queued charge) | — |

Two asymmetries deserve explanation.

**Pause on `automatic` is effectively dead.** The code requires the gateway to declare `pause_subscription` and implement `pause()`. **No shipped gateway does either.** An automatic subscription can only become `paused` by being paused at the gateway and having the status arrive by webhook.

**Switching gateways is blocked for store-billed subscriptions** — and this is not a limitation, it's a correctness guard. "Switch payment method" does not change a card; both `StripeGateway/SwitchCustomerMethod` and `PayPalGateway/SubscriptionManager` **create a live vendor subscription** at the target gateway. On a subscription owned by the renewal engine, that gateway would start billing on its own schedule while FluentCart kept issuing renewals for the same periods — a **double bill**. Moving a store-billed subscription onto a gateway's billing engine is a *migration*, not a fallback, and is deliberately not implemented. Customers change the **card on file** instead.

## Hook inventory

### Shared

| Hook | Fired at |
|---|---|
| `fluent_cart/scheduler/hourly_tasks` | Action Scheduler, hourly |
| `fluent_cart/renewal_paid` | `StatusHelper` — **the only fire site** |
| `fluent_cart/payments/subscription_status_changed` | `SubscriptionService` |
| `fluent_cart/payments/subscription_{status}` | `SubscriptionService` (dynamic) |
| `fluent_cart/subscription/data_updated` | `SubscriptionService` (dirty diff, no status change) |
| `fluent_cart/subscription_collection_method_{gateway}` | filter — `CheckoutProcessor` |
| `fluent_cart/subscription/management_mode` | filter — `SubscriptionManagementMode`, store-wide mode override |
| `fluent_cart/checkout_active_payment_methods` | filter — `SubscriptionGatewayGate` gates every subscription cart here |
| `fluent_cart/subscription/vendor_id_editing_enabled` | filter, default `false` — opt in to [editing vendor identifiers](/modules/subscription-vendor-ids) on an `automatic` subscription |

### Renewal engine

| Hook | Purpose |
|---|---|
| `fluent_cart/renewal_created` | Renewal generated (drives the pay-now email) |
| `fluent_cart/renewal_payment_scheduled` | Gateway deferred a charge → renewal flips to `payment_scheduled` |
| `fluent_cart/subscription_past_due` | Overdue escalation (drives the past-due email) |
| `fluent_cart/renewal_voided` | Admin voided a renewal |
| `fluent_cart/renewal/advance_creation_days` | filter — the advance window map |
| `fluent_cart/subscription/grace_period_days` | filter — the grace map |

### System charge

| Hook | Params | Purpose |
|---|---|---|
| `fluent_cart/subscriptions/system_renewal_scheduled` | `(['subscription','order','parent_order','customer','transaction'])` | System renewal created; charge queued, no pay-now email |
| `fluent_cart/subscriptions/system_charge_due` | `($orderId, $attempt)` | The scheduled charge (Action Scheduler) |
| `fluent_cart/subscriptions/system_charge_reconcile` | `($orderId)` | Daily re-check of an async charge |
| `fluent_cart/subscriptions/system_charge_succeeded` | `(['order','subscription','attempt'])` | |
| `fluent_cart/subscriptions/system_charge_failed` | `(['order','subscription','attempt','error','next_retry_at'])` | |
| `fluent_cart/subscriptions/system_charge_failed_notification` | `([...])` | Drives the charge-failed emails |
| `fluent_cart/subscriptions/system_charge_failure_notify` | filter, default `$attempt === 1` | Whether to email on this failure |
| `fluent_cart/subscriptions/system_charge_disabled` | `(['subscription','reason'])` | Demoted to `manual` |
| `fluent_cart/subscriptions/system_charge_retry_offsets` | filter — `($offsets, ['subscription','grace_days'])` | Retry schedule, in days after the due date |
| `fluent_cart/subscriptions/system_collection_enabled` | filter — `($enabled)` | Store-wide override of the auto-charge setting |
| `fluent_cart/subscriptions/system_billing_enabled` | filter, default `true` | Env kill switch — return `false` (e.g. on a staging clone) to stop all system billing |

::: warning Stripe webhook events are merchant-configured
`Webhook::getEvents()` is the source of truth for which Stripe dashboard events are consumed (including `setup_intent.succeeded`). Any event added to the accepted-events list must also land in `getEvents()` and the setup instructions, or the merchant never enables it in their dashboard and the handler is unreachable.
:::

## Known gaps

Recorded so nobody rediscovers them the hard way.

- **An ambiguous transport failure can double-charge a `system` renewal.** The Stripe idempotency key is `fct_system_charge_{order_id}_{attempt}` — it includes the attempt number, so a charge that *succeeded* but whose response was lost gets re-charged under a fresh key on the next retry. A per-renewal key would fix it, at the cost of per-attempt replay protection.
- **Stripe's `invoice.payment_failed` is not handled.** It is advertised in the webhook setup instructions but absent from the accepted-events list, so it returns 200 and does nothing. Payment failure on a gateway-managed subscription is learned indirectly, via `customer.subscription.updated` → `past_due` → local `expiring`.
- **`pause_subscription` is declared by no gateway and implemented by none** — pausing an `automatic` subscription from FluentCart always fails.
- **The final installment of a store-billed subscription emits `SubscriptionEOT` but no `SubscriptionRenewed`** (`handleRenewalPaid` returns early once the sync marks it `completed`).
- **A lost Action Scheduler job** leaves a system renewal sitting in `payment_scheduled` with its reminders suppressed. The overdue scanner still escalates it once the due date passes, so it is not stranded — just quiet until then.
- **`store_managed` does not fully stop a gateway schedule for an `automatic` subscription.** The gate admits Stripe and PayPal on a store-managed cart because they declare `manual_subscription`, on the assumption they will take a single charge — but that one-time routing only applies to `manual` and `system` subscriptions. An `automatic` subscription paid through them still gets a vendor schedule. Closing it means widening the one-time rule itself, not the gate.

## Quick reference

**Am I looking at a store-managed subscription?** `$subscription->usesRenewalEngine()` — not `isManual()`, which means strictly `manual` and excludes `system`.

**Where does a renewal come from?**
- `automatic` → a webhook, reactively → `recordRenewalPayment()`
- `manual` / `system` → the hourly cron, proactively → `processDueSubscriptions()`

**Who advances `next_billing_date`?**
- `automatic` → the gateway (copied from its payload)
- `manual` / `system` → `handleRenewalPaid()`, cadence-preserving

**Why isn't my subscription renewing?**
- `automatic` → check the webhook actually arrived; the expiry safety-net cron is what eventually marks it expired
- `manual` / `system` → check `next_billing_date`, the advance window, and whether an open renewal already exists (the engine will not create a second one)

**Why is a `system` subscription not auto-charging?** Check `collection_method` — it may have been **demoted to `manual`** because the gateway on file changed (look for a `system_charge_disabled` activity log entry). Also check `system_charge_state` meta for `exhausted`.

## Related Documentation

- [Subscription Model](/database/models/subscription) — attributes, scopes, methods
- [Subscription Meta](/database/models/subscription-meta) — where tokens and system-charge state are stored
- [Subscription Action Hooks](/hooks/actions/subscriptions) — lifecycle event payloads
- [Subscription Filter Hooks](/hooks/filters/customers-and-subscriptions) — advance window, grace, retry offsets
- [Subscriptions API](/api/subscriptions) — admin and customer REST endpoints
- [Editing Vendor IDs](/modules/subscription-vendor-ids) — opt-in repair of `vendor_subscription_id` / `vendor_customer_id`
- [Payment Methods Module](/modules/payment-methods) — the gateway architecture subscriptions build on

---

**Next Steps:**
- [Payment Methods Module](./payment-methods) — gateway development and the capability system
- [Custom Payment Gateway](/payment-methods-integration/) — implement `chargeRenewal()` for system charges
- [Modules Overview](./index) — back to modules overview
