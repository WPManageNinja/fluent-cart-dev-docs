---
title: Live Rates
description: How a FluentCart shipping carrier returns checkout rates, handles caching, failures and currency, and how the selected rate reaches the order.
---

# Live Rates

FluentCart builds one rate list for each address and cart. It contains the store's zone methods, followed by every enabled carrier's rates, cheapest first. The checkout page, Place Order validation, the charge and the tax calculation all read this same list.

## What your carrier receives

With `ProvidesLiveRates` you implement `fetchLiveRates()`. It runs only when no cached answer exists.

```php
protected function fetchLiveRates(array $destination, array $items, string $currency)
```

| Argument | Contents |
| -------- | -------- |
| `$destination` | `country`, `state`, `postcode`, `city`, `name`, `address_1`, `phone`. Each is sanitized and limited in length. `state` is empty unless it is a real subdivision of the country. |
| `$items` | Every cart line, including digital ones. |
| `$currency` | The ISO code to price in. Return the currency you actually priced in on each rate. |

`name`, `address_1` and `phone` stay empty until the shopper has filled every one of them that the checkout form shows. This stops half-typed values from creating new quotes. Your API must therefore accept a quote that has only the country, state, city and postcode, or you must return `[]` until the contact details arrive.

### Cart lines

| Key | Meaning |
| --- | ------- |
| `fulfillment_type` | `physical` or `digital`. Skip anything that is not `physical`. |
| `object_id`, `post_id` | Variation ID and product ID |
| `quantity` | Units on the line |
| `unit_price`, `subtotal`, `line_total` | Amounts in cents, in the checkout currency |
| `other_info.weight`, `other_info.weight_unit` | Weight of **one unit**, without its box. A blank unit means the store's weight unit, `Helper::shopConfig('weight_unit')`. |
| `other_info.package_slug` | The box. `Helper::getPackageBySlug($slug)` returns its dimensions and empty weight, or the default package. |

To split lines into boxes, pass them to `FluentCart\App\Services\Shipments\BoxPacker::pack()`, which is the same packing used for weight-based zone rates.

## What your carrier returns

An array of rates, or a `WP_Error` for a failure.

```php
[
    'id'               => 'acme:ground',    // required, stable, not numeric
    'title'            => 'Acme Ground',    // required, shown to the customer
    'cost'             => 750,              // required, integer cents in 'currency'
    'currency'         => 'USD',            // required, ISO code
    'states'           => [],               // state codes this rate is limited to; [] = all
    'description'      => '2-3 days',       // optional, shown under the title at checkout
    'estimated_days'   => 3,                // optional, used in the admin rate picker
    'provider_rate_id' => 'rate_8f2a',      // optional, your own quote ID, kept on the order
]
```

FluentCart sets `carrier` for you. It removes a rate with no `id`, a numeric `id`, a negative `cost`, no `currency`, or a currency it has no exchange rate for.

::: warning Keep rate IDs stable
A customer's selection is matched against the list by exact `id`, and the list is quoted again as they fill in the form. Build the `id` from the service, such as `acme:ground`, and put the ID your API issues per quote in `provider_rate_id`. An `id` that changes with each quote makes the selected rate disappear. Numeric IDs are reserved for zone methods. Use only letters, numbers, `:`, `_` and `-`, because the ID must come through `sanitize_text_field()` unchanged.
:::

## Caching and limits

`ProvidesLiveRates` caches answers in transients. The cache key contains the destination, the currency and whatever `liveRatesCacheItemsKey()` returns.

::: danger Implement liveRatesCacheItemsKey()
The default returns an empty string, so the cart is not part of the key. If your price depends on the cart, a shopper who changes the quantity gets the old price until the cache expires. Return a fingerprint of what you price on, and add anything else that changes the answer, such as a test or live mode.
:::

| Situation | What happens |
| --------- | ------------ |
| Rates returned | Kept for the rate cache time: 10 minutes by default, 1 to 1440 allowed. |
| No rates returned | Kept for at most 3 minutes. |
| `markLiveRatesPartial()` called | The list is shown for 60 seconds, so missing services come back soon. Place Order can still use it for the full cache time. |
| `WP_Error` with `http_code` 0, 401, 403, 408, 429 or 5xx | Treated as an outage. Nobody calls your API for 60 seconds. A `WP_Error` with no `http_code` counts as 0. |
| `WP_Error` with any other `http_code` | Treated as a problem with this address, such as a half-typed postcode. Only this cache key is skipped, for up to 3 minutes. |
| Exception thrown | Caught. Your carrier adds no rates for that request. |

Each visitor can trigger 20 live quotes per 10 minutes, because the rate endpoints are public. Cached destinations are still served after that. Override `liveRatesBudget()` to change the number.

Use a short timeout. The shopper waits for your API, and Acme's example uses 5 seconds.

Change the cache time with the `defaultRateCacheMinutes()` method, or let a site override it:

```php
add_filter('fluent_cart/shipping/carrier_rate_cache_minutes', function ($minutes, $context) {
    return $context['carrier'] === 'acme' ? 30 : $minutes;
}, 10, 2);
```

## When rates are quoted again

The checkout saves the form and asks for rates again when any of these change: country, state, postcode, city, the ship-to-different option, the cart items, or the contact details once they are complete.

If the selected rate is no longer in the list, the selection is cleared and the customer chooses again. If the list has exactly one rate, it is selected automatically unless `fluent_cart/shipping/auto_select_single_method` returns false.

## Currency

Declare what your API can price in with `canQuoteInCurrency()`. FluentCart reads it before each quote.

| You return for the checkout currency | Result |
| ------------------------------------- | ------ |
| `true` | Quoted in the checkout currency. |
| `false` | Hidden, unless the store's base currency is quotable and the `fluent_cart/shipping/carrier_rates_allow_conversion` filter returns true. The rate is then quoted in the base currency and converted at the store's exchange rate. |
| `null` | Undeclared. With `ProvidesLiveRates`, every quote is requested in the base currency. FluentCart converts whichever currency comes back. |

Whichever applies, the customer pays `cost` in the checkout currency, and your original figure stays on the rate as `source_cost` and `source_currency`.

## What happens at Place Order

1. FluentCart asks for the rate list with `reuse_quote` set, so `ProvidesLiveRates` answers from the last list quoted for that address and cart. The customer does not wait on your API.
2. It looks up the submitted rate by exact `id`.
3. It charges that rate's `cost` and spreads it over the physical lines by line total. Shipping tax is calculated from those shares.
4. It writes the order.

The order stores the details in `$order->config`:

```php
[
    'shipping_method_id'    => 'acme:ground',
    'shipping_method_title' => 'Acme Ground',
    'shipping_carrier'      => 'acme',
    'shipping_quote'        => [
        'carrier'         => 'acme',
        'rate_id'         => 'rate_8f2a',    // provider_rate_id, or id when there is none
        'source_cost'     => 750,
        'source_currency' => 'USD',
    ],
]
```

The charge itself is `$order->shipping_total`.

If you implement `getRates()` yourself instead of using the trait, read `$args['reuse_quote']` and answer from your last quote when it is set.

### When checkout is refused

The customer sees the error in the shipping section and no order is created.

| Situation | Error key under `shipping_method` |
| --------- | --------------------------------- |
| No rate selected | `required` |
| The address has no rates, including during an outage with no cached quote | `unavailable` |
| The selected rate is not in the list | `invalid` |

### Refusing a changed price

The reuse in step 1 lasts for the rate cache time. After that, Place Order quotes again, and the new price can differ from the one on the page. To stop and show the customer the new price, compare the two in `fluent_cart/checkout/validate_data`:

```php
use FluentCart\App\Helpers\AddressHelper;
use FluentCart\App\Helpers\Helper;
use FluentCart\Framework\Support\Arr;

add_filter('fluent_cart/checkout/validate_data', function ($errors, $context) {
    $data     = $context['data'];
    $cart     = $context['cart'];
    $selected = (string) Arr::get($data, 'fc_selected_shipping_method', '');

    if (strpos($selected, 'acme:') !== 0 || !empty($errors['shipping_method'])) {
        return $errors;
    }

    $prefix = Arr::get($data, 'ship_to_different', 'no') === 'yes' ? 'shipping_' : 'billing_';
    $rate   = AddressHelper::resolveSelectedRate(
        Arr::get($data, $prefix . 'country', ''),
        Arr::get($data, $prefix . 'state', ''),
        (array) $cart->cart_data,
        $selected,
        [
            'postcode' => (string) Arr::get($data, $prefix . 'postcode', ''),
            'city'     => (string) Arr::get($data, $prefix . 'city', ''),
        ] + AddressHelper::quoteContact($data)
    );

    $shown = (int) Arr::get($cart->checkout_data, 'shipping_data.shipping_charge', 0);

    if ($rate && (int) $rate['cost'] !== $shown) {
        // Saves the new charge and its tax on the cart, so the page and the retry agree.
        do_action('fluent_cart/cart/cart_data_items_updated', ['cart' => $cart, 'scope' => 'acme_price_changed']);

        $errors['shipping_method']['acme_price_changed'] = sprintf(
            /* translators: 1: service name, 2: new price */
            esc_html__('The price of %1$s changed to %2$s. Reload the page to review your total.', 'acme-parcel-for-fluent-cart'),
            esc_html($rate['title']),
            Helper::toDecimal($rate['cost'])
        );
    }

    return $errors;
}, 10, 2);
```

The checkout shows this message as HTML, so escape anything you add to it. This filter can also refuse an order for any other reason of your own.

## One rate per order

A customer selects one shipping option, and it covers every physical line in the cart. To let your rates stand alone, the merchant turns off the **Manual / Other** carrier, which removes zone methods from checkout.

When a cart holds some items you ship and some the merchant ships, return a rate that includes both. `$items` lets you divide the lines, and the Manual carrier prices any list of lines from the store's zones:

```php
use FluentCart\App\Modules\Shipping\Carriers\Core\CarrierManager;

$merchantRates = CarrierManager::carrier('manual')->getRates([
    'country' => $destination['country'],
    'state'   => $destination['state'],
    'items'   => $merchantLines,
]);
```

This call works whether or not the Manual carrier is turned on, so the merchant can turn it off and customers see only your combined rates. Each returned rate has `id`, `title` and `cost`. The `cost` is in the checkout currency, so add it to your own price only when you price in that currency. Include those lines in `liveRatesCacheItemsKey()`. On the order screen the admin can then create one shipment for each set of items, each with its own carrier.

## Showing slow carriers progressively

If a quote fans out to several accounts that each take time, split it into sources. Rates already cached show at once, and the checkout fetches the rest one by one.

```php
protected function liveRateSources(): array
{
    return [
        'account_1' => 'Acme Ground',
        'account_2' => 'Acme Express',
    ];
}

protected function fetchLiveRatesForSource(string $source, array $destination, array $items, string $currency)
{
    // Quote one source and return its rates, or a WP_Error.
}
```

Each source is cached and backed off separately, and the visitor limit is multiplied by the number of sources.
