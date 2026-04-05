/// <reference types="node" />

import { defineConfig } from 'vitepress'
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, writeFileSync, readFileSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Explicit logical ordering per module — slug order defines sidebar order
// Any slugs not listed here appear at the end (alphabetically)
const MODULE_ORDER: Record<string, string[]> = {
  orders: [
    'list-orders', 'get-order', 'create-order', 'update-order', 'delete-order',
    'mark-as-paid', 'refund-order', 'accept-dispute',
    'update-order-address', 'update-order-address-id', 'change-customer', 'create-and-change-customer',
    'get-order-transactions', 'get-single-transaction', 'update-transaction-status',
    'create-custom-order-item', 'update-statuses', 'sync-order-statuses',
    'get-shipping-methods', 'calculate-shipping',
    'generate-missing-licenses', 'bulk-actions',
  ],
  products: [
    'list-products', 'get-product', 'create-product', 'update-product-detail', 'delete-product', 'duplicate-product',
    'search-products-by-name', 'fetch-products-by-ids',
    'get-product-pricing', 'update-product-pricing',
    'list-product-variations', 'list-all-variants', 'create-variation', 'update-variation', 'delete-variation',
    'fetch-variations-by-ids', 'search-variants-by-name', 'search-product-variant-options',
    'update-variant-option', 'update-variation-pricing-table', 'set-variation-media',
    'find-subscription-variants',
    'update-inventory', 'update-manage-stock', 'suggest-sku',
    'get-downloadable-url', 'sync-downloadable-files', 'update-downloadable-file', 'delete-downloadable-file',
    'get-bundle-info', 'save-bundle-info',
    'get-upgrade-settings', 'get-variation-upgrade-paths', 'save-upgrade-path', 'update-upgrade-path', 'delete-upgrade-path',
    'get-pricing-widgets', 'get-related-products', 'get-max-excerpt-word-count', 'update-long-desc-editor-mode',
    'fetch-taxonomy-terms', 'fetch-terms-by-parent', 'add-product-terms', 'sync-taxonomy-terms', 'delete-taxonomy-term',
    'update-shipping-class', 'remove-shipping-class', 'update-tax-class', 'remove-tax-class',
    'get-product-integration-settings', 'get-product-integration-feeds', 'save-product-integration',
    'change-integration-status', 'delete-product-integration',
    'bulk-edit-fetch', 'bulk-insert-products', 'bulk-update-products', 'do-bulk-action', 'create-dummy-products',
  ],
  customers: [
    'list-customers', 'get-customer', 'create-customer', 'update-customer',
    'get-customer-stats', 'get-customer-orders', 'find-customer-order', 'recalculate-ltv',
    'get-customer-addresses', 'create-address', 'update-address', 'set-primary-address', 'delete-address',
    'update-additional-info',
    'attach-user', 'detach-user', 'get-attachable-users',
    'bulk-actions',
  ],
  coupons: [
    'list-coupons', 'get-coupon', 'create-coupon', 'update-coupon', 'delete-coupon',
    'list-coupon-codes', 'apply-coupon', 'cancel-coupon', 're-apply-coupons',
    'check-product-eligibility',
    'get-coupon-settings', 'store-coupon-settings',
  ],
  subscriptions: [
    'list-subscriptions', 'get-subscription', 'list-customer-subscriptions', 'get-customer-subscription',
    'cancel-subscription', 'pause-subscription', 'resume-subscription', 'reactivate-subscription',
    'cancel-auto-renew',
    'update-payment-method', 'switch-payment-method',
    'initiate-early-payment', 'generate-early-payment-link',
    'confirm-subscription-switch', 'get-or-create-plan',
    'fetch-subscription-remote', 'get-setup-intent-attempts',
  ],
  tax: [
    'get-tax-settings', 'save-tax-settings',
    'list-tax-classes', 'create-tax-class', 'update-tax-class', 'delete-tax-class',
    'list-all-tax-rates', 'create-tax-rate', 'update-tax-rate', 'delete-tax-rate',
    'list-tax-records', 'mark-taxes-as-filed',
    'get-country-tax-rates', 'get-country-tax-id', 'save-country-tax-id',
    'save-configured-countries',
    'get-eu-tax-rates', 'save-eu-vat-cross-border-settings',
    'get-preconfigured-tax-rates',
    'save-oss-tax-override', 'delete-oss-tax-override',
    'save-oss-shipping-tax-override', 'delete-oss-shipping-tax-override',
    'save-shipping-tax-override', 'delete-shipping-tax-override',
    'delete-country-rates',
  ],
  shipping: [
    'list-shipping-zones', 'get-shipping-zone', 'create-shipping-zone', 'update-shipping-zone', 'delete-shipping-zone',
    'update-zone-order', 'get-zone-states',
    'create-shipping-method', 'update-shipping-method', 'delete-shipping-method',
    'list-shipping-classes', 'get-shipping-class', 'create-shipping-class', 'update-shipping-class', 'delete-shipping-class',
  ],
  settings: [
    'get-store-settings', 'save-store-settings',
    'get-module-settings', 'save-module-settings',
    'get-checkout-fields', 'save-checkout-fields',
    'save-confirmation-settings',
    'get-permissions', 'save-permissions',
    'list-all-payment-methods', 'get-payment-method-settings', 'save-payment-method-settings',
    'get-payment-method-connection-info', 'save-payment-method-design', 'reorder-payment-methods',
    'disconnect-payment-method', 'activate-payment-addon', 'install-payment-addon',
    'check-paypal-webhook', 'setup-paypal-webhook', 'exchange-paypal-seller-auth-token',
    'list-all-storage-drivers', 'get-active-storage-drivers', 'get-storage-driver-settings',
    'save-storage-driver-settings', 'verify-storage-driver-connection',
    'get-plugin-addons', 'activate-plugin-addon', 'install-plugin-addon',
    'get-email-shortcodes',
  ],
  'email-notification': [
    'list-notifications', 'get-notification', 'update-notification', 'enable-notification',
    'preview-notification', 'preview-default-template',
    'get-settings', 'save-settings',
    'get-shortcodes',
    'get-reminders', 'save-reminders',
  ],
  reports: [
    'get-overview', 'report-overview', 'get-dashboard-summary', 'dashboard-stats',
    'get-revenue', 'revenue-by-group',
    'order-chart', 'fetch-order-by-group', 'quick-order-stats',
    'get-recent-orders', 'order-completion-time', 'order-value-distribution', 'item-count-distribution',
    'sales-report', 'sales-growth', 'sales-growth-chart',
    'product-report', 'product-performance', 'fetch-top-sold-products', 'fetch-top-sold-variants', 'top-products-sold',
    'customer-report', 'daily-signups', 'fetch-new-vs-returning-customer', 'search-repeat-customer',
    'subscription-chart', 'subscription-cohorts', 'subscription-retention', 'future-renewals',
    'refund-chart', 'refund-data-by-group', 'weeks-between-refund',
    'retention-chart', 'generate-retention-snapshots', 'retention-snapshots-status',
    'license-chart', 'license-pie-chart', 'license-summary',
    'country-heat-map', 'sources',
    'fetch-report-by-day-and-hour', 'fetch-report-meta',
    'get-recent-activities',
  ],
  integration: [
    'list-addons', 'install-addon-plugin',
    'get-global-settings', 'set-global-settings',
    'get-global-feeds', 'get-feed-lists', 'get-feed-settings', 'save-feed-settings',
    'change-feed-status', 'delete-feed',
    'list-product-feeds', 'get-product-integration-settings', 'save-product-integration',
    'change-product-feed-status', 'delete-product-integration',
    'get-dynamic-options', 'chained-data-request',
  ],
  files: [
    'list-files', 'get-bucket-list', 'upload-file', 'upload-editor-file', 'delete-file',
  ],
  'labels-attributes': [
    'list-labels', 'create-label', 'update-label-selections',
    'list-attribute-groups', 'get-attribute-group', 'create-attribute-group', 'update-attribute-group', 'delete-attribute-group',
    'list-attribute-terms', 'create-attribute-term', 'update-attribute-term', 'delete-attribute-term',
    'change-term-sort-order',
  ],
  dashboard: [
    'initialize-app', 'get-dashboard-stats', 'get-widgets',
    'get-onboarding-data', 'get-onboarding-settings', 'save-onboarding-settings',
    'get-filter-options', 'get-search-options', 'get-country-info', 'list-countries',
    'list-activities', 'mark-activity-read', 'delete-activity',
    'attach-note-to-order',
    'list-attachments', 'upload-attachment',
    'get-print-templates', 'save-print-templates',
    'create-all-pages', 'create-single-page',
  ],
  'public-shop': [
    'list-products', 'get-product-views', 'search-products',
  ],
  checkout: [
    'get-checkout-summary', 'get-country-info',
    'get-available-shipping-methods', 'get-shipping-methods-list-view',
    'get-order-info', 'place-order', 'login',
  ],
  'customer-profile': [
    'get-profile-details', 'update-profile-details',
    'get-customer-details', 'update-customer-details',
    'dashboard-overview',
    'list-orders', 'get-order-details', 'get-customer-orders',
    'list-downloads',
    'get-upgrade-paths',
    'create-profile-address', 'update-profile-address', 'delete-profile-address', 'make-profile-address-primary',
    'create-address-checkout', 'update-address-checkout', 'delete-address-checkout', 'select-address-for-checkout',
    'set-address-as-primary',
    'get-transaction-billing-address', 'save-transaction-billing-address',
  ],
  licensing: [
    'list-licenses', 'get-license-details', 'delete-license',
    'get-license-activations', 'update-license-activation-limit', 'update-license-status',
    'regenerate-license-key', 'extend-license-validity',
    'get-customer-licenses-admin', 'get-customer-license-details', 'list-customer-licenses',
    'get-product-license-settings', 'save-product-license-settings',
    'get-license-chart', 'get-license-pie-chart', 'get-license-summary',
    'activate-plugin-license', 'deactivate-plugin-license', 'get-plugin-license-status',
    'public-activate-license', 'public-deactivate-license', 'public-check-license',
    'public-get-license-version', 'public-download-license-package',
    'activate-site-admin', 'deactivate-site-admin', 'deactivate-site-customer',
  ],
  'roles-permissions': [
    'list-roles', 'get-role', 'update-role',
    'list-managers', 'assign-role', 'delete-role-assignment',
    'search-users',
    'get-permissions', 'save-permissions',
  ],
  'order-bumps': [
    'list-order-bumps', 'get-order-bump', 'create-order-bump', 'update-order-bump', 'delete-order-bump',
  ],
}

// Auto-generate sidebar items from docs/restapi/operations/
function getOperationSidebarItems(moduleDir: string, label: string) {
  const opsDir = join(projectRoot, 'docs', 'restapi', 'operations', moduleDir)
  if (!existsSync(opsDir)) return []

  const files = readdirSync(opsDir).filter(f => f.endsWith('.md'))
  const order = MODULE_ORDER[moduleDir] || []

  const items = files.map(file => {
    const slug = file.replace('.md', '')
    const content = readFileSync(join(opsDir, file), 'utf-8')
    const titleMatch = content.match(/^title:\s*(.+)$/m)
    const title = titleMatch ? titleMatch[1].replace(/['"]/g, '') : slug.replace(/-/g, ' ')
    return { text: title, link: `/restapi/operations/${moduleDir}/${slug}`, _slug: slug }
  })

  // Sort by explicit order, unlisted items go to the end
  items.sort((a, b) => {
    const ia = order.indexOf(a._slug)
    const ib = order.indexOf(b._slug)
    const posA = ia === -1 ? 9999 : ia
    const posB = ib === -1 ? 9999 : ib
    if (posA !== posB) return posA - posB
    return a.text.localeCompare(b.text)
  })

  return items.map(({ _slug, ...rest }) => rest)
}

// Build REST API sidebar with per-endpoint operation links
function buildRestApiSidebar() {
  const modules = [
    { group: 'Core Resources', items: [
      { text: 'Orders', link: '/restapi/orders', dir: 'orders' },
      { text: 'Products', link: '/restapi/products', dir: 'products' },
      { text: 'Customers', link: '/restapi/customers', dir: 'customers' },
      { text: 'Coupons', link: '/restapi/coupons', dir: 'coupons' },
      { text: 'Subscriptions', link: '/restapi/subscriptions', dir: 'subscriptions' },
    ]},
    { group: 'Configuration', items: [
      { text: 'Tax', link: '/restapi/tax', dir: 'tax' },
      { text: 'Shipping', link: '/restapi/shipping', dir: 'shipping' },
      { text: 'Settings', link: '/restapi/settings', dir: 'settings' },
      { text: 'Email Notifications', link: '/restapi/email-notifications', dir: 'email-notification' },
    ]},
    { group: 'Analytics & Content', items: [
      { text: 'Reports', link: '/restapi/reports', dir: 'reports' },
      { text: 'Integrations', link: '/restapi/integrations', dir: 'integration' },
      { text: 'Files', link: '/restapi/files', dir: 'files' },
      { text: 'Labels & Attributes', link: '/restapi/labels-and-attributes', dir: 'labels-attributes' },
      { text: 'Dashboard', link: '/restapi/dashboard', dir: 'dashboard' },
    ]},
    { group: 'Storefront & Checkout', items: [
      { text: 'Public Shop', link: '/restapi/public-shop', dir: 'public-shop' },
      { text: 'Checkout', link: '/restapi/checkout', dir: 'checkout' },
      { text: 'Customer Profile', link: '/restapi/customer-profile', dir: 'customer-profile' },
    ]},
    { group: 'Pro Features', items: [
      { text: 'Licensing', link: '/restapi/licensing', dir: 'licensing' },
      { text: 'Roles & Permissions', link: '/restapi/roles', dir: 'roles-permissions' },
      { text: 'Order Bumps', link: '/restapi/order-bumps', dir: 'order-bumps' },
    ]},
  ]

  const sidebar: any[] = [
    { text: 'Getting Started', items: [{ text: 'API Overview', link: '/restapi/' }] }
  ]

  for (const section of modules) {
    const sectionItems: any[] = []
    for (const mod of section.items) {
      const ops = getOperationSidebarItems(mod.dir, mod.text)
      if (ops.length > 0) {
        sectionItems.push({
          text: mod.text,
          link: mod.link,
          collapsed: true,
          items: ops
        })
      } else {
        sectionItems.push({ text: mod.text, link: mod.link })
      }
    }
    sidebar.push({ text: section.group, collapsed: false, items: sectionItems })
  }

  return sidebar
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  
  title: "FluentCart Developer Docs",
  description: "Complete developer documentation for FluentCart e-commerce plugin",
  
  head: [
    ['meta', { name: 'theme-color', content: '#136196' }],
    [
      'script',
      { type: 'module' },
      'import "https://cdn.jsdelivr.net/gh/fluent-docai/chat-widget@latest/chat-widget.js"; window.FluentBotChatWidget.injectWidget("d5e29b4b-0108-4885-98c8-d1cde76a5b70");'
    ]
  ],

  
  
  vite: {
    // Ensure JSON files can be imported
    assetsInclude: ['**/*.json'],
    plugins: [
      {
        name: 'copy-openapi-json-files',
        configureServer(server) {
          // Serve OpenAPI JSON files in dev mode at /openapi/public/ path
          // (matches the production build path structure)
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/openapi/public/')) {
              const filePath = req.url.replace('/openapi/public/', '')
              const fullPath = join(projectRoot, 'public', 'openapi', filePath)
              if (existsSync(fullPath)) {
                const content = readFileSync(fullPath, 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(content)
                return
              }
            }
            next()
          })
        },
        closeBundle() {
          // This runs after the bundle is closed
          const sourceDir = join(projectRoot, 'public', 'openapi')
          const targetDir = join(__dirname, 'dist', 'openapi', 'public')
          
          if (!existsSync(sourceDir)) {
            console.warn('⚠️  Source directory does not exist:', sourceDir)
            return
          }
          
          // Array to store all discovered JSON file paths
          const jsonFiles: string[] = []
          
          // Recursive copy function that also collects file paths
          const copyRecursive = (src: string, dest: string, baseDir: string) => {
            if (!existsSync(src)) return
            
            const stats = statSync(src)
            if (stats.isDirectory()) {
              if (!existsSync(dest)) {
                mkdirSync(dest, { recursive: true })
              }
              const files = readdirSync(src)
              files.forEach(file => {
                if (file === 'README.md') return
                copyRecursive(join(src, file), join(dest, file), baseDir)
              })
            } else {
              if (!src.endsWith('.json')) return
              
              const destDir = dirname(dest)
              if (!existsSync(destDir)) {
                mkdirSync(destDir, { recursive: true })
              }
              copyFileSync(src, dest)
              
              // Calculate relative path from sourceDir for the manifest
              const relativePath = relative(baseDir, src).replace(/\\/g, '/')
              jsonFiles.push(`/openapi/public/${relativePath}`)
            }
          }
          
          copyRecursive(sourceDir, targetDir, sourceDir)
          
          // Generate manifest.json with list of all JSON files
          const manifestPath = join(targetDir, 'manifest.json')
          const manifest = {
            files: jsonFiles,
            generated: new Date().toISOString()
          }
          writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
          
          console.log(`✓ OpenAPI: Copied ${jsonFiles.length} JSON files and generated manifest`)
        }
      }
    ]
  },
  
  // Ignore dead links during build
  ignoreDeadLinks: true,
  
  markdown: {
    config: (md) => {
      // Add Mermaid support
      const { fence } = md.renderer.rules
      if (fence) {
        md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
          const token = tokens[idx]
          const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
          const langName = info ? info.split(/\s+/g)[0] : ''
          
          if (langName === 'mermaid') {
            return `<Mermaid content="${md.utils.escapeHtml(token.content)}" />`
          }
          
          return fence(tokens, idx, options, env, renderer)
        }
      }
    }
  },
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      light: 'https://docs.fluentcart.com/logo-full-dark.svg',
      dark: 'https://docs.fluentcart.com/logo-full.png'
    },
    
    siteTitle: 'Dev Docs',
    
        // Navigation
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
          {
            text: 'Database',
            items: [
              { text: 'Database Schema', link: '/database/schema' },
              { text: 'Database Models', link: '/database/models' },
              { text: 'Model Relationships', link: '/database/models/relationships' },
              { text: 'Query Builder', link: '/database/query-builder' }
            ]
          },
          {
            text: 'Developer Hooks',
            items: [
              { text: 'Action Hooks', link: '/hooks/actions' },
              { text: 'Filter Hooks', link: '/hooks/filters' }
            ]
          },
          { text: 'Rest API', link: '/restapi/' },
          {
            text: 'Tutorials',
            items: [
              { text: 'Ghost Product Selling', link: '/modules/ghost-product-selling' },
              { text: 'Custom Payment Gateway', link: '/payment-methods-integration/' },
              { text: '(Payment Gateway) Example', link: '/payment-methods-integration/paddle-example' }
            ]
          },
          
          // {
          //   text: 'REST API',
          //   items: [
          //     { text: 'API Overview', link: '/api/' },
          //     { text: 'Authentication', link: '/api/authentication' },
          //     { text: 'Orders API', link: '/api/orders' },
          //     { text: 'Customers API', link: '/api/customers' },
          //     { text: 'Products API', link: '/api/products' },
          //     { text: 'Subscriptions API', link: '/api/subscriptions' },
          //     {
          //       text: 'Pro API',
          //       items: [
          //         { text: 'Licensing API (Pro)', link: '/api/licensing' },
          //         { text: 'Roles & Permissions API (Pro)', link: '/api/roles-permissions' },
          //         { text: 'Order Bump API (Pro)', link: '/api/order-bump' }
          //       ]
          //     }
          //   ]
          // },
          // {
          //   text: 'Modules',
          //   items: [
          //     { text: 'Module Overview', link: '/modules/' },
          //     { text: 'Payment Methods', link: '/modules/payment-methods' },
          //     { text: 'Shipping', link: '/modules/shipping' },
          //     { text: 'Storage Drivers', link: '/modules/storage' },
          //     {
          //       text: 'Pro Modules',
          //       items: [
          //         { text: 'Licensing Module (Pro)', link: '/modules/licensing' },
          //         { text: 'Order Bump Module (Pro)', link: '/modules/order-bump' }
          //       ]
          //     }
          //   ]
          // },
          // {
          //   text: 'Guides',
          //   items: [
          //     { text: 'Frontend Development', link: '/guides/frontend' },
          //     { text: 'Integration Guide', link: '/guides/integrations' }
          //   ]
          // }
        ],

    // Sidebar
    sidebar: {
      '/getting-started': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/getting-started' }
          ]
        }
      ],
      '/database/': [
        {
          text: 'Database',
          items: [
            // { text: 'Overview', link: '/database/README' },
            { text: 'Schema', link: '/database/schema' },
            { text: 'Models', link: '/database/models.md' },
            { text: 'Model Relationships', link: '/database/models/relationships' },
            { text: 'Query Builder', link: '/database/query-builder' }
          ]
        },
        {
          text: 'Core Models',
          items: [
            { text: 'Order', link: '/database/models/order' },
            { text: 'Order Item', link: '/database/models/order-item' },
            { text: 'Order Meta', link: '/database/models/order-meta' },
            { text: 'Order Transaction', link: '/database/models/order-transaction' },
            { text: 'Order Address', link: '/database/models/order-address' },
            { text: 'Order Operation', link: '/database/models/order-operation' },
            { text: 'Order Tax Rate', link: '/database/models/order-tax-rate' },
            { text: 'Order Download Permission', link: '/database/models/order-download-permission' },
            { text: 'Customer', link: '/database/models/customer' },
            { text: 'Customer Addresses', link: '/database/models/customer-addresses' },
            { text: 'Customer Meta', link: '/database/models/customer-meta' },
            { text: 'Product', link: '/database/models/product' },
            { text: 'Product Detail', link: '/database/models/product-detail' },
            { text: 'Product Variation', link: '/database/models/product-variation' },
            { text: 'Product Meta', link: '/database/models/product-meta' },
            { text: 'Product Download', link: '/database/models/product-download' },
            { text: 'Subscription', link: '/database/models/subscription' },
            { text: 'Subscription Meta', link: '/database/models/subscription-meta' },
            { text: 'Cart', link: '/database/models/cart' },
            { text: 'Coupon', link: '/database/models/coupon' },
            { text: 'Applied Coupon', link: '/database/models/applied-coupon' },
            { text: 'Activity', link: '/database/models/activity' },
            { text: 'Scheduled Action', link: '/database/models/scheduled-action' },
            { text: 'Meta', link: '/database/models/meta' },
            { text: 'User', link: '/database/models/user' },
            { text: 'Dynamic Model', link: '/database/models/dynamic-model' }
          ]
        },
        {
          text: 'Attribute System Models',
          items: [
            { text: 'Attribute Group', link: '/database/models/attribute-group' },
            { text: 'Attribute Term', link: '/database/models/attribute-term' },
            { text: 'Attribute Relation', link: '/database/models/attribute-relation' }
          ]
        },
        {
          text: 'Shipping & Tax Models',
          items: [
            { text: 'Shipping Zone', link: '/database/models/shipping-zone' },
            { text: 'Shipping Method', link: '/database/models/shipping-method' },
            { text: 'Shipping Class', link: '/database/models/shipping-class' },
            { text: 'Tax Class', link: '/database/models/tax-class' },
            { text: 'Tax Rate', link: '/database/models/tax-rate' }
          ]
        },
        {
          text: 'Label System Models',
          items: [
            { text: 'Label', link: '/database/models/label' },
            { text: 'Label Relationship', link: '/database/models/label-relationship' }
          ]
        },
        {
          text: 'Pro Plugin Models',
          items: [
            { text: 'License', link: '/database/models/license' },
            { text: 'License Meta', link: '/database/models/license-meta' },
            { text: 'License Activation', link: '/database/models/license-activation' },
            { text: 'License Site', link: '/database/models/license-site' },
            { text: 'Order Promotion', link: '/database/models/order-promotion' },
            { text: 'Order Promotion Stat', link: '/database/models/order-promotion-stat' },
            { text: 'User Meta', link: '/database/models/user-meta' }
          ]
        }
      ],
      '/hooks/': [
        {
          text: 'Developer Hooks',
          items: [
            {
                text: 'Action Hooks',
                items: [
                  { text: 'Action Hooks Overview', link: '/hooks/actions' },
                  { text: 'Orders', link: '/hooks/actions/orders' },
                  { text: 'Subscriptions', link: '/hooks/actions/subscriptions' },
                  { text: 'Licenses', link: '/hooks/actions/licenses' },
                  { text: 'Cart & Checkout', link: '/hooks/actions/cart-and-checkout' },
                  { text: 'Customers & Users', link: '/hooks/actions/customers-and-users' },
                  { text: 'Products & Coupons', link: '/hooks/actions/products-and-coupons' },
                  { text: 'Payments & Integrations', link: '/hooks/actions/payments-and-integrations' },
                  { text: 'Admin & Templates', link: '/hooks/actions/admin-and-templates' },
                ]
              },
            { text: 'Filter Hooks', 
              items: [
                  { text: 'Filter Hooks Overview', link: '/hooks/filters' },
                  { text: 'Cart & Checkout', link: '/hooks/filters/cart-and-checkout' },
                  { text: 'Customers & Subscriptions', link: '/hooks/filters/customers-and-subscriptions' },
                  { text: 'Integrations & Advanced', link: '/hooks/filters/integrations-and-advanced' },
                  { text: 'Orders & Payments', link: '/hooks/filters/orders-and-payments' },
                  { text: 'Products & Pricing', link: '/hooks/filters/products-and-pricing' },
                  { text: 'Settings & Configuration', link: '/hooks/filters/settings-and-configuration' },
                ]
             },
            // { text: 'Event System', link: '/hooks/events' }
          ]
        }
      ],
      '/restapi/': buildRestApiSidebar(),
      // '/api/': [
      //   {
      //     text: 'REST API',
      //     items: [
      //       { text: 'Overview', link: '/api/' },
      //       { text: 'Authentication', link: '/api/authentication' },
      //       { text: 'Orders API', link: '/api/orders' },
      //       { text: 'Customers API', link: '/api/customers' },
      //       { text: 'Products API', link: '/api/products' },
      //       { text: 'Subscriptions API', link: '/api/subscriptions' }
      //     ]
      //   },
      //   {
      //     text: 'Pro API',
      //     items: [
      //       { text: 'Licensing API (Pro)', link: '/api/licensing' },
      //       { text: 'Roles & Permissions API (Pro)', link: '/api/roles-permissions' },
      //       { text: 'Order Bump API (Pro)', link: '/api/order-bump' }
      //     ]
      //   }
      // ],
      // '/modules/': [
      //   {
      //     text: 'Modules',
      //     items: [
      //       { text: 'Overview', link: '/modules/' },
      //       { text: 'Payment Methods', link: '/modules/payment-methods' },
      //       { text: 'Shipping', link: '/modules/shipping' },
      //       { text: 'Storage Drivers', link: '/modules/storage' }
      //     ]
      //   },
      //   {
      //     text: 'Pro Modules',
      //     items: [
      //       { text: 'Licensing Module (Pro)', link: '/modules/licensing' },
      //       { text: 'Order Bump Module (Pro)', link: '/modules/order-bump' }
      //     ]
      //   }
      // ],
      // '/guides/': [
      //   {
      //     text: 'Developer Guides',
      //     items: [
      //       { text: 'Overview', link: '/guides/' },
      //       { text: 'Frontend Development', link: '/guides/frontend' },
      //       { text: 'Integration Guide', link: '/guides/integrations' }
      //     ]
      //   }
      // ]
    },

    
    footer: {
      message: 'FluentCart developer documentation',
      copyright: 'Copyright © 2025 FluentCart'
    },
    
    search: {
      provider: 'local'
    },
    
    outline: {
      level: [2, 3],
      label: 'On this page'
    }
  },
  
  // Build hook to copy OpenAPI JSON files to public directory (backup method)
  async buildEnd(siteConfig) {
    const { outDir } = siteConfig
    // Copy from root public/openapi to build output openapi/public/
    // __dirname is .vitepress, so go up one level to project root
    const projectRoot = join(__dirname, '..')
    const sourceDir = join(projectRoot, 'public', 'openapi')
    const targetDir = join(outDir, 'openapi', 'public')
    
    console.log('buildEnd hook running...')
    console.log('Source:', sourceDir)
    console.log('Target:', targetDir)
    
    // Array to store all discovered JSON file paths
    const jsonFiles: string[] = []
    
    // Recursive copy function that also collects file paths
    const copyRecursive = (src: string, dest: string, baseDir: string) => {
      if (!existsSync(src)) {
        console.warn('Source does not exist:', src)
        return
      }
      
      const stats = statSync(src)
      if (stats.isDirectory()) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true })
        }
        const files = readdirSync(src)
        files.forEach(file => {
          // Skip README.md files
          if (file === 'README.md') return
          copyRecursive(join(src, file), join(dest, file), baseDir)
        })
      } else {
        // Only copy JSON files
        if (!src.endsWith('.json')) return
        
        const destDir = dirname(dest)
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true })
        }
        copyFileSync(src, dest)
        
        // Calculate relative path from sourceDir for the manifest
        const relativePath = relative(baseDir, src).replace(/\\/g, '/')
        jsonFiles.push(`/openapi/public/${relativePath}`)
      }
    }
    
    // Copy OpenAPI public files to build output
    if (existsSync(sourceDir)) {
      copyRecursive(sourceDir, targetDir, sourceDir)
      
      // Generate manifest.json with list of all JSON files
      const manifestPath = join(targetDir, 'manifest.json')
      const manifest = {
        files: jsonFiles,
        generated: new Date().toISOString()
      }
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
      
      console.log(`✓ OpenAPI: Copied ${jsonFiles.length} JSON files and generated manifest via buildEnd`)
    } else {
      console.error('✗ Source directory does not exist:', sourceDir)
    }
  }
})

