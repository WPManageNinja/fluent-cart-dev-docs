---
title: Deprecated Hooks
description: Status registry for FluentCart hooks — which are deprecated and still fire, and which have been fully removed, with replacements and version numbers.
---

# Deprecated Hooks

FluentCart deprecates a hook through WordPress's `apply_filters_deprecated()` / `do_action_deprecated()` for at least one release before removing it outright. While deprecated, the old name still fires (usually forwarding into the new name's default value) so existing integrations keep working, but it logs a deprecation notice and will stop firing in a future release.

This page tracks that lifecycle: which hooks are currently deprecated and still fire today, and which have been removed and no longer fire at all. It's updated as hooks move through that lifecycle — check back here before assuming an old hook name still works.

## Deprecated — still fires, not yet removed

| Hook | Deprecated in | Replacement | Scheduled removal | Docs |
|------|----------------|-------------|--------------------|------|
| `fluent_cart/transaction/receipt_page_url` (PayPal redirect only) | 1.6.2 | `fluent_cart/payment/success_url` | Not yet scheduled | [Orders & Payments](/hooks/filters/orders-and-payments) |

::: warning This is not a deprecation of the hook itself
`fluent_cart/transaction/receipt_page_url` remains fully live for its original purpose — building a transaction's receipt page URL (see [Orders & Payments](/hooks/filters/orders-and-payments)). Only one specific caller is deprecating its *use* of that hook: PayPal's `getConfirmRedirectUrl()` currently reuses it as a stand-in for the post-payment redirect URL, and that narrow use is what's migrating to the more purpose-built `fluent_cart/payment/success_url`. If you hook `fluent_cart/transaction/receipt_page_url` for anything other than a PayPal redirect, this doesn't affect you.
:::

**Source:** `app/Modules/PaymentMethods/PayPalGateway/PayPal.php:741`

## Removed — as of v1.4.3

All 25 hooks below were deprecated in **1.3.16** and have their bridges fully removed as of **v1.4.3** — the old name no longer fires, with no notice and no fallback. Use the replacement listed.

### Core (22)

| # | Removed hook | Replacement |
|---|---------------|-------------|
| 1 | `fluent-cart/order_statuses` | `fluent_cart/order_statuses` |
| 2 | `fluent-cart/editable_order_statuses` | `fluent_cart/editable_order_statuses` |
| 3 | `fluent-cart/editable_customer_statuses` | `fluent_cart/editable_customer_statuses` |
| 4 | `fluent-cart/shipping_statuses` | `fluent_cart/shipping_statuses` |
| 5 | `fluent-cart/transaction_statuses` | `fluent_cart/transaction_statuses` |
| 6 | `fluent-cart/editable_transaction_statuses` | `fluent_cart/editable_transaction_statuses` |
| 7 | `fluent-cart/available_currencies` | `fluent_cart/available_currencies` |
| 8 | `fluent-cart/coupon_statuses` | `fluent_cart/coupon_statuses` |
| 9 | `fluent-cart/util/countries` | `fluent_cart/util/countries` |
| 10 | `fluentcart/transaction/receipt_page_url` | `fluent_cart/transaction/receipt_page_url` |
| 11 | `fluent-cart/after_render_payment_method_{$route}` | `fluent_cart/after_render_payment_method_{$route}` |
| 12 | `fluent_cart_stripe_idempotency_key` | `fluent_cart/stripe_idempotency_key` |
| 13 | `fluent_cart_stripe_request_body` | `fluent_cart/stripe_request_body` |
| 14 | `fluent_cart_form_disable_stripe_connect` | `fluent_cart/form_disable_stripe_connect` |
| 15 | `fluent_cart_stripe_appearance` | `fluent_cart/stripe_appearance` |
| 16 | `fluent_cart_template_part_content` | `fluent_cart/template_part_content` |
| 17 | `fluent_cart_template_part_content_{$slug}` | `fluent_cart/template_part_content_{$slug}` |
| 18 | `fluent_cart_template_part_output` | `fluent_cart/template_part_output` |
| 19 | `fluent_cart_template_part_output_{$slug}` | `fluent_cart/template_part_output_{$slug}` |
| 20 | `fluent_cart_ipn_url_{$slug}` | `fluent_cart/ipn_url_{$slug}` |
| 21 | `fluent_cart/afrer_checkout_page_start` | `fluent_cart/after_checkout_page_start` |
| 22 | `fluent_cart_payment_method_list_class` | `fluent_cart/payment_method_list_class` |

Find these in [Orders & Payments](/hooks/filters/orders-and-payments), [Cart & Checkout](/hooks/filters/cart-and-checkout), [Customers & Subscriptions](/hooks/filters/customers-and-subscriptions), [Settings & Configuration](/hooks/filters/settings-and-configuration), and [Integrations & Advanced](/hooks/filters/integrations-and-advanced).

### Pro (3)

| # | Removed hook | Replacement |
|---|---------------|-------------|
| 23 | `fluentcart/sanitize_user_meta` | `fluent_cart/sanitize_user_meta` |
| 24 | `fluent_cart/license/santized_url` | `fluent_cart/license/sanitized_url` |
| 25 | `fluent_cart_sl_encoded_package_url` | `fluent_cart_sl/encoded_package_url` |

Find these in [Pro Modules](/hooks/filters/pro-modules).
