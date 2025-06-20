# Payment Flow Overview

This document outlines the payment processing flow in FluentCart, which begins immediately after an order is placed. The flow is initiated by the `makePayment` method within the specific payment gateway being used.

> [!NOTE]
> This document covers the payment processing that happens *after* a customer submits the checkout form. For information on how payment methods are initially loaded and displayed on the checkout page, please see the [Loading Payment Modules](initiate-payment-module.md) documentation.

## High-Level Payment Flow

The payment process involves a coordinated effort between the backend (your server) and the frontend (the customer's browser), and sometimes a third-party hosted page.

1.  **Backend: Trigger Payment**: The checkout process calls the `makePayment` method on the selected payment gateway.
2.  **Backend: Prepare for Payment**: The `makePayment` method gathers order details (customer, items, amount) and communicates with the payment provider's API to create a payment session or intent.
3.  **Backend to Frontend**: The backend sends a response to the frontend.
    *   For **onsite/modal payments**, this is typically a client secret or token for the frontend to use.
    *   For **hosted checkouts**, this is a redirect URL.
4.  **Frontend: Handle Payment**: The frontend JavaScript handles the payment.
    *   For **onsite/modal payments**, it uses the provider's JS library (e.g., Stripe.js) to securely collect payment details and confirm the payment.
    *   For **hosted checkouts**, it redirects the user to the provider's page.
5.  **Frontend to Backend: Verify Payment**: After a successful client-side transaction, the frontend sends a request to the backend with a transaction identifier.
6.  **Backend: Confirm Payment**: The backend securely verifies the transaction status with the payment provider using the identifier.
7.  **Backend: Finalize Order**: The backend updates the order status, records the transaction, and dispatches final events.
8.  **Frontend: Redirect to Success**: The user is redirected to the order confirmation page.

---

## Step 1: Triggering the Payment (Backend)

The payment flow begins in the `placeOrder` method of `FluentCart\Api\Checkout\CheckoutApi.php`. After the order is created and saved, this method calls `finalizeOrder`, which retrieves the selected payment gateway instance and invokes its `makePayment` method.

::: details Code Example: Initiating `makePayment`
```php
// In FluentCart\Api\Checkout\CheckoutApi.php

private static function finalizeOrder($orderHelper, $orderData, CartCheckoutHelper $cartCheckoutHelper, $userTz = 'UTC')
{
    // ...
    // The payment method has already been validated in the placeOrder method.
    $gateway = App::gateway(sanitize_text_field($orderHelper->order->payment_method));
    $gateway->makePayment($orderHelper);
}
```
:::

## Step 2: Processing the Payment with `makePayment` (Backend)

The `makePayment` method is the core of every payment gateway. All gateways must extend `AbstractPaymentGateway` and implement this method. It receives an `OrderHelper` object, which contains all the necessary data for the transaction.

-   **Customer**: `$orderHelper->customer`
-   **Order**: `$orderHelper->order`
-   **OneTime Items**: `$orderHelper->items`
-   **Subscription Items**: `$orderHelper->subscriptionItems`
-   **Payable Amount**: `$orderHelper->payableAmount`
-   **Draft Transaction**: `$orderHelper->transactions->first()`

Inside `makePayment`, you will prepare the data according to your payment provider's requirements and make an API request to them to initiate the payment.

::: details Example: Stripe `makePayment` Implementation
The Stripe gateway's `makePayment` method prepares an array of arguments for the Stripe API. It then determines whether the cart contains a one-time purchase or a subscription and calls the appropriate handler.

```php
// In FluentCart\App\Modules\PaymentMethods\Stripe\Stripe.php

public function makePayment($orderHelper)
{
    $hash = $this->resolveOrderHash($orderHelper);
    // ...
    $paymentArgs = [
        'client_reference_id' => $hash,
        'items'               => $orderHelper->items,
        'amount'              => (int)$dueAmount,
        'currency'            => strtolower($orderHelper->order->currency),
        'description'         => "Payment for Order",
        'customer_email'      => $orderHelper->customer->email,
        'success_url'         => $this->getSuccessUrl($transaction),
    ];
    
    // ...

    if (empty($orderHelper->subscriptionItems)) {
        // Handle a standard, one-time payment
        $this->handleOnsitePaymentOnetime($orderHelper, $paymentArgs, $apiKey);
    } else {
        // Handle a subscription payment via an addon
        do_action('fluent_cart/payment/stripe_subscription_onsite', $orderHelper, $paymentArgs, $apiKey);
    }
}
```
The `handleOnsitePaymentOnetime` method then makes the actual API call to Stripe to create a `payment_intent`. After a successful API call, it updates the transaction record with the `vendor_charge_id` from Stripe and sends a JSON response to the frontend.

```php
// In FluentCart\App\Modules\PaymentMethods\Stripe\Stripe.php

public function handleOnsitePaymentOnetime($orderHelper, $paymentArgs, $apiKey)
{
    // ... Create customer, prepare session data ...

    try {
        // Create the Payment Intent via Stripe API
        $intent = (new API())->makeRequest('payment_intents', $sessionData, $apiKey, 'POST');
        
        // ...
        
        // Store the Stripe Intent ID in our database
        $this->updateVendorChargeId($orderHelper, $intent);

        // Send a success response back to the frontend
        wp_send_json_success(
            [
                'nextAction'   => 'stripe', // Identifies the payment gateway
                'actionName'   => 'custom', // Tells the frontend to expect custom JS handling
                'status'       => 'success',
                'message'      => __('Order has been placed successfully', 'fluent-cart'),
                'data'         => $orderHelper,
                'payment_args' => $paymentArgs,
                'response'     => $intent // Contains the client_secret
            ],
            200
        );
    } catch (\Exception $e) {
        // Handle API errors
    }
}
```
:::

## Step 3: Handling Onsite Payments (Frontend)

For onsite or modal checkouts, the backend sends a response to the frontend to continue the process. The main checkout handler in FluentCart dispatches a custom event based on the `nextAction` property from the backend response.

```js
// In FluentCartCheckoutHandler.js
window.dispatchEvent(
    new CustomEvent(
        "fluent_cart_payment_next_action_" + response.data.nextAction, 
        { detail: { response: response } }
    )
);
```

Your payment gateway's JavaScript file must listen for this event to take over. For Stripe, this event would be `fluent_cart_payment_next_action_stripe`.

::: details Example: Stripe `stripe-checkout.js`
The Stripe JavaScript file listens for the event and uses the `client_secret` from the backend response to confirm the payment using Stripe.js.

```js
// In fluent-cart/resources/public/payment-methods/stripe-checkout.js

window.addEventListener("fluent_cart_payment_next_action_stripe", (event) => {
    const response = event.detail.response;
    const clientSecret = response.data.response.client_secret;
    const successUrl = response.data.payment_args.success_url;
    
    // Use the provider's JS SDK to confirm the payment
    stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
            return_url: successUrl
        },
        redirect: 'if_required'
    }).then((result) => {
        if (result.error) {
            // Handle payment error on the client side
        } else {
            // Payment succeeded on the client. Now, verify on the server.
            const intentId = result.paymentIntent?.id;
            if (intentId) {
                // ... (Proceed to Step 4) ...
            }
        }
    });
});
```
:::

## Step 4: Confirming the Payment (Backend Verification)

After the payment is successfully handled by the client-side JavaScript, it's crucial to securely verify the payment status with the provider from your backend. This prevents tampering and confirms the funds have been transferred.

The frontend script should make an AJAX request to a custom WordPress action, sending the unique transaction identifier (e.g., Stripe's Payment Intent ID).

::: details Example: Stripe Payment Confirmation
The `stripe-checkout.js` makes a POST request to the `fluent_cart_confirm_stripe_payment` action.

```js
// In stripe-checkout.js, inside the .then() block from Step 3

if (intentId) {
    jQuery.post(window.fluentcart_checkout_vars.ajaxurl, {
        action: 'fluent_cart_confirm_stripe_payment',
        intentId: intentId
    }).then((response) => {
        // Redirect to the success URL provided by the backend
        window.location.href = successUrl;
    }).catch(error => {
        // Handle verification error
    });
}
```

The backend hooks this action, retrieves the charge from the provider's API, validates it, and updates the transaction and order status accordingly.

```php
// In FluentCart\App\Modules\PaymentMethods\Stripe\Stripe.php

// Register the AJAX action
add_action('wp_ajax_fluent_cart_confirm_stripe_payment', [$this, 'confirmStripePayment']);

public function confirmStripePayment()
{
    $intentId = sanitize_text_field($_REQUEST['intentId']);
    // ...
    // Verify the transaction directly with the Stripe API
    $response = $api->makeRequest('payment_intents/' . $intentId, [], (new StripeSettings())->getApiKey());
    // ...
    
    // Find our transaction record using the vendor charge ID
    $transaction = OrderTransaction::query()->where('vendor_charge_id', Arr::get($response, 'id'))->first();
    // ...
    
    // Update the order status, paid amount, etc.
    $this->updateOrderDataByOrder($order, $updateData, $transaction);
}
```
:::

## Step 5: Finalizing the Order and Dispatching Events (Backend)

The final step is to update the order status and dispatch events. The `updateOrderDataByOrder` method handles this. It sets the order status to **processing** (for physical goods) or **completed** (for digital goods) and updates the total amount paid.

Finally, it fires several actions that other plugins or themes can use.

-   `do_action('fluent_cart/payment_paid', $order);`: A generic hook that runs when any payment is successfully completed.
-   `do_action('fluent_cart/payment/after_payment_{paymentStatus}', $order);`: A dynamic hook based on the payment status (e.g., `paid`, `pending`, `failed`).

After the backend verification is complete, the frontend JavaScript redirects the user to the success page.

## Handling Hosted Checkouts

For hosted checkouts (e.g., PayPal Standard), the flow is simpler:
1.  In `makePayment`, your gateway generates a unique checkout URL for the provider.
2.  Instead of returning JSON, your backend response instructs the frontend to redirect to this URL. For example: `wp_send_json_success(['actionName' => 'redirect', 'redirect_url' => $payPalUrl]);`
3.  The user completes payment on the provider's site and is redirected back to a `return_url` you specified.
4.  Payment confirmation often happens via a separate webhook/IPN (Instant Payment Notification) from the provider, which you must handle to verify the payment and update the order status. The verification steps are similar to Step 4, but are triggered by the provider's server instead of the user's browser.

