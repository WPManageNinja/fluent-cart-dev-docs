# Modules

Filters exposed by FluentCart's optional built-in modules: the **MCP server** (`app/Modules/MCP/`), which exposes store data and actions to AI agents through the WordPress Abilities API; the **Advanced Variation** product type (`app/Services/AdvancedVariationService.php`, `app/Hooks/Handlers/AdvancedVariationHandler.php`), which lets a product combine multiple attribute groups into a large set of purchasable variants; and the **Multi-Currency** module (`app/Modules/MultiCurrency/`), which prices a store in more than one currency: exchange rates, rounding rules and the storefront currency switcher.

---

## Advanced Variation

### <code> advanced_variation/asset_page_types </code>
<details open>
<summary><code>fluent_cart/advanced_variation/asset_page_types</code> &mdash; Filter which frontend page types load the advanced-variation selector assets</summary>

**When it runs:**
Runs once when the handler builds the list of FluentCart page types for which it enqueues the advanced-variation selector's CSS/JS on `wp_enqueue_scripts`. Cart, checkout, receipt, login, registration, and the customer dashboard are excluded by default so those pages don't pay the asset weight; use this filter to add a custom page type context.

**Parameters:**
- `$pageTypes` (array): Page type slugs the selector assets should load on. Default: `['single_product', 'shop', 'product_taxonomy']`

**Returns:** `array` — The page type slugs to enqueue assets for

**Source:** `app/Hooks/Handlers/AdvancedVariationHandler.php:161`

**Usage:**
```php
add_filter('fluent_cart/advanced_variation/asset_page_types', function ($pageTypes) {
    // Also load the selector assets on a custom landing page template
    $pageTypes[] = 'custom_bundle_page';
    return $pageTypes;
}, 10, 1);
```
</details>

### <code> advanced_variation/max_combinations </code>
<details>
<summary><code>fluent_cart/advanced_variation/max_combinations</code> &mdash; Filter the maximum projected variant combinations allowed per product</summary>

**When it runs:**
Runs when `AdvancedVariationService` validates a save: once against the *projected* combination count (attribute-group term counts multiplied together) before the real per-variant relations are built, and again against the *real* group set right before the write. Both checks re-apply this filter so a raised limit is honored consistently. Exceeding the limit rejects the save with an error message.

**Parameters:**
- `$maxCombinations` (int): The combination cap. Default: `self::DEFAULT_MAX_COMBINATIONS`

**Returns:** `int` — The maximum number of variant combinations to allow

**Source:** `app/Services/AdvancedVariationService.php:162`

Also re-applied at `app/Services/AdvancedVariationService.php:463`.

**Usage:**
```php
add_filter('fluent_cart/advanced_variation/max_combinations', function ($maxCombinations) {
    // This store's catalog needs a larger combination ceiling than the default
    return 5000;
}, 10, 1);
```
</details>

### <code> advanced_variation/max_groups_per_save </code>
<details>
<summary><code>fluent_cart/advanced_variation/max_groups_per_save</code> &mdash; Filter the maximum number of attribute groups allowed per save</summary>

**When it runs:**
Runs when `AdvancedVariationService` validates a save, bounding the number of non-empty attribute groups in the submitted payload (e.g. Color, Size, Material). It's re-applied a second time against the *real* group count derived from the persisted variant relations, since a single payload entry can bundle terms from more than one real group.

**Parameters:**
- `$maxGroups` (int): The attribute-group cap. Default: `self::DEFAULT_MAX_GROUPS_PER_SAVE`

**Returns:** `int` — The maximum number of attribute groups to allow per save

**Source:** `app/Services/AdvancedVariationService.php:130`

Also re-applied at `app/Services/AdvancedVariationService.php:452`.

**Usage:**
```php
add_filter('fluent_cart/advanced_variation/max_groups_per_save', function ($maxGroups) {
    return 6;
}, 10, 1);
```
</details>

### <code> advanced_variation/max_terms_per_save </code>
<details>
<summary><code>fluent_cart/advanced_variation/max_terms_per_save</code> &mdash; Filter the maximum number of unique attribute terms allowed per save</summary>

**When it runs:**
Runs when `AdvancedVariationService` validates a save, bounding the total number of unique attribute terms (e.g. Red, Blue, Small, Large) across all attribute groups in the submitted payload. This bounds the term-validation `whereIn` list and the per-variant relation insert count independently of the combination cap, which only bounds the cartesian product.

**Parameters:**
- `$maxTerms` (int): The unique-term cap. Default: `self::DEFAULT_MAX_TERMS_PER_SAVE`

**Returns:** `int` — The maximum number of unique attribute terms to allow per save

**Source:** `app/Services/AdvancedVariationService.php:146`

**Usage:**
```php
add_filter('fluent_cart/advanced_variation/max_terms_per_save', function ($maxTerms) {
    return 200;
}, 10, 1);
```
</details>

---

## MCP

### <code> mcp_ability_names </code>
<details open>
<summary><code>fluent_cart/mcp_ability_names</code> &mdash; Filter the fully-qualified ability names exposed by the MCP server</summary>

**When it runs:**
Runs when `MCPInit` builds the list of abilities to register with the MCP adapter, and again in `toolsCount()` when the admin Settings UI reports how many tools are available. Use it to add abilities registered outside FluentCart's own `AbilitiesRegistrar`, or to remove specific abilities from the exposed set.

**Parameters:**
- `$abilityNames` (array): Fully-qualified ability names (e.g. `fluent-cart/list-orders`)

**Returns:** `array` — The ability names to register/count. Duplicates and empty values are filtered out afterward

**Source:** `app/Modules/MCP/MCPInit.php:130`

Also re-applied in `toolsCount()` at `app/Modules/MCP/MCPInit.php:247`.

**Usage:**
```php
add_filter('fluent_cart/mcp_ability_names', function ($abilityNames) {
    // Hide a sensitive built-in ability from every MCP client
    return array_diff($abilityNames, ['fluent-cart/refund-order']);
}, 10, 1);
```
</details>

### <code> mcp_advanced_search_entities </code>
<details>
<summary><code>fluent_cart/mcp_advanced_search_entities</code> &mdash; Filter the entities available to the MCP advanced-search tool</summary>

**When it runs:**
Runs when `AdvancedSearch` resolves the entity map that backs the `get-search-schema` MCP tool and the `advanced_filters` parameter on the `query-*` tools. Each entry maps an entity name to the filter class that handles it, the WordPress capability required to query it, and the corresponding `list-*` tool name.

**Parameters:**
- `$entities` (array): Entity map
    ```php
    $entities = [
        'orders' => [
            'filter'    => \FluentCart\App\Services\Filter\OrderFilter::class,
            'permission' => 'manage_options',
            'list_tool'  => 'list-orders',
        ],
        // ...
    ];
    ```

**Returns:** `array` — The entity map, keyed by entity name

**Source:** `app/Modules/MCP/Support/AdvancedSearch.php:102`

**Usage:**
```php
add_filter('fluent_cart/mcp_advanced_search_entities', function ($entities) {
    // Expose a custom entity to the MCP advanced-search tool
    $entities['loyalty_points'] = [
        'filter'     => \MyAddon\LoyaltyPointsFilter::class,
        'permission' => 'manage_options',
        'list_tool'  => 'list-loyalty-points',
    ];
    return $entities;
}, 10, 1);
```
</details>

### <code> mcp_allow_live_gateway </code>
<details>
<summary><code>fluent_cart/mcp_allow_live_gateway</code> &mdash; Filter whether MCP tools may perform live (real-money) gateway actions</summary>

**When it runs:**
Runs inside `WriteGuard` whenever an MCP tool call (e.g. `refund-order`, `change-subscription-status:cancel`) would touch a live gateway. By default live mutations are blocked and the tool call returns a `live_gateway_blocked` error, so an agent can't move real money unless a store owner explicitly opts in via the `mcp_allow_live_gateway` option or this filter.

**Parameters:**
- `$allowed` (bool): Whether live refunds/cancellations are permitted. Reflects the current `mcp_allow_live_gateway` option value

**Returns:** `bool` — `true` to permit live gateway writes from MCP tools, `false` to keep blocking them

**Source:** `app/Modules/MCP/Support/WriteGuard.php:186`

**Usage:**
```php
add_filter('fluent_cart/mcp_allow_live_gateway', function ($allowed) {
    // Only ever allow live gateway writes from MCP on staging
    return wp_get_environment_type() !== 'production';
}, 10, 1);
```
</details>

### <code> mcp_customer_data </code>
<details>
<summary><code>fluent_cart/mcp_customer_data</code> &mdash; Filter the customer payload returned by MCP customer tools</summary>

**When it runs:**
Runs in `CustomerTools` after the customer record and its requested `include[]` sections have been assembled into the response payload, just before it's wrapped and returned to the MCP client. Use it to append data an add-on tracks about the customer.

**Parameters:**
- `$data` (array): The customer payload as it will be returned to the MCP client
- `$context` (array): Resolution context
    ```php
    $context = [
        'customer' => $customer, // \FluentCart\App\Models\Customer
        'include'  => $include,  // string[] — the include[] sections that were requested
    ];
    ```

**Returns:** `array` — The (possibly extended) customer payload

**Source:** `app/Modules/MCP/Tools/CustomerTools.php:435`

**Usage:**
```php
add_filter('fluent_cart/mcp_customer_data', function ($data, $context) {
    $data['loyalty_points'] = my_addon_get_points($context['customer']->id);
    return $data;
}, 10, 2);
```
</details>

### <code> mcp_customer_include_sections </code>
<details>
<summary><code>fluent_cart/mcp_customer_include_sections</code> &mdash; Filter the section names offered in the MCP get-customer tool's include[] enum</summary>

**When it runs:**
Runs when `CustomerTools` builds the list of section names a caller may request via the `include` parameter on the `get-customer` MCP tool. Add a section name here to advertise it in the tool's schema; you still need to populate that section via `fluent_cart/mcp_customer_data`.

**Parameters:**
- `$sections` (array): Section name strings

**Returns:** `array` — The section names to offer in the `include[]` enum. Deduplicated and cast to strings afterward

**Source:** `app/Modules/MCP/Tools/CustomerTools.php:141`

**Usage:**
```php
add_filter('fluent_cart/mcp_customer_include_sections', function ($sections) {
    $sections[] = 'loyalty_points';
    return $sections;
}, 10, 1);
```
</details>

### <code> mcp_enums </code>
<details>
<summary><code>fluent_cart/mcp_enums</code> &mdash; Filter the enum reference map returned by get-store-context</summary>

**When it runs:**
Runs when `ContextTools` assembles the payload for the `get-store-context` MCP tool, which every well-behaved MCP client is instructed to call once per session. The `enums` section tells the agent the exact valid values (order statuses, payment statuses, etc.) to use so it never invents one.

**Parameters:**
- `$enums` (array): The default enum map, from `ContextTools::enums()`

**Returns:** `array` — The enum map to expose to MCP clients

**Source:** `app/Modules/MCP/Tools/ContextTools.php:254`

**Usage:**
```php
add_filter('fluent_cart/mcp_enums', function ($enums) {
    $enums['loyalty_tier'] = ['bronze', 'silver', 'gold'];
    return $enums;
}, 10, 1);
```
</details>

### <code> mcp_expose_error_details </code>
<details>
<summary><code>fluent_cart/mcp_expose_error_details</code> &mdash; Filter whether MCP tool errors include file/line and stack trace details</summary>

**When it runs:**
Runs in `AbilitiesRegistrar`'s exception handler when an MCP tool callback throws. Full error detail is always logged server-side regardless of this filter; this only controls whether the file (reduced to a basename), line, and a short stack trace are also included in the error payload sent back to the MCP client. Off (`false`) by default since a client-visible stack trace can leak the server's filesystem layout.

**Parameters:**
- `$exposeDetails` (bool): Whether to include file/line/trace in the client-facing error. Default: `false`

**Returns:** `bool` — `true` to include the extra detail in the MCP error response

**Source:** `app/Modules/MCP/AbilitiesRegistrar.php:323`

**Usage:**
```php
add_filter('fluent_cart/mcp_expose_error_details', function ($exposeDetails) {
    // Only expose stack traces to MCP clients on a local dev install
    return defined('WP_DEBUG') && WP_DEBUG;
}, 10, 1);
```
</details>

### <code> mcp_guidelines </code>
<details>
<summary><code>fluent_cart/mcp_guidelines</code> &mdash; Filter the top-level usage guidelines returned by get-store-context</summary>

**When it runs:**
Runs when `ContextTools` builds the `guidelines` string returned by the `get-store-context` MCP tool — the free-text instructions that steer how an MCP client should call FluentCart's tools (e.g. calling `get-store-context` once per session, requiring a `dry_run` preview before destructive writes).

**Parameters:**
- `$guidelines` (string): The default guidelines text

**Returns:** `string` — The guidelines text to return to MCP clients

**Source:** `app/Modules/MCP/Tools/ContextTools.php:426`

**Usage:**
```php
add_filter('fluent_cart/mcp_guidelines', function ($guidelines) {
    return $guidelines . ' Loyalty point balances are informational only and cannot be redeemed through these tools.';
}, 10, 1);
```
</details>

### <code> mcp_is_local_dev </code>
<details>
<summary><code>fluent_cart/mcp_is_local_dev</code> &mdash; Filter whether the current request is treated as local development for MCP settings</summary>

**When it runs:**
Runs at the end of `McpSettingsController`'s local-dev detection, after it has checked the request host against its own heuristics (e.g. `localhost`, `.test`, `.local`). Local-dev status affects which guidance/warnings the MCP Settings UI shows about exposing the endpoint.

**Parameters:**
- `$isLocal` (bool): The result of the built-in heuristic check
- `$host` (string): The request host that was checked

**Returns:** `bool` — Whether to treat the current install as local development

**Source:** `app/Http/Controllers/McpSettingsController.php:273`

**Usage:**
```php
add_filter('fluent_cart/mcp_is_local_dev', function ($isLocal, $host) {
    // Also treat this team's internal staging domain as local
    return $isLocal || str_ends_with($host, '.staging.example.com');
}, 10, 2);
```
</details>

### <code> mcp_order_data </code>
<details>
<summary><code>fluent_cart/mcp_order_data</code> &mdash; Filter the order payload returned by MCP order tools</summary>

**When it runs:**
Runs in `OrderTools` after the order record and its requested `include[]` sections have been assembled into the response payload, before the `fields` projection (if requested) trims it. Note `order_id` is always kept even if `fields` would otherwise drop it.

**Parameters:**
- `$data` (array): The order payload as it will be returned to the MCP client
- `$context` (array): Resolution context
    ```php
    $context = [
        'order'   => $order,   // \FluentCart\App\Models\Order
        'include' => $include, // string[] — the include[] sections that were requested
    ];
    ```

**Returns:** `array` — The (possibly extended) order payload

**Source:** `app/Modules/MCP/Tools/OrderTools.php:532`

**Usage:**
```php
add_filter('fluent_cart/mcp_order_data', function ($data, $context) {
    $data['fulfillment_notes'] = my_addon_get_notes($context['order']->id);
    return $data;
}, 10, 2);
```
</details>

### <code> mcp_order_include_sections </code>
<details>
<summary><code>fluent_cart/mcp_order_include_sections</code> &mdash; Filter the section names offered in the MCP get-order tool's include[] enum</summary>

**When it runs:**
Runs when `OrderTools` builds the list of section names a caller may request via the `include` parameter on the `get-order` MCP tool. Add a section name here to advertise it in the tool's schema; you still need to populate that section via `fluent_cart/mcp_order_data`.

**Parameters:**
- `$sections` (array): Section name strings

**Returns:** `array` — The section names to offer in the `include[]` enum. Deduplicated and cast to strings afterward

**Source:** `app/Modules/MCP/Tools/OrderTools.php:567`

**Usage:**
```php
add_filter('fluent_cart/mcp_order_include_sections', function ($sections) {
    $sections[] = 'fulfillment_notes';
    return $sections;
}, 10, 1);
```
</details>

### <code> mcp_server_namespace </code>
<details>
<summary><code>fluent_cart/mcp_server_namespace</code> &mdash; Filter the REST namespace the FluentCart MCP server is registered under</summary>

**When it runs:**
Runs when `MCPInit` creates the dedicated `fluent-cart` MCP server and again in `getEndpointUrl()`, which the Settings UI and connection-snippet generator use, so both stay in sync. Combined with `fluent_cart/mcp_server_route`, this forms the REST path `/wp-json/{namespace}/{route}`.

**Parameters:**
- `$namespace` (string): The REST namespace. Default: `'fluent-cart'`

**Returns:** `string` — The REST namespace for the MCP server endpoint

**Source:** `app/Modules/MCP/MCPInit.php:133`

Also re-applied in `getEndpointUrl()` at `app/Modules/MCP/MCPInit.php:265`.

**Usage:**
```php
add_filter('fluent_cart/mcp_server_namespace', function ($namespace) {
    return 'my-store-mcp';
}, 10, 1);
```
</details>

### <code> mcp_server_route </code>
<details>
<summary><code>fluent_cart/mcp_server_route</code> &mdash; Filter the REST route the FluentCart MCP server is registered under</summary>

**When it runs:**
Runs when `MCPInit` creates the dedicated `fluent-cart` MCP server and again in `getEndpointUrl()`, which the Settings UI and connection-snippet generator use, so both stay in sync. Combined with `fluent_cart/mcp_server_namespace`, this forms the REST path `/wp-json/{namespace}/{route}`.

**Parameters:**
- `$route` (string): The REST route. Default: `'mcp'`

**Returns:** `string` — The REST route for the MCP server endpoint

**Source:** `app/Modules/MCP/MCPInit.php:134`

Also re-applied in `getEndpointUrl()` at `app/Modules/MCP/MCPInit.php:266`.

**Usage:**
```php
add_filter('fluent_cart/mcp_server_route', function ($route) {
    return 'agent-tools';
}, 10, 1);
```
</details>

### <code> mcp_tool_index </code>
<details>
<summary><code>fluent_cart/mcp_tool_index</code> &mdash; Filter the tool index returned by get-store-context</summary>

**When it runs:**
Runs when `ContextTools` builds the `tool_index` section of the `get-store-context` MCP tool payload — a grouped index that helps an MCP client pick the right tool for a task before calling `list-*`/`query-*`/`get-*` tools. Empty groups are already filtered out before this filter runs.

**Parameters:**
- `$index` (array): The tool index, grouped by category

**Returns:** `array` — The tool index to return to MCP clients

**Source:** `app/Modules/MCP/Tools/ContextTools.php:408`

**Usage:**
```php
add_filter('fluent_cart/mcp_tool_index', function ($index) {
    $index['loyalty'] = ['list-loyalty-points', 'get-loyalty-summary'];
    return $index;
}, 10, 1);
```
</details>

---

## Multi-Currency

Filters exposed by the multi-currency module (`app/Modules/MultiCurrency/`). Core defines every
extension point and ships manual rate entry; FluentCart Pro supplies the rate store, a daily feed and
the dropdown switcher. Rates are stored as `DECIMAL(24,12)` and amounts stay in cents.

### <code> currency/enabled_currencies </code>
<details>
<summary><code>fluent_cart/currency/enabled_currencies</code> &mdash; Filter which currencies the store offers</summary>

**When it runs:**
Applied in `MultiCurrencySettings::currencyCodes()`. The incoming list is the configured currency
codes, or an empty array when multi-currency is switched off. Whatever you return is upper-cased,
de-duplicated and re-indexed afterwards, so case and duplicates do not matter.

**Parameters:**
- `$codes` (string[]): The configured currency codes. Empty when the module is disabled.
- `$context` (array): Context data
    ```php
    $context = [
        'base_currency' => 'USD', // The store's base currency
    ];
    ```

**Returns:** `string[]` — The currency codes to offer

**Source:** `app/Modules/MultiCurrency/Services/MultiCurrencySettings.php:170`

**Usage:**
```php
add_filter('fluent_cart/currency/enabled_currencies', function ($codes, $context) {
    // Offer CAD only to visitors routed through a Canadian edge
    if (($_SERVER['HTTP_CF_IPCOUNTRY'] ?? '') !== 'CA') {
        return array_diff($codes, ['CAD']);
    }

    return $codes;
}, 10, 2);
```
</details>

### <code> currency/rate_providers </code>
<details>
<summary><code>fluent_cart/currency/rate_providers</code> &mdash; Register a source of exchange rates</summary>

**When it runs:**
Applied in `MultiCurrencySettings::rateProviders()` when the settings screen lists the available rate
sources. Core ships manual entry only; add a slug here to offer your own feed. Registering a provider
does not activate it — a feed never replaces manual rates until the merchant selects it.

Writing rates is separate: on your own schedule, call
`\FluentCartPro\App\Modules\MultiCurrency\RateStore::record()` with your slug as the source. That
requires FluentCart Pro, which owns the rate store.

**Parameters:**
- `$providers` (array): Provider slug => label. Default `['manual' => 'Enter rates manually']`.

**Returns:** `array` — The provider list

**Source:** `app/Modules/MultiCurrency/Services/MultiCurrencySettings.php:71`

**Usage:**
```php
add_filter('fluent_cart/currency/rate_providers', function ($providers) {
    $providers['my_feed'] = __('My FX feed', 'my-plugin');
    return $providers;
});
```
</details>

### <code> currency/rate_provider_notes </code>
<details>
<summary><code>fluent_cart/currency/rate_provider_notes</code> &mdash; Add a note beside a rate provider</summary>

**When it runs:**
Applied in `MultiCurrencySettings::rateProviderNotes()` to render a short note next to a provider on
the settings screen — a source credit or terms-of-use line. Plain text, not HTML, keyed by the same
slug used in [`currency/rate_providers`](#currency-rate-providers).

**Parameters:**
- `$notes` (array): Provider slug => note. Default empty.

**Returns:** `array` — The notes

**Source:** `app/Modules/MultiCurrency/Services/MultiCurrencySettings.php:58`

**Usage:**
```php
add_filter('fluent_cart/currency/rate_provider_notes', function ($notes) {
    $notes['my_feed'] = __('Rates by My FX feed. Attribution required.', 'my-plugin');
    return $notes;
});
```
</details>

### <code> currency/rate_lock_ttl </code>
<details>
<summary><code>fluent_cart/currency/rate_lock_ttl</code> &mdash; Filter how long a cart's rate stays locked</summary>

**When it runs:**
Applied in `MultiCurrencySettings::rateLockSeconds()`. A cart freezes its exchange rate for this long
so prices do not move while the customer shops; after it expires the cart re-prices at the current
rate.

**The value is in minutes, and the method returns seconds.** Return minutes here — a negative value is
floored to `0`, which disables the lock and re-prices on every read.

**Parameters:**
- `$minutes` (int): Lock duration in minutes, from the `rate_lock_minutes` setting.

**Returns:** `int` — Lock duration in minutes

**Source:** `app/Modules/MultiCurrency/Services/MultiCurrencySettings.php:228`

**Usage:**
```php
add_filter('fluent_cart/currency/rate_lock_ttl', function ($minutes) {
    return 120; // two hours
});
```
</details>

### <code> currency/exchange_rate </code>
<details>
<summary><code>fluent_cart/currency/exchange_rate</code> &mdash; Supply the raw exchange rate for a currency pair</summary>

**When it runs:**
Applied in `ExchangeRateService::current()` to resolve the rate for one pair. **Core stores no rates**
— it starts from `null` and relies on a listener to answer. Pro's `RateStore::storedRate()` answers at
**priority 5** with the stored row, so a live feed registered at the default priority 10 can replace
it.

Return the raw rate, *before* margin. The margin from [`currency/fx_margin`](#currency-fx-margin) is
applied to whatever you return. A return value that is not an array, or whose `rate` is not a valid
positive rate, is treated as "no rate" and the conversion is refused.

**Parameters:**
- `$rate` (array|null): `null` on the way in, or an earlier listener's answer.
    ```php
    $rate = [
        'rate'         => '0.918400',          // (string|float) Raw rate, before margin
        'rate_id'      => 12,                  // (int|null) The stored row's id, when there is one
        'source'       => 'ecb',               // (string) Provider slug; 'manual' skips the store margin
        'margin'       => '0',                 // (string|float) Percent; used as the default margin
        'effective_at' => '2026-11-12 00:00:00', // (string) GMT timestamp the rate took effect
    ];
    ```
- `$context` (array): Context data
    ```php
    $context = [
        'base'    => 'USD',  // The store's base currency
        'quote'   => 'EUR',  // The currency being priced
        'context' => [...],  // Caller-supplied context, may be empty
    ];
    ```

**Returns:** `array|null` — The raw rate, or `null` for none

**Source:** `app/Modules/MultiCurrency/Services/ExchangeRateService.php:49`

**Usage:**
```php
// Replace Pro's stored rate with a live one. Priority 10 runs after Pro's 5.
add_filter('fluent_cart/currency/exchange_rate', function ($rate, $context) {
    $live = my_plugin_live_rate($context['base'], $context['quote']);
    if (!$live) {
        return $rate; // fall back to whatever was stored
    }

    return [
        'rate'         => $live,
        'rate_id'      => null,
        'source'       => 'my_feed',
        'margin'       => 0,
        'effective_at' => gmdate('Y-m-d H:i:s'),
    ];
}, 10, 2);
```
</details>

### <code> currency/fx_margin </code>
<details>
<summary><code>fluent_cart/currency/fx_margin</code> &mdash; Filter the merchant markup applied to a rate</summary>

**When it runs:**
Applied in `ExchangeRateService::current()` right after the raw rate is resolved. The margin is a
percentage added to the raw rate, and the result is the rate frozen on the order — the rate the
customer actually paid.

The default depends on where the rate came from: a `manual` rate uses its own stored margin; a feed
rate gets `0` while the provider setting is still `manual`, so a leftover feed row is never marked up
unseen; otherwise the store's configured margin applies.

**Parameters:**
- `$margin` (float): The default margin in percent, resolved as described above.
- `$context` (array): Context data
    ```php
    $context = [
        'base'  => 'USD', // The store's base currency
        'quote' => 'EUR', // The currency being priced
    ];
    ```

**Returns:** `float` — The margin in percent. `0` applies no markup.

**Source:** `app/Modules/MultiCurrency/Services/ExchangeRateService.php:71`

**Usage:**
```php
add_filter('fluent_cart/currency/fx_margin', function ($margin, $context) {
    // Absorb the spread on a currency you hold a balance in
    return $context['quote'] === 'EUR' ? 0.0 : $margin;
}, 10, 2);
```
</details>

### <code> currency/resolve_for_request </code>
<details>
<summary><code>fluent_cart/currency/resolve_for_request</code> &mdash; Pick the currency for a visitor who has not chosen one</summary>

**When it runs:**
Applied in `CurrencyContext::resolve()` only after the earlier checks fall through: the module must be
enabled, and the visitor must not already have an explicit choice — a chosen currency always wins over
this filter. Admin screens, cron and CLI never price in a visitor's currency.

A returned currency that is not selectable is discarded and the base currency is used, so an
unavailable guess cannot break pricing.

**Parameters:**
- `$currency` (string): The base currency, as the default guess.
- `$context` (array): Context data
    ```php
    $context = [
        'country' => 'DE', // Visitor country from HTTP_CF_IPCOUNTRY, '' when absent
    ];
    ```

**Returns:** `string` — The currency code to price in

**Source:** `app/Modules/MultiCurrency/Services/CurrencyContext.php:236`

**Usage:**
```php
add_filter('fluent_cart/currency/resolve_for_request', function ($currency, $context) {
    $map = ['DE' => 'EUR', 'FR' => 'EUR', 'GB' => 'GBP'];

    return $map[$context['country']] ?? $currency;
}, 10, 2);
```
</details>

### <code> currency/rounding_rules </code>
<details>
<summary><code>fluent_cart/currency/rounding_rules</code> &mdash; Filter the rounding rules offered in settings</summary>

**When it runs:**
Applied in `RoundingRules::options()` when the settings screen lists the rounding choices. The defaults
are "round to the smallest unit of the currency" plus one entry per configured step.

Adding a key here only puts it in the dropdown. To make a new rule actually round, also handle it in
[`currency/rounding_rule`](#currency-rounding-rule), which receives your key as `rule`.

**Parameters:**
- `$options` (array): Rule key => label.

**Returns:** `array` — The rule list

**Source:** `app/Modules/MultiCurrency/Services/RoundingRules.php:55`

**Usage:**
```php
add_filter('fluent_cart/currency/rounding_rules', function ($options) {
    $options['nearest_5'] = __('Round to the nearest 5', 'my-plugin');
    return $options;
});
```
</details>

### <code> currency/rounding_rule </code>
<details>
<summary><code>fluent_cart/currency/rounding_rule</code> &mdash; Filter a rounded amount</summary>

**When it runs:**
Applied in `RoundingRules::finish()`, the last step of both `apply()` and `price()`, after the selected
rule has already rounded the amount. Use it for charm pricing, or to implement a rule you added
through [`currency/rounding_rules`](#currency-rounding-rules).

The result is cast to `int` and floored at `0`, so a negative return cannot produce a negative price.
Amounts are in **cents**; for a zero-decimal currency the smallest unit is 100 stored units.

**Parameters:**
- `$rounded` (int): The already-rounded amount in cents.
- `$context` (array): Context data
    ```php
    $context = [
        'raw_amount' => 3999,    // (int|float) The amount before rounding
        'currency'   => 'EUR',   // (string) Upper-cased currency code
        'rule'       => 'up_1',  // (string) The rule applied
        'charm'      => 'none',  // (string) Charm-pricing key; always 'none' when called from apply()
    ];
    ```

**Returns:** `int` — The final amount in cents

**Source:** `app/Modules/MultiCurrency/Services/RoundingRules.php:127`

**Usage:**
```php
add_filter('fluent_cart/currency/rounding_rule', function ($rounded, $context) {
    if ($context['currency'] === 'EUR' && $context['rule'] === 'up_1') {
        return max(0, $rounded - 10); // 40.00 becomes 39.90
    }

    return $rounded;
}, 10, 2);
```
</details>

### <code> currency_switcher/render </code>
<details>
<summary><code>fluent_cart/currency_switcher/render</code> &mdash; Replace the currency switcher's markup</summary>

**When it runs:**
Applied in `CurrencySwitcher::render()` for both the shortcode and the block. Return a string to use
your own markup instead of the default `<select>`; return anything else and the default renders.

It is **not** applied when fewer than two currencies are selectable — a store with one currency shows
no switcher at all, so a listener here never runs. This is the hook Pro's dropdown uses to replace the
select with its button and panel.

If you replace the markup, also set `style` to `button` in
[`currency_switcher/editor_preview`](#currency-switcher-editor-preview) so the block editor's preview
matches what the storefront renders.

**Parameters:**
- `$html` (string|null): `null` on the way in, or an earlier listener's markup.
- `$context` (array): Context data
    ```php
    $context = [
        'atts'       => [...],          // (array) Shortcode attributes, or the block's after its allowlist
        'currencies' => ['USD','EUR'],  // (string[]) Selectable currency codes
        'current'    => 'EUR',          // (string) The currency in effect
    ];
    ```

**Returns:** `string|null` — Your markup, or `null` to keep the default

**Source:** `app/Modules/MultiCurrency/Services/CurrencySwitcher.php:86`

**Usage:**
```php
add_filter('fluent_cart/currency_switcher/render', function ($html, $context) {
    $out = '<ul class="my-switcher">';
    foreach ($context['currencies'] as $code) {
        $class = $code === $context['current'] ? ' class="is-current"' : '';
        $out .= '<li' . $class . '>' . esc_html($code) . '</li>';
    }

    return $out . '</ul>';
}, 10, 2);
```
</details>

### <code> currency_switcher/editor_preview </code>
<details>
<summary><code>fluent_cart/currency_switcher/editor_preview</code> &mdash; Filter the switcher's preview in the block editor</summary>

**When it runs:**
Applied in `CurrencySwitcherBlockEditor::localizeData()` when the block editor loads, so the preview
shown to an editor matches what the storefront will render. Admin only — it has no effect on the
storefront.

A plugin that replaces the frontend markup through
[`currency_switcher/render`](#currency-switcher-render) should set `style` to `button` here, and may add
a `flag` URL to each currency. The block's sidebar options appear only for the `button` style, because
core's `select` ignores them.

**Parameters:**
- `$preview` (array): The preview descriptor
    ```php
    $preview = [
        'style'      => 'select', // (string) 'select' | 'button'
        'currencies' => [
            ['code' => 'USD', 'symbol' => '$', 'name' => 'US Dollar'],
        ],
    ];
    ```

**Returns:** `array` — The preview descriptor

**Source:** `app/Hooks/Handlers/BlockEditors/CurrencySwitcherBlockEditor.php:123`

**Usage:**
```php
add_filter('fluent_cart/currency_switcher/editor_preview', function ($preview) {
    $preview['style'] = 'button';
    foreach ($preview['currencies'] as &$currency) {
        $currency['flag'] = plugins_url('flags/' . strtolower($currency['code']) . '.svg', __FILE__);
    }

    return $preview;
});
```
</details>
