import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  
  title: "FluentCart Developer Docs",
  description: "Complete developer documentation for FluentCart e-commerce plugin",
  
  head: [
    ['meta', { name: 'theme-color', content: '#136196' }]
  ],
  
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
  }
})
