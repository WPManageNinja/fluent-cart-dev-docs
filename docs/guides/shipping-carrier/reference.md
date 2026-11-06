---
title: Carrier Reference
description: Contract methods, optional methods, traits and hooks for FluentCart shipping carriers.
---

# Carrier Reference

All classes are under `FluentCart\App\Modules\Shipping\Carriers`, unless a full namespace is shown. All monetary values are in **cents** (for example, `$10.00` = `1000`).

## CarrierContract

`Contracts\CarrierContract` is what the `fluent_cart/shipping/carrier_providers` filter requires. Extend `Core\AbstractShippingCarrier` to get a default for everything except `meta()` and `fields()`.

| Method | Called when | Default |
| ------ | ----------- | ------- |
| `meta(): array` | Lists, settings and shipments | Required |
| `fields(): array` | The settings page and each save | Required |
| `isEnabled(): bool` | Building the rate list and the shipment form | `is_active` is `yes` |
| `getSettings(): BaseCarrierSettings` | Reading settings | The instance passed to the constructor |
| `boot(): void` | Once, at registration. Add your hooks here. | Nothing |
| `getRates(array $args): array` | Each rate list | `[]`. `ProvidesLiveRates` replaces it. |
| `validateSettings(array $settings)` | Each save | Returns `$settings` |
| `getShipmentQuote(ShipmentInstance $instance)` | The admin rate picker | `null` |
| `makeShipmentFromShipmentInstance(ShipmentInstance $instance)` | Creating a shipment | `null` |
| `cancelShipmentFromShipmentInstance(ShipmentInstance $instance)` | Deleting a shipment, or undoing a label | `null` |
| `getTrackingUrl(string $trackingNumber): string` | Deriving a tracking link | `''` |
| `supportsTrackingSync(): bool` | Showing the refresh action | `false` |
| `syncTrackingFromShipmentInstance(ShipmentInstance $instance)` | The admin refresh action | `null` |
| `getWebhookUrl(): string` | The settings page | `''` |
| `handleWebhook(): void` | An inbound webhook | Nothing |
| `createLabel(array $shipment)` | Required by the contract. Labels go through `makeShipmentFromShipmentInstance()`. | `WP_Error` |
| `getTrackingInfo(string $trackingNumber): array` | Required by the contract. Tracking goes through `syncTrackingFromShipmentInstance()`. | `[]` |

## Optional methods

These are not on the contract. A carrier that implements `CarrierContract` directly can add the ones it needs.

| Method | Purpose | Default |
| ------ | ------- | ------- |
| `canQuoteInCurrency(string $currency): ?bool` | Declares the currencies you can price in | `null` |
| `getRateCacheMinutes(): int` | Rate cache time after the filter, 1 to 1440 | `defaultRateCacheMinutes()`, which returns 10 |
| `runAction(string $action, array $data)` | A status button | `WP_Error` |
| `getSetupNotices(): array` | Problems for the merchant to fix | `[]` |
| `hasLabel(Shipment $shipment): bool` | Whether a label can be printed | `false` |
| `getLabelDownloadUrl(Shipment $shipment)` | A current link to the label PDF | `''` |
| `canTrackWithoutLabel(Shipment $shipment): bool` | Allows refresh without a `transaction_id` | `false` |
| `supportsUnconfirmedRecheck(): bool` | Adds **Check again** for an unconfirmed purchase. Not defined on the base class. | Not defined |
| `supports(string $feature): bool` | Whether `meta()['supports']` lists a feature | From `meta()` |

## Traits

| Trait | You implement | It provides |
| ----- | -------------- | ----------- |
| `Concerns\ProvidesLiveRates` | `fetchLiveRates()`, `canQuoteInCurrency()`, an `enable_rates` setting | `getRates()`, `buildOrigin()`, `markLiveRatesPartial()`, caching, backoff and the visitor limit |
| `Concerns\ProvidesSetupNotices` | `buildOrigin()` | `originSetupNotice()`, `setupNotice()`, `missingOriginFields()` |
| `Concerns\WebhookOutcomes` | | `webhookApplied()`, `webhookIgnored()`, `webhookRejected()`, `webhookFailed()` |

`ProvidesLiveRates` methods you can override:

| Method | Default |
| ------ | ------- |
| `liveRatesCacheItemsKey(array $items): string` | `''` |
| `liveRatesBudget(): int` | `20` |
| `liveRateSources(): array` | `[]` |
| `fetchLiveRatesForSource(string $source, array $destination, array $items, string $currency)` | Calls `fetchLiveRates()` |

`buildOrigin()` returns the store address as `country`, `state`, `city`, `postcode`, `address1` and `address2`.

## Filters

Source paths are for FluentCart 2.3.0.

### <code> shipping/carrier_providers </code>
<details>
<summary><code>fluent_cart/shipping/carrier_providers</code> &mdash; Register carriers</summary>

**When it runs:** Once per request, when FluentCart boots on `plugins_loaded`.

**Parameters:**

- `$carriers` (array): Slug => `CarrierContract` instance. A value of any other type is skipped with a notice.

**Returns:** `array` &mdash; The carriers to register.

**Source:** `app/Modules/Shipping/ShippingModule.php` (line 440)

**Usage:**
```php
add_filter('fluent_cart/shipping/carrier_providers', function ($carriers) {
    $carriers['acme'] = new \AcmeParcel\AcmeCarrier(new \AcmeParcel\AcmeCarrierSettings());
    return $carriers;
});
```
</details>

### <code> shipping/carrier_rate_cache_minutes </code>
<details>
<summary><code>fluent_cart/shipping/carrier_rate_cache_minutes</code> &mdash; How long quoted rates can be reused</summary>

**Parameters:**

- `$minutes` (int): The carrier's default
- `$context` (array): `carrier` (slug), `carrier_instance`

**Returns:** `int` &mdash; Minutes. Limited to 1 through 1440.

**Source:** `app/Modules/Shipping/Carriers/Core/AbstractShippingCarrier.php` (line 191)
</details>

### <code> shipping/carrier_rates_allow_conversion </code>
<details>
<summary><code>fluent_cart/shipping/carrier_rates_allow_conversion</code> &mdash; Show a base-currency rate at a checkout in another currency</summary>

**When it runs:** The carrier declared it cannot quote in the checkout currency but can quote in the base currency.

**Parameters:**

- `$allow` (bool): Default `false`
- `$context` (array): `carrier`, `checkout_currency`, `base_currency`

**Returns:** `bool` &mdash; True converts the rate at the store's exchange rate. False hides it.

**Source:** `app/Helpers/AddressHelper.php` (line 669)
</details>

### <code> shipping/auto_select_single_method </code>
<details>
<summary><code>fluent_cart/shipping/auto_select_single_method</code> &mdash; Auto-select when the list has one rate</summary>

**Parameters:**

- `$select` (bool): Default `true`
- `$context` (array): `cart`, `method` (an object), `rate` (the rate array)

**Returns:** `bool`

**Source:** `app/Helpers/CartHelper.php` (line 1052)
</details>

### <code> checkout/validate_data </code>
<details>
<summary><code>fluent_cart/checkout/validate_data</code> &mdash; Refuse an order at Place Order</summary>

**Parameters:**

- `$errors` (array): Errors by field. Add yours under `shipping_method` to show them in the shipping section.
- `$context` (array): `data` (the submitted form), `cart`

**Returns:** `array` &mdash; Any error stops the order.

**Source:** `api/Checkout/CheckoutApi.php` (line 1238)
</details>

### <code> before_carrier_dispatch </code>
<details>
<summary><code>fluent_cart/before_carrier_dispatch</code> &mdash; Adjust or skip a carrier dispatch</summary>

**Parameters:**

- `$instance` (ShipmentInstance)
- `$context` (array): `carrier_slug`

**Returns:** `ShipmentInstance` to continue, or anything else to skip the carrier and record the shipment by hand.

**Source:** `app/Services/ShipmentService.php` (line 1306)
</details>

### <code> shipping/log_carrier_webhooks </code>
<details>
<summary><code>fluent_cart/shipping/log_carrier_webhooks</code> &mdash; Log webhook deliveries that changed nothing</summary>

**Parameters:**

- `$enabled` (bool): Default `true`
- `$context` (array): `carrier`, `outcome`, `status`

**Returns:** `bool`

**Source:** `app/Modules/Shipping/ShippingModule.php` (line 183)
</details>

### <code> shipment_statuses </code>
<details>
<summary><code>fluent_cart/shipment_statuses</code> &mdash; The shipment statuses</summary>

**Parameters:**

- `$statuses` (array): Status slug => label
- `$context` (array): Empty

**Returns:** `array` &mdash; `applyTrackingUpdate()` accepts only statuses in this list.

**Source:** `app/Models/Shipment.php` (line 56)
</details>

## Actions

Except where noted, each action receives one array. The status actions pass `shipment`, `order`, `old_status` and `new_status`.

| Action | Fires when | Source (`app/Services/ShipmentService.php`) |
| ------ | ---------- | ------ |
| `fluent_cart/order_shipment_created` | A shipment is recorded. Passes `shipment`, `order`. | line 593 |
| `fluent_cart/order_shipment_deleted` | A shipment is deleted. Passes `shipment`, `order`. | line 1955 |
| `fluent_cart/shipment_tracking_updated` | Tracking changed the status | line 1632 |
| `fluent_cart/order_shipment_status_changed_to_{status}` | The status changed to `{status}` | line 1633 |
| `fluent_cart/order_shipment_status_changed` | The status changed | line 1634 |
| `fluent_cart/shipping/unconfirmed_purchase_resolved` | An unconfirmed attempt closed. Passes four arguments: `$attemptId`, `$carrierSlug`, `$order`, `$outcome` (`recorded`, `not_found`, `dismissed`, `refused` or `voided`). | line 844 |

## Helpers

| Helper | Purpose |
| ------ | ------- |
| `Helper::shopConfig('weight_unit')`, `Helper::shopConfig('dimension_unit')` | The store's units |
| `Helper::convertWeight($value, $from, $to)` | Converts between `g`, `kg`, `lbs` and `oz` |
| `Helper::getPackageBySlug($slug)` | A box's dimensions and weights, or the default box |
| `BoxPacker::pack($lines, $maxParcels)` | Splits lines into parcels by box and weight limit |
| `Helper::encryptKey($value)`, `Helper::decryptKey($value)` | Encrypt a token for storage, and read it back |
| `ShipmentService::applyTrackingUpdate($shipment, $status, $meta)` | Applies a tracking event |

## Custom routes

`?fluent-cart={name}` on the site fires `fluent_cart_action_{name}` with the request data as one array, then the request ends. The route is public, so your handler must check permissions and redirect or respond. See [Connecting with OAuth](/guides/shipping-carrier/settings#connecting-with-oauth).

**Source:** `app/Http/Routes/WebRoutes.php` (line 233)

## REST routes

These routes serve the admin pages. They are under `/wp-json/fluent-cart/v2/`.

| Route | Purpose | Permission |
| ----- | ------- | ---------- |
| `GET shipping/carriers` | Carriers with masked settings | `store/sensitive` |
| `PUT shipping/carriers/{slug}/settings` | Save settings | `store/sensitive` |
| `POST shipping/carriers/{slug}/actions/{action}` | Run a status button | `store/sensitive` |
| `GET shipping/carrier-options` | Carriers for the shipment form, without settings | `orders/manage_statuses` |
