---
title: Admin Screens
description: Add your plugin's own screens to the FluentCart admin with core's Vue, Element Plus and layout components.
---

# Admin Screens

Your plugin can add screens to the FluentCart admin. They load inside FluentCart's own admin app, so they get:

- **The same Vue, router and Element Plus.** Your screens use `<el-button>`, `<el-input>` and the router as FluentCart's screens do.
- **The layout components.** `Page`, `Section`, `SettingRow`, `List` and the others make your screen look like a FluentCart screen. See [Layout Components](./components).
- **Helpers.** `translate`, `Rest`, `Notify`, `UserCan` and more.
- **Charts.** The same ECharts that FluentCart's reports use, with its colors and tooltip helpers. See [Charts](./charts).

Your plugin ships only its own screens. It never ships Vue or Element Plus.

::: info Requirements
FluentCart **X.Y.Z** or later, which sets `FLUENTCART_MODULE_API` to **5**. Check that number before you load any screen that imports the layout components (step 1). Pro is not needed.
:::

## How it fits together

| Step | FluentCart does | Your plugin does |
| ---- | ---------------- | ---------------- |
| Page load | Prints an import map for `@fluent-cart/vue`, `@fluent-cart/ui`, `@fluent-cart/dayjs` and `@fluent-cart/echarts`, then fires `fluent_cart/loading_app` | Enqueues its built entry file as `type="module"` |
| App start | Applies the `fluent_cart_routes` JS filter | Adds its routes |
| Menu | Applies `fluent_cart/global_admin_menu_items` | Adds a menu item with a permission |
| Strings | Applies `fluent_cart/admin_translations` | Merges its translated strings |
| Navigation | Renders the route's component inside the admin | Renders its screen from `@fluent-cart/ui` components |

## Build a screen

This example adds a **Gift Wrap** screen with one setting and a list. It uses four files.

```
gift-wrap-for-fluent-cart/
├── gift-wrap-for-fluent-cart.php
├── vite.admin-modules.config.mjs
└── resources/admin-modules/gift-wrap/
    ├── entry.js
    └── GiftWrap.vue
```

### 1. The plugin file

```php
<?php
/**
 * Plugin Name: Gift Wrap for FluentCart
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Requires Plugins: fluent-cart
 * Text Domain: gift-wrap-for-fluent-cart
 */

defined('ABSPATH') || exit;

define('GIFT_WRAP_VERSION', '1.0.0');

add_action('plugins_loaded', function () {
    // FluentCart before API 5 lacks the layout components: register nothing and say why.
    if (!defined('FLUENTCART_MODULE_API') || FLUENTCART_MODULE_API < 5) {
        add_action('admin_notices', function () {
            if (current_user_can('update_plugins')) {
                echo '<div class="notice notice-warning"><p>' . esc_html__('Gift Wrap needs a newer FluentCart.', 'gift-wrap-for-fluent-cart') . '</p></div>';
            }
        });
        return;
    }

    add_action('fluent_cart/loading_app', function () {
        $url = plugin_dir_url(__FILE__) . 'assets/admin-modules/';
        wp_enqueue_style('gift_wrap_admin', $url . 'gift-wrap.css', [], GIFT_WRAP_VERSION);
        wp_enqueue_script('gift_wrap_admin', $url . 'gift-wrap.js', [], GIFT_WRAP_VERSION, true);
        wp_localize_script('gift_wrap_admin', 'giftWrapAdmin', [
            'restUrl' => rest_url('gift-wrap/v1'),
        ]);
    });

    add_filter('script_loader_tag', function ($tag, $handle) {
        return $handle === 'gift_wrap_admin' ? str_replace('<script ', '<script type="module" ', $tag) : $tag;
    }, 10, 2);

    add_filter('fluent_cart/global_admin_menu_items', function ($items, $args) {
        $items['gift_wrap'] = [
            'label'      => __('Gift Wrap', 'gift-wrap-for-fluent-cart'),
            'link'       => $args['base_url'] . 'gift-wrap',
            'permission' => ['store/settings'],
        ];
        return $items;
    }, 10, 2);
});
```

- **The API check** matters: a screen that imports a name FluentCart does not have fails to load as a whole. API 5 means the layout components exist.
- **`type="module"`** lets the browser resolve `@fluent-cart/*` through the import map. Add it only to your own handle.
- **The permission** must be an existing FluentCart permission. Use the same one on the menu item, the route and your REST routes. You cannot add new permissions.
- **Your REST routes** live in your own namespace. `Rest` from `@fluent-cart/ui` calls them when you pass their base URL (step 4).

### When FluentCart is too old

A store can update your add-on before FluentCart. Never load your screens there: one missing import stops the whole bundle. Tell the admin what to do instead.

- **Your add-on needs API 5:** an older FluentCart has no shared card. Show an admin notice, as the plugin file above does.
- **Your add-on needs a later API:** FluentCart 5 and later has `CoreUpdateCard`. Keep your menu item, and on a too-old FluentCart load a small fallback bundle instead of your screens. The fallback registers the same routes and shows the card:

```vue
<!-- resources/admin-modules/fallback/UpdateScreen.vue -->
<script setup>
import {CoreUpdateCard, Page, translate} from '@fluent-cart/ui';
</script>

<template>
  <Page :title="translate('Gift Wrap')">
    <CoreUpdateCard
        :title="translate('Update FluentCart to manage gift wraps')"
        :text="translate('This version of Gift Wrap needs a newer FluentCart.')"
    />
  </Page>
</template>
```

```js
// resources/admin-modules/fallback/entry.js: the same route, a different screen.
import {translate} from '@fluent-cart/ui';
import UpdateScreen from './UpdateScreen.vue';

window.fluent_cart_admin.hooks.addFilter('fluent_cart_routes', 'gift_wrap', (routes) => {
    routes.gift_wrap = {
        name: 'gift_wrap',
        path: '/gift-wrap',
        component: UpdateScreen,
        meta: {active_menu: 'gift_wrap', title: translate('Gift Wrap'), permission: 'store/settings'},
    };
    return routes;
});
```

```php
// In the plugin file: enqueue one bundle or the other.
$bundle = FLUENTCART_MODULE_API >= 6 ? 'gift-wrap' : 'fallback';
wp_enqueue_script('gift_wrap_admin', $url . $bundle . '.js', [], GIFT_WRAP_VERSION, true);
```

Register every route your add-on has, so no link leads to an empty page. Build the fallback as its own entry, and import only what the oldest FluentCart you support exports. If a FluentCart before API 5 must see a card too, copy the card into your add-on and build it from the names FluentCart 2.2.0 exports. FluentCart Pro does this for licensing.

### 2. The build config

Build with Vite. Every `@fluent-cart/*` import must stay external, so the browser loads core's copy.

```js
// vite.admin-modules.config.mjs
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

const CORE_MODULES = {
    'vue': '@fluent-cart/vue',
    'dayjs': '@fluent-cart/dayjs',
    'echarts': '@fluent-cart/echarts',
    '@fluent-cart/ui': '@fluent-cart/ui',
};

export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'assets/admin-modules',
        emptyOutDir: true,
        rollupOptions: {
            input: {'gift-wrap': 'resources/admin-modules/gift-wrap/entry.js'},
            external: Object.keys(CORE_MODULES),
            output: {
                format: 'es',
                paths: CORE_MODULES,
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name].js',
                assetFileNames: '[name][extname]',
            },
        },
    },
});
```

::: danger Never bundle Vue or Element Plus
A second copy of Vue cannot see FluentCart's app. Every `<el-*>` component and every router link in your screen stops working. Do not alias `vue` and do not import `element-plus`; FluentCart registers both on its app.
:::

Install `vite`, `@vitejs/plugin-vue` and `vue` as dev dependencies, on the same major versions as FluentCart. `vue` is needed to compile your `.vue` files; it never ends up in the bundle.

#### How the imports resolve

In your source code, import Vue and ECharts by their usual names. The build config rewrites them to FluentCart's names, and FluentCart's import map points those names at its own files.

| Your code writes | The built file imports | The browser loads |
| ---------------- | ---------------------- | ----------------- |
| `import {ref} from 'vue'` | `from "@fluent-cart/vue"` | FluentCart's Vue |
| `import {init} from 'echarts'` | `from "@fluent-cart/echarts"` | FluentCart's ECharts |
| `import dayjs from 'dayjs'` | `from "@fluent-cart/dayjs"` | FluentCart's Day.js |
| `import {Page} from '@fluent-cart/ui'` | `from "@fluent-cart/ui"` | FluentCart's components and helpers |

- **Why `'vue'` and not `'@fluent-cart/vue'`:** the Vue compiler writes `import … from 'vue'` into every compiled `.vue` template. The build config must map `'vue'` anyway, and your editor gets types and completion for `'vue'` from the dev dependency. `@fluent-cart/vue` exists only in the browser.
- **Check your build:** search the files in `assets/admin-modules/` for `from"`. You should see only `@fluent-cart/…` names and your own chunks. If Vue's code is in your bundle, `CORE_MODULES` is missing from the config.

### 3. The entry file

```js
// resources/admin-modules/gift-wrap/entry.js
import {translate} from '@fluent-cart/ui';

window.fluent_cart_admin.hooks.addFilter('fluent_cart_routes', 'gift_wrap', (routes) => {
    routes.gift_wrap = {
        name: 'gift_wrap',
        path: '/gift-wrap',
        component: () => import('./GiftWrap.vue'),
        meta: {active_menu: 'gift_wrap', title: translate('Gift Wrap'), permission: 'store/settings'},
    };
    return routes;
});
```

The entry file only registers. It has no exports, so the browser loads it once.

### 4. The screen

```vue
<!-- resources/admin-modules/gift-wrap/GiftWrap.vue -->
<script setup>
import {ref, onMounted} from 'vue';
import {Page, Section, SettingRow, List, ListItem, EmptyState, Rest, Notify, translate} from '@fluent-cart/ui';

const API = window.giftWrapAdmin.restUrl;
const settings = ref({enabled: 'no', fee: 0});
const papers = ref([]);
const saving = ref(false);

onMounted(() => {
    Rest.get('settings', {}, API).then((response) => {
        settings.value = response.settings;
        papers.value = response.papers;
    });
});

const save = () => {
    saving.value = true;
    Rest.post('settings', settings.value, API)
        .then(() => Notify.success(translate('Settings saved')))
        .catch((error) => Notify.error(error?.data?.message || translate('Could not save the settings')))
        .finally(() => (saving.value = false));
};
</script>

<template>
  <Page :title="translate('Gift Wrap')" class="gift-wrap-page">
    <template #actions>
      <el-button type="primary" :loading="saving" @click="save">{{ translate('Save') }}</el-button>
    </template>

    <Section :title="translate('Settings')" divided>
      <SettingRow layout="toggle" :label="translate('Offer gift wrap at checkout')"
                  :description="translate('Customers can add gift wrap to their order.')" v-slot="{id}">
        <el-switch :id="id" v-model="settings.enabled" active-value="yes" inactive-value="no"/>
      </SettingRow>
      <SettingRow :label="translate('Fee')" :description="translate('Added once per order.')" v-slot="{id}">
        <el-input-number :id="id" v-model="settings.fee" :min="0"/>
      </SettingRow>
    </Section>

    <Section :title="translate('Papers')" flush>
      <List v-if="papers.length">
        <ListItem v-for="paper in papers" :key="paper.id" :title="paper.name" :meta="paper.color"/>
      </List>
      <EmptyState v-else size="sm" :title="translate('No papers yet')"/>
    </Section>
  </Page>
</template>
```

The screen has one `h1` from `Page`, an `h2` for each `Section`, a label connected to each control, and FluentCart's spacing and dark mode. You wrote no CSS.

For complete screens with saving, validation, a list you can rearrange and a chart, see [Examples](./examples).

## Strings

Use `translate('…')` with a string literal. FluentCart looks the text up in its admin string map, and your plugin adds its own strings to that map in PHP:

```php
add_filter('fluent_cart/admin_translations', function ($translations) {
    $mine = [
        'Gift Wrap' => __('Gift Wrap', 'gift-wrap-for-fluent-cart'),
        'Fee'       => __('Fee', 'gift-wrap-for-fluent-cart'),
    ];
    // FluentCart's own strings win when both maps have the same text.
    return array_merge($mine, (array) $translations);
});
```

Never pass a variable to `translate()`. A tool that builds the map from your source code only finds literal strings.

## CSS

- **Prefer the components.** They bring FluentCart's spacing, colors and dark mode.
- **Prefix your own classes** with your plugin's name, for example `.gift-wrap-…`. Put them on the components when you need a screen-specific tweak: `<Section class="gift-wrap-papers">`.
- **Use the `--fct-*` variables** for colors and spacing, so dark mode works without extra rules. See [Design tokens](./components#design-tokens).
- **Do not ship Tailwind utilities that FluentCart already ships.** Your copy loads later and overrides FluentCart's responsive rules.

## Check your screen

1. Open your screen in light mode and in dark mode (the moon icon in the FluentCart header).
2. Press Tab through the screen. Each control gets a visible focus ring, and each label belongs to its control.
3. Narrow the window to about 400px. Setting rows stack under their labels.
4. Open the browser console. It shows no errors and no `[Vue warn]` lines.
