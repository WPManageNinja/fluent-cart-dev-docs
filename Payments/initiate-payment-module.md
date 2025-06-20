# Loading Payment Modules

There are three types of implementation available for Payment module:
1. Onsite Checkout: The customer enters their payment details directly on your website. This requires JavaScript from the payment provider (e.g., Stripe.js) to securely handle the card information. 

2. Modal Checkout: The customer clicks a "Pay" button, and a pop-up window (a modal) from the payment provider appears over your site. This also requires the provider's JavaScript to create and manage the pop-up.

3. Hosted Checkout: The customer is redirected away from your site to a page hosted by the payment provider (e.g., PayPal's standard checkout). After paying, they are redirected back. This method is simpler because the payment provider handles everything on their own page, so no special JavaScript is needed on your website.

> [!NOTE]
> Onsite and Modal checkout needs to enqueue the client js file provided from vendor as it will be used to handle payment on the checkout page. Before rendering checkout page all available payment method should render with the required dependency. Except it will throw payment method validation exception on checkout.


## Rendering checkout page
The payment module is loaded from the checkout page. So we need to trigger the hooks from the checkout page before rendering the payment modules.

## 1. Trigger hooks
**Checkout page rendering**

Hook triggered `do_action('fluent_cart/views/checkout_page', $data)` from the checkout page which is loaded from the shortcode `[fluent_cart_checkout]` or from the blocks of the checkout page.

::: details check code for `do_action('fluent_cart/views/checkout_page', $data)`
```php
<?php
namespace FluentCart\App\Hooks\Handlers\ShortCodes;
...
class CheckoutPageHandler
{
    ....
    public function cartCheckout()
    {   .......
        .......
        if ((empty($currentCart) || empty($currentCart->cart_data)) && !$hasInstantCheckoutParam ) {
            // handle empty cart items 
        } else {
            .....
            do_action('fluent_cart/views/checkout_page', [
                'checkout' => $checkoutHelper,
                'addresses' => $userAddresses
            ]);
        }
        .....
    }
}
```
:::

> [!NOTE]
> All the views hooks like `fluent_cart/views/{hooks_slug}` are triggered dynamically from the template manager of FluentCart to add some support for themes.
> You can find the triggered hooks by searching `render_{hooks_slug}` method.
> all templates are available in `/fluent-cart/app/FC/Template/DefaultTemplate/Views/` ( we will discuss the template manager in another docs. )




## 2. Rendering the checkout page form

Checkout page trigger the child component hooks like form, button, payment methods etc to render the complete checkout page.
Let's check how the checkout_page form hook is triggered.

Hook: `fluent_cart/views/checkout_page_checkout_form`

::: details check code for `fluent_cart/views/checkout_page_checkout_form`
```php
namespace FluentCart\App\FC\Template\Concerns\Checkout;

trait CanRenderCheckoutPageViews
{
    .....
    // trigger the checkout_page_checkout_form hook
    public function render_checkout_page($viewData = [])
    {
        .......
        $viewData['show_checkout_form'] = function () use ($viewData, $requiredLoggedIn) {
            if (!$requiredLoggedIn) {
                do_action('fluent_cart/views/checkout_page_checkout_form', $viewData);
            }
        };
        .....
        $this->loadView('checkout/checkout', $viewData);
    }
    ....

    // form render method catch the hook and render the form
    public function render_checkout_page_checkout_form($viewData = [])
    {   .......  
        $viewData['show_payment_methods'] = function () use ($viewData) {
            do_action('fluent_cart/views/checkout_page_payment_methods_wrapper', $viewData);
        };
        .......
        .......
        $this->loadView('checkout/forms/checkout-form', $viewData);
    }
}
```
:::


## 3. Rendering payment methods

The template renderer finally call the method **render_checkout_page_payment_methods_wrapper()** which is used to render the global payment method wrapper considering some validations. 

Initially it will look for all active payment methods then filter out by initial validation.

::: details check code for `fluent_cart/views/checkout_page_checkout_form`
```php
// Hook triggered
public function render_checkout_page_checkout_form($viewData = [])
{   .......  
    $viewData['show_payment_methods'] = function () use ($viewData) {
        do_action('fluent_cart/views/checkout_page_payment_methods_wrapper', $viewData);
    };
    .......
    .......
    $this->loadView('checkout/forms/checkout-form', $viewData);
}

//  Method called
public function render_checkout_page_payment_methods_wrapper($viewData = [])
{
    ....
    $paymentMethods = PaymentMethods::getActiveMethodInstance();
    $paymentMethodMode = 'fluent_cart_payment_method_mode_' . $checkout->getSettings('checkout_method_style');
    ....
    // trigger the payment_methods_title hook
    $viewData['show_title'] = function () {
        do_action('fluent_cart/views/checkout_page_payment_methods_title');
    };
    // check for subscription products
    if (!Arr::has($viewData, 'hasSubscription')) {
        .....
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

:::info
You may check all the hooks by searching the way as we discuss before. we are skipping hooks invoking part now as it's a part of template rendering.
Let's go to directly the root level rendering method for payment module. 
:::

## 4. Load / Enqueue client js
All registered payment modules must extend `FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway` class.

Payment modules can extend the base method `getEnqueueScriptSrc()` and return `src` array which will be enqueued on the checkout page automatically. 

::: details example code for Stripe payment method `getEnqueueScriptSrc()`
```php
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

A user visits the checkout page.
FluentCart starts a chain reaction using hooks:
- Page loading begins `(checkout_page)`.
- The main form is rendered `(checkout_page_checkout_form)`.
- The payment section is rendered `(checkout_page_payment_methods_wrapper)`.
- While building this page, FluentCart asks each active payment gateway (like Stripe) what scripts it needs using the `getEnqueueScriptSrc()` method.
- FluentCart adds all these required scripts to the page.
- The final page is sent to the user's browser, complete with all the HTML and the necessary JavaScript to make the selected payment methods work correctly.

