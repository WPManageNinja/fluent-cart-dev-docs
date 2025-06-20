# FluentCart Checkout Flow

This document provides a comprehensive overview of the FluentCart checkout process, from form submission to order creation. Understanding this flow is essential for developers building extensions or customizing the checkout experience.

## Architectural Overview

FluentCart follows several key principles to ensure a robust and extensible checkout system:

1. **Single Source of Truth**: All checkout data is maintained from one consistent source, ensuring data integrity and minimizing discrepancies.
2. **Standardized Extension Interface**: Clear interfaces for integrating extensions (like payment methods) while keeping extension logic separate from core checkout logic.
3. **Checkout Flow Tracking**: The system tracks checkout flow status, allowing users to monitor their progress easily.
4. **Event-Driven Interaction**: Extensions can subscribe to events in the checkout flow, enabling dynamic responses to changes.

## Checkout Flow Overview

The FluentCart checkout process consists of four main steps:

1. **Validate Checkout Form Data** - Verify customer input and payment method availability
2. **Validate Products** - Check product availability, stock levels, and prepare order items
3. **Prepare Customer Data** - Create or update customer records
4. **Process and Place Order** - Create the order, transactions, and subscriptions

Each step builds upon the previous one, ensuring data integrity throughout the process.

---

## Step 1: Validate Checkout Form Data

The checkout process begins with comprehensive data validation. This step ensures that all customer input is valid and sanitized before proceeding to order creation.

### What Gets Validated

- **Billing Address**: Customer's billing information and contact details
- **Shipping Address**: Delivery information (if shipping is required)
- **Email Address**: Valid email format and availability
- **Payment Method**: Availability and functionality of the selected payment gateway

### Validation Process

<p style="max-width: 400px; margin: 0 auto;">  
  <img src="./images/validation.svg" alt="My SVG Image" style="width: 100%; height: auto;">  

</p>  

#### Checking Codebase:

```php
namespace FluentCart\Api\Checkout;

class CheckoutApi
{
    public static function placeOrder(array $data)
    {
        static::validateData($data);
        // ...
        PaymentHelper::validateMethod($paymentMethod);
        // ...
    }
}
```

### Payment Method Validation

Payment methods are validated using a filter-based system:

```php
// In PaymentHelper::validateMethod()
public static function validateMethod($paymentMethod)
{
    $status = apply_filters('fluent_cart/payment/validate_payment_method_' . $paymentMethod, [
        'isValid' => false,
        'reason' => 'No payment method found!'
    ]);
    // ...
}
```

Each payment gateway registers its own validation filter:

```php
// In BasePaymentMethod
add_filter('fluent_cart/payment/validate_payment_method_' . $this->slug, [$this, 'validatePaymentMethod'], 10, 1);

public function validatePaymentMethod()
{
    if (!$this->isEnabled()) {
        return [
            'isValid' => false,
            'reason' => 'Payment method is not enabled'
        ];
    }
    // Additional validation logic...
}
```

### Error Handling

If validation fails, the system returns a structured error response:

```php
wp_send_json_error([
    'status'  => 'failed',
    'message' => Arr::get($status, 'reason'),
    'data'    => []
], 423);
```

---

## Step 2: Validate Products

This step ensures that all items in the cart are available and valid for purchase. It handles both one-time purchases and subscription products.

### Validation Criteria

- **Quantity Validation**: Ensures quantities are within allowed limits
- **Stock Availability**: Checks if products are in stock
- **Product Availability**: Verifies products are active and purchasable
- **Subscription Limits**: Validates subscription product constraints (e.g., single quantity limit)

### Product Processing
<p style="max-width: 500px; margin: 0 auto;">  
  <img src="./images/product.svg" alt="My SVG Image" style="width: 100%; height: auto;">  
</p>  

The system uses `CartCheckoutHelper` to retrieve and validate cart items:

```php
class CheckoutApi
{   
    public static function placeOrder(array $data)
    {
        // ...
        $cartCheckoutHelper = new CartCheckoutHelper();
        OrderService::validateProducts($cartCheckoutHelper->getItems());
        // ...
    }
}
```

### Subscription Handling

For subscription products, the system:
- Extracts one-time items (like signup fees) before applying discounts
- Prepares discounted items for first-time payments
- Validates subscription-specific constraints

---

## Step 3: Prepare Customer Data

This step handles customer creation and management, ensuring all customer information is properly stored and linked.

<p style="max-width: 500px; margin: 0 auto;">  
  <img src="./images/customer.svg" alt="My SVG Image" style="width: 100%; height: auto;">  
</p>  

### Customer Processing Logic

The system determines whether to create a new customer or update an existing one:

```php
class CheckoutApi
{   
    public static function placeOrder(array $data)
    {
        // ...
        $customer = static::getOrCreateCustomer($cartCheckoutHelper, $orderData);
    }
}
```

### Customer Creation Process

```php
private static function getOrCreateCustomer(CartCheckoutHelper $cartCheckoutHelper, $orderData)
{
    $customer = $cartCheckoutHelper->getCustomer(
        static::getCustomerEmail($orderData['billing_address'])
    );

    return static::createCustomerWithAddress(
        $customer,
        $orderData,
        $orderData['billing_address'],
        $orderData['shipping_address']
    );
}
```

### Customer Data Management

```php
public static function createCustomerWithAddress($customer, $orderData, $billingAddress, $shippingAddress)
{
    if (empty($customer)) {
        // Create new customer
    } else if ($customer instanceof Customer) {
        // Update existing customer
    }
    return $customer;
}
```

---

## Step 4: Process and Place Order

This is the final step before payment processing. It creates the order, transactions, and subscriptions while handling all related events.

<p style="max-width: 400px; margin: 0 auto;">  
  <img src="./images/process-order.svg" alt="My SVG Image" style="width: 100%; height: auto;">  
</p>  

### Order Creation Process

The order creation involves several key components:

```php
class CheckoutApi
{   
    public static function placeOrder(array $data)
    {
        // ...
        $orderHelper = static::prepareOrderHelper($customer, $cartCheckoutHelper->getItems());
        $orderHelper = static::createOrderWithDraftPayments($orderHelper, $orderData, $cartCheckoutHelper->getUtmData());
        
        if ($orderHelper instanceof OrderHelper) {
            static::finalizeOrder($orderHelper, $orderData, $cartCheckoutHelper);
        } else {
            static::handleOrderError($orderHelper);
        }
    }
}
```

### OrderHelper Class

The `OrderHelper` class is central to order processing. It contains all necessary data for order creation and payment processing:

```php
class OrderHelper
{
    public array $items = [];                    // One-time purchase items
    public array $subscriptionItems = [];        // Subscription-based items
    public $customer = null;                     // Customer instance
    public Order $order;                         // Order instance
    public $transaction = null;                  // Draft transaction
    public $activeSubscription = null;           // For plan upgrades
    public $transactions;                        // Transaction collection
    public string $paymentFrom = 'cart';         // Checkout source
    public int $payableAmount = 0;               // Total amount to pay
}
```

### Order Preparation

```php
public static function prepareOrderHelper(Customer $customer, $items): OrderHelper
{
    $orderHelper = new OrderHelper();
    $orderHelper->setCustomer($customer);
    
    $checkoutItems = new CheckoutService($items);
    $onetimeItems = $checkoutItems->onetime;

    if (!empty($checkoutItems->subscriptions)) {
        // Process subscription items and signup fees
        // Generate subscription plans
    }
    
    $orderHelper->addItems($onetimeItems);
    return $orderHelper;
}
```

### Order Creation with Draft Payments

```php
public static function createOrderWithDraftPayments(OrderHelper $orderHelper, $orderData, $utmData = [])
{
    try {
        $orderHelper = $orderHelper->processOrder($data, $utmData);

        if (!empty($orderHelper->subscriptionItems)) {
            // Create draft transactions for each subscription
            foreach ($orderHelper->subscriptionItems as $item) {
                $subscriptionData = static::processSubscriptionData($orderHelper->order, $item);
                $orderHelper->createAndSetDraftTransaction($subscriptionData);
            }
        } else {
            // Create single draft transaction for one-time purchase
            $orderHelper->createAndSetDraftTransaction([
                'payment_method' => $data['payment_method'],
                'status'         => 'pending'
            ]);
        }
        
        $orderHelper->commitEvents();
    }
    // Error handling...
}
```

### Event System

The system dispatches various events throughout the order creation process:

```php
// Available event hooks
do_action('fluent_cart/payment_' . $orderStatus, $order, $customer, $transaction);
do_action('fluent_cart/payment_' . $transaction->type . '_' . $orderStatus, $order, $customer, $transaction);
```

**Event Data Provided:**
- `$order` - Order model instance
- `$customer` - Customer model instance  
- `$transaction` - Transaction model instance

**Example Hooks:**
- `fluent_cart/payment_paid`
- `fluent_cart/payment_partially-paid`
- `fluent_cart/payment_one_time_paid`

---

## Order Statuses and Types

### Order Statuses
- `on-hold` - Order is on hold (e.g., awaiting payment)
- `processing` - Order is being processed
- `completed` - Order is complete
- `canceled` - Order has been canceled
- `failed` - Order processing failed

### Transaction Types
- `one_time` - Single payment transaction
- `subscription` - Subscription payment
- `refund` - Refund transaction
- `subscription_cycle` - Recurring subscription payment

### Payment Statuses
- `paid` - Payment completed successfully
- `pending` - Payment is pending
- `partially-paid` - Partial payment received
- `refunded` - Payment has been refunded
- `partially-refunded` - Partial refund processed
- `failed` - Payment failed

### Transaction Statuses
- `completed` - Transaction completed successfully
- `refunded` - Transaction has been refunded
- `failed` - Transaction failed

### Subscription Statuses
- `active` - Subscription is active
- `canceled` - Subscription has been canceled
- `past-due` - Subscription payment is overdue
- `expired` - Subscription has expired

---

## Flow Diagram

The checkout flow follows this sequence:

1. **Form Submission** → Data validation
2. **Product Validation** → Stock and availability checks
3. **Customer Processing** → Create or update customer records
4. **Order Creation** → Generate order and draft transactions
5. **Payment Processing** → Handle payment through selected gateway
6. **Order Completion** → Update status and dispatch events

This structured approach ensures data integrity and provides a solid foundation for extensions and customizations.



