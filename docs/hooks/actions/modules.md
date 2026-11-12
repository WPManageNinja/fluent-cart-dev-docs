# Modules

Hooks fired by FluentCart's optional built-in modules: the **MCP server** (`app/Modules/MCP/`), which exposes store data and actions to AI agents through the WordPress Abilities API; the **Advanced Variation** product type (`app/Services/AdvancedVariationService.php`, `app/Hooks/Handlers/AdvancedVariationHandler.php`), which lets a product combine multiple attribute groups into a large set of purchasable variants; and the **Multi-Currency** module (`app/Modules/MultiCurrency/`), which prices a store in more than one currency: exchange rates, rounding rules and the storefront currency switcher.

---

## MCP

### <code> mcp_loaded </code>
<details open>
<summary><code>fluent_cart/mcp_loaded</code> &mdash; Fires once the MCP module has finished bootstrapping</summary>

**When it runs:**
Fires at the end of `MCPInit::init()`, after the module has confirmed an MCP adapter and the Abilities API are available and has registered its boot hooks, but before the dedicated `fluent-cart` MCP server itself is created. Use it to know the module is active and about to register its server, e.g. to register your own abilities before the server is built.

**Parameters:** None.

**Source:** `app/Modules/MCP/MCPInit.php:104`

**Usage:**
```php
add_action('fluent_cart/mcp_loaded', function () {
    error_log('FluentCart MCP module is active and initializing.');
}, 10, 0);
```
</details>

### <code> mcp_ability_registration_failed </code>
<details>
<summary><code>fluent_cart/mcp_ability_registration_failed</code> &mdash; Fires when registering an MCP ability throws an exception</summary>

**When it runs:**
Fires inside `AbilitiesRegistrar` when a single ability's registration callback throws while the registrar is looping over all defined abilities. The registrar catches the exception so one broken ability doesn't stop the rest from registering, and fires this hook so the failure isn't silently swallowed.

**Parameters:**
- `$context` (array): Failure context
    ```php
    $context = [
        'exception' => $e,     // \Throwable — the exception that was thrown
        'ability'   => $name,  // string — fully-qualified ability name that failed to register
    ];
    ```

**Source:** `app/Modules/MCP/AbilitiesRegistrar.php:91`

**Usage:**
```php
add_action('fluent_cart/mcp_ability_registration_failed', function ($context) {
    error_log(sprintf(
        'FluentCart MCP: ability "%s" failed to register: %s',
        $context['ability'],
        $context['exception']->getMessage()
    ));
}, 10, 1);
```
</details>

---

## Advanced Variation

### <code> advanced_variation/enqueue_assets </code>
<details>
<summary><code>fluent_cart/advanced_variation/enqueue_assets</code> &mdash; Fires when a block that can render an advanced-variation selector is about to render</summary>

**When it runs:**
Fires once, with no arguments, from the Buy Section, Product Info, and Product Carousel block editors just before they render a product — a fire-once, no-arg contract that lets an add-on providing the advanced-variation selector UI enqueue its CSS/JS on demand instead of unconditionally on every page. Without a listener, the selector renders unstyled and its price/variant JS never wires up. A listener is expected to dedupe by its own enqueue handle, since this can fire more than once per page (once per block instance).

**Parameters:** None.

**Source:** `app/Hooks/Handlers/BlockEditors/BuySectionBlockEditor.php:76`

Also fires from `app/Hooks/Handlers/BlockEditors/ProductInfoBlockEditor.php:81` and `app/Hooks/Handlers/BlockEditors/ProductCarousel/ProductCarouselBlockEditor.php:107`.

**Usage:**
```php
add_action('fluent_cart/advanced_variation/enqueue_assets', function () {
    wp_enqueue_style('my-addon-variation-selector');
    wp_enqueue_script('my-addon-variation-selector');
}, 10, 0);
```
</details>

---

## Multi-Currency

Actions fired by the multi-currency module (`app/Modules/MultiCurrency/`). Rates themselves are
stored by FluentCart Pro; core defines the extension points and holds no rates of its own.

### <code> currency/settings_saved </code>
<details>
<summary><code>fluent_cart/currency/settings_saved</code> &mdash; Fires after the multi-currency settings are written</summary>

**When it runs:**
Fires at the end of `MultiCurrencySettings::save()`, after the option is written and the in-process
settings cache is cleared. Any currency the save rejected has already been dropped, so the payload is
the settings as they were actually stored, not as they were submitted.

**Parameters:**

- `$data` (array): The saved settings
    ```php
    $data = [
        'settings' => [...], // The stored settings, read back after the write
    ];
    ```

**Source:** `app/Modules/MultiCurrency/Services/MultiCurrencySettings.php:117`

**Usage:**
```php
add_action('fluent_cart/currency/settings_saved', function ($data) {
    // Re-prime an external price cache when the currency list changes
    $codes = array_column($data['settings']['currencies'], 'code');
    update_option('my_plugin_known_currencies', $codes, 'no');
}, 10, 1);
```
</details>

### <code> currency/prime_rates </code>
<details>
<summary><code>fluent_cart/currency/prime_rates</code> &mdash; Asks a rate store to load many rates at once</summary>

**When it runs:**
Fires from `ExchangeRateService::primeRates()` before a batch of conversions, so a rate store can load
every quote in one query instead of one query per `current()` call. Pro's `RateStore::primeRates()`
listens. Nothing fires when the quote list is empty.

This is a performance hook, not a notification: a listener is expected to warm its own cache, and the
`current()` calls that follow read that cache.

**Parameters:**

- `$data` (array): The rates to load
    ```php
    $data = [
        'base'   => 'USD',               // The store's base currency
        'quotes' => ['EUR', 'GBP'],      // Re-indexed list of quote currencies
    ];
    ```

**Source:** `app/Modules/MultiCurrency/Services/ExchangeRateService.php:102`

**Usage:**
```php
add_action('fluent_cart/currency/prime_rates', function ($data) {
    // Fetch every quote in one request and cache it for current() to read
    my_plugin_warm_rate_cache($data['base'], $data['quotes']);
}, 10, 1);
```
</details>

### <code> currency/rates_flushed </code>
<details>
<summary><code>fluent_cart/currency/rates_flushed</code> &mdash; Drop every cached exchange rate</summary>

**When it runs:**
Fires from `ExchangeRateService::flushCache()`, which Pro calls after it records a new rate. A listener
should discard whatever it cached for [`currency/prime_rates`](#currency-prime-rates) or
[`currency/exchange_rate`](../filters/modules#currency-exchange-rate).

**Parameters:**

- `$data` (array): Always an empty array. The hook is a signal, not a payload.

**Source:** `app/Modules/MultiCurrency/Services/ExchangeRateService.php:113`

**Usage:**
```php
add_action('fluent_cart/currency/rates_flushed', function () {
    delete_transient('my_plugin_fx_cache');
}, 10, 1);
```
</details>

### <code> currency/transaction_mismatch </code>
<details>
<summary><code>fluent_cart/currency/transaction_mismatch</code> &mdash; Fires when a transaction's currency differs from its order's</summary>

**When it runs:**
Fires from `CurrencySnapshot::applyToNewTransaction()` when a transaction is recorded in a currency
other than the order's. Every amount on an order is stored in that order's own currency, so such a
payment cannot be totalled against it and needs review. FluentCart has already written a warning
activity against the order by the time this fires.

**Parameters:**

- `$data` (array): The mismatched pair
    ```php
    $data = [
        'transaction' => OrderTransaction, // The transaction just recorded
        'order'       => Order,            // The order it was recorded against
    ];
    ```

**Source:** `app/Modules/MultiCurrency/Services/CurrencySnapshot.php:264`

**Usage:**
```php
add_action('fluent_cart/currency/transaction_mismatch', function ($data) {
    // Route to whoever reconciles payments
    wp_mail(
        get_option('admin_email'),
        'Currency mismatch on order #' . $data['order']->id,
        sprintf(
            'A %s transaction was recorded on a %s order.',
            strtoupper($data['transaction']->currency),
            strtoupper($data['order']->currency)
        )
    );
}, 10, 1);
```
</details>
