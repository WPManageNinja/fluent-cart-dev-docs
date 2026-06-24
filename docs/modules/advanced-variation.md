---
title: Advanced Variation
description: Developer guide to FluentCart's Advanced Variation system — product attributes, multi-option variations, and the services, controllers, models, and events that power them.
---

# Advanced Variation

Advanced Variation lets a product carry multiple option groups (for example Color and Size) whose combinations generate concrete purchasable variations. The feature was previously part of FluentCart Pro and now ships in the **core (free) plugin** — Pro no longer contains any attribute or variation backend code.

## Overview

The system has two layers:

- **Attribute library** — reusable option groups (e.g. "Color") and their terms (e.g. "Red", "Blue"), shared across products.
- **Product variations** — the concrete rows generated from the attribute combinations selected for a given product, each with its own price, SKU, stock, and media.

These map onto the `fct_atts_*` tables (the attribute library) and `fct_product_variations` (the per-product variation rows). The table layouts are documented in [Database Schema](/database/schema) — see the `fct_atts_groups`, `fct_atts_terms`, and `fct_atts_relations` sections. This page focuses on the backend code that drives them.

## Models

| Model | Table | Purpose |
|-------|-------|---------|
| `AttributeGroup` | `fct_atts_groups` | An option group (Color, Size, Material, …) |
| `AttributeTerm` | `fct_atts_terms` | A term belonging to a group (Red, Large, …) |
| `AttributeRelation` | `fct_atts_relations` | Links a term to an object (e.g. a product/variation) |
| `ProductVariation` | `fct_product_variations` | A concrete purchasable variation row |

Full attribute/casts/relationship details for each model live under [Database Models](/database/models/).

## Core Service

### `AdvancedVariationService`

`FluentCart\App\Services\AdvancedVariationService` is the central service for building and maintaining a product's variations. Its methods are **static**.

Key public entry points:

```php
use FluentCart\App\Services\AdvancedVariationService;

// Sync a product's option groups/terms and (re)generate its variation
// combinations from the submitted options payload.
$result = AdvancedVariationService::syncVariantOption($productId, $data);

// Hydrate a product payload with the attribute term data referenced by
// its variants (resolves term_id references into full attribute maps).
$product = AdvancedVariationService::hydrateProductData($product);
```

`syncVariantOption()` reads the product's pricing source (`ProductDetail`), reconciles the option groups/terms against the submitted `options` payload, regenerates the variant combinations, and persists the result. When the combinations change it dispatches the [`ProductVariationsChanged`](#event-productvariationschanged) event so downstream listeners (such as the default-variation updater and bundle refreshers) can react.

## Event: `ProductVariationsChanged`

`FluentCart\App\Events\ProductVariationsChanged` fires whenever a product's variation set changes.

```php
namespace FluentCart\App\Events;

class ProductVariationsChanged extends EventDispatcher
{
    public string $hook = 'fluent_cart/product_variations_changed';

    protected array $listeners = [
        UpdateDefaultVariation::class,
    ];

    public $postIds;

    public function __construct($postIds) { /* ... */ }

    public function toArray(): array
    {
        return ['post_ids' => $this->postIds];
    }
}
```

- **Action hook:** `fluent_cart/product_variations_changed`
- **Payload:** `['post_ids' => [...]]` — the affected product IDs
- **Built-in listener:** `FluentCart\App\Listeners\UpdateDefaultVariation`

It is dispatched from `AdvancedVariationService` when combinations are regenerated:

```php
(new ProductVariationsChanged([$productId]))->dispatch();
```

### Listener: `UpdateDefaultVariation`

`FluentCart\App\Listeners\UpdateDefaultVariation` recalculates and stores the product's default variation after the variation set changes. It exposes a static `handle($event)` entry point and is registered on the event's `$listeners` array, so it runs automatically — no manual `add_action` is required.

To react to variation changes from your own code, hook the action directly:

```php
add_action('fluent_cart/product_variations_changed', function ($data) {
    $productIds = $data['post_ids'];
    // ...your logic (e.g. clear a cache, refresh a bundle map)...
}, 10, 1);
```

## REST Controllers & Routes

### Attribute library — `AttributesController`

`FluentCart\App\Http\Controllers\AttributesController` manages the reusable attribute groups and terms. Routes are registered under the `options` prefix with the `ProductPolicy` policy (see `app/Http/Routes/api.php`).

| Method (HTTP) | Route | Controller method | Permission |
|---------------|-------|-------------------|------------|
| GET | `options/attr/groups/library` | `getLibrary` | `products/view` |
| GET | `options/attr/groups` | `getGroups` | `products/view` |
| POST | `options/attr/groups/reorder` | `reorderGroups` | `products/edit` |
| POST | `options/attr/group/` | `createGroup` | `products/create` |
| GET | `options/attr/group/{group_id}` | `getGroup` | `products/view` |
| PUT | `options/attr/group/{group_id}` | `updateGroup` | `products/edit` |
| DELETE | `options/attr/group/{group_id}` | `deleteGroup` | `products/delete` |
| GET | `options/attr/group/{group_id}/terms` | `getTerms` | `products/view` |
| POST | `options/attr/group/{group_id}/terms` | `createTerms` | `products/create` |
| POST | `options/attr/group/{group_id}/term/{term_id}` | `updateTerm` | `products/edit` |
| DELETE | `options/attr/group/{group_id}/term/{term_id}` | `deleteTerm` | `products/delete` |
| POST | `options/attr/group/{group_id}/terms/reorder` | `reorderTerms` | `products/edit` |

The `getLibrary` endpoint returns a single payload powering the Advanced Variation library picker (the full group list with terms plus the frequently-used IDs for chips).

### Product variations — `ProductVariationController`

`FluentCart\App\Http\Controllers\ProductVariationController` manages the concrete variation rows for a product.

| Method (HTTP) | Route | Controller method |
|---------------|-------|-------------------|
| GET | `.../variants` | `index` |
| POST | `.../variants` | `create` |
| POST | `.../variants/bulk-update` | `bulkUpdate` |
| POST | `.../variants/group-bulk-update` | `groupBulkUpdate` |
| POST | `.../variants/{variantId}` | `update` |
| POST | `.../variants/{variantId}/tax-exempt` | `updateTaxSettings` |
| DELETE | `.../variants/{variantId}` | `delete` |
| POST | `.../variants/{variantId}/setMedia` | `setMedia` |
| PUT | `.../variants/{variantId}/pricing-table` | `updatePricingTable` |

The `bulkUpdate` and `groupBulkUpdate` endpoints back the grouped variant editor and group bulk-edit drawer in the admin. Variation create/update requests are validated by `ProductVariationRequest`.

## Storefront Rendering

`FluentCart\App\Services\Renderer\AdvancedVariationRenderer` renders the variation selector on single-product and product-card surfaces, and `FluentCart\App\Hooks\Handlers\AdvancedVariationHandler` wires the storefront behaviour. The storefront selector JS/CSS now ships from core; Pro no longer enqueues any advanced-variation assets.

## Related Documentation

- [Database Schema](/database/schema) - `fct_atts_*` and `fct_product_variations` table definitions
- [Database Models](/database/models/) - AttributeGroup, AttributeTerm, AttributeRelation, ProductVariation models
- [Developer Hooks](/hooks/) - Complete hooks and filters reference
- [REST API](/api/) - API endpoints for product and variation management

---

**Next Steps:** Continue with the [Modules Overview](./) or explore [Ghost Product Selling](./ghost-product-selling).
