/// <reference types="node" />

import { defineConfig } from 'vitepress'
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  
  title: "FluentCart Developer Docs",
  description: "Complete developer documentation for FluentCart e-commerce plugin",
  
  head: [
    ['meta', { name: 'theme-color', content: '#136196' }],
    ['script', { src: 'https://cdn.jsdelivr.net/gh/fluent-docai/fluent-bot-chat-widget-open@latest/fluent-bot-chat-widget.umd.js' }],
    ['script', {}, '(function() { function initWidget() { if (typeof FluentBotChatWidget !== "undefined") { FluentBotChatWidget.injectWidget("d5e29b4b-0108-4885-98c8-d1cde76a5b70"); } else { setTimeout(initWidget, 100); } } initWidget(); })();']
  ],
  
  vite: {
    // Ensure JSON files can be imported
    assetsInclude: ['**/*.json'],
    plugins: [
      {
        name: 'copy-openapi-json-files',
        closeBundle() {
          // This runs after the bundle is closed
          // __dirname is .vitepress, so go up one level to project root
          const projectRoot = join(__dirname, '..')
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
                  { text: 'Subscriptions & Licenses', link: '/hooks/actions/subscriptions-and-licenses' },
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
      '/restapi/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'API Overview', link: '/restapi/' }
          ]
        },
        {
          text: 'Orders',
          items: [
            { text: 'List Orders <badge type="tip">GET</badge>', link: '/restapi/operations/orders/list-orders' },
            { text: 'Create Order <badge type="warning">POST</badge>', link: '/restapi/operations/orders/create-order' },
            { text: 'Get Order <badge type="tip">GET</badge>', link: '/restapi/operations/orders/get-order' },
            { text: 'Update Order <badge type="warning">POST</badge>', link: '/restapi/operations/orders/update-order' },
            { text: 'Delete Order <badge type="danger">DELETE</badge>', link: '/restapi/operations/orders/delete-order' },
            { text: 'Mark as Paid <badge type="warning">POST</badge>', link: '/restapi/operations/orders/mark-as-paid' },
            { text: 'Refund Order <badge type="warning">POST</badge>', link: '/restapi/operations/orders/refund-order' },
            { text: 'Update Statuses <badge type="info">PUT</badge>', link: '/restapi/operations/orders/update-statuses' }
          ]
        },
        {
          text: 'Products',
          items: [
            { text: 'List Products <badge type="tip">GET</badge>', link: '/restapi/operations/products/list-products' },
            { text: 'Create Product <badge type="warning">POST</badge>', link: '/restapi/operations/products/create-product' },
            { text: 'Get Product <badge type="tip">GET</badge>', link: '/restapi/operations/products/get-product' },
            { text: 'Update Product Pricing <badge type="warning">POST</badge>', link: '/restapi/operations/products/update-product-pricing' },
            { text: 'Delete Product <badge type="danger">DELETE</badge>', link: '/restapi/operations/products/delete-product' }
          ]
        },
        {
          text: 'Customers',
          items: [
            { text: 'List Customers <badge type="tip">GET</badge>', link: '/restapi/operations/customers/list-customers' },
            { text: 'Create Customer <badge type="warning">POST</badge>', link: '/restapi/operations/customers/create-customer' },
            { text: 'Get Customer <badge type="tip">GET</badge>', link: '/restapi/operations/customers/get-customer' },
            { text: 'Update Customer <badge type="info">PUT</badge>', link: '/restapi/operations/customers/update-customer' }
          ]
        },
        {
          text: 'Coupons',
          items: [
            { text: 'List Coupons <badge type="tip">GET</badge>', link: '/restapi/operations/coupons/list-coupons' },
            { text: 'Create Coupon <badge type="warning">POST</badge>', link: '/restapi/operations/coupons/create-coupon' },
            { text: 'Get Coupon <badge type="tip">GET</badge>', link: '/restapi/operations/coupons/get-coupon' },
            { text: 'Update Coupon <badge type="info">PUT</badge>', link: '/restapi/operations/coupons/update-coupon' },
            { text: 'Delete Coupon <badge type="danger">DELETE</badge>', link: '/restapi/operations/coupons/delete-coupon' },
            { text: 'Apply Coupon <badge type="warning">POST</badge>', link: '/restapi/operations/coupons/apply-coupon' }
          ]
        },
        {
          text: 'Subscriptions',
          items: [
            { text: 'List Subscriptions <badge type="tip">GET</badge>', link: '/restapi/operations/subscriptions/list-subscriptions' },
            { text: 'Get Subscription <badge type="tip">GET</badge>', link: '/restapi/operations/subscriptions/get-subscription' },
            { text: 'Cancel Subscription <badge type="info">PUT</badge>', link: '/restapi/operations/subscriptions/cancel-subscription' },
            { text: 'Reactivate Subscription <badge type="info">PUT</badge>', link: '/restapi/operations/subscriptions/reactivate-subscription' }
          ]
        },
        {
          text: 'Tax',
          items: [
            { text: 'List Tax Classes <badge type="tip">GET</badge>', link: '/restapi/operations/tax/list-tax-classes' },
            { text: 'Create Tax Class <badge type="warning">POST</badge>', link: '/restapi/operations/tax/create-tax-class' }
          ]
        },
        {
          text: 'Shipping',
          items: [
            { text: 'List Shipping Zones <badge type="tip">GET</badge>', link: '/restapi/operations/shipping/list-shipping-zones' }
          ]
        },
        {
          text: 'Settings',
          items: [
            { text: 'Get Store Settings <badge type="tip">GET</badge>', link: '/restapi/operations/settings/get-store-settings' },
            { text: 'Save Store Settings <badge type="warning">POST</badge>', link: '/restapi/operations/settings/save-store-settings' }
          ]
        },
        {
          text: 'Reports',
          items: [
            { text: 'Get Reports Overview <badge type="tip">GET</badge>', link: '/restapi/operations/reports/get-overview' },
            { text: 'Get Quick Order Stats <badge type="tip">GET</badge>', link: '/restapi/operations/reports/quick-order-stats' }
          ]
        },
        {
          text: 'Files',
          items: [
            { text: 'List Files <badge type="tip">GET</badge>', link: '/restapi/operations/files/list-files' },
            { text: 'Upload File <badge type="warning">POST</badge>', link: '/restapi/operations/files/upload-file' }
          ]
        },
        {
          text: 'Dashboard',
          items: [
            { text: 'Get Dashboard Stats <badge type="tip">GET</badge>', link: '/restapi/operations/dashboard/get-dashboard-stats' }
          ]
        },
        {
          text: 'Roles & Permissions',
          items: [
            { text: 'Get Permissions <badge type="tip">GET</badge>', link: '/restapi/operations/roles-permissions/get-permissions' },
            { text: 'Save Permissions <badge type="warning">POST</badge>', link: '/restapi/operations/roles-permissions/save-permissions' }
          ]
        },
        {
          text: 'Integration',
          items: [
            { text: 'List Addons <badge type="tip">GET</badge>', link: '/restapi/operations/integration/list-addons' },
            { text: 'Get Global Settings <badge type="tip">GET</badge>', link: '/restapi/operations/integration/get-global-settings' },
            { text: 'Set Global Settings <badge type="warning">POST</badge>', link: '/restapi/operations/integration/set-global-settings' },
            { text: 'Get Global Feeds <badge type="tip">GET</badge>', link: '/restapi/operations/integration/get-global-feeds' }
          ]
        },
        {
          text: 'Licensing',
          items: [
            { text: 'Get License Line Chart <badge type="tip">GET</badge>', link: '/restapi/operations/licensing/get-license-chart' },
            { text: 'Get License Pie Chart <badge type="tip">GET</badge>', link: '/restapi/operations/licensing/get-license-pie-chart' },
            { text: 'Get License Summary <badge type="tip">GET</badge>', link: '/restapi/operations/licensing/get-license-summary' }
          ]
        },
        {
          text: 'Email Notification',
          items: [
            { text: 'List Notifications <badge type="tip">GET</badge>', link: '/restapi/operations/email-notification/list-notifications' },
            { text: 'Get Notification Details <badge type="tip">GET</badge>', link: '/restapi/operations/email-notification/get-notification' },
            { text: 'Update Notification <badge type="info">PUT</badge>', link: '/restapi/operations/email-notification/update-notification' }
          ]
        }
      ],
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

