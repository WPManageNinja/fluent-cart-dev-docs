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

**Parameters:**

- `$data` (array): Release artifact data
    - `product_id` (int) — ID of the licensed product
    - `version` (string) — Version the artifacts belong to
    - `manifest` (array) — The stored release manifest
    - `signature` (string) — Detached signature for the manifest
    - `previous_manifest` (array|null) — The manifest being replaced, if any

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
Fires when a license is brought back to active status because its backing subscription was reactivated. Note this uses the `fluent_cart/licensing/` prefix rather than `fluent_cart_sl/`.

**Parameters:**

- `$data` (array): Reactivation data
    - `license` ([`\FluentCart\App\Models\License`](/database/models/license)) — The reactivated license
    - `subscription` ([`\FluentCart\App\Models\Subscription`](/database/models/subscription)) — The subscription that triggered it

**Source:** `fluent-cart-pro/app/Modules/Licensing/Hooks/Handlers/LicenseGenerationHandler.php:417`

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
