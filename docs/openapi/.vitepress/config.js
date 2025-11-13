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
        text: 'Operations',
        items: [
          {
            text: 'Files',
            items: [
              { text: 'List Files', link: '/operations/list-files' }
            ]
          },
          {
            text: 'Orders',
            items: [
              { text: 'List Orders', link: '/operations/orders/list-orders' },
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
      }
    ],
    
    // Disable the right sidebar (table of contents) globally
    outline: false
  }
})
