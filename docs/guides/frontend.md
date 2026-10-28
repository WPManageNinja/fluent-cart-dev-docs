---
title: Frontend Development Guide
description: Complete guide for FluentCart frontend development, Vue.js integration, and template customization.
---

# Frontend Development Guide

This guide covers frontend development for FluentCart, including Vue.js integration, template customization, and asset management.

## Template System

### Template Hierarchy

The storefront is not rendered from a `Views/` template tree. FluentCart builds its
markup in PHP renderer classes under `app/Services/Renderer/`:

```
app/Services/Renderer/
├── ProductRenderer.php          # single product
├── ProductCardRender.php        # product cards in listings
├── CartItemRenderer.php         # cart line items
├── CartSummaryRender.php        # cart totals
├── CheckoutRenderer.php         # checkout form
├── PricingTableRenderer.php     # variant pricing tables
├── TaxRenderer.php              # tax line display
├── AdvancedVariationRenderer.php
├── RenderHelper.php             # shared helpers
├── RenderContext.php            # decorates hook payloads with source / source_name
└── Receipt/
    ├── ReceiptRenderer.php
    ├── ThankYouRender.php
    └── StoreBusinessInfoHelper.php
```

`app/Views/` does exist, but it holds admin, email, invoice and print templates — not the
storefront.

The matching browser assets live under `resources/public/`, one directory per surface
(`cart`, `checkout`, `product-card`, `single-product`, `product-page`, `receipt`,
`customer-profile`, `payment-methods`, `search-bar-app`, and others).

### Custom Templates

Theme overrides go through the template loader rather than through a copied view tree.
`TemplateLoader::templatePath()` returns the directory the loader looks for inside the
active theme, filterable:

```php
// Default: 'fluent-cart/'
add_filter('fluent_cart/template_path', function ($path) {
    return 'my-theme-cart/';
});
```

Two further filters control the lookup:

```php
// Add or reorder candidate template files
add_filter('fluent_cart/template_loader_files', function ($templates, $context) {
    return $templates;
}, 10, 2);

// Tell FluentCart whether the block theme already provides a template
add_filter('fluent_cart/has_block_template', function ($hasTemplate, $context) {
    return $hasTemplate;
}, 10, 2);
```

### Template Loading

`TemplateLoader` is an all-static class in `FluentCart\App\Modules\Templating`. There is
no `FluentCart\App\FC\Template\DefaultTemplate\TemplateLoader`, and it is not
instantiated with the app container:

```php
use FluentCart\App\Modules\Templating\TemplateLoader;

// Called by the plugin during boot
TemplateLoader::init();

// Resolve the template WordPress should use for the current query
$template = TemplateLoader::loadTemplate($template);

// Where the loader looks inside the theme
$dir = TemplateLoader::templatePath();      // 'fluent-cart/'

// Whether the active theme declares support
$supported = TemplateLoader::hasThemeSupport();
```

### Template Hooks

Storefront hooks are namespaced with a slash and fire from the renderer classes:

```php
// Single product: around the price block
add_action('fluent_cart/product/single/after_price_block', function ($data) {
    echo '<div class="custom-product-info">Custom content here</div>';
}, 20);

// Other anchors on the same page
// fluent_cart/product/single/after_title_block
// fluent_cart/product/single/after_excerpt_block
// fluent_cart/product/single/after_quantity_block
// fluent_cart/product/single/after_actions_block

// Checkout: before the form opens
add_action('fluent_cart/checkout_form_opening', function ($data) {
    echo '<div class="checkout-notice">Important notice</div>';
});

// Cart line items
add_action('fluent_cart/cart/line_item/after_main_title', function ($data) {
    echo '<div class="cart-recommendations">Recommended products</div>';
});
```

Payloads are wrapped by `RenderContext::decorate()`, so every one of these carries
`source` and `source_name` alongside the entry's own keys. The full set is in the
[action](/hooks/actions) and [filter](/hooks/filters) references.

## Vue.js Integration

### Admin Interface

FluentCart uses Vue.js 3 with Element Plus for the admin interface. The admin components are located in `resources/admin/`:

```
resources/admin/
├── Application.vue
├── Bits/Components/     # 337 Vue components
├── Modules/            # Feature-specific components
│   ├── Products/       # 43 components
│   ├── Orders/         # 34 components
│   ├── Customers/      # 19 components
│   └── Reports/        # 73 components
├── Pages/              # Page components
└── utils/              # Utilities and mixins
```

### Frontend Vue Components

Only the customer profile is built with Vue. Every other storefront surface is plain
JavaScript:

```
resources/public/
├── customer-profile/   # 48 .vue files — the only Vue app on the storefront
├── cart/               # plain JS
├── checkout/           # plain JS
├── product-card/       # plain JS
├── pricing-table/      # plain JS
├── single-product/     # plain JS
└── search-bar-app/     # plain JS
```

The admin is the Vue-heavy side, with roughly 840 `.vue` files under
`resources/admin/`.

### Component Example

```vue
<template>
  <div class="fluent-cart-component">
    <el-button @click="handleClick" type="primary">
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElButton } from 'element-plus'

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Click Me'
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>
```

### React Integration

FluentCart also includes React components for Gutenberg blocks:

```
resources/admin/BlockEditor/
├── Buttons/            # Add to Cart, Direct Checkout
├── Checkout/           # Checkout block
├── CustomerProfile/    # Customer profile block
├── PricingTable/       # Pricing table block
├── ProductCard/        # Product card block
└── SearchBar/          # Search bar block
```

### State Management

For complex applications, consider using Pinia for state management:

```javascript
import { createPinia } from 'pinia'
import { defineStore } from 'pinia'

// Cart store
export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        total: 0,
        loading: false
    }),
    
    actions: {
        async addToCart(productId, quantity = 1) {
            this.loading = true
            try {
                // The AJAX endpoint the bundled cart uses — prefer
                // window.fluentCartCart over calling it directly.
                const response = await fetch(window.fluentCartRestVars.ajaxurl
                    + '?action=fluent_cart_checkout_routes'
                    + '&fc_checkout_action=fluent_cart_cart_update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.fluentCartRestVars.nonce
                    },
                    body: JSON.stringify({
                        action: 'add_to_cart',
                        product_id: productId,
                        quantity: quantity
                    })
                })
                
                const data = await response.json()
                this.items = data.items
                this.total = data.total
            } catch (error) {
                console.error('Error adding to cart:', error)
            } finally {
                this.loading = false
            }
        }
    }
})

// Initialize Pinia
const pinia = createPinia()
app.use(pinia)
```

### Event Handling

FluentCart dispatches `CustomEvent`s on `window`, and exposes its storefront objects as
individually named globals:

| Global | What it is |
|---|---|
| `window.fluentCartCart` | the cart instance (add, update, remove) |
| `window.fluentCartRestVars` | `ajaxurl`, nonce and REST config |
| `window.fluentCartCheckout` | checkout controller |
| `window.fluentCartCheckoutParams` | checkout configuration |
| `window.fluentCartSingleProduct` | single-product controller |
| `window.fluentCartShopApps` | mounted storefront apps |

Events you can listen for include:

```js
// Payment method lifecycle
window.addEventListener('fluent_cart_payment_method_loading', (e) => {});
window.addEventListener('fluent_cart_payment_method_loading_success', (e) => {});
window.addEventListener('fluent_cart_payment_method_loading_failed', (e) => {});

// Per-gateway load hook: fluent_cart_load_payments_{slug}
window.addEventListener('fluent_cart_load_payments_stripe', (e) => {
    // e.detail carries orderHandler, isZeroPayment, hasSubscriptions and more
});

// Nonce refresh
window.addEventListener('fcart_renew_rest_nonce', (e) => {});
```

Reviews add their own `fct-review-*` events (`fct-review-form-mounted`,
`fct-review-form-before-submit`, `fct-review-submitted`, `fct-review-form-saved`).

#### Updating the cart

Cart changes go through the WordPress AJAX handler, not a REST route:

```js
// What window.fluentCartCart does internally
const url = window.fluentCartRestVars.ajaxurl
    + '?action=fluent_cart_checkout_routes&fc_checkout_action=fluent_cart_cart_update';
```

Prefer the `window.fluentCartCart` instance over calling that URL yourself.

## Asset Management

### Vite Configuration

FluentCart uses Vite for asset bundling and development:

```javascript
// vite.config.mjs
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    build: {
        rollupOptions: {
            input: {
                // Real entries, as listed in vite.config.mjs
                'admin': 'resources/admin/bootstrap/app.js',
                'tailwind': 'resources/styles/tailwind/style.css',
                'shop-app': 'resources/admin/BlockEditor/ShopApp/ShopAppBlockEditor.jsx'
            }
        }
    }
})
```

### SCSS Compilation

Organize styles with SCSS:

```scss
// resources/styles/…
@import 'variables';
@import 'mixins';

.fluent-cart-checkout {
    &__form {
        @include form-styles;
        
        &-group {
            margin-bottom: 1rem;
        }
    }
    
    &__payment-methods {
        @include payment-methods-styles;
    }
}

// Variables
$primary-color: #007cba;
$border-radius: 4px;
$spacing: 1rem;

// Mixins
@mixin form-styles {
    .form-control {
        border: 1px solid #ddd;
        border-radius: $border-radius;
        padding: 0.5rem;
        
        &:focus {
            border-color: $primary-color;
            outline: none;
        }
    }
}
```

### JavaScript Bundling

Structure JavaScript files for optimal loading:

```javascript
// resources/public/checkout/…
import { createApp } from 'vue'
import CheckoutComponent from './components/Checkout.vue'
import '../scss/checkout.scss'

// Initialize checkout app
const checkoutApp = createApp(CheckoutComponent)
checkoutApp.mount('#checkout-app')

// Lazy load additional components
const loadPaymentMethods = () => {
    return import('./components/PaymentMethods.vue')
}

// Load payment methods when needed
document.addEventListener('DOMContentLoaded', () => {
    const paymentSection = document.querySelector('#payment-methods')
    if (paymentSection) {
        loadPaymentMethods().then(module => {
            checkoutApp.component('PaymentMethods', module.default)
        })
    }
})
```

## Responsive Design

### Mobile-First Approach

Design for mobile devices first:

```scss
// Mobile-first responsive design
.fluent-cart-product {
    display: block;
    margin-bottom: 1rem;
    
    // Tablet and up
    @media (min-width: 768px) {
        display: flex;
        gap: 1rem;
    }
    
    // Desktop and up
    @media (min-width: 1024px) {
        gap: 2rem;
    }
}

.fluent-cart-checkout {
    &__form {
        // Mobile: single column
        display: block;
        
        // Tablet: two columns
        @media (min-width: 768px) {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
    }
}
```

### Touch-Friendly Interface

Ensure touch-friendly interactions:

```scss
.fluent-cart-button {
    min-height: 44px; // Minimum touch target
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    
    &:active {
        transform: scale(0.98); // Touch feedback
    }
}

.fluent-cart-input {
    min-height: 44px;
    padding: 0.75rem;
    font-size: 16px; // Prevent zoom on iOS
    
    @media (max-width: 767px) {
        font-size: 16px; // Ensure no zoom
    }
}
```

## Performance Optimization

### Lazy Loading

Implement lazy loading for images and components:

```javascript
// Lazy load product images
const lazyImages = document.querySelectorAll('img[data-src]')

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
        }
    })
})

lazyImages.forEach(img => imageObserver.observe(img))
```

### Code Splitting

Split code for better performance:

```javascript
// Dynamic imports for route-based code splitting
const routes = [
    {
        path: '/checkout',
        component: () => import('./views/Checkout.vue')
    },
    {
        path: '/cart',
        component: () => import('./views/Cart.vue')
    }
]
```

### Caching Strategies

Implement proper caching:

```javascript
// Service worker for caching
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/wp-json/fluent-cart/')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                    return caches.open('fluent-cart-v1').then(cache => {
                        cache.put(event.request, fetchResponse.clone())
                        return fetchResponse
                    })
                })
            })
        )
    }
})
```

---

**Related Documentation:**
- [Template System](../modules/) - Module development
- [REST API](../api/) - API integration
- [Developer Hooks](../hooks/) - Customization hooks
