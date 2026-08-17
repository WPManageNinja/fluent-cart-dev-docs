<Badge type="warning" text="Pro" />

# Pro Modules

Filter hooks exposed by FluentCart Pro modules: advanced inventory, saved views, signed releases, the Paddle gateway, saved payment methods, e-invoicing, LMS and WP User integrations, and add-on installation.

Hooks here carry a <Badge type="warning" text="Pro" /> badge when they require the FluentCart Pro plugin. **Check the badge per hook rather than assuming the page** — one hook on this page (`fluent_cart/render_block_email_template`) is fired by the *free* plugin and merely *implemented* by Pro, and is called out inline.

---

## Advanced Inventory

### <code> inventory_low_stock_threshold </code>
<details open>
<summary><code>fluent_cart/inventory_low_stock_threshold</code> <Badge type="warning" text="Pro" /> &mdash; Sets the low-stock boundary</summary>

**When it runs:**
Applied when the inventory stats endpoint buckets variants into in-stock, low-stock and out-of-stock. The threshold is compared against each variant's **`available`** figure — that is `total_stock - committed - on_hold` — not against `total_stock`.

**Parameters:**

- `$threshold` (int) — The boundary. Default `10`.

**Source:** `fluent-cart-pro/app/Modules/AdvancedInventory/Http/Controllers/AdvancedInventoryController.php:18`

**Usage:**
```php
add_filter('fluent_cart/inventory_low_stock_threshold', function ($threshold) {
    return 25;
});
```

::: tip Related
Consumed by [`GET /inventory/stats`](/restapi/operations/inventory/get-inventory-stats).
:::
</details>

---

## Saved Views

### <code> saved_views_permission_map </code>
<details>
<summary><code>fluent_cart/saved_views_permission_map</code> <Badge type="warning" text="Pro" /> &mdash; Maps admin tables to the capability required to use their saved views</summary>

**When it runs:**
Applied whenever `SavedViewsPolicy` resolves which capability guards a given `object_type`. Add an entry here to bring a custom table under the saved-views API.

::: warning An unmapped `object_type` is denied
The policy returns `false` for any `object_type` absent from this map, which surfaces as `403 rest_forbidden` before the controller runs. Adding the table to this filter is what makes it addressable.
:::

**Parameters:**

- `$map` (array) — Map of `object_type` to permission slug. The special value `is_super_admin` requires `manage_options`.

**Source:** `fluent-cart-pro/app/Http/Policies/SavedViewsPolicy.php:29`

**Usage:**
```php
add_filter('fluent_cart/saved_views_permission_map', function ($map) {
    $map['my_custom_table'] = 'orders/view';
    return $map;
});
```

::: tip Related
See the [Saved Views API](/restapi/saved-views) for the full default map.
:::
</details>

---

## Signed Releases

### <code> enable_signed_releases </code>
<details>
<summary><code>fluent_cart/licensing/enable_signed_releases</code> <Badge type="warning" text="Pro" /> &mdash; Turns on release manifest signing</summary>

**When it runs:**
Applied when the licensing module decides whether release manifests should be signed and verified. **Disabled by default.**

**Parameters:**

- `$enabled` (bool) — Whether signing is active. Default `false`.

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/ReleaseSignature.php:61`

**Usage:**
```php
add_filter('fluent_cart/licensing/enable_signed_releases', '__return_true');
```
</details>

### <code> release_public_keys </code>
<details>
<summary><code>fluent_cart/licensing/release_public_keys</code> <Badge type="warning" text="Pro" /> &mdash; Supplies the trusted public keys for verifying release signatures</summary>

**When it runs:**
Applied when collecting the set of public keys a release signature may validate against. Returns an empty array by default, and a non-array return value is discarded.

**Parameters:**

- `$keys` (array) — Trusted public keys. Default `[]`.

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/ReleaseSignature.php:100`

**Usage:**
```php
add_filter('fluent_cart/licensing/release_public_keys', function ($keys) {
    $keys[] = get_option('my_release_signing_public_key');
    return $keys;
});
```
</details>

### <code> encoded_package_url </code>
<details>
<summary><code>fluent_cart_sl/encoded_package_url</code> <Badge type="warning" text="Pro" /> &mdash; Rewrites the download URL issued for a licensed package</summary>

**When it runs:**
Applied to the package download URL before it is handed to an updater client. Use it to route downloads through a CDN or a signed-URL service.

**Parameters:**

- `$package_url` (string) — The generated download URL
- `$context` (array) — Currently always an empty array

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseManager.php:154`

**Usage:**
```php
add_filter('fluent_cart_sl/encoded_package_url', function ($url, $context) {
    return str_replace('https://downloads.example.com', 'https://cdn.example.com', $url);
}, 10, 2);
```
</details>

### <code> license/sanitized_url </code>
<details>
<summary><code>fluent_cart/license/sanitized_url</code> <Badge type="warning" text="Pro" /> &mdash; Adjusts how an activating site's URL is normalised</summary>

**When it runs:**
Applied after a site URL has been normalised for storage and comparison during activation. Both the normalised and original values are passed so you can override the normalisation entirely.

**Parameters:**

- `$url` (string) — The sanitized URL
- `$originalUrl` (string) — The URL exactly as submitted

**Source:** `fluent-cart-pro/app/Modules/Licensing/Services/LicenseHelper.php:41`

**Usage:**
```php
add_filter('fluent_cart/license/sanitized_url', function ($url, $originalUrl) {
    // Treat every subdomain of a staging host as one site.
    return preg_replace('/^[a-z0-9-]+\.staging\./', 'staging.', $url);
}, 10, 2);
```
</details>

---

## Paddle Gateway

### <code> paddle/checkout_custom_data </code>
<details>
<summary><code>fluent_cart/paddle/checkout_custom_data</code> <Badge type="warning" text="Pro" /> &mdash; Adds custom data to a Paddle checkout</summary>

**When it runs:**
Applied to the `custom_data` payload sent to Paddle when a checkout is created.

::: warning Reserved keys
The default value already contains keys FluentCart relies on to match the webhook back to a local order. Merge into the array rather than replacing it, or reconciliation will break.
:::

**Parameters:**

- `$reserved` (array) — FluentCart's own custom data
- `$context` (array) — `order`, `transaction`, `subscription` models

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/PaddleHelper.php:274`

**Usage:**
```php
add_filter('fluent_cart/paddle/checkout_custom_data', function ($data, $context) {
    $data['affiliate_id'] = get_query_var('ref');
    return $data;
}, 10, 2);
```
</details>

### <code> paddle_product_custom_data </code>
<details>
<summary><code>fluent_cart/paddle_product_custom_data</code> <Badge type="warning" text="Pro" /> &mdash; Adds custom data to a Paddle catalog product</summary>

**When it runs:**
Applied when FluentCart builds the `custom_data` payload for a Paddle **catalog product** — the product/price records mirrored into Paddle, as distinct from a checkout session.

The default value comes from `PaddleHelper::getCatalogCustomData()` and carries the identifiers FluentCart uses to map a Paddle product back to a local one:

```php
[
    'fct_product_id'   => '31562',   // string, omitted when not resolvable
    'fct_variation_id' => '22',      // string, omitted when no variation
]
```

::: warning Reserved keys
`fct_product_id` and `fct_variation_id` are how FluentCart re-identifies the product on the Paddle side. **Merge into the array; do not replace it** — dropping either breaks the mapping. Same rule as `paddle/checkout_custom_data`.
:::

**Parameters:**

- `$customData` (array) — The default identifier payload described above
- `$context` (array)
    - `product` ([`\FluentCart\App\Models\Product`](/database/models/product)`|null`) — The local product, `null` when it cannot be resolved
    - `variation_id` (int|null) — The variation being mirrored, when applicable

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/Product.php:24`

**Usage:**
```php
add_filter('fluent_cart/paddle_product_custom_data', function ($customData, $context) {
    if ($context['product']) {
        $customData['internal_sku'] = $context['product']->getMeta('erp_sku');
    }
    return $customData;
}, 10, 2);
```

::: tip Related
For the checkout-time equivalent, see [`fluent_cart/paddle/checkout_custom_data`](#paddle-checkout-custom-data).
:::
</details>

### <code> paddle/webhook_auto_recover_enabled </code>
<details>
<summary><code>fluent_cart/paddle/webhook_auto_recover_enabled</code> <Badge type="warning" text="Pro" /> &mdash; Controls the signature-failure recovery path</summary>

**When it runs:**
Applied when a Paddle webhook fails signature verification. When enabled (the default), FluentCart re-fetches the entity directly from the Paddle API rather than trusting the payload; when disabled, the request is rejected with `401`.

**Parameters:**

- `$enabled` (bool) — Whether auto-recover runs. Default `true`.
- `$context` (array) — `payload` — the raw webhook payload

**Source:** `fluent-cart-pro/app/Modules/PaymentMethods/PaddleGateway/Webhook/IPN.php:76`

**Usage:**
```php
// Strict mode: reject anything that fails signature verification.
add_filter('fluent_cart/paddle/webhook_auto_recover_enabled', '__return_false');
```

::: tip Related
Every recovery fires [`fluent_cart/paddle/webhook_signature_bypass`](../actions/pro-modules#webhook-signature-bypass).
:::
</details>

---

## Saved Payment Methods

### <code> consent_checked_by_default </code>
<details>
<summary><code>fluent_cart/saved_payment_methods/consent_checked_by_default</code> <Badge type="warning" text="Pro" /> &mdash; Pre-checks the "save my payment method" consent box</summary>

**When it runs:**
Applied when rendering the save-payment-method consent checkbox at checkout.

::: warning Consent and compliance
Pre-checking a consent box is restricted or prohibited in some jurisdictions. Confirm your obligations before enabling this.
:::

**Parameters:**

- `$checkedByDefault` (bool) — Whether the box renders pre-checked
- `$context` (array) — `cart` — the current cart

**Source:** `fluent-cart-pro/app/Modules/SavedPaymentMethods/Checkout/CheckoutSaveHandler.php:126`

**Usage:**
```php
add_filter('fluent_cart/saved_payment_methods/consent_checked_by_default', function ($checked, $context) {
    return false;
}, 10, 2);
```
</details>

---

## E-Invoicing & PDF

### <code> pdf_einvoice_data </code>
<details>
<summary><code>fluent_cart/pdf_einvoice_data</code> <Badge type="warning" text="Pro" /> &mdash; Modifies the ZUGFeRD e-invoice payload before embedding</summary>

**When it runs:**
Applied to the structured e-invoice data just before it is embedded into the generated receipt PDF.

**Parameters:**

- `$eInvoiceData` (array) — The assembled e-invoice data
- `$order` ([`\FluentCart\App\Models\Order`](/database/models/order)) — The order being rendered
- `$meta` (array) — Additional render metadata

**Source:** `fluent-cart-pro/app/Services/PDF/OrderReceiptPdfService.php:92`

**Usage:**
```php
add_filter('fluent_cart/pdf_einvoice_data', function ($data, $order, $meta) {
    $data['buyer_reference'] = $order->getMeta('purchase_order_number');
    return $data;
}, 10, 3);
```

::: tip Related
Seller-side fields are configured through the [PDF Templates API](/restapi/pdf-templates).
:::
</details>

### <code> render_block_email_template </code>
<details>
<summary><code>fluent_cart/render_block_email_template</code> &mdash; Renders block markup into an email body</summary>

::: warning The extension point is free; the renderer is Pro
This is the reverse of the usual arrangement, so read it carefully before assuming the hook is unavailable to you.

**The free plugin fires this filter** — when sending a notification (`EmailNotificationMailer.php:317`) and from WP-CLI (`Commands.php:1354`). Pro fires it too, for the admin preview. So the filter runs on every install and you can hook it without Pro.

**Pro supplies the implementation**, registering a listener at `fluent-cart-pro/app/Hooks/actions.php:89` that turns the block markup into HTML.

The consequence: on a **free-only install nothing implements the filter**, so the default `''` survives and a block-based email body renders **empty**. That is not a bug in the caller — it is the renderer being absent. Either install Pro or register your own listener.
:::

**When it runs:**
Applied wherever a block-based email body needs to become HTML: the Pro admin preview, the free notification mailer, and the free CLI command. The default value is an **empty string** — the block markup itself arrives in the context array, and a listener is expected to return the rendered HTML.

**Parameters:**

- `$rendered` (string) — The rendered output. Default `''`.
- `$context` (array) — `emailBody`, `preheader`, `emailFooter`

**Usage:**
```php
// Supply your own renderer on a free-only install.
add_filter('fluent_cart/render_block_email_template', function ($rendered, $context) {
    if ($rendered !== '') {
        return $rendered; // Something already rendered it — don't clobber.
    }
    return do_blocks($context['emailBody']);
}, 10, 2);
```

**Source:** fired at `fluent-cart/app/Services/Email/EmailNotificationMailer.php:317`, `fluent-cart/app/Hooks/CLI/Commands.php:1354` and `fluent-cart-pro/app/Http/Controllers/EmailNotificationProController.php:45`; implemented at `fluent-cart-pro/app/Hooks/actions.php:89`
</details>

### <code> disable_pro_email_templates </code>
<details>
<summary><code>fluent_cart_pro/disable_pro_email_templates</code> <Badge type="warning" text="Pro" /> &mdash; Hides the Pro starter email templates</summary>

**When it runs:**
Applied when building the starter template list for the email block editor. **Defaults to `true`**, i.e. the Pro starter templates are hidden — return `false` to surface them.

**Parameters:**

- `$disabled` (bool) — Whether Pro starter templates are hidden. Default `true`.

**Source:** `fluent-cart-pro/app/Hooks/Handlers/FluentCartBlockEditorHandler.php:247`

**Usage:**
```php
add_filter('fluent_cart_pro/disable_pro_email_templates', '__return_false');
```
</details>

---

## Integrations

### <code> learndash/before_set_user_course_expiry </code>
<details>
<summary><code>fluent_cart/learndash/before_set_user_course_expiry</code> <Badge type="warning" text="Pro" /> &mdash; Adjusts LearnDash course access expiry</summary>

**When it runs:**
Applied just before FluentCart writes a user's course access expiry, when enrolment is driven by an order or subscription.

**Parameters:**

- `$expiryTimestamp` (int) — The computed expiry, as a Unix timestamp
- `$context` (array) — `user_id`, `course_id`, `order`, `subscription`

**Source:** `fluent-cart-pro/app/Modules/Integrations/LMS/LearnDashLMSConnect.php:238`

**Usage:**
```php
add_filter('fluent_cart/learndash/before_set_user_course_expiry', function ($expiry, $context) {
    // Grant a 7-day grace period past the subscription end.
    return $expiry + (7 * DAY_IN_SECONDS);
}, 10, 2);
```
</details>

### <code> sanitize_user_meta </code>
<details>
<summary><code>fluent_cart/sanitize_user_meta</code> <Badge type="warning" text="Pro" /> &mdash; Controls per-field sanitization of synced WP user meta</summary>

**When it runs:**
Applied per meta field while the WP User integration writes user meta, deciding whether `sanitize_text_field()` is applied to that value. Only consulted for string values.

::: warning Returning false skips sanitization
Disable this only for fields whose content you control and which need markup or newlines preserved.
:::

**Parameters:**

- `$shouldSanitize` (bool) — Whether to sanitize this field
- `$fieldName` (string) — The meta key being written
- `$metaData` (string) — The value about to be written

**Source:** `fluent-cart-pro/app/Modules/Integrations/WPUserConnect.php:220`

**Usage:**
```php
add_filter('fluent_cart/sanitize_user_meta', function ($sanitize, $field, $value) {
    return $field === 'my_rich_bio' ? false : $sanitize;
}, 10, 3);
```
</details>

---

## Translations

### <code> blocks_translations </code>
<details>
<summary><code>fluent_cart_pro/blocks_translations</code> <Badge type="warning" text="Pro" /> &mdash; Overrides the block editor's translation strings</summary>

**When it runs:**
Applied when the Pro block editor loads its UI strings. The default is the full map from `block-editor-translation.php`, keyed by the **English source string**, with each value already passed through `__()` against the `fluent-cart-pro` text domain:

```php
[
    'Activations'      => __('Activations', 'fluent-cart-pro'),
    'Billing Address'  => __('Billing Address', 'fluent-cart-pro'),
    'Browse Smartcodes' => __('Browse Smartcodes', 'fluent-cart-pro'),
    // …
]
```

Use it to reword editor labels without a translation file — handy for white-labelling or house terminology. For actual localisation prefer a `.mo` for the `fluent-cart-pro` domain, which this map already honours.

::: tip Note the prefix
This hook uses `fluent_cart_pro/`, not the usual `fluent_cart/`. That prefix is a small, consistent family of four Pro-specific hooks: `fluent_cart_pro/blocks_translations`, `fluent_cart_pro/admin_translations`, [`fluent_cart_pro/disable_pro_email_templates`](#disable-pro-email-templates) and [`fluent_cart_pro/licensed_addons/allowed_hosts`](#licensed-addons-allowed-hosts).
:::

**Parameters:**

- `$translations` (array) — Map of English source string to translated string

**Source:** `fluent-cart-pro/app/Services/Translations/Translations.php:30`

**Usage:**
```php
add_filter('fluent_cart_pro/blocks_translations', function ($translations) {
    $translations['Billing Address'] = 'Invoice Address';
    return $translations;
});
```

::: tip Related
The admin UI outside the block editor has its own map, filtered by `fluent_cart_pro/admin_translations`.
:::
</details>

---

## Add-on Installation

### <code> payment_addons </code>
<details>
<summary><code>fluent_cart/payment_addons</code> <Badge type="warning" text="Pro" /> &mdash; Registers installable payment add-ons</summary>

**When it runs:**
Applied when the background installer assembles the list of payment add-ons available to install. A non-array return is coerced away.

**Parameters:**

- `$paymentAddons` (array) — Add-on definitions. Default `[]`.

**Source:** `fluent-cart-pro/app/Services/BackgroundInstaller.php:373`
</details>

### <code> licensed_addons/allowed_hosts </code>
<details>
<summary><code>fluent_cart_pro/licensed_addons/allowed_hosts</code> <Badge type="warning" text="Pro" /> &mdash; Allowlists hosts that may serve licensed add-on downloads</summary>

**When it runs:**
Applied when validating the remote host of a licensed add-on download. Hosts are lower-cased and trimmed, and the request is additionally required to be HTTPS and to pass `wp_http_validate_url()`.

::: warning Security boundary
This allowlist is what stops a licensed-download URL pointing somewhere arbitrary. Only add hosts you control.
:::

**Parameters:**

- `$allowedHosts` (array) — Permitted hostnames. Defaults to FluentCart's own license host.

**Source:** `fluent-cart-pro/app/Services/BackgroundInstaller.php:271`

**Usage:**
```php
add_filter('fluent_cart_pro/licensed_addons/allowed_hosts', function ($hosts) {
    $hosts[] = 'downloads.example.com';
    return $hosts;
});
```
</details>
