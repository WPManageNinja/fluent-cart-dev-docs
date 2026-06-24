---
title: MCP Module
description: FluentCart's Model Context Protocol (MCP) module — read/write tools, ability registration, permission gating, and write-confirmation safety for AI assistants.
---

# MCP Module

The MCP module exposes FluentCart store operations to AI assistants through the [Model Context Protocol](https://modelcontextprotocol.io/). It registers a set of **abilities** (tools) via the WordPress Abilities API and serves them over an MCP server endpoint. The module ships in both the **core (free)** plugin and **FluentCart Pro**.

The whole surface is gated behind the `mcp_enabled` option (default **off**), and is only active when the supporting systems are present (WordPress 6.9+ with the WP Abilities API, and an MCP adapter provided by FluentHub or the standalone `mcp-adapter` plugin).

## Architecture

| Component | Class | Responsibility |
|-----------|-------|----------------|
| Bootstrap | `FluentCart\App\Modules\MCP\MCPInit` | Boots the module, registers the ability category, abilities, and the custom MCP server |
| Ability registrar | `FluentCart\App\Modules\MCP\AbilitiesRegistrar` | Merges each tool class's `definitions()` slice and registers every ability with `wp_register_ability()` |
| Tools | `FluentCart\App\Modules\MCP\Tools\*` | One class per domain; each owns its tool schema and execute callbacks |
| Permission gate | `FluentCart\App\Modules\MCP\Support\PermissionGate` | Capability checks, read/write role caps, transport gating, enabled flag |
| Write guard | `FluentCart\App\Modules\MCP\Support\WriteGuard` | Preview/confirm flow and idempotency for write tools |
| Helper | `FluentCart\App\Modules\MCP\Support\MCPHelper` | Shared helpers for tools |

The server ID and category are both `fluent-cart` (`MCPInit::SERVER_ID`). The module is booted from `app/Hooks/actions.php` via the static entry point:

```php
\FluentCart\App\Modules\MCP\MCPInit::boot();
```

### Registration flow

1. `MCPInit::boot()` registers module settings and hooks into `wp_abilities_api_categories_init` and `mcp_adapter_init`.
2. `MCPInit::registerCategory()` registers the `fluent-cart` ability category via `wp_register_ability_category()`.
3. `AbilitiesRegistrar::register()` merges the `definitions()` slice from each tool class and calls `wp_register_ability()` for each ability (all placed in the `fluent-cart` category).
4. `MCPInit::registerCustomServer()` exposes the abilities over the MCP server route.

### Tool definitions

Each tool class owns a static `definitions()` method that returns its abilities keyed by ability name (schema lives next to the code). For example, `ContextTools::definitions()` returns:

```php
public static function definitions()
{
    return [
        'fluent-cart/get-store-context' => [
            'label'       => __('Get Store Context', 'fluent-cart'),
            // ...input schema + execute callback...
        ],
    ];
}
```

`AbilitiesRegistrar` collects these and registers each one. Unhandled exceptions in an execute callback are wrapped so they surface as clean tool errors.

## Core Tools

The core plugin registers these tool classes under `app/Modules/MCP/Tools/`, exposing the following abilities:

| Tool class | Abilities |
|------------|-----------|
| `ContextTools` | `get-store-context`, `list-reference-data` |
| `OrderTools` | `list-orders`, `get-order`, `get-order-activity`, `add-order-note`, `change-order-status`, `refund-order` |
| `ProductTools` | `list-products`, `get-product`, `get-inventory` |
| `CustomerTools` | `list-customers`, `get-customer`, `upsert-customer` |
| `SubscriptionTools` | `list-subscriptions`, `get-subscription`, `change-subscription-status` |
| `CouponTools` | `list-coupons`, `manage-coupon` |
| `ReportTools` | `get-sales-report`, `get-sales-trend`, `get-refund-report`, `get-top-products`, `query-orders`, `query-products`, `query-customers`, `query-sources` |
| `LabelTools` | `apply-labels` |

> Ability names are namespaced, e.g. `fluent-cart/list-orders`. The cross-entity analytical `query-*` abilities (`query-orders`, `query-products`, `query-customers`, `query-sources`) are all owned by `ReportTools`.

Tools are split into **read** tools (list/get/query/report) and **write** tools (create/update/status-change/refund). Write tools run through `WriteGuard` and require the appropriate write capabilities.

## Pro Tools

FluentCart Pro adds its own MCP tools under `app/Modules/MCP/` of the pro plugin. They are **read-only** and **gated on the Licensing module** — `MCPInit` only wires them when the Licensing module is active, so a site without Licensing pays no cost.

| Tool class | Abilities |
|------------|-----------|
| `FluentCartPro\App\Modules\MCP\Tools\LicenseTools` | `fluent-cart/list-licenses`, `fluent-cart/get-license` |

Pro also includes:

- `ToolkitInstaller` — handles auto-installing the MCP adapter toolkit when it can (`canAutoInstall()` / `autoInstall()`).
- `AbilitiesRegistrar` / `MCPInit` — the pro-side registrar simply registers whatever tools are wired; gating happens upstream per Pro module.

License keys are masked in tool output.

## Permissions

`PermissionGate` controls access:

- `PermissionGate::isEnabled()` / `setEnabled($enabled)` — read/toggle the `mcp_enabled` flag.
- `PermissionGate::can($permission)` / `canAny(array $permissions)` — capability checks for a tool.
- `PermissionGate::readRoleCaps()` / `writeRoleCaps()` — the capability sets distinguishing read vs write tools.
- `PermissionGate::transport($request)` — used as the MCP server's permission callback to gate the transport.

## Write Safety

Mutating tools use `WriteGuard` to make changes deliberate and safe:

- `WriteGuard::preview($tool, $entityKey, $fingerprint, array $preview)` — return a preview of the intended change plus a confirmation token.
- `WriteGuard::confirm($tool, $entityKey, $currentFingerprint, $token)` — validate the token and that the entity has not changed since preview (fingerprint match).
- `WriteGuard::idempotent($tool, $entityKey, $key, callable $fn)` — run a write once per idempotency key.

## Extensibility Hooks

`MCPInit` exposes filters/actions for extending the surface:

- `do_action('fluent_cart/mcp_loaded')` — fires after the module boots.
- `apply_filters('fluent_cart/mcp_ability_names', $abilityNames)` — adjust the list of registered ability names.
- `apply_filters('fluent_cart/mcp_server_namespace', 'fluent-cart')` — the server REST namespace.
- `apply_filters('fluent_cart/mcp_server_route', 'mcp')` — the server route (endpoint at `/wp-json/fluent-cart/mcp`).

## Related Documentation

- [Modules Overview](./) - Module system overview
- [Developer Hooks](/hooks/) - Complete hooks and filters reference
- [Licensing Module (Pro)](./licensing) - Required for the Pro license MCP tools
- [REST API](/api/) - The standard FluentCart REST surface

---

**Next Steps:** Return to the [Modules Overview](./) or explore the [REST API](/api/).
