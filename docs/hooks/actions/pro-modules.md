<Badge type="warning" text="Pro" />

# Pro Modules

Action hooks fired by FluentCart Pro modules that are not covered by the lifecycle categories: software release publishing, the Paddle webhook pipeline, saved payment methods, subscription-driven license reactivation, and the MCP tool bridge.

Hooks here carry a <Badge type="warning" text="Pro" /> badge when they require the FluentCart Pro plugin. **Check the badge per hook rather than assuming the page** — one hook on this page (`fluent_cart/mcp_tool_exception`) is grouped here by subject but is also fired by the free plugin, and is called out inline.

---

## Software Releases

### <code> product_version_updated </code>
<details open>
<summary><code>fluent_cart_sl/product_version_updated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a licensed product's version is published</summary>

**When it runs:**
Fires after an admin saves a new version number against a licensed product, once the license settings have been persisted. Use it to notify customers, warm a CDN, or mirror the release elsewhere.

**Parameters:**

- `$data` (array): Version change data
    - `product_id` (int) — ID of the licensed product
    - `version` (string) — The newly published version
    - `previous_version` (string) — The version being replaced
    - `license_settings` (array) — The product's full license settings after the save

**Source:** `fluent-cart-pro/app/Modules/Licensing/Http/Controllers/ProductLicenseController.php:168`

**Usage:**
```php
add_action('fluent_cart_sl/product_version_updated', function ($data) {
    if ($data['version'] === $data['previous_version']) {
        return;
    }

    fluent_cart_add_log(
        'Release published',
        sprintf('Product #%d moved from %s to %s', $data['product_id'], $data['previous_version'], $data['version']),
        'info'
    );
}, 10, 1);
```
</details>

### <code> product_release_artifacts_updated </code>
<details>
<summary><code>fluent_cart_sl/product_release_artifacts_updated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a signed release manifest is stored</summary>

**When it runs:**
Fires when the release manifest and its signature are written for a licensed product. This is the signed-release counterpart to `product_version_updated` — it carries the artifacts that updater clients verify against.

It fires only when the manifest or the signature actually changed, and it is deliberately independent of the version: signing switched on for an already-published version, a corrected paste, or a re-sign during key rotation all move the pair without moving the version. Clearing both values fires it too, since that is equally a cache invalidation. Treat every occurrence as a reason to invalidate anything caching version responses — a customer's site verifies the pair and refuses the update when it does not match, so a stale cached pair blocks updates rather than merely being out of date.

**Parameters:**

- `$data` (array): Release artifact data
    - `product_id` (int) — ID of the licensed product
    - `version` (string) — Version the artifacts belong to
    - `manifest` (string) — The stored release manifest, kept byte for byte as supplied
    - `signature` (string) — Detached signature for the manifest
    - `previous_manifest` (string) — The manifest being replaced; `''` when there was none
    - `previous_signature` (string) — The signature being replaced; `''` when there was none

**Source:** `fluent-cart-pro/app/Modules/Licensing/Http/Controllers/ProductLicenseController.php:196`

**Usage:**
```php
add_action('fluent_cart_sl/product_release_artifacts_updated', function ($data) {
    // Mirror the manifest to an external audit log.
    update_option(
        'my_release_audit_' . $data['product_id'],
        ['version' => $data['version'], 'signature' => $data['signature']]
    );
}, 10, 1);
```

::: tip Related
Signature verification is gated by [`fluent_cart/licensing/enable_signed_releases`](../filters/pro-modules#enable-signed-releases) and the trusted keys come from [`fluent_cart/licensing/release_public_keys`](../filters/pro-modules#release-public-keys).
:::
</details>

---

## Licensing

### <code> license_reactivated </code>
<details>
<summary><code>fluent_cart/licensing/license_reactivated</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a subscription renewal revives a license</summary>

**When it runs:**
Fires when a license is brought back to active status: its backing subscription was reactivated, a paid renewal restored a disabled or expired license, or a billing-date update revived an expired one. Note this uses the `fluent_cart/licensing/` prefix rather than `fluent_cart_sl/`.

**Parameters:**

- `$data` (array): Reactivation data
    - `license` ([`\FluentCartPro\App\Modules\Licensing\Models\License`](/database/models/license)) — The reactivated license
    - `subscription` ([`\FluentCart\App\Models\Subscription`](/database/models/subscription)) — The subscription that triggered it

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:295`, `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:475`

**Usage:**
```php
add_action('fluent_cart/licensing/license_reactivated', function ($data) {
    $license = $data['license'];
    // Re-enable downstream access that was revoked on expiry.
}, 10, 1);
```
</details>

---

## Paddle Webhooks

### <code> webhook_signature_bypass </code>
<details>
<summary><code>fluent_cart/paddle/webhook_signature_bypass</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a Paddle webhook is accepted without a valid signature</summary>

**When it runs:**
Fires when signature verification failed but the event was still processed through the auto-recover path, which re-fetches the entity from the Paddle API instead of trusting the payload.

::: warning Security-relevant
This is an audit signal. A steady stream of these means signatures are not verifying — investigate rather than ignore. The bypass itself can be switched off with [`fluent_cart/paddle/webhook_auto_recover_enabled`](../filters/pro-modules#webhook-auto-recover-enabled).
:::

**Parameters:**

- `$data` (array): Bypass context
    - `event_type` (string) — The Paddle event type that was bypassed
    - `entity_id` (string|null) — ID of the entity re-fetched from the Paddle API

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/Webhook/IPN.php:106`

**Usage:**
```php
add_action('fluent_cart/paddle/webhook_signature_bypass', function ($data) {
    fluent_cart_add_log(
        'Paddle signature bypass',
        sprintf('%s for entity %s', $data['event_type'], $data['entity_id']),
        'error'
    );
}, 10, 1);
```
</details>

### <code> webhook_subscription_unmatched </code>
<details>
<summary><code>fluent_cart/paddle/webhook_subscription_unmatched</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a Paddle subscription cannot be matched locally</summary>

**When it runs:**
Fires when a webhook references a Paddle subscription that has no corresponding local subscription. The handler then returns `false` and the event is not applied.

**Parameters:**

- `$data` (array): Unmatched subscription context
    - `paddle_subscription_id` (string) — The Paddle-side subscription ID
    - `event_type` (string) — The event type being processed
    - `order_id` (int|null) — Local order ID if one was resolved, otherwise `null`

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/Webhook/IPN.php:358`

**Usage:**
```php
add_action('fluent_cart/paddle/webhook_subscription_unmatched', function ($data) {
    // Queue for reconciliation rather than dropping silently.
}, 10, 1);
```
</details>

---

## Saved Payment Methods

### <code> saved_payment_method/saved </code>
<details>
<summary><code>fluent_cart/saved_payment_method/saved</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a payment method token is stored for a customer</summary>

**When it runs:**
Fires after a reusable payment token has been persisted for a customer. Currently emitted by the PayPal saved-method writer.

**Parameters:**

- `$data` (array): Saved method data
    - `customer_id` (int) — ID of the [Customer](/database/models/customer) the token belongs to
    - `gateway` (string) — Gateway slug that issued the token
    - `token_id` (string) — The gateway's token identifier

**Source:** `fluent-cart-pro/app/Modules/SavedPaymentMethods/PayPal/PayPalSavedMethodWriter.php:162`

**Usage:**
```php
add_action('fluent_cart/saved_payment_method/saved', function ($data) {
    // Mirror to a CRM so support can see the customer has a card on file.
}, 10, 1);
```
</details>

---

## MCP

### <code> mcp_tool_exception </code>
<details>
<summary><code>fluent_cart/mcp_tool_exception</code> &mdash; Fires when an MCP tool invocation throws</summary>

::: info Available without Pro
Despite living on this page, this hook is **not Pro-only**. The MCP module ships in both plugins and each fires this action from its own abilities registrar, so a handler registered on a free-only install still receives exceptions.
:::

**When it runs:**
Fires when a registered MCP ability throws during execution. The exception is caught and surfaced through this hook so it can be logged without breaking the tool response.

A single handler sees throws from **both** free and Pro abilities — the two registrars fire the same hook name with the same payload shape. Use the `tool` value to tell them apart rather than assuming a source.

**Parameters:**

- `$data` (array): Exception context
    - `exception` (`\Throwable`) — The caught exception
    - `tool` (string) — Name of the tool that threw
    - `params` (array) — Parameters the tool was invoked with

**Source:** `fluent-cart/app/Modules/MCP/AbilitiesRegistrar.php:308` and `fluent-cart-pro/app/Modules/MCP/AbilitiesRegistrar.php:96`

**Usage:**
```php
add_action('fluent_cart/mcp_tool_exception', function ($data) {
    fluent_cart_add_log(
        'MCP tool error: ' . $data['tool'],
        $data['exception']->getMessage(),
        'error'
    );
}, 10, 1);
```
</details>

---

## Multi-Currency

Pro owns the rate store. Core defines the extension points and holds no rates of its own — see the
[core multi-currency hooks](./modules#multi-currency) for the filters that resolve and round a rate.

### <code> currency/rate_rejected </code>
<details>
<summary><code>fluent_cart/currency/rate_rejected</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a new rate moved too far and was not activated</summary>

**When it runs:**
Fires from `RateStore::record()` when the incoming rate differs from the active one by more than the
sanity band — 10% by default, adjustable through
[`currency/rate_sanity_band`](../filters/pro-modules#currency-rate-sanity-band). The rate is **not**
stored and prices keep using the previous one. `record()` then returns a `WP_Error` with code
`rate_out_of_band`.

A warning activity has already been written by the time this fires. Use the hook to alert whoever owns
the feed, because a rejected rate means prices are now stale until someone intervenes.

**Parameters:**

- `$data` (array): The rejected rate
    ```php
    $data = [
        'base'     => 'USD',          // (string) Base currency
        'quote'    => 'EUR',          // (string) Quote currency
        'rate'     => '0.918400',     // (string) The normalised rate that was refused
        'source'   => 'ecb',          // (string) Provider slug that supplied it
        'previous' => CurrencyRate,   // The rate still in effect (Pro model)
    ];
    ```

**Source:** `fluent-cart-pro/app/Modules/MultiCurrency/RateStore.php:222`

**Usage:**
```php
add_action('fluent_cart/currency/rate_rejected', function ($data) {
    // Prices are stale until this is resolved — page the feed owner
    my_plugin_notify_ops(sprintf(
        '%s/%s rate %s from %s was rejected; still on %s',
        $data['base'],
        $data['quote'],
        $data['rate'],
        $data['source'],
        $data['previous']->rate
    ));
}, 10, 1);
```
</details>

### <code> currency/rate_changed </code>
<details>
<summary><code>fluent_cart/currency/rate_changed</code> <Badge type="warning" text="Pro" /> &mdash; Fires when a new exchange rate becomes active</summary>

**When it runs:**
Fires from `RateStore::record()` after the new rate row is created and the cache has been flushed
through core, so every listener on
[`currency/rates_flushed`](./modules#currency-rates-flushed) has already dropped the old value. From
this point on, conversions use the new rate.

`previous` is `null` for the first rate ever recorded for a pair.

**Parameters:**

- `$data` (array): The rate change
    ```php
    $data = [
        'rate'     => CurrencyRate,      // The newly active rate (Pro model)
        'previous' => CurrencyRate|null, // The rate it replaced; null on the first one
    ];
    ```

**Source:** `fluent-cart-pro/app/Modules/MultiCurrency/RateStore.php:245`

**Usage:**
```php
add_action('fluent_cart/currency/rate_changed', function ($data) {
    // Keep an audit trail of every rate that ever priced an order
    my_plugin_log_rate(
        $data['rate']->base,
        $data['rate']->quote,
        $data['rate']->rate,
        $data['previous'] ? $data['previous']->rate : null
    );
}, 10, 1);
```
</details>
