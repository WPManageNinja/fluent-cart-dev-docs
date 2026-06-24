---
title: Modules Overview
description: FluentCart modules system architecture and development guide for extending functionality.
---

# FluentCart Modules System

FluentCart groups self-contained features into module directories under `app/Modules/`. A module is simply a plain PHP class (no shared base class or interface) that owns a feature area — its hooks, services, models, controllers, and assets. Modules are wired up explicitly during plugin boot rather than auto-discovered, which keeps the load path predictable.

## How Modules Actually Work

There is **no** `AbstractModule` base class and **no** `ModuleInterface` in FluentCart. A module is a normal class. The common convention is a single entry-point class that exposes either:

- a `register($app)` instance method (most modules), or
- a static `boot()` method (e.g. the MCP module).

That entry point is called once from `app/Hooks/actions.php` during boot. Inside it, the module attaches everything it needs via the FluentCart hook system (`add_action`/`add_filter` or `$app->addFilter()` / `$app->addAction()`), registers its REST routes, and wires its services.

### Real Registration Examples

These are the actual registrations from `app/Hooks/actions.php`:

```php
// Instance method, passed the application container
(new \FluentCart\App\Modules\StockManagement\StockManagement())->register(fluentCart());
(new \FluentCart\App\Modules\Tax\TaxModule())->register();
(new \FluentCart\App\Modules\Coupon\CouponHandler())->register();
(new \FluentCart\App\Modules\Turnstile\TurnstileInit())->register(\FluentCart\App\App::getInstance());
(new \FluentCart\App\Modules\IntegrationActions\GlobalIntegrationActionHandler())->register();

// Static boot method
\FluentCart\App\Modules\MCP\MCPInit::boot();
```

### A Module's `register()` Method

A module's `register()` method typically declares its settings fields, sets default values, then short-circuits when the module is disabled before attaching the heavier feature hooks. This is the real pattern from `app/Modules/StockManagement/StockManagement.php`:

```php
class StockManagement
{
    public function register($app)
    {
        // Declare the module's settings card on the Modules settings screen
        $app->addFilter('fluent_cart/module_setting/fields', function ($fields, $args) {
            $fields['stock_management'] = [
                'title'       => __('Stock Management', 'fluent-cart'),
                'description' => __('Manage stock of your products easier than ever!', 'fluent-cart'),
                'type'        => 'component',
                'component'   => 'ModuleSettings',
                'settings'    => [
                    'enable_advanced_inventory' => [
                        'label'   => __('Enable Advanced Inventory', 'fluent-cart'),
                        'default' => 'no',
                    ],
                ],
            ];
            return $fields;
        }, 10, 2);

        // Provide default values for the settings store
        $app->addFilter('fluent_cart/module_setting/default_values', function ($values, $args) {
            if (empty($values['stock_management']['active'])) {
                $values['stock_management']['active'] = 'no';
            }
            return $values;
        }, 10, 2);

        // Always-on hooks live before the active-check
        add_filter('fluent_cart/shop_query', [$this, 'filterShopQuery'], 10, 2);

        // Bail out before wiring feature behaviour when the module is off
        if (!\FluentCart\Api\ModuleSettings::isActive('stock_management')) {
            return;
        }

        // ...feature hooks for an active module...
    }
}
```

Key conventions visible above:

- **Settings live in the module** via the `fluent_cart/module_setting/fields` and `fluent_cart/module_setting/default_values` filters.
- **Enabled state** is read with `\FluentCart\Api\ModuleSettings::isActive('<module_key>')` — there is no `isEnabled()` interface method.
- **Hooks before the active-check** run regardless; feature hooks are attached only when the module is active.

## Module Catalog

The following modules live under `app/Modules/` in the **core** (free) plugin:

| Module | Directory | Purpose |
|--------|-----------|---------|
| Payment Methods | `app/Modules/PaymentMethods/` | Payment gateway integrations (Stripe, PayPal, Mollie, Square, Razorpay, …) and the `GatewayManager` |
| Shipping | `app/Modules/Shipping/` | Shipping zones, methods, classes, and rate calculation |
| Storage Drivers | `app/Modules/StorageDrivers/` | File storage / digital delivery (Local, Amazon S3) |
| Subscriptions | `app/Modules/Subscriptions/` | Recurring billing and subscription lifecycle |
| Tax | `app/Modules/Tax/` | Tax calculation, EU VAT, reverse charge (`TaxModule`, `TaxCalculator`) |
| Stock Management | `app/Modules/StockManagement/` | Inventory tracking and advanced inventory |
| Coupon | `app/Modules/Coupon/` | Discount coupon handling (`CouponHandler`) |
| Advanced Variation | `app/Services/AdvancedVariationService.php` + `app/Modules/...` helpers | Product attributes and multi-option variations (moved from Pro into core) — see [Advanced Variation](./advanced-variation) |
| Turnstile | `app/Modules/Turnstile/` | Cloudflare Turnstile bot protection (`TurnstileInit`) |
| Product Integration | `app/Modules/ProductIntegration/` | Product-level integration wiring |
| Integrations | `app/Modules/Integrations/` | Third-party services (FluentCRM, MailChimp, Webhooks) |
| Integration Actions | `app/Modules/IntegrationActions/` | Global integration action dispatch (`GlobalIntegrationActionHandler`) |
| Reporting | `app/Modules/ReportingModule/` | Sales and store reporting |
| Templating | `app/Modules/Templating/` | Page-builder/template integrations (e.g. Bricks via `BricksLoader`) |
| WooCommerce Migrator | `app/Modules/WooCommerceMigrator/` | Import data from WooCommerce (WP-CLI driven) |
| Data | `app/Modules/Data/` | Static/reference data helpers |
| MCP | `app/Modules/MCP/` | Model Context Protocol tools for AI assistants — see [MCP](./mcp) |

The following modules live in **FluentCart Pro** (`app/Modules/` of the pro plugin):

| Module | Purpose |
|--------|---------|
| Licensing | Software license management and validation — see [Licensing (Pro)](./licensing) |
| Order Bump | Promotional offers and order bumps — see [Order Bump (Pro)](./order-bump) |
| MCP (License tools) | Read-only license MCP tools, gated on the Licensing module — see [MCP](./mcp) |

> Ghost product selling is **not** a module — it is a hook-based pattern for adding non-catalog items to the cart. See [Ghost Product Selling](./ghost-product-selling).

## The Gateway Manager

Payment gateways are the one module family with a dedicated manager. The `GatewayManager` handles gateway registration and lookup:

```php
use FluentCart\App\Modules\PaymentMethods\Core\GatewayManager;

// Register a gateway
GatewayManager::getInstance()->register('your_gateway', new YourGateway());

// Get a specific gateway
$gateway = GatewayManager::getInstance()->get('stripe');

// Get all enabled gateways
$enabledGateways = GatewayManager::getInstance()->enabled();

// Check if a gateway exists
$exists = GatewayManager::has('stripe');
```

See [Payment Methods Module](./payment-methods) and [Custom Payment Gateway Integration](/payment-methods-integration/) for the full gateway contract.

## Building Your Own Module

To add a feature module to a custom add-on plugin:

1. **Create the entry-point class** with a `register($app)` (or static `boot()`) method:

   ```php
   <?php
   namespace YourPlugin\Modules\YourModule;

   class YourModule
   {
       public function register($app)
       {
           // Declare settings (optional)
           $app->addFilter('fluent_cart/module_setting/fields', [$this, 'addSettings'], 10, 2);

           // Attach feature hooks
           add_action('fluent_cart/order/created', [$this, 'handleOrderCreated']);
           add_filter('fluent_cart/order/total', [$this, 'modifyOrderTotal']);
       }
   }
   ```

2. **Wire it on boot** from your own plugin, after FluentCart has loaded:

   ```php
   add_action('fluentcart_loaded', function ($app) {
       (new \YourPlugin\Modules\YourModule\YourModule())->register($app);
   });
   ```

3. **Gate behaviour** behind your module's active flag where appropriate using `\FluentCart\Api\ModuleSettings::isActive('your_module_key')`.

4. **Register REST routes** in a dedicated routes file loaded by your module, following the route-meta-permission convention used across core (see [REST API](/api/)).

## Related Documentation

- [Database Models](/database/models) - Models used by modules
- [Developer Hooks](/hooks/) - Hooks for module development
- [REST API](/api/) - API endpoints for module integration
- [Frontend Development](/guides/frontend) - Frontend module integration
- [Integration Guide](/guides/integrations) - Third-party module integrations

## Next Steps

Continue with module development:

1. **[Advanced Variation](./advanced-variation)** - Product attributes and variations (core)
2. **[Ghost Product Selling](./ghost-product-selling)** - Sell ghost products using hooks
3. **[Payment Methods Module](./payment-methods)** - Payment gateway development
4. **[Shipping Module](./shipping)** - Shipping method development
5. **[Storage Drivers](./storage)** - File storage integration
6. **[MCP Module](./mcp)** - Model Context Protocol tools for AI assistants
7. **[Licensing Module (Pro)](./licensing)** - Software license management
8. **[Order Bump Module (Pro)](./order-bump)** - Promotional tools

## Previous/Next Navigation

- **Previous**: [REST API](/api/) - Programmatic access to FluentCart
- **Next**: [Developer Guides](/guides/) - Advanced development topics

---
