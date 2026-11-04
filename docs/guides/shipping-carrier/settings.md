---
title: Carrier Settings
description: The settings form, field types, status actions and setup notices for a FluentCart shipping carrier.
---

# Carrier Settings

FluentCart draws your carrier's settings page from `fields()`, so you write no Vue. The page is at **Settings → Shipping → Carriers → your carrier**.

## Carrier details

`meta()` describes the carrier.

| Key | Required | Purpose |
| --- | -------- | ------- |
| `slug` | Yes | Must match the key you registered it under. |
| `name` | Yes | Shown in the carrier list, the shipment form and on shipments. |
| `description` | No | Shown in the carrier list. |
| `supports` | No | Any of `rates`, `labels`, `tracking`. |
| `webhook_hint` | No | Instructions shown under the webhook URL. |

A carrier without `slug` and `name` is left out of the settings pages.

## Saving

A save runs in this order:

1. Keeps only the keys you declared. An undeclared key in the request is dropped.
2. Drops an empty secret, which means the admin did not retype it, so the stored value stays.
3. Sanitizes the values and converts toggles to `yes` or `no`.
4. Calls `validateSettings()`. Return the array, changed if you need to, or a `WP_Error` to reject the save with your message.
5. Merges the result into the stored settings.

You can store keys you did not declare, such as OAuth tokens, by adding them in `validateSettings()` or calling `$this->settings->save()`. They are never sent to the browser.

Read a value with `$this->settings->get('key')`. Give every key a value in `getDefaults()`.

`isEnabled()` decides whether checkout offers your carrier. The default checks that `is_active` is `yes`. Override it to require credentials as well. `ProvidesLiveRates` also requires an `enable_rates` setting of `yes`.

## Input fields

Every field has a `key`, `type` and `label`. Keys share one store, so each must be unique. `hint` adds help text.

| Type | Stores | Notes |
| ---- | ------ | ----- |
| `text` | String | `placeholder` is optional. |
| `password` | String | Returned to the browser as an empty string. The form shows that a value is saved and its last four characters. |
| `toggle` | `yes` or `no` | |
| `select` | Option value | `'options' => [['value' => 'a', 'label' => 'A'], ...]` |
| `mode` | Option value | Radio cards. Each option can hold its own `fields`. |

Input fields also accept `label_note`, which adds a small note beside the label, and `'width' => 'half'`.

Add `'is_secret' => true` to mask any other field type in the same way as a password.

A `mode` field shows an option's fields only while it is selected. Nesting is limited to one level.

```php
[
    'key'     => 'sandbox_mode',
    'type'    => 'mode',
    'label'   => __('Connection Mode', 'acme-parcel-for-fluent-cart'),
    'options' => [
        [
            'value'  => 'no',
            'label'  => __('Live', 'acme-parcel-for-fluent-cart'),
            'hint'   => __('Labels are real and billed.', 'acme-parcel-for-fluent-cart'),
            'fields' => [
                ['key' => 'live_key', 'type' => 'password', 'label' => __('Live Key', 'acme-parcel-for-fluent-cart')],
            ],
        ],
        [
            'value'  => 'yes',
            'label'  => __('Test', 'acme-parcel-for-fluent-cart'),
            'fields' => [
                ['key' => 'test_key', 'type' => 'password', 'label' => __('Test Key', 'acme-parcel-for-fluent-cart')],
            ],
        ],
    ],
],
```

## Display fields

These show information and store nothing. Each one still needs a unique `key`.

| Type | Keys | Purpose |
| ---- | ---- | ------- |
| `section` | `label`, `hint` | Starts a new group of fields. |
| `webhook_url` | | Places the webhook URL here. Without it, the URL appears at the end of the form. |
| `status` | `title`, `text`, `tone`, `items`, `actions`, `note` | A strip with facts and buttons. `tone` of `err` shows it as an error. |
| `readonly` | `label`, `value`, `hint`, `link` | A value managed elsewhere. |
| `notice` | `text`, `tone`, `link` | An inline message. `tone` is `mute`, `warn` or `err`. |
| `webhook_setup` | `label`, `steps`, `open`, `mask_param` | Manual setup steps with a masked URL. `mask_param` names the query argument to hide. `**word**` in a step is shown in bold. |

A `link` is `['label' => 'Change', 'route' => '/settings/store-settings']`, using a route in the FluentCart admin.

Any field can use `show_if` to appear only while another field has a value. A hidden field keeps its stored value.

```php
['key' => 'label_format', 'type' => 'text', 'label' => 'Label format', 'show_if' => ['key' => 'enable_labels', 'value' => 'yes']],
```

## Status actions

A button in a `status` field runs at once, without Save. Use it for actions such as testing a connection.

```php
[
    'key'     => 'connection',
    'type'    => 'status',
    'title'   => __('Connection', 'acme-parcel-for-fluent-cart'),
    'text'    => __('Check that your API key works.', 'acme-parcel-for-fluent-cart'),
    'actions' => [
        ['action' => 'test_connection', 'label' => __('Test connection', 'acme-parcel-for-fluent-cart'), 'variant' => 'primary'],
    ],
],
```

An action can also set `variant` to `danger`, and `confirm` to `['title' => '', 'text' => '', 'button' => '']` to ask first.

The button calls `runAction()`:

```php
public function runAction(string $action, array $data)
{
    if ($action !== 'test_connection') {
        return parent::runAction($action, $data);
    }

    $response = $this->request('GET', '/account');

    return is_wp_error($response)
        ? ['ok' => false, 'message' => $response->get_error_message()]
        : ['ok' => true, 'message' => __('Connected.', 'acme-parcel-for-fluent-cart')];
}
```

Return `message` and `ok`, or a `WP_Error`. The page then reloads the carrier, so `fields()` can reflect what the action stored. The route needs the `store/sensitive` permission.

## Setup notices

`getSetupNotices()` lists problems the merchant must fix. They appear on the carrier pages, and the carrier list marks the carrier as needing attention.

```php
public function getSetupNotices(): array
{
    $notices = [];

    if ($this->settings->get('is_active') === 'yes' && !$this->settings->get('api_key')) {
        $notices[] = [
            'type'    => 'error',
            'message' => __('Add your API key to start showing rates.', 'acme-parcel-for-fluent-cart'),
            'action'  => null,
        ];
    }

    return $notices;
}
```

`type` is `error`, `warning` or `info`. `action` is `null` or `['label' => '', 'route' => '']`. This method runs each time the carrier list loads, so read stored settings only and do not call your API.

The `ProvidesSetupNotices` trait adds two helpers. `originSetupNotice($carrierName)` returns a notice when the store address is incomplete, or `null`. `setupNotice($type, $message)` builds a plain notice. It needs `buildOrigin()`, which `ProvidesLiveRates` provides.
