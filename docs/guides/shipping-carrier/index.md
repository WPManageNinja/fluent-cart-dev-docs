---
title: Custom Shipping Carrier
description: Build a WordPress plugin that adds a shipping carrier to FluentCart, with live checkout rates, labels and tracking.
---

# Custom Shipping Carrier

A shipping carrier is a PHP class that your plugin registers with FluentCart. It can add any of these to a store:

- **Live rates at checkout.** Your rates appear with the store's shipping zone methods. FluentCart validates the selected rate and handles currency, per-item shares, shipping tax and the order record.
- **Labels from the order screen.** The admin compares your rates, buys a label and gets the tracking number on the shipment.
- **Tracking updates.** A refresh button and an inbound webhook move the shipment status, and FluentCart updates the order and fires its events.

Each feature is optional. A carrier that only tracks parcels does not need rates, and a carrier that only shows rates does not need labels. The Shippo carrier in the Shipping for FluentCart add-on is built on this same framework.

::: info Requirements
FluentCart **2.3.0** or later and PHP 7.4 or later. The carrier framework is in the free plugin, so a carrier works with or without FluentCart Pro.
:::

## How it fits together

| Step | FluentCart does | Your carrier does |
| ---- | ---------------- | ----------------- |
| Boot | Applies `fluent_cart/shipping/carrier_providers`, then lists the carrier under **Settings → Shipping → Carriers** | Returns an instance of its class |
| Settings | Draws the form from `fields()`, masks secrets and saves | Declares fields and validates them |
| Checkout | Calls `getRates()` when the address or cart changes, merges the answer with zone methods and shows the list | Returns rates for the address and cart |
| Place Order | Checks the selected rate against the list, charges its `cost` and stores the quote on the order | Answers from its last quote |
| Dispatch | Shows the rate picker, then records the shipment | Prices the shipment and buys the label |
| After dispatch | Applies status changes and fires events | Reads the carrier's status and reports it |

## Build a carrier with live rates

This plugin adds a carrier called Acme Parcel. It uses three files.

### 1. The plugin file

```php
<?php
/**
 * Plugin Name: Acme Parcel for FluentCart
 * Description: Acme Parcel live rates, labels and tracking for FluentCart.
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Requires Plugins: fluent-cart
 * Text Domain: acme-parcel-for-fluent-cart
 */

defined('ABSPATH') || exit;

add_filter('fluent_cart/shipping/carrier_providers', function ($carriers) {
    require_once __DIR__ . '/src/AcmeCarrierSettings.php';
    require_once __DIR__ . '/src/AcmeCarrier.php';

    $carriers['acme'] = new \AcmeParcel\AcmeCarrier(new \AcmeParcel\AcmeCarrierSettings());

    return $carriers;
});
```

FluentCart applies the filter on `plugins_loaded`, so a filter added when your plugin file loads is always in time. The classes load inside the callback because they extend FluentCart classes. The array key is the carrier slug and must match `meta()['slug']`. The slug `manual` belongs to the built-in carrier, and a slug can be registered only once.

### 2. The settings class

```php
<?php

namespace AcmeParcel;

use FluentCart\App\Modules\Shipping\Carriers\Core\BaseCarrierSettings;

class AcmeCarrierSettings extends BaseCarrierSettings
{
    protected string $metaKey = 'fluent_cart_carrier_settings_acme';

    public function getDefaults(): array
    {
        return [
            'is_active'      => 'no',
            'api_key'        => '',
            'enable_rates'   => 'no',
            'enable_labels'  => 'no',
            'webhook_secret' => '',
        ];
    }
}
```

The settings are stored in one row under `$metaKey`. The key must start with `fluent_cart_carrier_settings_`, because FluentCart loads all carrier settings with one query on that prefix.

### 3. The carrier class

Extend `AbstractShippingCarrier`, which gives a safe default for everything you do not implement, and use `ProvidesLiveRates`, which adds the caching and protection a public checkout needs.

```php
<?php

namespace AcmeParcel;

use FluentCart\App\Helpers\Helper;
use FluentCart\App\Modules\Shipping\Carriers\Concerns\ProvidesLiveRates;
use FluentCart\App\Modules\Shipping\Carriers\Core\AbstractShippingCarrier;
use FluentCart\Framework\Support\Arr;

class AcmeCarrier extends AbstractShippingCarrier
{
    use ProvidesLiveRates;

    const SLUG = 'acme';

    public function meta(): array
    {
        return [
            'slug'        => self::SLUG,
            'name'        => 'Acme Parcel',
            'description' => __('Live rates from Acme Parcel.', 'acme-parcel-for-fluent-cart'),
            'supports'    => ['rates'],
        ];
    }

    public function fields(): array
    {
        return [
            ['key' => 'is_active', 'type' => 'toggle', 'label' => __('Enable Acme Parcel', 'acme-parcel-for-fluent-cart')],
            ['key' => 'api_key', 'type' => 'password', 'label' => __('API Key', 'acme-parcel-for-fluent-cart')],
            ['key' => 'enable_rates', 'type' => 'toggle', 'label' => __('Show live rates at checkout', 'acme-parcel-for-fluent-cart')],
        ];
    }

    public function isEnabled(): bool
    {
        return $this->settings->get('is_active') === 'yes' && (string) $this->settings->get('api_key') !== '';
    }

    public function canQuoteInCurrency(string $currency): ?bool
    {
        return strtoupper($currency) === 'USD';
    }

    protected function liveRatesCacheItemsKey(array $items): string
    {
        return md5(wp_json_encode($this->parcelLines($items)));
    }

    protected function fetchLiveRates(array $destination, array $items, string $currency)
    {
        $response = $this->request('POST', '/rates', [
            'from'     => $this->buildOrigin(),
            'to'       => $destination,
            'lines'    => $this->parcelLines($items),
            'currency' => $currency,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $rates = [];
        foreach ((array) Arr::get($response, 'rates', []) as $rate) {
            $rates[] = [
                'id'               => self::SLUG . ':' . sanitize_key((string) Arr::get($rate, 'service')),
                'title'            => sanitize_text_field((string) Arr::get($rate, 'name')),
                'cost'             => Helper::toCent(Arr::get($rate, 'amount')),
                'currency'         => strtoupper((string) Arr::get($rate, 'currency')),
                'states'           => [],
                'estimated_days'   => max(0, (int) Arr::get($rate, 'days')),
                'provider_rate_id' => sanitize_text_field((string) Arr::get($rate, 'id')),
            ];
        }

        return $rates;
    }

    protected function parcelLines(array $items): array
    {
        $lines = [];
        foreach ($items as $item) {
            if (Arr::get($item, 'fulfillment_type') !== 'physical') {
                continue;
            }
            $lines[] = [
                'sku'         => (string) Arr::get($item, 'object_id'),
                'quantity'    => max(1, (int) Arr::get($item, 'quantity', 1)),
                'weight'      => (float) Arr::get($item, 'other_info.weight', 0),
                'weight_unit' => (string) Arr::get($item, 'other_info.weight_unit', ''),
            ];
        }

        return $lines;
    }

    /**
     * @return array|\WP_Error
     */
    protected function request(string $method, string $path, array $body = [], int $timeout = 5)
    {
        $response = wp_remote_request('https://api.acme-parcel.example/v1' . $path, [
            'method'  => $method,
            'timeout' => $timeout,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->settings->get('api_key'),
                'Content-Type'  => 'application/json',
            ],
            'body'    => $body ? wp_json_encode($body) : null,
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error('acme_unreachable', $response->get_error_message(), ['http_code' => 0]);
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        $data = json_decode(wp_remote_retrieve_body($response), true);

        if ($code < 200 || $code >= 300 || !is_array($data)) {
            return new \WP_Error('acme_api_error', sprintf('Acme Parcel answered HTTP %d.', $code), ['http_code' => $code]);
        }

        return $data;
    }
}
```

### 4. Try it

1. Activate the plugin and open **Settings → Shipping → Carriers**. Acme Parcel is in the list.
2. Open it, turn on the carrier and rates, enter the API key and save.
3. Add a physical product to the cart and enter a delivery address at checkout. Your rates appear after the zone methods, cheapest first.

The store address must be complete, because `buildOrigin()` reads it for the ship-from address.

## Next steps

- [Live Rates](/shipping-carrier-integration/live-rates) covers caching, failures, currency and how a rate reaches the order.
- [Labels and Tracking](/shipping-carrier-integration/labels-and-tracking) covers quotes, label purchase, voiding, tracking and webhooks.
- [Carrier Settings](/shipping-carrier-integration/settings) covers every field type, status actions and setup notices.
- [Reference](/shipping-carrier-integration/reference) lists the contract methods, hooks and helpers.

::: tip Going live
- Keep API keys in `password` fields, so they are never sent back to the browser.
- Add a `liveRatesCacheItemsKey()` that covers everything your price depends on.
- Use stable rate IDs and keep your carrier's own quote ID in `provider_rate_id`.
- Test with a store currency your API does not quote in, and with your API returning errors.
:::
