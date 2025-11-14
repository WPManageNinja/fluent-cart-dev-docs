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
      }
    ],
    
    // Disable the right sidebar (table of contents) globally
    outline: false
  }
})
