---
title: Labels and Tracking
description: How a FluentCart shipping carrier prices shipments, buys and voids labels, updates tracking and receives webhooks.
---

# Labels and Tracking

An admin creates a shipment from the order screen by choosing a carrier and the items to send. These methods connect your carrier to that flow. Add `labels` and `tracking` to `meta()['supports']`, and an `enable_labels` toggle to your settings.

```php
'supports' => ['rates', 'labels', 'tracking'],
```

The form offers your label purchase only when the carrier is enabled, `supports` lists `labels`, and the `enable_labels` setting is `yes`. Your rate picker follows the same rule when you declare both `rates` and `labels`. All registered carriers can be picked to record a shipment by hand, even when disabled.

The admin's selection reaches your methods as a `ShipmentInstance`:

| Property | Contents |
| -------- | -------- |
| `$instance->order` | The [`Order`](/database/models/order) |
| `$instance->items` | The items in this shipment: `[['order_item_id' => int, 'qty' => int], ...]` |
| `$instance->data` | The validated form data, such as `carrier_slug` and `selected_rate_id` |
| `$instance->shipment` | The `Shipment` row when one exists. It is `null` during creation. |

If your carrier throws while quoting, buying or voiding, the admin gets an error message and the request does not fail.

The examples on this page use these imports:

```php
use FluentCart\App\App;
use FluentCart\App\Helpers\Helper;
use FluentCart\App\Models\OrderItem;
use FluentCart\App\Models\Shipment;
use FluentCart\App\Modules\Shipping\Carriers\Concerns\WebhookOutcomes;
use FluentCart\App\Services\ShipmentService;
use FluentCart\App\Services\Shipments\ShipmentInstance;
use FluentCart\Framework\Support\Arr;
```

## Pricing a shipment

`getShipmentQuote()` fills the rate picker. It buys nothing. Return `null` when your carrier does not quote.

```php
public function getShipmentQuote(ShipmentInstance $instance)
{
    if ($this->settings->get('enable_labels') !== 'yes') {
        return new \WP_Error('acme_labels_off', __('Labels are turned off in Acme Parcel settings.', 'acme-parcel-for-fluent-cart'));
    }

    $response = $this->request('POST', '/rates', $this->shipmentPayload($instance), 15);
    if (is_wp_error($response)) {
        return $response;
    }

    $rates = [];
    foreach ((array) Arr::get($response, 'rates', []) as $rate) {
        $rates[] = [
            'rate_object_id' => sanitize_text_field((string) Arr::get($rate, 'id')),
            'service_name'   => sanitize_text_field((string) Arr::get($rate, 'name')),
            'cost_cents'     => Helper::toCent(Arr::get($rate, 'amount')),
            'currency'       => strtoupper((string) Arr::get($rate, 'currency')),
            'estimated_days' => max(0, (int) Arr::get($rate, 'days')),
        ];
    }

    return [
        'rate_object_id' => $rates ? $rates[0]['rate_object_id'] : '',
        'rates'          => $rates,
    ];
}
```

`rate_object_id` at the top level is the rate selected by default. To match the customer's choice, compare your rates with `$instance->order->config['shipping_method_id']`.

These rates are what the merchant pays you, so they stay in your billing currency and are not converted. FluentCart adds an approximate figure in the order's currency for the admin.

## Buying the label

`makeShipmentFromShipmentInstance()` runs before the shipment row is written and outside any database transaction, so a refusal leaves nothing behind.

```php
public function makeShipmentFromShipmentInstance(ShipmentInstance $instance)
{
    if ($this->settings->get('enable_labels') !== 'yes') {
        return null;
    }

    $response = $this->request('POST', '/labels', array_merge($this->shipmentPayload($instance), [
        'rate'            => (string) Arr::get($instance->data, 'selected_rate_id', ''),
        'idempotency_key' => (string) Arr::get($instance->data, 'unconfirmed_id', ''),
    ]), 30);

    if (is_wp_error($response)) {
        $status = (int) Arr::get((array) $response->get_error_data(), 'http_code', 0);
        if ($status === 0 || $status >= 500) {
            return new \WP_Error(
                'acme_purchase_unconfirmed',
                __('Acme Parcel did not confirm the purchase. Check your dashboard before trying again.', 'acme-parcel-for-fluent-cart'),
                ['purchase_unconfirmed' => true]
            );
        }

        return $response;
    }

    return [
        'tracking_number' => (string) Arr::get($response, 'tracking_number'),
        'tracking_url'    => (string) Arr::get($response, 'tracking_url'),
        'service_name'    => (string) Arr::get($response, 'service_name'),
        'label_url'       => (string) Arr::get($response, 'label_url'),
        'transaction_id'  => (string) Arr::get($response, 'id'),
        'cost'            => Helper::toCent(Arr::get($response, 'amount')),
        'currency'        => strtoupper((string) Arr::get($response, 'currency')),
    ];
}
```

| Return | Result |
| ------ | ------ |
| Array | The shipment is recorded with this label. |
| `WP_Error` | Nothing is recorded and the admin sees the message. |
| `null` | Your carrier does not dispatch this shipment. It is recorded from what the admin typed. |

The array keys FluentCart keeps:

| Key | Stored as |
| --- | --------- |
| `tracking_number`, `tracking_url` | Shipment columns. They replace anything the admin typed. |
| `service_name`, `label_url` | `$shipment->meta` |
| `transaction_id` | `$shipment->meta`. Your label ID, used to void and fetch the label again. |
| `cost`, `currency` | `$shipment->meta['cost']` and `['cost_currency']`. Integer cents in the label's own currency. |

Read the address from the order and the package details from the order items:

```php
protected function shipmentPayload(ShipmentInstance $instance): array
{
    $order   = $instance->order;
    $address = $order->shipping_address ?: $order->billing_address;

    return [
        'from'     => $this->buildOrigin(),
        'to'       => [
            'name'      => (string) $address->name,
            'address_1' => (string) $address->address_1,
            'address_2' => (string) $address->address_2,
            'city'      => (string) $address->city,
            'state'     => (string) $address->state,
            'postcode'  => (string) $address->postcode,
            'country'   => strtoupper((string) $address->country),
            'phone'     => (string) $address->phone,
        ],
        'lines'    => $this->dispatchLines($instance),
    ];
}

protected function dispatchLines(ShipmentInstance $instance): array
{
    $orderItems = OrderItem::query()
        ->whereIn('id', array_map('intval', array_column($instance->items, 'order_item_id')))
        ->where('order_id', $instance->order->id)
        ->get()
        ->keyBy('id');

    $lines = [];
    foreach ($instance->items as $dispatched) {
        $itemId = (int) $dispatched['order_item_id'];
        if (!isset($orderItems[$itemId])) {
            continue;
        }
        $info    = (array) $orderItems[$itemId]->other_info;
        $lines[] = [
            'sku'         => (string) $orderItems[$itemId]->object_id,
            'quantity'    => (int) $dispatched['qty'],
            'weight'      => (float) Arr::get($info, 'weight', 0),
            'weight_unit' => (string) Arr::get($info, 'weight_unit', ''),
            'box'         => Arr::only($info, ['package_length', 'package_width', 'package_height', 'package_dimension_unit', 'package_weight', 'package_weight_unit']),
        ];
    }

    return $lines;
}
```

`weight` is one unit's weight, without its box. The `package_*` keys describe the box as it was when the order was placed, and `package_weight` is the empty box. The shipment's `getPackages()` helper reads only the box, so use it for dimensions and take the contents' weight from `weight`.

To store more on the shipment, such as parcel details for a multi-parcel label, listen to `fluent_cart/order_shipment_created` and save to `$shipment->meta`.

### When the purchase result is unknown

A timeout or 5xx during purchase may still have bought a label, and a retry could buy a second one. Tell FluentCart the result is unknown by adding `purchase_unconfirmed` to the error data, or by ending the error code with `_purchase_unconfirmed` or `_label_pending`:

```php
return new \WP_Error('acme_purchase_unconfirmed', $message, ['purchase_unconfirmed' => true]);
```

FluentCart saves the attempt before calling you, and keeps it on the order after this error. The admin can then mark it resolved. Each attempt has an ID in `$instance->data['unconfirmed_id']`, which makes a good idempotency key for your API.

To add a **Check again** button, implement `supportsUnconfirmedRecheck()` and return `true`. FluentCart then calls `makeShipmentFromShipmentInstance()` again with `$instance->data['lookup_only']` set to true. You must never buy in this case:

```php
if (!empty($instance->data['lookup_only'])) {
    // Your own lookup, by the attempt ID you sent as the idempotency key.
    $label = $this->findLabelByAttempt((string) $instance->data['unconfirmed_id']);

    return $label ?: new \WP_Error(
        'acme_label_not_found',
        __('No label was found. You can buy a new one.', 'acme-parcel-for-fluent-cart')
    );
}
```

Return the same array as a purchase when you find the label. An error code ending in `_label_not_found` closes the attempt, unless the attempt is less than 5 minutes old or the error data has `purchase_unconfirmed`. Any other error leaves the attempt open. `fluent_cart/shipping/unconfirmed_purchase_resolved` fires when an attempt closes, if you keep your own records for it.

## Voiding a label

FluentCart calls this when an admin deletes a shipment, and when a label was bought but the shipment could not be recorded.

```php
public function cancelShipmentFromShipmentInstance(ShipmentInstance $instance)
{
    $labelId = (string) Arr::get($instance->data, 'transaction_id', '');
    if ($labelId === '') {
        return null;
    }

    $response = $this->request('DELETE', '/labels/' . rawurlencode($labelId), [], 15);

    return is_wp_error($response) ? $response : true;
}
```

The label ID is always in `$instance->data['transaction_id']`. Return `true` when voided, a `WP_Error` when your carrier refused, and `null` when there was nothing to void. A refusal is shown to the admin and logged on the order.

## Printing a label

Label links expire, so FluentCart stores no PDF and asks you for a link each time.

```php
public function hasLabel(Shipment $shipment): bool
{
    return (string) Arr::get((array) $shipment->meta, 'transaction_id', '') !== '';
}

public function getLabelDownloadUrl(Shipment $shipment)
{
    $response = $this->request('GET', '/labels/' . rawurlencode((string) Arr::get((array) $shipment->meta, 'transaction_id', '')), [], 8);
    if (is_wp_error($response)) {
        return $response;
    }

    return esc_url_raw((string) Arr::get($response, 'label_url'), ['https']);
}
```

`hasLabel()` runs for every shipment in a list, so it must not call your API. `getLabelDownloadUrl()` must return an `https://` link to a PDF of at most 5 MB, an empty string when there is no label, or a `WP_Error`.

## Tracking

`getTrackingUrl()` gives the public link used when your label result has no `tracking_url`, and when an admin types a tracking number.

```php
public function getTrackingUrl(string $trackingNumber): string
{
    return 'https://track.acme-parcel.example/' . rawurlencode($trackingNumber);
}
```

To add the admin's refresh action, implement the two sync methods and report the status through `ShipmentService::applyTrackingUpdate()`:

```php
public function supportsTrackingSync(): bool
{
    return $this->isEnabled();
}

public function syncTrackingFromShipmentInstance(ShipmentInstance $instance)
{
    return $instance->shipment ? $this->pullTracking($instance->shipment) : null;
}

/**
 * @return bool|\WP_Error True when a new status was applied.
 */
protected function pullTracking(Shipment $shipment)
{
    $track = $this->request('GET', '/tracking/' . rawurlencode((string) $shipment->tracking_number), [], 8);
    if (is_wp_error($track)) {
        return $track;
    }

    $statuses = [
        'accepted'   => Shipment::STATUS_DISPATCHED,
        'in_transit' => Shipment::STATUS_IN_TRANSIT,
        'delivered'  => Shipment::STATUS_DELIVERED,
        'returned'   => Shipment::STATUS_RETURNED,
        'failed'     => Shipment::STATUS_FAILED,
    ];
    $status = (string) Arr::get($track, 'status');
    if (!isset($statuses[$status])) {
        return false;
    }

    $result = ShipmentService::applyTrackingUpdate($shipment, $statuses[$status], [
        'tracking_status'         => $status,
        'tracking_status_date'    => sanitize_text_field((string) Arr::get($track, 'updated_at')),
        'tracking_status_details' => sanitize_text_field((string) Arr::get($track, 'details')),
    ]);

    return is_wp_error($result) ? $result : (bool) $result;
}
```

`applyTrackingUpdate()` is safe to call with old or repeated events:

- An event no newer than the stored one is ignored. It compares `tracking_status_date` when both events have one, and otherwise the shipment's stage.
- `delivered` and `returned` are final. Later events can add details but cannot change the status.
- It returns `true` only when the status changed.

| Shipment status | Constant |
| --------------- | -------- |
| `dispatched` | `Shipment::STATUS_DISPATCHED` |
| `in_transit` | `Shipment::STATUS_IN_TRANSIT` |
| `delivered` | `Shipment::STATUS_DELIVERED` |
| `returned` | `Shipment::STATUS_RETURNED` |
| `failed` | `Shipment::STATUS_FAILED` |

When the last shipment is delivered, FluentCart moves the order's shipping status to `delivered`. A change fires `fluent_cart/shipment_tracking_updated`, then `fluent_cart/order_shipment_status_changed_to_{status}` and `fluent_cart/order_shipment_status_changed`.

The refresh action appears for a shipment with a tracking number and a status that can still change, when it has a `transaction_id`. To track shipments without one, implement `canTrackWithoutLabel()` and return `true`.

## Webhooks

FluentCart gives every carrier a public endpoint:

```text
https://your-site.com/?fluent-cart=fct_shipping_listener_webhook&carrier={slug}
```

It finds your carrier by `carrier` and calls `handleWebhook()`. An unknown slug gets a 404, and an exception from your code gets a 500 so your carrier retries. **You authenticate the request and send the response.**

Create the secret when settings are saved. It is not a declared field, so it is never returned by the settings API.

```php
public function validateSettings(array $settings)
{
    if (!$this->settings->get('webhook_secret')) {
        $settings['webhook_secret'] = wp_generate_password(32, false);
    }

    return $settings;
}

public function getWebhookUrl(): string
{
    $secret = (string) $this->settings->get('webhook_secret');
    if ($secret === '') {
        return '';
    }

    return add_query_arg([
        'fluent-cart' => 'fct_shipping_listener_webhook',
        'carrier'     => self::SLUG,
        'token'       => $secret,
    ], home_url('/'));
}

public function handleWebhook(): void
{
    $token   = (string) App::request()->getSafe('token', 'sanitize_text_field');
    $payload = json_decode((string) file_get_contents('php://input'), true);

    list($status, $body) = $this->processWebhook($token, is_array($payload) ? $payload : []);

    wp_send_json($body, $status);
}

public function processWebhook(string $token, array $payload): array
{
    $secret = (string) $this->settings->get('webhook_secret');
    if ($secret === '' || !hash_equals($secret, $token)) {
        return $this->webhookRejected(401, 'invalid_token');
    }

    if (Arr::get($payload, 'event') !== 'tracking.updated') {
        return $this->webhookIgnored('event');
    }

    $shipment = Shipment::query()
        ->where('carrier_slug', self::SLUG)
        ->where('tracking_number', sanitize_text_field((string) Arr::get($payload, 'tracking_number')))
        ->first();

    if (!$shipment) {
        return $this->webhookIgnored('unknown_shipment');
    }

    $applied = $this->pullTracking($shipment);
    if (is_wp_error($applied)) {
        return $this->webhookFailed(502, 'refetch_failed', $applied->get_error_message(), $shipment);
    }

    return $this->webhookApplied($shipment, $applied);
}
```

Treat the webhook body as a notice only. Use it to find the shipment, then read the status from your API, so a forged or replayed event cannot change anything.

`getWebhookUrl()` returns the URL the merchant copies. FluentCart shows it on the settings page with `meta()['webhook_hint']` as the instructions. Return an empty string if your carrier takes no webhooks.

### Outcomes

The `WebhookOutcomes` trait gives every response the same shape. FluentCart reads the response to write a log entry, which never includes the token or body.

| Method | HTTP | `outcome` | Use it when |
| ------ | ---- | --------- | ----------- |
| `webhookApplied($shipment, true)` | 200 | `applied` | The status changed. |
| `webhookApplied($shipment, false)` | 200 | `unchanged` | Nothing changed. |
| `webhookIgnored($reason, $shipment, $details)` | 200 | `ignored` | You will never use this event, so your carrier should not retry it. |
| `webhookRejected($status, $reason, $message)` | your status | `rejected` | Authentication failed. |
| `webhookFailed($status, $reason, $message, $shipment)` | your status | `error` | Your read failed. Use a 5xx so your carrier retries. |

Repeated outcomes are logged at most once an hour. Turn off these log entries with `fluent_cart/shipping/log_carrier_webhooks`.

## Changing a shipment before dispatch

Other plugins can adjust the instance before your carrier is called, or skip the carrier and record the shipment by hand:

```php
add_filter('fluent_cart/before_carrier_dispatch', function ($instance, $context) {
    if ($context['carrier_slug'] === 'acme' && $instance->order->total_amount > 100000) {
        return null; // Not a ShipmentInstance: the carrier is skipped.
    }

    return $instance;
}, 10, 2);
```
