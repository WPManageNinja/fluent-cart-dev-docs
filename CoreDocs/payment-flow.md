# Fluent Cart Payment Flow

After completing the fourth step of the checkout process, the payment flow immediately begins, triggering the "PlaceOrder" method from the Order flow through a hooked action.

> [!WARNING]
> There are some actions which begins before the Payment method rendered. This is not included on the payment flow implementation. we will discuss those part on another section : [Initiating Payment Method before checkout](./initiate-payment-module.md).


## Starting the Payment from checkout flow

In placeOrder finalization do_action triggered with the payment method slug like this:
'fluent_cart/payment/pay_order_with_' . $paymentMethodSlug

**Example:** fluent_cart/payment/pay_order_with_stripe

```php
    public static function placeOrder(array $data)
    {
        .......
        if ($orderHelper instanceof OrderHelper) {
            static::finalizeOrder($orderHelper, $orderData, $cartCheckoutHelper);
        ....

        }
        ....
    }
```

```php
    private static function finalizeOrder($orderHelper, $orderData, $cartCheckoutHelper)
    {
        ...
        do_action('fluent_cart/payment/pay_order_with_' . sanitize_text_field($orderHelper->order->payment_method), $orderHelper);
        ...
    }

```

## 1. Hook the action from base payment method

The base payment method add that action to the abstract method of individual paymethods function **makePayment** 

```php
   public function init()
    {
        .....
        add_action('fluent_cart/payment/pay_order_with_' . $this->slug, [$this, 'makePayment']);
        .....
    }
```

```php
  abstract public function makePayment($orderHelper);
```


## 2. Retrieve all data

**makePayment:** method accept $orderHelper FluentCart\App\Helpers\OrderHelper, which has all available data for payment.

We can access data just calling the property from $orderHelper instance:

- Customer: $orderHelper->customer
- Order: $orderHelper->order
- OneTime Items: $orderHelper->items
- Subscription Items: $orderHelper->subscriptionItems
- Payable Amount: $orderHelper->payableAmount
- Draft Transaction: $orderHelper->transactions->first();

## 3. Making payment intent
we have all the available data now, to process payments. we have to call and format the payment module specific data. For an example if we make payment for stripe we have to format data as per stripe documentations. so the data process will be different and not the same for PayPal.

### Lets breakdown **Stripe** payment module code for example

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
    <?php
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

### Request for Payment API

If no subscription items are available, proceed to process the payment for one-time items; otherwise, handle the subscription through the Subscription module.

```php
<?php
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
        .......
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
    **actionName:** is the next actionable things, here 'custom' will trigger a frontend hook to handle from client js side, Or 'redirect' will look for the **redirect_url**. redirect_url: is used to handle the hosted redirect payment.

**In summary:** this method creates the Stripe payment intent, logs the payment completion step, and then updates the Transaction table with the intent ID as the vendor charge ID using the updateVendorChargeId method. This ID will be used to validate transaction data received from IPN in the future.


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
Updating the vendor transaction Id:
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

## 4. Charge the intent

This is the step where the payment is charged. This process may vary for different types of payment API.
The common types for all payment modules are three:
1. **Onsite embed payment:** which will be handled from client js side.
2. **Hosted checkout:** which will be handled from php side and redirect to the provider payment page.
3. **Modal:** Also handled from the client js side.



