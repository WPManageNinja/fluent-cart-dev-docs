# Modules

Filters exposed by FluentCart's optional built-in modules: the **MCP server** (`app/Modules/MCP/`), which exposes store data and actions to AI agents through the WordPress Abilities API, and the **Advanced Variation** product type (`app/Services/AdvancedVariationService.php`, `app/Hooks/Handlers/AdvancedVariationHandler.php`), which lets a product combine multiple attribute groups into a large set of purchasable variants.

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
