import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'FluentCart OpenAPI',
  description: 'OpenAPI documentation for FluentCart API',
  
  vite: {
    // Ensure JSON files can be imported
    assetsInclude: ['**/*.json']
  },
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Reference', link: '/api' }
    ],
    
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'API Reference', link: '/api' }
        ]
      },
      {
        text: 'Orders',
        items: [
          {
            items: [
              { text: 'List Orders <badge type="tip">GET</badge>', link: '/operations/orders/list-orders' },
              { text: 'Create Order <badge type="warning">POST</badge>', link: '/operations/orders/create-order' },
              { text: 'Get Order <badge type="tip">GET</badge>', link: '/operations/orders/get-order' },
              { text: 'Update Order <badge type="warning">POST</badge>', link: '/operations/orders/update-order' },
              { text: 'Delete Order <badge type="danger">DELETE</badge>', link: '/operations/orders/delete-order' },
              { text: 'Mark as Paid <badge type="warning">POST</badge>', link: '/operations/orders/mark-as-paid' },
              { text: 'Refund Order <badge type="warning">POST</badge>', link: '/operations/orders/refund-order' },
              { text: 'Update Statuses <badge type="info">PUT</badge>', link: '/operations/orders/update-statuses' }
            ]
          }
        ]
      },
      {
        text: 'Products',
        items: [
          {
            items: [
              { text: 'List Products <badge type="tip">GET</badge>', link: '/operations/products/list-products' },
              { text: 'Create Product <badge type="warning">POST</badge>', link: '/operations/products/create-product' },
              { text: 'Get Product <badge type="tip">GET</badge>', link: '/operations/products/get-product' },
              { text: 'Update Product Pricing <badge type="warning">POST</badge>', link: '/operations/products/update-product-pricing' },
              { text: 'Delete Product <badge type="danger">DELETE</badge>', link: '/operations/products/delete-product' }
            ]
          }
        ]
      },
      {
        text: 'Customers',
        items: [
          {
            items: [
              { text: 'List Customers <badge type="tip">GET</badge>', link: '/operations/customers/list-customers' },
              { text: 'Create Customer <badge type="warning">POST</badge>', link: '/operations/customers/create-customer' },
              { text: 'Get Customer <badge type="tip">GET</badge>', link: '/operations/customers/get-customer' },
              { text: 'Update Customer <badge type="info">PUT</badge>', link: '/operations/customers/update-customer' }
            ]
          }
        ]
      },
      {
        text: 'Coupons',
        items: [
          {
            items: [
              { text: 'List Coupons <badge type="tip">GET</badge>', link: '/operations/coupons/list-coupons' },
              { text: 'Create Coupon <badge type="warning">POST</badge>', link: '/operations/coupons/create-coupon' },
              { text: 'Get Coupon <badge type="tip">GET</badge>', link: '/operations/coupons/get-coupon' },
              { text: 'Update Coupon <badge type="info">PUT</badge>', link: '/operations/coupons/update-coupon' },
              { text: 'Delete Coupon <badge type="danger">DELETE</badge>', link: '/operations/coupons/delete-coupon' },
              { text: 'Apply Coupon <badge type="warning">POST</badge>', link: '/operations/coupons/apply-coupon' }
            ]
          }
        ]
      },
      {
        text: 'Subscriptions',
        items: [
          {
            items: [
              { text: 'List Subscriptions <badge type="tip">GET</badge>', link: '/operations/subscriptions/list-subscriptions' },
              { text: 'Get Subscription <badge type="tip">GET</badge>', link: '/operations/subscriptions/get-subscription' },
              { text: 'Cancel Subscription <badge type="info">PUT</badge>', link: '/operations/subscriptions/cancel-subscription' },
              { text: 'Reactivate Subscription <badge type="info">PUT</badge>', link: '/operations/subscriptions/reactivate-subscription' }
            ]
          }
        ]
      },
      {
        text: 'Tax',
        items: [
          {
            items: [
              { text: 'List Tax Classes <badge type="tip">GET</badge>', link: '/operations/tax/list-tax-classes' },
              { text: 'Create Tax Class <badge type="warning">POST</badge>', link: '/operations/tax/create-tax-class' }
            ]
          }
        ]
      },
      {
        text: 'Shipping',
        items: [
          {
            items: [
              { text: 'List Shipping Zones <badge type="tip">GET</badge>', link: '/operations/shipping/list-shipping-zones' }
            ]
          }
        ]
      },
      {
        text: 'Settings',
        items: [
          {
            items: [
              { text: 'Get Store Settings <badge type="tip">GET</badge>', link: '/operations/settings/get-store-settings' },
              { text: 'Save Store Settings <badge type="warning">POST</badge>', link: '/operations/settings/save-store-settings' }
            ]
          }
        ]
      },
      {
        text: 'Reports',
        items: [
          {
            items: [
              { text: 'Get Reports Overview <badge type="tip">GET</badge>', link: '/operations/reports/get-overview' },
              { text: 'Get Quick Order Stats <badge type="tip">GET</badge>', link: '/operations/reports/quick-order-stats' }
            ]
          }
        ]
      },
      {
        text: 'Files',
        items: [
          {
            items: [
              { text: 'List Files <badge type="tip">GET</badge>', link: '/operations/files/list-files' },
              { text: 'Upload File <badge type="warning">POST</badge>', link: '/operations/files/upload-file' }
            ]
          }
        ]
      },
      {
        text: 'Dashboard',
        items: [
          {
            items: [
              { text: 'Get Dashboard Stats <badge type="tip">GET</badge>', link: '/operations/dashboard/get-dashboard-stats' }
            ]
          }
        ]
      },
      {
        text: 'Roles & Permissions',
        items: [
          {
            items: [
              { text: 'Get Permissions <badge type="tip">GET</badge>', link: '/operations/roles-permissions/get-permissions' },
              { text: 'Save Permissions <badge type="warning">POST</badge>', link: '/operations/roles-permissions/save-permissions' }
            ]
          }
        ]
      },
      {
        text: 'Integration',
        items: [
          {
            items: [
              { text: 'List Addons <badge type="tip">GET</badge>', link: '/operations/integration/list-addons' },
              { text: 'Get Global Settings <badge type="tip">GET</badge>', link: '/operations/integration/get-global-settings' },
              { text: 'Set Global Settings <badge type="warning">POST</badge>', link: '/operations/integration/set-global-settings' },
              { text: 'Get Global Feeds <badge type="tip">GET</badge>', link: '/operations/integration/get-global-feeds' }
            ]
          }
        ]
      },
      {
        text: 'Licensing',
        items: [
          {
            items: [
              { text: 'Get License Line Chart <badge type="tip">GET</badge>', link: '/operations/licensing/get-license-chart' },
              { text: 'Get License Pie Chart <badge type="tip">GET</badge>', link: '/operations/licensing/get-license-pie-chart' },
              { text: 'Get License Summary <badge type="tip">GET</badge>', link: '/operations/licensing/get-license-summary' }
            ]
          }
        ]
      },
      {
        text: 'Email Notification',
        items: [
          {
            items: [
              { text: 'List Notifications <badge type="tip">GET</badge>', link: '/operations/email-notification/list-notifications' },
              { text: 'Get Notification Details <badge type="tip">GET</badge>', link: '/operations/email-notification/get-notification' },
              { text: 'Update Notification <badge type="info">PUT</badge>', link: '/operations/email-notification/update-notification' }
            ]
          }
        ]
      }
    ],
    
    // Disable the right sidebar (table of contents) globally
    outline: false
  }
})
