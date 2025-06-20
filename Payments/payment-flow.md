# Payment Flow Overview

After completing the place order process, the payment flow immediately begins, triggering the "makePayment" method from the Order flow.

> [!NOTE]
> There are some actions which begins before the Payment method rendered. This is not part of the payment flow. Check [Initiating/Rendering Payment Method Client before checkout](initiate-payment-module.md).

## 1. Triggering the payment flow

#### The Payment flow starts just after the checkout flow ends

In the `placeOrder` method of `FluentCart\Api\Checkout\CheckoutApi.php` the payment actions starts after finalizing the order other actions.

The specific payment gateway instance is retrieved using `FluentCart\App\App::gateway($methodSlug)` dynamically by passing the method slug. we must have to verify the method availability. We are skipping here cause we already did that in `place_order` method. 

Example for stripe `FluentCart\App\App::gateway('stripe');`


```php
public static function placeOrder(array $data)
{
    ...
   if ($orderHelper instanceof OrderHelper) {
        static::finalizeOrder($orderHelper, $orderData, $cartCheckoutHelper, $userTz);
    } else {
        static::handleOrderError($orderHelper);
    }
}
```

```php
private static function finalizeOrder($orderHelper, $orderData, CartCheckoutHelper $cartCheckoutHelper, $userTz = 'UTC')
{
    ....
    // we don't have to validate the payment method again, as it's already validated in placeOrder method
    $gateway = App::gateway(sanitize_text_field($orderHelper->order->payment_method));
    $gateway->makePayment($orderHelper);
}
```

## 2. `makePayment` method

As the payment method must have to implement the abstract before register, the payment instance have `makePayment` method already. Which will handle the payment process.

Example for stripe payment method:
```php
class Stripe extends AbstractPaymentGateway
{
    public function makePayment(OrderHelper $orderHelper)
    {
        // payment process
    }
}
```


## 3. Prepare data for payment

**makePayment:** method accept $orderHelper `FluentCart\App\Helpers\OrderHelper`, which has all available data for payment.

We can access data just calling the property from $orderHelper instance:

- Customer: `$orderHelper->customer`
- Order: `$orderHelper->order`
- OneTime Items: `$orderHelper->items`
- Subscription Items: `$orderHelper->subscriptionItems`
- Payable Amount: `$orderHelper->payableAmount`
- Draft Transaction: `$orderHelper->transactions->first()`



### Example: Payment process for Stripe

**Lets breakdown **Stripe** payment module backend code for example**

::: details

**Making payment intent**

we have all the available data now, to process payments. we have to call and format the payment module specific data. For an example if we make payment for stripe we have to format data as per stripe documentations. so the data process will be different and not the same for PayPal.


To make payment using onsite embed checkout of stripe we need some info:

- client_reference_id : We use order hash as reference id,
- items : Onetime items we got from checkout,
- amount : Total Due amount to pay
- currency : Currency for payment (ex, USD, EURO...)
- description : Payment description for stripe,
- customer_email : Email address for the customer,
- success_url : After payment success which URL should redirect,

Here we can retrieve those data from orderHelper:
```php
namespace FluentCart\App\Modules\PaymentMethods\Stripe;
........
public function makePayment($orderHelper)
{
    $hash = $this->resolveOrderHash($orderHelper);
    .....
    $paymentArgs = array(
        'client_reference_id' => $hash,
        'items' => $orderHelper->items,
        'amount' => (int)$dueAmount,
        'currency' => strtolower($orderHelper->order->currency),
        'description' => "Payment for Order",
        'customer_email' => $orderHelper->customer->email,
        'success_url' => $this->getSuccessUrl($transaction),
    );
    .....
}
```


**Request for Payment API**

If no subscription items are available, proceed to process the payment for one-time items; otherwise, handle the subscription through the Subscription module.

```php
namespace FluentCart\App\Modules\PaymentMethods\Stripe;
........
public function makePayment($orderHelper)
{
    ......
    if (empty($orderHelper->subscriptionItems)) {
        $paymentArgs['public_key'] = $publicKey;
        $this->handleOnsitePaymentOnetime($orderHelper, $paymentArgs, $apiKey);
    } else {
        // handle from subscription addon
        do_action('fluent_cart/payment/stripe_subscription_onsite', $orderHelper, $paymentArgs, $apiKey);
    }
}
```

Let's check the method for onetime payment :

we have to follow the stripe guideline, we have done a couple things in this method.
- Prepare session data for payment and stripe customer
- **createCustomer:** request to the Stripe API to create customer with customer data
- Log the data and throw necessary error if failed
- **makeRequest:** make final request to create 'payment_intents' on Stripe
- **updateVendorChargeId:** Update the charge id of stripe transaction to transaction table
- Return the in intent data along with **next actions**

    **nextAction:** will be the payment method slug, which may use as frontend hook to do necessary things in client side.
    ```js
    window.dispatchEvent(
        new CustomEvent("fluent_cart_payment_next_action_" + response.data.nextAction,{detail: {response: response,},})
    );
    ```
    **actionName:** is the next actionable things, here 'custom' will trigger a frontend hook to handle from client js side, and 'redirect' will look for the **redirect_url**. redirect_url: is used to handle the hosted redirect payment.

**In summary:** this method creates the Stripe payment intent, logs the payment completion step, and then updates the Transaction table with the intent ID as the vendor charge ID using the updateVendorChargeId method. This ID will be used to validate transaction data received from IPN in the future.

**handleOnsitePaymentOnetime:**

```php
public function handleOnsitePaymentOnetime($orderHelper, $paymentArgs, $apiKey)
{
    //preparing session data

    $customer = $this->createCustomer($orderHelper, $apiKey);

    if (is_wp_error($customer)) {
        //add logs and handle error
    }

    ....

    try {
        $intent = (new API())->makeRequest('payment_intents', $sessionData, $apiKey, 'POST');
        ....
        $this->updateVendorChargeId($orderHelper, $intent);

        wp_send_json_success(
            [
                'nextAction' => 'stripe',
                'actionName' => 'custom',
                'status' => 'success',
                'message' => __('Order has been placed successfully', 'fluent-cart'),
                'data' => $orderHelper,
                'payment_args' => $paymentArgs,
                'response' => $intent
            ],
            200
        );
    } catch (\Exception $e) {
        //send error
    }

}
```

**Updating the vendor transaction Id:**

```php
public function updateVendorChargeId($orderHelper, $intent)
{
    $intentId = Arr::get($intent, 'id', false);
    if (!$intentId) {
        return;
    }

    $orderHelper->transaction
        ->update([
            'vendor_charge_id' => sanitize_text_field($intentId),
            'payment_mode' => sanitize_text_field($orderHelper->order->mode)
        ]);
}
```

:::

After completing the payment data processing for specific payment method, we have to return the response to the client js side
to process onsite payment. Or we have to redirect to the vendor hosted checkout page.



## 4. Charge the payment

This is the step where the payment is charged. This process may vary for different types of payment API.
The common types for all payment modules are:
1. **Onsite embed payment:** which will be handled from client js side on checkout page.
2. **Hosted checkout:** which will be handled from php side and redirect to the provider payment page.
3. **Modal:** it will be handled from client js side on checkout page also.


For onsite embed checkout we have to return like `'ActionName' => 'custom'` and `'nextAction' => 'stripe'` which will dispatch the event when success response is received in **FluentCartCheckoutHandler.js**

**FluentCartCheckoutHandler.js** event dispatch code:

```js
// return the response to the client js side
window.dispatchEvent(
    new CustomEvent(
        "fluent_cart_payment_next_action_" + response.data.nextAction,{detail: {response: response,}}
    )
)
```

Now we have to hook that event from client js to charge the intent that we have returned earlier from [#handleOnsitePaymentOnetime](#handleonsitepaymentonetime).


**Lets breakdown **Stripe** payment module frontend js code for example**

::: details
### stripe-checkout.js

For Stripe we have **stripe-checkout.js** `fluent-cart/resources/public/payment-methods/stripe-checkout.js` file which hooked that event like this:

```js
window.addEventListener("fluent_cart_payment_next_action_stripe",  (data) => {
    .......
});
```

where the data is `detail: {response: response}`, And **response** is the backend response we returned from **handleOnsitePaymentOnetime**

Now retrieve all the response data from intent and charge using Stripe clientJs. The method `confirmIntent(confirmData)` will charge from stripe for the intent we generated. For successful payment we will receive intentId from `result[accessor]?.id;`. Either we have to handle the error response.

```js
window.addEventListener("fluent_cart_payment_next_action_stripe",  (data) => {
    elements.submit().then(result=> {
        const confirmIntent = intentType === "setup" ? stripe.confirmSetup : stripe.confirmPayment;
        const accessor = intentType === "setup" ? 'setupIntent' : 'paymentIntent';
        let confirmData = {
            elements,
                clientSecret,
                confirmParams: {
                    return_url: successUrl
                },
            redirect: 'if_required'
        }
        confirmIntent(confirmData)
            .then((result) => {
                that.paymentLoader?.changeLoaderStatus('confirming');
                const intentId = result[accessor]?.id;
                if (intentId) {
                    // If order complete update the transaction status
                    // make redirection 
            }).catch(error => {
                // handle error
            })
    })
});
```

Lets update the transaction details and mark the transaction as paid.

:::



> [!NOTE]
> This is the example for stripe payment module. The code may vary for other payment modules.




## 5. Confirm the payment

The payment process will handle through the client js.

After a successful transaction we have to verify the transaction from vendor, then update the intent and order info.


**Lets breakdown **Stripe** payment module backend code for example**

::: details
```js
...
if (intentId) {
    that.paymentLoader?.changeLoaderStatus('completed');
    jQuery.post(window.fluentcart_checkout_vars.ajaxurl, {
        action: 'fluent_cart_confirm_stripe_payment',
        intentId: intentId
    }).then((response) => {
        window.location.href =  successUrl;
        that.paymentLoader?.changeLoaderStatus('redirecting');
    }).catch(error => {
        console.log(error, 'failed')
    });
}
// handle error and redirect to error page 
```

### Receive the request from backend

The request is trigger on a custom action based on payment method slug. `fluent_cart_confirm_stripe_payment`. Which will be hooked and validated with vendor before updating the order and transactions.

This **confirmStripePayment** method have done:
- Retrieve the charge ID
- Validate the payment in stripe using that charge id
- Find and update the transaction status with intentId of that charge
- Update the order status and order paid amount according to that transaction

```php
add_action('wp_ajax_fluent_cart_confirm_stripe_payment', [$this, 'confirmStripePayment']);
```

```php
public function confirmStripePayment()
{
    // retrieve the intend ID
    .....
    //validate the transaction from vendor
    $response = $api->makeRequest($path, [], (new StripeSettings())->getApiKey());
    ......
    ......
    // update the transaction
    $transaction = OrderTransaction::query()->where('vendor_charge_id', Arr::get($response, 'id'))->first();
    ....
    // update the order data
    $this->updateOrderDataByOrder($order, $updateData, $transaction);
}
```
**updateOrderDataByOrder:** will update the order status to **processing** for a paid transaction. 
```php
public function updateOrderDataByOrder($order, $transactionData = [], $transaction = null)
{
    // validate order
    ....

    // change order status 
    ....

    // trigger payment paid actions
    if ($paymentStatus === 'paid') {
        (new PaymentPaid($order))->dispatch();
    }

    do_action('fluent_cart/payment/after_payment_' . $paymentStatus, $order);
}
```
:::

This will do these steps:
- Validate the order
- For digital products, update the order status to **completed**, and physical products status will be **processing** 
- Update the order paid amount.

## 6. Dispatching events

- Triggered all the payment paid hooks for further actions `fluent_cart/payment_paid`
```php
// example use case
do_action('fluent_cart/payment_paid', $order);

```

- Triggered after payment actions for all status `fluent_cart/payment/after_payment_{paymentStatus}`
```php
// example use case
do_action('fluent_cart/payment/after_payment_pending', $order);

```

- Redirect to the receipt page
```js
.then((response) => {
    window.location.href =  successUrl;
})
```


