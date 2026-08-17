# Modules

Hooks fired by FluentCart's optional built-in modules: the **MCP server** (`app/Modules/MCP/`), which exposes store data and actions to AI agents through the WordPress Abilities API, and the **Advanced Variation** product type (`app/Services/AdvancedVariationService.php`, `app/Hooks/Handlers/AdvancedVariationHandler.php`), which lets a product combine multiple attribute groups into a large set of purchasable variants.

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
