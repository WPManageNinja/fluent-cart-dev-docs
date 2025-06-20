# Loading Payment Modules

When a customer proceeds to checkout, FluentCart dynamically loads the available payment modules. This process is primarily driven by a series of WordPress hooks. This document explains the different checkout implementations and the step-by-step rendering process.

## Checkout Types

FluentCart supports three types of checkout implementations for payment modules:

1.  **Onsite Checkout**: The customer enters their payment details directly on your website. This requires JavaScript from the payment provider (e.g., Stripe.js) to securely handle the card information.
2.  **Modal Checkout**: The customer clicks a "Pay" button, and a pop-up window (a modal) from the payment provider appears over your site. This also requires the provider's JavaScript to create and manage the pop-up.
3.  **Hosted Checkout**: The customer is redirected to a page hosted by the payment provider (e.g., PayPal's standard checkout). After payment, they are redirected back to your site. This method is simpler as the payment provider handles all payment processing on their page.

> [!IMPORTANT]
> For **Onsite** and **Modal** checkouts, your payment module must enqueue the necessary JavaScript files from the payment provider. These scripts are essential for handling payments on the checkout page. Failing to enqueue required scripts will result in a payment method validation exception during checkout.

## Checkout Page Rendering Flow

FluentCart uses a hook-based system to render the checkout page. The process starts when a user visits a page with the `[fluent_cart_checkout]` shortcode. Here's a step-by-step breakdown of how payment modules are loaded.

## Step 1: Initializing the Checkout Page

The rendering process begins with the `fluent_cart/views/checkout_page` hook. This action is triggered to start rendering the main checkout page components.

::: details Code Example: Triggering `checkout_page` hook
```php
<?php
namespace FluentCart\App\Hooks\Handlers\ShortCodes;
// ...
class CheckoutPageHandler
{
    // ...
    public function cartCheckout()
    {   // ...
        if ((empty($currentCart) || empty($currentCart->cart_data)) && !$hasInstantCheckoutParam ) {
            // handle empty cart items 
        } else {
            // ...
            do_action('fluent_cart/views/checkout_page', [
                'checkout' => $checkoutHelper,
                'addresses' => $userAddresses
            ]);
        }
        // ...
    }
}
```
:::

> [!NOTE]
> All view-related hooks in FluentCart, like `fluent_cart/views/{hook_slug}`, are triggered dynamically by the template manager. You can typically find the code that fires a specific hook by searching for a `render_{hook_slug}` method in the codebase. All templates are available in `/fluent-cart/app/FC/Template/DefaultTemplate/Views/`.

## Step 2: Rendering the Checkout Form

Next, the `fluent_cart/views/checkout_page_checkout_form` hook is fired. This hook is responsible for rendering the main checkout form, which includes fields for customer information and the payment selection area.

::: details Code Example: Rendering the Checkout Form
```php
<?php
namespace FluentCart\App\FC\Template\Concerns\Checkout;

trait CanRenderCheckoutPageViews
{
    // ...
    // trigger the checkout_page_checkout_form hook
    public function render_checkout_page($viewData = [])
    {
        // ...
        $viewData['show_checkout_form'] = function () use ($viewData, $requiredLoggedIn) {
            if (!$requiredLoggedIn) {
                do_action('fluent_cart/views/checkout_page_checkout_form', $viewData);
            }
        };
        // ...
        $this->loadView('checkout/checkout', $viewData);
    }
    // ...

    // form render method catches the hook and renders the form
    public function render_checkout_page_checkout_form($viewData = [])
    {   // ...
        $viewData['show_payment_methods'] = function () use ($viewData) {
            do_action('fluent_cart/views/checkout_page_payment_methods_wrapper', $viewData);
        };
        // ...
        $this->loadView('checkout/forms/checkout-form', $viewData);
    }
}
```
:::

## Step 3: Displaying Payment Methods

Within the checkout form, the `fluent_cart/views/checkout_page_payment_methods_wrapper` hook is called. This function is responsible for rendering the payment method section. It retrieves all active payment gateways and filters them based on initial validation rules.

This wrapper then triggers other hooks to render the title and the list of payment methods.

::: details Code Example: Rendering the Payment Methods Wrapper
```php
// Hook triggered from render_checkout_page_checkout_form
public function render_checkout_page_checkout_form($viewData = [])
{   // ...  
    $viewData['show_payment_methods'] = function () use ($viewData) {
        do_action('fluent_cart/views/checkout_page_payment_methods_wrapper', $viewData);
    };
    // ...
    $this->loadView('checkout/forms/checkout-form', $viewData);
}

// Method that renders the payment methods wrapper
public function render_checkout_page_payment_methods_wrapper($viewData = [])
{
    // ...
    $paymentMethods = PaymentMethods::getActiveMethodInstance();
    $paymentMethodMode = 'fluent_cart_payment_method_mode_' . $checkout->getSettings('checkout_method_style');
    // ...
    // trigger the payment_methods_title hook
    $viewData['show_title'] = function () {
        do_action('fluent_cart/views/checkout_page_payment_methods_title');
    };
    // check for subscription products
    if (!Arr::has($viewData, 'hasSubscription')) {
        // ...
        $viewData['hasSubscription'] = $hasSubscription;
    }

    // trigger the payment_method_list hook
    $viewData['show_payment_method_list'] = function () use ($viewData) {
        do_action('fluent_cart/views/checkout_page_payment_method_list', $viewData);
    };

    $viewData['show_empty_payment_message'] = function () use ($viewData) {
        // empty payment method messages will be rendered here
    };

    // load the payment method wrapper view
    $this->loadView('checkout/payment-methods/wrapper', $viewData);
}
```
:::

## Step 4: Enqueuing Payment Gateway Scripts

This is a critical step for developers building a payment module. All payment gateway classes must extend `FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway`.

To add provider-specific JavaScript (for Onsite or Modal checkouts), you need to implement the `getEnqueueScriptSrc()` method in your payment gateway class. This method should return an array of script details that FluentCart will automatically enqueue on the checkout page.

::: details Example: `getEnqueueScriptSrc()` for Stripe
```php
<?php
class Stripe extends AbstractPaymentGateway
{
  public function getEnqueueScriptSrc($hasSubscription = 'no'): array
    {
        // return the script sources for the payment method
        return [
            [
                'handle' => 'fluent-cart-checkout-sdk-stripe',
                'src' => 'https://js.stripe.com/v3/',
            ],
            // enqueue other scripts if required
            [
                'handle' => 'fluent-cart-checkout-handler-stripe',
                'src' => Vite::getEnqueuePath('public/payment-methods/stripe-checkout.js'),
                'deps' => ['fluent-cart-checkout-sdk-stripe']
            ]
        ];
    }
}
```
:::

## Summary of the Flow

Here is a summary of the entire process:

1.  A user visits the checkout page.
2.  FluentCart triggers a sequence of hooks to build the page:
    - `checkout_page` starts the page rendering.
    - `checkout_page_checkout_form` renders the main form.
    - `checkout_page_payment_methods_wrapper` renders the payment section.
3.  While rendering, FluentCart calls `getEnqueueScriptSrc()` on each active payment gateway (like Stripe) to collect required scripts.
4.  FluentCart adds all the collected scripts to the page.
5.  The complete HTML page, along with all necessary JavaScript for the payment methods, is sent to the user's browser.

