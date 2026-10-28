---
title: Payment Methods Module
description: FluentCart Payment Methods module architecture, gateway development, and integration guide.
---

# Payment Methods Module

The Payment Methods module is FluentCart's core payment processing system. It provides a flexible architecture for integrating various payment gateways while maintaining a consistent interface for order processing.

## Architecture Overview

### Core Components

#### 1. **GatewayManager**
The central manager for all payment gateways using the Singleton pattern.

```php
use FluentCart\App\Modules\PaymentMethods\Core\GatewayManager;

// Get manager instance
$manager = GatewayManager::getInstance();

// Get specific gateway
$stripe = GatewayManager::gateway('stripe');

// Check if gateway exists
$exists = GatewayManager::has('stripe');
```

#### 2. **PaymentGatewayInterface**
The interface that all payment gateways must implement.

```php
interface PaymentGatewayInterface
{
    public function has(string $feature): bool;
    public function meta(): array;
    public function makePaymentFromPaymentInstance(PaymentInstance $paymentInstance);
    public function handleIPN();
    public function getOrderInfo(array $data);
    public function fields();
}
```

#### 3. **AbstractPaymentGateway**
Base class providing common functionality for all gateways.

```php
abstract class AbstractPaymentGateway implements PaymentGatewayInterface
{
    public array $supportedFeatures = [];
    public StoreSettings $storeSettings;
    public ?AbstractSubscriptionModule $subscriptions;
    public BaseGatewaySettings $settings;
}
```

## Supported Payment Gateways

A gateway is "built-in" only if FluentCart or FluentCart Pro registers it. Core
registers three in `GlobalPaymentHandler::init()`; Pro registers three more. Everything
else is a separate add-on plugin that registers itself through
`fluent_cart/register_payment_methods`.

### Built-in — FluentCart (free)

| Gateway | Slug | Location | Declared features |
|---|---|---|---|
| Stripe | `stripe` | `app/Modules/PaymentMethods/StripeGateway/` | payment, refund, webhook, custom_payment, card_update, multi_currency, switch_payment_method, dispute_handler, subscriptions, zero_recurring, system_subscription, manual_subscription, verify_vendor_ids |
| PayPal | `paypal` | `app/Modules/PaymentMethods/PayPalGateway/` | payment, refund, webhook, custom_payment, card_update, multi_currency, switch_payment_method, dispute_handler, subscriptions, resume_subscription, system_subscription, manual_subscription, verify_vendor_ids |
| Offline / Cash on Delivery | `offline_payment` | `app/Modules/PaymentMethods/Cod/` | payment, refund, offline, local_refund_only, multi_currency |

Note the slug: the class is `Cod`, but it registers as `offline_payment`.

### Built-in — FluentCart Pro

| Gateway | Slug | Location | Declared features |
|---|---|---|---|
| Paddle | `paddle` | `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/` | payment, refund, webhook, subscriptions, custom_payment, upgrade_plan, card_update, resume_subscription, manual_subscription, first_cycle_discount, multi_currency |
| Mollie | `mollie` | `fluent-cart-pro/app/Modules/PaymentMethods/MollieGateway/` | payment, refund, webhook, subscriptions, upgrade_plan, manual_subscription, multi_currency |
| Authorize.Net | `authorize_dot_net` | `fluent-cart-pro/app/Modules/PaymentMethods/AuthorizeDotNetGateway/` | payment, refund, webhook, subscriptions, custom_payment, manual_subscription |

### Add-on gateways (separate plugins)

These are **not** in the core or Pro codebase. `AddonGatewaysHandler` holds an entry for
each so the admin can offer installation, and the add-on plugin registers the gateway
itself once active:

`paystack`, `razorpay`, `mercado_pago`, `flutterwave`, `square`, `airwallex`, `sslcommerz`

::: warning Feature flags are declarative
`has()` tests membership of `$supportedFeatures`. Some flags are acted on — notably
`subscriptions`, `system_subscription`, `offline`, `local_refund_only`, `refund`,
`payment` and `multi_currency`. Others, including `webhook`, are declared by every
built-in gateway but never queried, so adding one does not switch any behaviour on.
:::

## Building a custom gateway

The full walkthrough lives in the
**[Payment Gateway Integration Guide](/payment-methods-integration/quick-implementation)** —
registering the gateway, the settings class, the gateway class, the API handler, payment
processing, confirmation and the IPN listener, with the real return contract the checkout
frontend expects.

Related:

- [Overview](/payment-methods-integration/) — what a gateway has to provide
- [Setting Fields](/payment-methods-integration/payment_setting_fields) — every field type the settings renderer handles
- [Paddle Example](/payment-methods-integration/paddle-example) — a complete working gateway

### Registering your gateway

Gateways register on `fluent_cart/register_payment_methods`, which passes the manager:

```php
add_action('fluent_cart/register_payment_methods', function ($payload) {
    $payload['gatewayManager']->register('your_gateway', new YourGateway());
});
```

Core registers `stripe`, `paypal` and `offline_payment` this way in
`GlobalPaymentHandler::init()`; Pro adds `paddle`, `mollie` and `authorize_dot_net`.

### Testing a gateway

The IPN listener URL is built by `getListenerUrl()`, which returns an array:

```php
$url = $this->getListenerUrl()['listener_url'];
// https://example.com/?fluent-cart=fct_payment_listener_ipn&method=your_gateway
```

Point your gateway's webhook configuration at that URL. The store's `order_mode` decides
whether the store is in test or live mode, and `BaseGatewaySettings::getMode()` reads it.

---

**Next Steps:**
- [Shipping Module](./shipping) - Shipping method development
- [Storage Drivers](./storage) - File storage integration
- [Modules Overview](./index) - Back to modules overview
