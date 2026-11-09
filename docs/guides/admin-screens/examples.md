---
title: Examples
description: "Four complete FluentCart admin screens for one add-on, with all the code: a list you can rearrange, a settings page, a detail page and a report with a chart."
---

# Examples

These four screens belong to one example plugin, **Gift Wrap for FluentCart**. The code on this page is the complete plugin. We built it, installed it next to FluentCart **X.Y.Z** and checked every screen in the browser before we published this page.

| Screen | Shows |
| ------ | ----- |
| [Rearrange a list](#rearrange-a-list) | `SortableList`, `ListItem`, saving a new order |
| [Settings with validation](#settings-with-validation) | Every `SettingRow` layout, errors from the server |
| [Detail page](#detail-page) | `DetailLayout`, `KeyValueList`, a not-found state |
| [Report with a chart](#report-with-a-chart) | `StatGrid`, `FluidTab`, `ChartTab` and an ECharts chart |

```
gift-wrap-for-fluent-cart/
├── gift-wrap-for-fluent-cart.php      PHP: menu, assets, REST routes
├── package.json
├── vite.admin-modules.config.mjs
└── resources/admin-modules/gift-wrap/
    ├── entry.js                       Routes
    ├── gift-wrap.css
    ├── Papers.vue                     Rearrange a list
    ├── Settings.vue                   Settings with validation
    ├── PaperDetail.vue                Detail page
    ├── Report.vue                     Report with a chart
    └── SalesChart.vue
```

Run `npm install` and `npm run build` in the plugin folder. The build writes `assets/admin-modules/`, which the PHP file enqueues. Then activate the plugin. FluentCart shows **Gift Wrap** in its menu.

::: tip Imports
The screens import `vue` and `echarts` by their usual names. The build config below maps them to FluentCart's own copies, so nothing is bundled twice. See [How the imports resolve](./#how-the-imports-resolve).
:::

## The plugin file

It loads the screens into FluentCart and adds the REST routes the screens call. Every route checks the same FluentCart permission as the menu item and the screens.

```php [gift-wrap-for-fluent-cart.php]
<?php
/**
 * Plugin Name: Gift Wrap for FluentCart
 * Description: Example add-on from the FluentCart Admin Screens guide.
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Requires Plugins: fluent-cart
 * Text Domain: gift-wrap-for-fluent-cart
 */

defined('ABSPATH') || exit;

define('GIFT_WRAP_VERSION', '1.0.0');

use FluentCart\App\Services\Permission\PermissionManager;

add_action('plugins_loaded', function () {
    // 5: FluentCart has the layout components these screens import.
    if (!defined('FLUENTCART_MODULE_API') || FLUENTCART_MODULE_API < 3) {
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
            'link'       => $args['base_url'] . 'gift-wrap/papers',
            'permission' => ['store/settings'],
        ];
        return $items;
    }, 10, 2);
});

add_action('rest_api_init', function () {
    $canManage = function () {
        return class_exists(PermissionManager::class) && PermissionManager::hasPermission(['store/settings']);
    };

    register_rest_route('gift-wrap/v1', '/papers', [
        ['methods' => 'GET', 'callback' => 'gift_wrap_get_papers', 'permission_callback' => $canManage],
    ]);
    register_rest_route('gift-wrap/v1', '/papers/order', [
        ['methods' => 'POST', 'callback' => 'gift_wrap_save_order', 'permission_callback' => $canManage],
    ]);
    register_rest_route('gift-wrap/v1', '/papers/(?P<id>\d+)', [
        ['methods' => 'GET', 'callback' => 'gift_wrap_get_paper', 'permission_callback' => $canManage],
    ]);
    register_rest_route('gift-wrap/v1', '/settings', [
        ['methods' => 'GET', 'callback' => 'gift_wrap_get_settings', 'permission_callback' => $canManage],
        ['methods' => 'POST', 'callback' => 'gift_wrap_save_settings', 'permission_callback' => $canManage],
    ]);
    register_rest_route('gift-wrap/v1', '/report', [
        ['methods' => 'GET', 'callback' => 'gift_wrap_get_report', 'permission_callback' => $canManage],
    ]);
});

function gift_wrap_papers(): array
{
    $papers = get_option('gift_wrap_papers');
    if (is_array($papers)) {
        return $papers;
    }

    // Prices are in cents, like every FluentCart amount.
    return [
        ['id' => 1, 'name' => 'Classic Red', 'color' => 'Red with gold ribbon', 'price' => 300, 'stock' => 42, 'swatch' => '#C8102E', 'active' => true],
        ['id' => 2, 'name' => 'Kraft Brown', 'color' => 'Recycled kraft, twine', 'price' => 200, 'stock' => 120, 'swatch' => '#A67B5B', 'active' => true],
        ['id' => 3, 'name' => 'Festive Stars', 'color' => 'Navy with silver stars', 'price' => 400, 'stock' => 0, 'swatch' => '#1F2A5A', 'active' => false],
        ['id' => 4, 'name' => 'Pastel Floral', 'color' => 'Pink and mint flowers', 'price' => 350, 'stock' => 18, 'swatch' => '#F4B6C2', 'active' => true],
    ];
}

function gift_wrap_get_papers()
{
    return ['papers' => gift_wrap_papers()];
}

function gift_wrap_get_paper(WP_REST_Request $request)
{
    foreach (gift_wrap_papers() as $paper) {
        if ((int) $paper['id'] === (int) $request['id']) {
            return ['paper' => $paper, 'orders' => []];
        }
    }

    return new WP_Error('not_found', __('This wrapping paper no longer exists.', 'gift-wrap-for-fluent-cart'), ['status' => 404]);
}

function gift_wrap_save_order(WP_REST_Request $request)
{
    $ids = array_map('intval', (array) $request->get_param('ids'));
    $byId = array_column(gift_wrap_papers(), null, 'id');

    // Only reorder papers that exist, and keep every paper exactly once.
    if (count($ids) !== count($byId) || array_diff($ids, array_keys($byId))) {
        return new WP_Error('invalid_order', __('The list changed. Reload the page and try again.', 'gift-wrap-for-fluent-cart'), ['status' => 422]);
    }

    update_option('gift_wrap_papers', array_map(function ($id) use ($byId) {
        return $byId[$id];
    }, $ids), false);

    return ['message' => __('Order saved', 'gift-wrap-for-fluent-cart')];
}

function gift_wrap_defaults(): array
{
    return ['enabled' => 'no', 'fee' => 0, 'style' => 'classic', 'message_limit' => 120, 'note' => ''];
}

function gift_wrap_get_settings()
{
    return ['settings' => array_merge(gift_wrap_defaults(), (array) get_option('gift_wrap_settings', []))];
}

function gift_wrap_save_settings(WP_REST_Request $request)
{
    $input = (array) $request->get_param('settings');
    $settings = [
        'enabled'       => ($input['enabled'] ?? 'no') === 'yes' ? 'yes' : 'no',
        'fee'           => (int) ($input['fee'] ?? 0),
        'style'         => sanitize_key($input['style'] ?? 'classic'),
        'message_limit' => (int) ($input['message_limit'] ?? 0),
        'note'          => sanitize_text_field($input['note'] ?? ''),
    ];

    $errors = [];
    if ($settings['fee'] < 0) {
        $errors['fee'] = __('The fee cannot be negative.', 'gift-wrap-for-fluent-cart');
    }
    if (!in_array($settings['style'], ['classic', 'kraft', 'festive'], true)) {
        $errors['style'] = __('Pick one of the paper styles.', 'gift-wrap-for-fluent-cart');
    }
    if ($settings['message_limit'] < 20 || $settings['message_limit'] > 500) {
        $errors['message_limit'] = __('Use a limit between 20 and 500 characters.', 'gift-wrap-for-fluent-cart');
    }

    if ($errors) {
        return new WP_Error('invalid_settings', __('Some settings need a fix.', 'gift-wrap-for-fluent-cart'), ['status' => 422, 'errors' => $errors]);
    }

    update_option('gift_wrap_settings', $settings, false);

    return ['message' => __('Settings saved', 'gift-wrap-for-fluent-cart'), 'settings' => $settings];
}

function gift_wrap_get_report(WP_REST_Request $request)
{
    $days = (int) $request->get_param('days') === 30 ? 30 : 7;

    // A real add-on queries its own orders here. These numbers repeat for the same day.
    $points = [];
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = gmdate('Y-m-d', strtotime("-{$i} days"));
        $seed = crc32($date);
        $points[] = ['date' => $date, 'orders' => $seed % 9 + 1, 'revenue' => ($seed % 9 + 1) * 300 + ($seed % 5) * 50];
    }

    return [
        'points'  => $points,
        'summary' => [
            'orders'  => array_sum(array_column($points, 'orders')),
            'revenue' => array_sum(array_column($points, 'revenue')),
        ],
    ];
}
```

- **Amounts are in cents**, like every FluentCart amount. The screens format them for display.
- **Validation lives on the server.** A failed save returns status 422 with one message per field in `data.errors`.
- **The report data is generated** so the example runs on any store. A real add-on queries its own orders in `gift_wrap_get_report()`.

## Build files

```json [package.json]
{
  "name": "gift-wrap-for-fluent-cart",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build -c vite.admin-modules.config.mjs"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "5.2.4",
    "vite": "6.3.5",
    "vue": "3.5.18"
  }
}
```

```js [vite.admin-modules.config.mjs]
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

// Resolved by FluentCart's import map at runtime, never bundled.
const CORE_MODULES = {
    'vue': '@fluent-cart/vue',
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

## Routes and CSS

One entry file registers all four screens. They share one permission, and each screen loads only when you open it.

```js [entry.js]
import {translate} from '@fluent-cart/ui';
import './gift-wrap.css';

const PERMISSION = 'store/settings';

const screens = {
    gift_wrap_papers: {path: '/gift-wrap/papers', component: () => import('./Papers.vue'), title: translate('Wrapping Papers')},
    gift_wrap_settings: {path: '/gift-wrap/settings', component: () => import('./Settings.vue'), title: translate('Gift Wrap Settings')},
    gift_wrap_paper: {path: '/gift-wrap/papers/:id', component: () => import('./PaperDetail.vue'), title: translate('Wrapping Paper'), props: true},
    gift_wrap_report: {path: '/gift-wrap/report', component: () => import('./Report.vue'), title: translate('Gift Wrap Report')},
};

window.fluent_cart_admin.hooks.addFilter('fluent_cart_routes', 'gift_wrap', (routes) => {
    Object.entries(screens).forEach(([name, screen]) => {
        routes[name] = {
            name,
            path: screen.path,
            props: !!screen.props,
            component: screen.component,
            meta: {active_menu: 'gift_wrap', title: screen.title, permission: PERMISSION},
        };
    });
    return routes;
});
```

```css [gift-wrap.css]
/* Every class is prefixed, so nothing here can restyle FluentCart's own screens. */
.gift-wrap-swatch {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid var(--fct-border);
}

.gift-wrap-swatch--large {
    width: 48px;
    height: 32px;
}

.gift-wrap-skeleton {
    padding: var(--fct-space-section);
}

.gift-wrap-styles {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.gift-wrap-style {
    display: flex;
    flex-direction: column;
    line-height: 1.4;
}

.gift-wrap-style span {
    color: var(--fct-text-muted);
}

.gift-wrap-chart {
    width: 100%;
    height: 320px;
}
```

The CSS uses the `--fct-*` variables, so the swatches and the chart area follow dark mode.

## Rearrange a list

The papers list can be reordered by dragging a row or with the arrow keys on its handle. Each move saves the new order.

```vue [Papers.vue]
<script setup>
// 'vue' resolves to FluentCart's own copy through the build config.
import {ref, onMounted} from 'vue';
import {Page, Section, SortableList, ListItem, EmptyState, Badge, CurrencyFormatter, Rest, Notify, translate} from '@fluent-cart/ui';

const API = window.giftWrapAdmin.restUrl;
const papers = ref([]);
const loading = ref(true);

const load = () => {
    loading.value = true;
    Rest.get('papers', {}, API)
        .then((response) => (papers.value = response.papers))
        .catch((error) => Notify.error(error?.data?.message || translate('Could not load the papers')))
        .finally(() => (loading.value = false));
};

// One save at a time. A move made during a save is sent when it finishes,
// so the newest order always reaches the server last.
let saving = false;
let pendingOrder = null;

const saveOrder = (list) => {
    if (saving) {
        pendingOrder = list;
        return;
    }
    saving = true;
    Rest.post('papers/order', {ids: list.map((paper) => paper.id)}, API)
        .then((response) => Notify.success(response.message))
        .catch((error) => {
            Notify.error(error?.data?.message || translate('Could not save the order'));
            load();
        })
        .finally(() => {
            saving = false;
            if (pendingOrder) {
                const next = pendingOrder;
                pendingOrder = null;
                saveOrder(next);
            }
        });
};

onMounted(load);
</script>

<template>
  <Page :title="translate('Wrapping Papers')" class="gift-wrap-papers">
    <template #actions>
      <el-button @click="$router.push({name: 'gift_wrap_report'})">{{ translate('Report') }}</el-button>
      <el-button type="primary" @click="$router.push({name: 'gift_wrap_settings'})">{{ translate('Settings') }}</el-button>
    </template>

    <Section :title="translate('Papers')" :description="translate('Checkout shows the papers in this order. Drag a row, or use the arrow keys on its handle.')" flush divided>
      <el-skeleton v-if="loading" class="gift-wrap-skeleton" :rows="4" animated/>

      <SortableList
          v-else-if="papers.length"
          v-model="papers"
          :handle-label="paper => translate('Reorder %1$s', paper.name)"
          @reorder="saveOrder"
      >
        <template #item="{item: paper, handle}">
          <ListItem :title="paper.name" :meta="paper.color" :to="{name: 'gift_wrap_paper', params: {id: paper.id}}">
            <template #handle><component :is="handle"/></template>
            <template #media><span class="gift-wrap-swatch" :style="{background: paper.swatch}"></span></template>
            <template #badges>
              <Badge size="small" :status="paper.active ? 'active' : 'disabled'" :text="paper.active ? translate('Active') : translate('Hidden')" :hide-icon="true"/>
            </template>
            <template #aside>{{ CurrencyFormatter.formatFixed(paper.price) }}</template>
          </ListItem>
        </template>
      </SortableList>

      <EmptyState v-else :title="translate('No papers yet')" :text="translate('Add a wrapping paper to offer gift wrap at checkout.')"/>
    </Section>
  </Page>
</template>
```

- **`v-model`** keeps `papers` in the new order. **`@reorder`** fires after each drag or arrow-key move, so that is where you save.
- **One save at a time.** A quick second move waits for the first save, then sends the newest order. A failed save reloads the list, so the screen never shows an order the server does not have.
- **The handle** is a button named by `handle-label`, for example "Reorder Classic Red". It keeps focus after a move, and screen readers hear "Moved to position 2 of 4".
- **The title links to the detail page** through `ListItem`'s `to` prop.

## Settings with validation

The settings page uses each `SettingRow` layout and shows the server's error under the field it belongs to.

```vue [Settings.vue]
<script setup>
// 'vue' resolves to FluentCart's own copy through the build config.
import {ref, onMounted} from 'vue';
import {Page, Section, SettingRow, Rest, Notify, translate} from '@fluent-cart/ui';

const API = window.giftWrapAdmin.restUrl;
const settings = ref(null);
const errors = ref({});
const saving = ref(false);

const styles = [
    {value: 'classic', label: translate('Classic'), text: translate('Glossy paper with a satin ribbon.')},
    {value: 'kraft', label: translate('Kraft'), text: translate('Recycled brown paper with twine.')},
    {value: 'festive', label: translate('Festive'), text: translate('Seasonal prints that change each month.')},
];

onMounted(() => {
    Rest.get('settings', {}, API)
        .then((response) => (settings.value = response.settings))
        .catch((error) => Notify.error(error?.data?.message || translate('Could not load the settings')));
});

const save = () => {
    saving.value = true;
    errors.value = {};
    Rest.post('settings', {settings: settings.value}, API)
        .then((response) => {
            settings.value = response.settings;
            Notify.success(response.message);
        })
        .catch((error) => {
            // A 422 from our endpoint carries one message per field.
            errors.value = error?.data?.data?.errors || {};
            Notify.error(error?.data?.message || translate('Could not save the settings'));
        })
        .finally(() => (saving.value = false));
};
</script>

<template>
  <Page :title="translate('Gift Wrap Settings')" :breadcrumbs="[{label: translate('Wrapping Papers'), to: {name: 'gift_wrap_papers'}}]">
    <template #actions>
      <el-button type="primary" :loading="saving" :disabled="!settings" @click="save">{{ translate('Save') }}</el-button>
    </template>

    <Section v-if="!settings">
      <el-skeleton :rows="5" animated/>
    </Section>

    <template v-else>
      <Section>
        <SettingRow layout="toggle" :label="translate('Offer gift wrap')"
                    :description="settings.enabled === 'yes' ? translate('Customers can add gift wrap at checkout.') : translate('Checkout does not show gift wrap.')"
                    v-slot="{id}">
          <el-switch :id="id" v-model="settings.enabled" active-value="yes" inactive-value="no"/>
        </SettingRow>
      </Section>

      <Section :title="translate('Pricing and style')" divided>
        <!-- The fee is stored in cents; the field shows it in the store currency. -->
        <SettingRow layout="inline" :label="translate('Fee per order')" :description="translate('Added once, however many items are wrapped.')"
                    :error="errors.fee" v-slot="{id}">
          <el-input-number :id="id" :model-value="settings.fee / 100" :min="0" :step="0.5" :precision="2"
                           @update:model-value="value => settings.fee = Math.round((value || 0) * 100)"/>
        </SettingRow>

        <SettingRow group :label="translate('Paper style')" :description="translate('The style customers see first.')" :error="errors.style">
          <el-radio-group v-model="settings.style" class="gift-wrap-styles">
            <el-radio v-for="style in styles" :key="style.value" :value="style.value">
              <span class="gift-wrap-style">
                <strong>{{ style.label }}</strong>
                <span>{{ style.text }}</span>
              </span>
            </el-radio>
          </el-radio-group>
        </SettingRow>
      </Section>

      <Section :title="translate('Gift message')" divided>
        <SettingRow layout="inline" :label="translate('Message length')" :description="translate('The most characters a customer can write, from 20 to 500.')"
                    :error="errors.message_limit" v-slot="{id}">
          <el-input-number :id="id" v-model="settings.message_limit" :step="10"/>
        </SettingRow>

        <SettingRow :label="translate('Note at checkout')" :description="translate('Shown under the gift message field.')" v-slot="{id, describedBy}">
          <el-input :id="id" :aria-describedby="describedBy" v-model="settings.note" type="textarea" :rows="2"
                    :placeholder="translate('We hand-write every message.')"/>
        </SettingRow>
      </Section>
    </template>
  </Page>
</template>
```

- **`layout="toggle"`** puts the on/off switch before its label. The line under it says what the store does now.
- **`layout="inline"`** puts a lone number field on the right edge.
- **`group`** labels the radio group as a whole, so screen readers read "Paper style" before the options.
- **`:error`** shows the server's message under the field and connects it to the control. Clear the errors before each save.
- **The fee is stored in cents.** The number field shows it in the store currency and converts back on change.

## Detail page

A detail page with the main content on the left and facts in a sidebar.

```vue [PaperDetail.vue]
<script setup>
// 'vue' resolves to FluentCart's own copy through the build config.
import {ref, watch} from 'vue';
import {Page, DetailLayout, Section, KeyValueList, KeyValue, EmptyState, Badge, CurrencyFormatter, Rest, translate} from '@fluent-cart/ui';

const props = defineProps({
    id: {type: [String, Number], required: true},
});

const API = window.giftWrapAdmin.restUrl;
const paper = ref(null);
const orders = ref([]);
const loading = ref(true);
const missing = ref(false);

// The route reuses this screen when you open another paper, so reload on every id.
watch(() => props.id, (id) => {
    loading.value = true;
    missing.value = false;
    Rest.get('papers/' + id, {}, API)
        .then((response) => {
            paper.value = response.paper;
            orders.value = response.orders;
        })
        .catch(() => {
            paper.value = null;
            missing.value = true;
        })
        .finally(() => (loading.value = false));
}, {immediate: true});
</script>

<template>
  <Page :title="paper ? paper.name : translate('Wrapping Paper')" :breadcrumbs="[{label: translate('Wrapping Papers'), to: {name: 'gift_wrap_papers'}}]">
    <template v-if="paper" #status>
      <Badge size="small" :status="paper.active ? 'active' : 'disabled'" :text="paper.active ? translate('Active') : translate('Hidden')" :hide-icon="true"/>
    </template>

    <Section v-if="loading"><el-skeleton :rows="6" animated/></Section>

    <Section v-else-if="missing">
      <EmptyState :title="translate('Paper not found')" :text="translate('It may have been deleted.')">
        <template #actions>
          <el-button @click="$router.push({name: 'gift_wrap_papers'})">{{ translate('Back to papers') }}</el-button>
        </template>
      </EmptyState>
    </Section>

    <DetailLayout v-else>
      <Section :title="translate('Orders with this paper')" :description="translate('The last 30 days.')" divided>
        <EmptyState v-if="!orders.length" size="sm" :title="translate('No orders yet')" :text="translate('Orders show here once a customer picks this paper.')"/>
      </Section>

      <template #sidebar>
        <Section :title="translate('Details')" size="sm" divided>
          <KeyValueList>
            <KeyValue :label="translate('Price')" :value="CurrencyFormatter.formatFixed(paper.price)"/>
            <KeyValue :label="translate('In stock')" :value="paper.stock"/>
            <KeyValue :label="translate('Status')" :value="paper.active ? translate('Active') : translate('Hidden')"/>
          </KeyValueList>
        </Section>

        <Section :title="translate('Look')" size="sm" divided>
          <KeyValueList layout="stacked">
            <KeyValue :label="translate('Colors')" :value="paper.color"/>
            <KeyValue :label="translate('Swatch')">
              <span class="gift-wrap-swatch gift-wrap-swatch--large" :style="{background: paper.swatch}"></span>
            </KeyValue>
          </KeyValueList>
        </Section>
      </template>
    </DetailLayout>
  </Page>
</template>
```

- **Watch the route prop** with `immediate: true`. The router reuses the screen when you open another paper, so `onMounted` alone would show the old one.
- **A missing record** shows an `EmptyState` with a way back, instead of a blank page.
- **`KeyValue`** shows "—" for an empty value and keeps `0` (an out-of-stock paper shows "0").

## Report with a chart

A report with summary numbers, a period switch and a revenue chart that switches between bars and a line.

```vue [Report.vue]
<script setup>
// 'vue' resolves to FluentCart's own copy through the build config.
import {ref, computed, watch} from 'vue';
import {Page, Section, StatGrid, StatTile, EmptyState, FluidTab, ChartTab, CurrencyFormatter, Rest, Notify, translate} from '@fluent-cart/ui';
import SalesChart from './SalesChart.vue';

const API = window.giftWrapAdmin.restUrl;
const days = ref(7);
const chartType = ref('bar');
const points = ref([]);
const summary = ref({orders: 0, revenue: 0});
const loading = ref(true);

const average = computed(() => summary.value.orders ? Math.round(summary.value.revenue / summary.value.orders) : 0);

watch(days, (value) => {
    loading.value = true;
    Rest.get('report', {days: value}, API)
        .then((response) => {
            points.value = response.points;
            summary.value = response.summary;
        })
        .catch((error) => Notify.error(error?.data?.message || translate('Could not load the report')))
        .finally(() => (loading.value = false));
}, {immediate: true});
</script>

<template>
  <Page :title="translate('Gift Wrap Report')" :breadcrumbs="[{label: translate('Wrapping Papers'), to: {name: 'gift_wrap_papers'}}]">
    <template #actions>
      <FluidTab.Tab small>
        <FluidTab.Item :label="translate('Last 7 days')" :class="{active: days === 7}" @click="days = 7"/>
        <FluidTab.Item :label="translate('Last 30 days')" :class="{active: days === 30}" @click="days = 30"/>
      </FluidTab.Tab>
    </template>

    <StatGrid :columns="3">
      <StatTile :label="translate('Wrapped orders')" :value="summary.orders" :loading="loading"/>
      <StatTile :label="translate('Gift wrap revenue')" :value="CurrencyFormatter.formatFixed(summary.revenue)" :loading="loading"/>
      <StatTile :label="translate('Average per order')" :value="CurrencyFormatter.formatFixed(average)" :loading="loading"/>
    </StatGrid>

    <Section :title="translate('Revenue per day')" divided>
      <template #actions>
        <ChartTab :active-type="chartType" :types="{bar: 'BarChart', line: 'LineChart'}" @change="type => chartType = type"/>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated/>
      <SalesChart v-else-if="points.length" :points="points" :type="chartType"/>
      <EmptyState v-else size="sm" :title="translate('No gift wrap sold yet')"/>
    </Section>
  </Page>
</template>
```

```vue [SalesChart.vue]
<script setup>
// 'vue' and 'echarts' resolve to FluentCart's own copies through the build config.
import {ref, watch, onMounted, onBeforeUnmount} from 'vue';
import {init} from 'echarts';
import {Theme, chartAxisPointer, chartTooltipAmount, chartTooltipPosition, getXAxisConfig, translate} from '@fluent-cart/ui';

const props = defineProps({
    // [{date: 'YYYY-MM-DD', revenue: cents}]
    points: {type: Array, required: true},
    type: {type: String, default: 'bar'},
});

const chartEl = ref(null);
let chart = null;
let resizeObserver = null;
const report = Theme.colors.report;

const options = () => {
    const dark = Theme.isDark();
    const text = dark ? '#C0C2C4' : '#565865';
    const line = dark ? '#253241' : '#EAECF0';

    return {
        grid: {left: 8, right: 16, top: 16, bottom: 8, containLabel: true},
        tooltip: {
            trigger: 'axis',
            confine: true,
            position: chartTooltipPosition,
            axisPointer: chartAxisPointer(dark, report.dark_cyan_blue_16, report.light_gray_blue, props.type),
            backgroundColor: dark ? '#253241' : '#ffffff',
            borderColor: dark ? '#2C3C4E' : '#D6DAE1',
            textStyle: {color: dark ? '#ffffff' : '#565865'},
            valueFormatter: (cents) => chartTooltipAmount(cents),
        },
        xAxis: {
            type: 'category',
            data: props.points.map((point) => point.date.slice(5)),
            axisLabel: {color: text, interval: getXAxisConfig(props.points.length).interval},
            axisLine: {lineStyle: {color: line}},
            axisTick: {show: false},
        },
        yAxis: {
            type: 'value',
            axisLabel: {color: text, formatter: (cents) => chartTooltipAmount(cents)},
            splitLine: {lineStyle: {color: line}},
        },
        series: [{
            name: translate('Revenue'),
            type: props.type,
            data: props.points.map((point) => point.revenue),
            color: dark ? report.blue_dark_mode : report.royal_blue,
            barMaxWidth: 28,
            itemStyle: {borderRadius: props.type === 'bar' ? [4, 4, 0, 0] : 0},
            smooth: true,
            showSymbol: false,
            areaStyle: props.type === 'line' ? {opacity: 0.12} : undefined,
        }],
    };
};

// `true` replaces the old options, so switching bar/line leaves nothing behind.
const draw = () => chart && chart.setOption(options(), true);

onMounted(() => {
    chart = init(chartEl.value);
    draw();
    resizeObserver = new ResizeObserver(() => chart && chart.resize());
    resizeObserver.observe(chartEl.value);
    window.addEventListener(Theme.THEME_CHANGE_EVENT, draw);
});

onBeforeUnmount(() => {
    window.removeEventListener(Theme.THEME_CHANGE_EVENT, draw);
    resizeObserver && resizeObserver.disconnect();
    chart && chart.dispose();
    chart = null;
});

watch(() => [props.points, props.type], draw);
</script>

<template>
  <div ref="chartEl" class="gift-wrap-chart" role="img" :aria-label="translate('Gift wrap revenue per day')"></div>
</template>
```

- **The `StatTile`s show their loading state** while the report loads, at the same size as the loaded tiles.
- **`FluidTab`** switches the period. The `active` class marks the selected item when the screen loads.
- **`ChartTab`** switches between bars and a line. See [Charts](./charts) for the helpers and the rules the chart component follows.
