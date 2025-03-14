import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Fluent Cart Developer Docs",
  description: "A developer docs for Fluent Cart WordPress plugin",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'All Docs', link: 'CoreDocs/checkout-flow' }
    ],

    sidebar: [
      {
        text: 'Core Docs',
        items: [
          { text: 'Checkout Flow', link: 'CoreDocs/checkout-flow' },
          { text: 'Payment Flow', link: 'CoreDocs/payment-flow' },
          { text: 'Initiating Payment Module', link: 'CoreDocs/initiate-payment-module.md' },        
        ]
      },
      {
        text: 'Subscriptions',
        items: [
          { text: 'Introduction', link: 'Subscriptions/introduction' },
        ]
      },
      {
        text: 'Licensing',
        items: [
          { text: 'API', link: 'Licensing/api' },
          { text: 'WP Plugin/Themes Updater', link: 'Licensing/wp-themes-plugins-setup.md' },
        ]
      },
      {
        text: 'Database Design',
        items: [
          { text: 'DB Design (dbdocs.io)', link: 'https://dbdocs.io/project/fluent-cart' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wpmanageninja/fluent-cart' }
    ]
  }
})
