# Initiate Payment Modules

There are three types of implementation available for Payment module:
1. Onsite Checkout : client js is required
2. Modal Checkout : client js is required
3. Hosted Checkout: no client js needed

Except Hosted Checkout both Onsite and Modal needs to enqueue the client js file provided from vendor. Before rendering checkout page all available payment method should render with the required dependency. Except it will throw payment method validation exception on checkout.


## 1. Rendering Payment Methods
Let's start from the checkout page rendering method **cartCheckout**. which is called before the checkout page load from the shortcode `[fluent_cart_checkout]`

Here the hook triggered `do_action('fluent_cart/views/checkout_page', $data)` from the shortcode.

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

> [!NOTE]
> All the views hooks like `fluent_cart/views/{hooks_slug}` are triggered dynamically from the template manager of FluentCart to add some support for themes.
> You can find the triggered hooks by searching `render_{hooks_slug}` method.
> all templates are available in `/fluent-cart/app/FC/Template/DefaultTemplate/Views/` ( we will discuss the template manager in another docs. )


Let's hook the checkout_page from **render_checkout_page($viewData)** method from **\FC\Template\Concerns\Checkout\CanRenderCheckoutPageViews**

```php
namespace FluentCart\App\FC\Template\Concerns\Checkout;

trait CanRenderCheckoutPageViews
{
    .....
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
}
```

Let's enter the checkout form renderer method **render_checkout_page_checkout_form()** in **CanRenderCheckoutPageViews** class
where `checkout_page_payment_methods_wrapper`
### CanRenderCheckoutPageViews:
```php
public function render_checkout_page_checkout_form($viewData = [])
{   .......  
    $viewData['show_payment_methods'] = function () use ($viewData) {
        do_action('fluent_cart/views/checkout_page_payment_methods_wrapper', $viewData);
    };
    .......
    .......
    $this->loadView('checkout/forms/checkout-form', $viewData);
}
```

the hook finally called the method **render_checkout_page_payment_methods_wrapper()** which is used to render the global payment method wrapper 
considering some validations. Initially it will look for all active payment methods then filter out by initial validation. Like, subscription products checkout, 
it will check for the payment method support for subscriptions. Except throw the error on checkout form. 


You may check all the hooks by searching the way as we discuss before. we are skipping hooks invoking part now as it's a part of template rendering.
Let's go to directly the root level rendering method for payment module. 

### Load client js for individual payment methods:
All the registered payment method extends BasePaymentMethod class which can be hooked by **before_render_payment_method**.
The method **beforeRenderPaymentMethod()** called from individual payment module like Stripe, PayPal etc. 

This is the method where we can load our individual payment module specific scripts if required.

```php
namespace FluentCart\App\Modules\PaymentMethods;
.....
abstract class BasePaymentMethod implements BasePaymentInterface
{
public function init()
{
    .....
    add_action('fluent_cart/payment/prepare_payment_method_' . $this->slug, [$this, 'prepare'], 10, 3);
    add_action('fluent_cart/before_render_payment_method_' . $this->slug, [$this, 'beforeRenderPaymentMethod'], 10, 2);
    .....
}

public function prepare($method, $mode, $hasSubscription)
{
    do_action('fluent_cart/before_render_payment_method_' . $this->slug, $method, $hasSubscription);
    $this->render($method, $mode);
    do_action('fluent-cart/after_render_payment_method_' . $this->slug, $method);
}

public function beforeRenderPaymentMethod($method, $hasSubscription): void
{
    $this->enqueue($hasSubscription);
}
```

### Let's see an example for stripe:
Stripe hooked the beforeRender by `before_render_payment_method_stripe` to load all necessary scripts.

```php
class StripePayment extends BasePaymentMethod
{
    public function __construct()
    {   ....
        add_action('fluent-cart/before_render_payment_method_' . $this->slug, [$this, 'loadCheckoutJs'], 10, 1);
    }

}
```


