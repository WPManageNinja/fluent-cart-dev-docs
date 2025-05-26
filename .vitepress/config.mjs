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
        text: 'Payments',
        items: [
          { text: 'Stripe OneTime Payments', link: 'Payments/onetime-payment-stripe' },
          { text: 'PayPal OneTime Payments', link: 'Payments/onetime-payment-paypal' },
          { text: 'Stripe Subscriptions', link: 'Payments/subscription-payment-stripe' },
          { text: 'PayPal Subscriptions', link: 'Payments/subscription-payment-paypal' },
          { text: 'Stripe Refunds', link: 'Payments/refund-payment-stripe' },
          { text: 'PayPal Refunds', link: 'Payments/refund-payment-paypal' },
        ]
      },
      {
        text: 'Licensing',
        items: [
          { text: 'API', link: 'Licensing/api' },
          { text: 'WP Plugin/Themes Updater', link: 'Licensing/wp-themes-plugins-setup.md' },
          {text: 'Product Release And Version Update', link: 'Licensing/product-release-and-version-update.md'}
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
