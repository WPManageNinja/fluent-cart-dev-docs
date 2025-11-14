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
              { text: 'List Orders (GET)', link: '/operations/orders/list-orders' },
              { text: 'Create Order', link: '/operations/orders/create-order' },
              { text: 'Get Order', link: '/operations/orders/get-order' },
              { text: 'Update Order', link: '/operations/orders/update-order' },
              { text: 'Delete Order', link: '/operations/orders/delete-order' },
              { text: 'Mark as Paid', link: '/operations/orders/mark-as-paid' },
              { text: 'Refund Order', link: '/operations/orders/refund-order' },
              { text: 'Update Statuses', link: '/operations/orders/update-statuses' }
            ]
          }
        ]
      },
      {
        text: 'Products',
        items: [
          {
            items: [
              { text: 'List Products (GET)', link: '/operations/products/list-products' },
              { text: 'Create Product', link: '/operations/products/create-product' },
              { text: 'Get Product', link: '/operations/products/get-product' },
              { text: 'Update Product Pricing', link: '/operations/products/update-product-pricing' },
              { text: 'Delete Product', link: '/operations/products/delete-product' }
            ]
          }
        ]
      },
      {
        text: 'Customers',
        items: [
          {
            items: [
              { text: 'List Customers (GET)', link: '/operations/customers/list-customers' },
              { text: 'Create Customer', link: '/operations/customers/create-customer' },
              { text: 'Get Customer', link: '/operations/customers/get-customer' },
              { text: 'Update Customer', link: '/operations/customers/update-customer' }
            ]
          }
        ]
      },
      {
        text: 'Coupons',
        items: [
          {
            items: [
              { text: 'List Coupons (GET)', link: '/operations/coupons/list-coupons' },
              { text: 'Create Coupon', link: '/operations/coupons/create-coupon' },
              { text: 'Get Coupon', link: '/operations/coupons/get-coupon' },
              { text: 'Update Coupon', link: '/operations/coupons/update-coupon' },
              { text: 'Delete Coupon', link: '/operations/coupons/delete-coupon' },
              { text: 'Apply Coupon', link: '/operations/coupons/apply-coupon' }
            ]
          }
        ]
      },
      {
        text: 'Subscriptions',
        items: [
          {
            items: [
              { text: 'List Subscriptions (GET)', link: '/operations/subscriptions/list-subscriptions' },
              { text: 'Get Subscription', link: '/operations/subscriptions/get-subscription' },
              { text: 'Cancel Subscription', link: '/operations/subscriptions/cancel-subscription' },
              { text: 'Reactivate Subscription', link: '/operations/subscriptions/reactivate-subscription' }
            ]
          }
        ]
      },
      {
        text: 'Tax',
        items: [
          {
            items: [
              { text: 'List Tax Classes (GET)', link: '/operations/tax/list-tax-classes' },
              { text: 'Create Tax Class', link: '/operations/tax/create-tax-class' }
            ]
          }
        ]
      },
      {
        text: 'Shipping',
        items: [
          {
            items: [
              { text: 'List Shipping Zones (GET)', link: '/operations/shipping/list-shipping-zones' }
            ]
          }
        ]
      },
      {
        text: 'Settings',
        items: [
          {
            items: [
              { text: 'Get Store Settings (GET)', link: '/operations/settings/get-store-settings' },
              { text: 'Save Store Settings', link: '/operations/settings/save-store-settings' }
            ]
          }
        ]
      },
      {
        text: 'Reports',
        items: [
          {
            items: [
              { text: 'Get Reports Overview (GET)', link: '/operations/reports/get-overview' },
              { text: 'Get Quick Order Stats (GET)', link: '/operations/reports/quick-order-stats' }
            ]
          }
        ]
      },
      {
        text: 'Files',
        items: [
          {
            items: [
              { text: 'List Files (GET)', link: '/operations/files/list-files' },
              { text: 'Upload File', link: '/operations/files/upload-file' }
            ]
          }
        ]
      },
      {
        text: 'Dashboard',
        items: [
          {
            items: [
              { text: 'Get Dashboard Stats (GET)', link: '/operations/dashboard/get-dashboard-stats' }
            ]
          }
        ]
      },
      {
        text: 'Roles & Permissions',
        items: [
          {
            items: [
              { text: 'Get Permissions (GET)', link: '/operations/roles-permissions/get-permissions' },
              { text: 'Save Permissions', link: '/operations/roles-permissions/save-permissions' }
            ]
          }
        ]
      },
      {
        text: 'Integration',
        items: [
          {
            items: [
              { text: 'List Addons (GET)', link: '/operations/integration/list-addons' },
              { text: 'Get Global Settings (GET)', link: '/operations/integration/get-global-settings' },
              { text: 'Set Global Settings', link: '/operations/integration/set-global-settings' },
              { text: 'Get Global Feeds (GET)', link: '/operations/integration/get-global-feeds' }
            ]
          }
        ]
      },
      {
        text: 'Licensing',
        items: [
          {
            items: [
              { text: 'Get License Line Chart (GET)', link: '/operations/licensing/get-license-chart' },
              { text: 'Get License Pie Chart (GET)', link: '/operations/licensing/get-license-pie-chart' },
              { text: 'Get License Summary (GET)', link: '/operations/licensing/get-license-summary' }
            ]
          }
        ]
      },
      {
        text: 'Email Notification',
        items: [
          {
            items: [
              { text: 'List Notifications (GET)', link: '/operations/email-notification/list-notifications' },
              { text: 'Get Notification Details (GET)', link: '/operations/email-notification/get-notification' },
              { text: 'Update Notification', link: '/operations/email-notification/update-notification' }
            ]
          }
        ]
      }
    ],
    
    // Disable the right sidebar (table of contents) globally
    outline: false
  }
})
