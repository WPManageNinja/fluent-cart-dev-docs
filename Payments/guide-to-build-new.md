# FluentCart Payment Gateway Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Architecture](#core-architecture)
3. [Creating a New Payment Gateway](#creating-a-new-payment-gateway)
4. [Gateway Settings Implementation](#gateway-settings-implementation)
5. [Subscription Module Integration](#subscription-module-integration)
6. [Registration and Usage](#registration-and-usage)
7. [Advanced Features](#advanced-features)
8. [Testing and Validation](#testing-and-validation)

## Overview

FluentCart provides a robust, extensible payment gateway system built on object-oriented principles. The system supports:

- ✅ **Multiple Payment Methods** (Stripe, PayPal, COD, etc.)
- ✅ **Subscription Support** with automatic module discovery
- ✅ **Webhook Handling** for real-time payment updates
- ✅ **Refund Management** with automated processing
- ✅ **Type-Safe Registration** with validation
- ✅ **Unified API** via App facade and GatewayManager

## Core Architecture

### Key Components

```
app/Modules/PaymentMethods/
├── Core/
│   ├── PaymentGatewayInterface.php      # Contract for all gateways
│   ├── AbstractPaymentGateway.php       # Base implementation
│   ├── GatewaySettingsInterface.php     # Settings contract
│   ├── AbstractSubscriptionModule.php   # Subscription base class
│   └── GatewayManager.php              # Gateway registry & manager
├── YourGateway/
│   ├── YourGateway.php                 # Main gateway class
│   ├── YourGatewaySettings.php         # Settings implementation
│   ├── YourGatewaySubscriptions.php    # Subscription module (optional)
│   └── API/                            # API integration classes
└── boot/
    └── subscription-modules.php        # Subscription registrations
```

### Core Interfaces

#### PaymentGatewayInterface
```php
interface PaymentGatewayInterface
{
    public function has(string $feature): bool;           // Feature support check
    public function meta(): array;                        // Gateway metadata
    public function makePayment(OrderHelper $orderHelper); // Process payment
    public function refund($refundInfo, $order);          // Handle refunds
    public function handleWebhook(array $payload);        // Webhook processing
    public function getOrderInfo(array $data);            // Order information
    public function fields();                             // Admin settings fields
}
```

#### GatewaySettingsInterface
```php
interface GatewaySettingsInterface
{
    public function __construct();                        // Initialize settings
    public function get($key = '');                       // Get setting value
    public function getMode();                            // Get payment mode (test/live)
    public function isActive();                           // Check if gateway is active
}
```

## Creating a New Payment Gateway

### Step 1: Create Gateway Class

```php
<?php
namespace FluentCart\App\Modules\PaymentMethods\RazorpayGateway;

use FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway;
use FluentCart\App\Helpers\OrderHelper;
use FluentCart\App\Vite;

class Razorpay extends AbstractPaymentGateway
{
    // Define supported features
    protected array $supportedFeatures = [
        'payment',           // Basic payment processing
        'refund',           // Refund support
        'webhook',          // Webhook handling
        'subscriptions',    // Subscription support (optional)
        'card_update'       // Card update for subscriptions (optional)
    ];

    public function __construct()
    {
        parent::__construct(new RazorpaySettings());
    }

    /**
     * Gateway metadata for admin interface
     */
    public function meta(): array
    {
        return [
            'title' => 'Razorpay',
            'route' => 'razorpay',                    // Unique identifier
            'description' => 'Pay securely with Razorpay',
            'logo' => Vite::getAssetUrl("images/payment-methods/razorpay.svg"),
            'icon' => Vite::getAssetUrl("images/payment-methods/razorpay-icon.svg"),
            'brand_color' => '#3395ff',
            'status' => $this->settings->get('is_active') === 'yes',
            'upcoming' => false,
        ];
    }

    /**
     * Initialize gateway (hooks, listeners, etc.)
     */
    public function boot()
    {
        // Register webhook listener
        add_action('fluent_cart/payments/ipn_endpoint_razorpay', [$this, 'handleIPN']);

        // Register any filters or actions
        add_filter('fluent_cart/payment_methods/razorpay_settings', [$this, 'getSettings']);
    }

    /**
     * Process payment
     */
    public function makePayment(OrderHelper $orderHelper)
    {
        try {
            // Validate gateway is active
            if (!$this->isEnabled()) {
                throw new \Exception(__('Razorpay is not active', 'fluent-cart'));
            }

            // Get payment details
            $amount = $this->getPayableAmount($orderHelper);
            $currency = $orderHelper->order->currency;
            $customer = $orderHelper->customer;

            // Create payment with Razorpay API
            $paymentData = [
                'amount' => $amount * 100, // Razorpay expects amount in paise
                'currency' => $currency,
                'receipt' => $orderHelper->order->uuid,
                'customer' => [
                    'name' => $customer->name,
                    'email' => $customer->email,
                ]
            ];

            // Process with Razorpay API
            $response = $this->createRazorpayOrder($paymentData);

            wp_send_json_success([
                'status' => 'success',
                'message' => __('Redirecting to payment...', 'fluent-cart'),
                'payment_data' => $response,
                'redirect_to' => $this->getPaymentUrl($response)
            ], 200);

        } catch (\Exception $e) {
            wp_send_json_error([
                'status' => 'failed',
                'message' => $e->getMessage()
            ], 423);
        }
    }

    /**
     * Handle refunds
     */
    public function refund($refundInfo, $order)
    {
        try {
            $refundAmount = $refundInfo['amount'];
            $paymentId = $order->vendor_charge_id;

            // Process refund with Razorpay API
            $refundResponse = $this->processRazorpayRefund($paymentId, $refundAmount);

            // Update order and trigger events
            $this->triggerAfterRefundProcess($refundInfo, $order, $refundResponse);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ], 423);
        }
    }

    /**
     * Handle webhook notifications
     */
    public function handleWebhook(array $payload)
    {
        $event = $payload['event'] ?? '';

        switch ($event) {
            case 'payment.captured':
                $this->handlePaymentSuccess($payload);
                break;
            case 'payment.failed':
                $this->handlePaymentFailure($payload);
                break;
            case 'refund.processed':
                $this->handleRefundProcessed($payload);
                break;
        }
    }

    /**
     * Get order information for frontend
     */
    public function getOrderInfo(array $data)
    {
        $items = $this->getCheckoutItems();
        $hasSubscription = $this->validateSubscriptions($items);

        // Calculate total
        $subTotal = 0;
        foreach ($items as $item) {
            $subTotal += intval($item['quantity'] * $item['unit_price']);
        }

        // Prepare payment arguments
        $paymentArgs = [
            'key' => $this->settings->getPublicKey(),
            'amount' => $subTotal,
            'currency' => $this->storeSettings->get('currency'),
            'name' => $this->storeSettings->get('business_name'),
        ];

        wp_send_json_success([
            'status' => 'success',
            'payment_args' => $paymentArgs,
            'has_subscription' => $hasSubscription
        ], 200);
    }

    /**
     * Admin settings fields
     */
    public function fields()
    {
        return [
            'api_key' => [
                'value' => '',
                'label' => __('API Key', 'fluent-cart'),
                'type' => 'text',
                'placeholder' => __('Enter your Razorpay API Key', 'fluent-cart')
            ],
            'api_secret' => [
                'value' => '',
                'label' => __('API Secret', 'fluent-cart'),
                'type' => 'password',
                'placeholder' => __('Enter your Razorpay API Secret', 'fluent-cart')
            ],
            'webhook_secret' => [
                'value' => '',
                'label' => __('Webhook Secret', 'fluent-cart'),
                'type' => 'password',
                'placeholder' => __('Enter your Razorpay Webhook Secret', 'fluent-cart')
            ]
        ];
    }

    /**
     * Validate settings before saving
     */
    public static function validateSettings($data): array
    {
        $apiKey = $data['api_key'] ?? '';
        $apiSecret = $data['api_secret'] ?? '';

        if (empty($apiKey) || empty($apiSecret)) {
            return [
                'status' => 'failed',
                'message' => __('API Key and Secret are required', 'fluent-cart')
            ];
        }

        // Test API connection
        try {
            // Make test API call to validate credentials
            $testResponse = static::testApiConnection($apiKey, $apiSecret);

            return [
                'status' => 'success',
                'message' => __('Settings validated successfully', 'fluent-cart')
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'failed',
                'message' => $e->getMessage()
            ];
        }
    }

    // Private helper methods
    private function createRazorpayOrder($data) { /* Implementation */ }
    private function processRazorpayRefund($paymentId, $amount) { /* Implementation */ }
    private function testApiConnection($key, $secret) { /* Implementation */ }
}
```

### Step 2: Create Settings Class

```php
<?php
namespace FluentCart\App\Modules\PaymentMethods\RazorpayGateway;

use FluentCart\App\Modules\PaymentMethods\Core\GatewaySettingsInterface;
use FluentCart\App\Helpers\Helper;
use FluentCart\Framework\Support\Arr;

class RazorpaySettings implements GatewaySettingsInterface
{
    public $settings;
    public $methodHandler = 'fluent_cart_payment_settings_razorpay';

    public function __construct()
    {
        $settings = fluent_cart_get_option($this->methodHandler, []);
        $defaults = static::getDefaults();

        if (is_array($settings)) {
            $settings = Arr::mergeMissingValues($settings, $defaults);
        }

        $this->settings = $settings;
    }

    public static function getDefaults()
    {
        return [
            'is_active' => 'no',
            'api_key' => '',
            'api_secret' => '',
            'webhook_secret' => '',
            'payment_mode' => 'test',
        ];
    }

    public function isActive(): bool
    {
        return $this->settings['is_active'] == 'yes';
    }

    public function get($key = '')
    {
        if ($key && isset($this->settings[$key])) {
            return $this->settings[$key];
        }
        return $this->settings;
    }

    public function getMode()
    {
        return $this->get('payment_mode');
    }

    public function getPublicKey()
    {
        return $this->get('api_key');
    }

    public function getApiSecret()
    {
        return Helper::decryptKey($this->get('api_secret'));
    }
}
```

## Gateway Settings Implementation

### Required Settings Methods

Every gateway settings class must implement:

```php
public function __construct()              // Load and merge settings
public function get($key = '')             // Get setting value(s)
public function getMode()                  // Get payment mode (test/live)
public function isActive()                 // Check if gateway is enabled
```

### Settings Storage

Settings are stored using FluentCart's option system:
```php
// Save settings
fluent_cart_update_option($this->methodHandler, $settings);

// Load settings
$settings = fluent_cart_get_option($this->methodHandler, []);
```

### Security Best Practices

```php
// Encrypt sensitive data
$encryptedSecret = Helper::encryptKey($apiSecret);

// Decrypt when needed
$decryptedSecret = Helper::decryptKey($this->get('api_secret'));

// Sanitize input
$settings = Helper::sanitize($settings, $this->fields());
```

## Subscription Module Integration

### Step 1: Create Subscription Module

```php
<?php
namespace FluentCart\App\Modules\PaymentMethods\RazorpayGateway;

use FluentCart\App\Modules\PaymentMethods\Core\AbstractSubscriptionModule;

class RazorpaySubscriptions extends AbstractSubscriptionModule
{
    public function fetchSubscription($data, $order, $subscription)
    {
        // Fetch subscription details from Razorpay
        $subscriptionId = $subscription->vendor_subscription_id;
        $razorpaySubscription = $this->getRazorpaySubscription($subscriptionId);

        // Update local subscription with remote data
        $this->updateLocalSubscription($subscription, $razorpaySubscription);
    }

    public function cardUpdate($data, $subscriptionId)
    {
        // Update payment method for subscription
        $newPaymentMethod = $data['payment_method'];
        $this->updateRazorpaySubscriptionPaymentMethod($subscriptionId, $newPaymentMethod);
    }

    public function cancelSubscription($data, $order, $subscription)
    {
        // Cancel subscription on Razorpay
        $subscriptionId = $subscription->vendor_subscription_id;
        $this->cancelRazorpaySubscription($subscriptionId);

        // Update local subscription status
        $subscription->status = 'cancelled';
        $subscription->save();
    }

    public function pauseSubscription($data, $order, $subscription)
    {
        // Pause subscription on Razorpay
        $subscriptionId = $subscription->vendor_subscription_id;
        $this->pauseRazorpaySubscription($subscriptionId);
    }

    public function resumeSubscription($data, $order, $subscription)
    {
        // Resume subscription on Razorpay
        $subscriptionId = $subscription->vendor_subscription_id;
        $this->resumeRazorpaySubscription($subscriptionId);
    }

    // Private helper methods
    private function getRazorpaySubscription($id) { /* Implementation */ }
    private function updateRazorpaySubscriptionPaymentMethod($id, $method) { /* Implementation */ }
    private function cancelRazorpaySubscription($id) { /* Implementation */ }
}
```

### Step 2: Register Subscription Module

Add to `boot/subscription-modules.php`:
```php
use FluentCart\App\Modules\PaymentMethods\Core\AbstractSubscriptionModule;
use FluentCart\App\Modules\PaymentMethods\RazorpayGateway\RazorpaySubscriptions;

// Register with type safety
AbstractSubscriptionModule::register('razorpay', RazorpaySubscriptions::class);
```

## Registration and Usage

### Step 1: Register Gateway

Add to `app/Hooks/Handlers/GlobalPaymentHandler.php`:
```php
public function init()
{
    add_action('init', function () {
        $gateway = GatewayManager::getInstance();

        // Register your gateway
        $gateway->register('razorpay', new Razorpay());

        // Existing registrations...
        $gateway->register('stripe', new Stripe());
        $gateway->register('paypal', new PayPal());
    });
}
```

### Step 2: Usage via App Facade

```php
// Get gateway manager
$gatewayManager = App::gateway();

// Get specific gateway
$razorpay = App::gateway('razorpay');

// Check if gateway exists and is enabled
if ($razorpay && $razorpay->isEnabled()) {
    // Process payment
    $razorpay->makePayment($orderHelper);
}

// Access subscription module
if ($razorpay && $razorpay->has('subscriptions')) {
    $subscriptions = $razorpay->subscriptions;
    $subscriptions->cancelSubscription($data, $order, $subscription);
}

// Get all enabled gateways
$enabledGateways = App::gateway()->enabled();

// Get gateway metadata
$gatewayMeta = App::gateway()->getAllMeta();
```

### Step 3: Usage via GatewayManager

```php
// Traditional approach
$manager = GatewayManager::getInstance();
$razorpay = $manager->get('razorpay');

// Direct approach
$razorpay = GatewayManager::getInstance('razorpay');

// Static convenience method
$razorpay = GatewayManager::gateway('razorpay');

// Check if gateway is registered
if (GatewayManager::has('razorpay')) {
    // Gateway is available
}
```

## Advanced Features

### Frontend JavaScript Integration

Create `public/payment-methods/razorpay-checkout.js`:
```javascript
class RazorpayCheckout {
    constructor(config) {
        this.config = config;
        this.razorpay = null;
    }

    init() {
        // Load Razorpay SDK
        this.loadRazorpaySDK().then(() => {
            this.setupPaymentForm();
        });
    }

    loadRazorpaySDK() {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    setupPaymentForm() {
        const paymentButton = document.querySelector('[data-payment-method="razorpay"]');
        if (paymentButton) {
            paymentButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }
    }

    processPayment() {
        const options = {
            key: this.config.key,
            amount: this.config.amount,
            currency: this.config.currency,
            name: this.config.name,
            description: this.config.description,
            order_id: this.config.order_id,
            handler: (response) => {
                this.handlePaymentSuccess(response);
            },
            modal: {
                ondismiss: () => {
                    this.handlePaymentCancel();
                }
            }
        };

        this.razorpay = new Razorpay(options);
        this.razorpay.open();
    }

    handlePaymentSuccess(response) {
        // Send payment confirmation to server
        fetch('/wp-json/fluent-cart/v1/payments/razorpay/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature
            })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  window.location.href = data.redirect_url;
              } else {
                  this.handlePaymentError(data.message);
              }
          });
    }

    handlePaymentCancel() {
        console.log('Payment cancelled by user');
    }

    handlePaymentError(message) {
        alert('Payment failed: ' + message);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.fluentCartRazorpayConfig) {
        const checkout = new RazorpayCheckout(window.fluentCartRazorpayConfig);
        checkout.init();
    }
});
```

### Enqueue Scripts and Styles

Add to your gateway class:
```php
public function getEnqueueScriptSrc($hasSubscription = 'no'): array
{
    return [
        [
            'handle' => 'razorpay-checkout-sdk',
            'src' => 'https://checkout.razorpay.com/v1/checkout.js',
        ],
        [
            'handle' => 'fluent-cart-razorpay-checkout',
            'src' => Vite::getEnqueuePath('public/payment-methods/razorpay-checkout.js'),
            'deps' => ['razorpay-checkout-sdk']
        ]
    ];
}

public function getEnqueueStyleSrc(): array
{
    return [
        [
            'handle' => 'fluent-cart-razorpay-styles',
            'src' => Vite::getEnqueuePath('public/payment-methods/razorpay.css'),
        ]
    ];
}
```

### Webhook Security

```php
public function handleWebhook(array $payload)
{
    // Verify webhook signature
    if (!$this->verifyWebhookSignature($payload)) {
        http_response_code(401);
        exit('Unauthorized');
    }

    // Process webhook
    $event = $payload['event'] ?? '';
    $this->processWebhookEvent($event, $payload);
}

private function verifyWebhookSignature($payload)
{
    $signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
    $webhookSecret = $this->settings->get('webhook_secret');

    $expectedSignature = hash_hmac('sha256', json_encode($payload), $webhookSecret);

    return hash_equals($expectedSignature, $signature);
}
```

### Error Handling and Logging

```php
public function makePayment(OrderHelper $orderHelper)
{
    try {
        // Payment processing logic

    } catch (\Exception $e) {
        // Log error
        fluent_cart_add_log('Razorpay Payment Error', $e->getMessage(), 'error', [
            'order_id' => $orderHelper->order->id,
            'customer_id' => $orderHelper->customer->id,
            'log_type' => 'payment'
        ]);

        wp_send_json_error([
            'status' => 'failed',
            'message' => __('Payment processing failed. Please try again.', 'fluent-cart')
        ], 423);
    }
}
```

## Testing and Validation

### Unit Testing

Create `tests/Unit/RazorpayGatewayTest.php`:
```php
<?php

use FluentCart\App\Modules\PaymentMethods\RazorpayGateway\Razorpay;
use FluentCart\App\Modules\PaymentMethods\RazorpayGateway\RazorpaySettings;

class RazorpayGatewayTest extends TestCase
{
    private $gateway;

    protected function setUp(): void
    {
        parent::setUp();
        $this->gateway = new Razorpay();
    }

    public function testGatewayMetadata()
    {
        $meta = $this->gateway->meta();

        $this->assertEquals('Razorpay', $meta['title']);
        $this->assertEquals('razorpay', $meta['route']);
        $this->assertArrayHasKey('logo', $meta);
        $this->assertArrayHasKey('icon', $meta);
    }

    public function testSupportedFeatures()
    {
        $this->assertTrue($this->gateway->has('payment'));
        $this->assertTrue($this->gateway->has('refund'));
        $this->assertTrue($this->gateway->has('webhook'));
    }

    public function testSettingsValidation()
    {
        $validData = [
            'api_key' => 'rzp_test_123456',
            'api_secret' => 'secret_123456'
        ];

        $result = Razorpay::validateSettings($validData);
        $this->assertEquals('success', $result['status']);

        $invalidData = [
            'api_key' => '',
            'api_secret' => ''
        ];

        $result = Razorpay::validateSettings($invalidData);
        $this->assertEquals('failed', $result['status']);
    }
}
```

### Integration Testing

```php
public function testPaymentFlow()
{
    // Create test order
    $order = $this->createTestOrder();
    $orderHelper = new OrderHelper($order);

    // Mock Razorpay API response
    $this->mockRazorpayAPI();

    // Process payment
    $response = $this->gateway->makePayment($orderHelper);

    // Assert payment was processed
    $this->assertArrayHasKey('payment_data', $response);
    $this->assertEquals('success', $response['status']);
}
```

### Manual Testing Checklist

- [ ] Gateway registration works correctly
- [ ] Settings page displays all fields
- [ ] Settings validation works for valid/invalid data
- [ ] Payment processing works in test mode
- [ ] Payment processing works in live mode
- [ ] Webhook handling works correctly
- [ ] Refund processing works
- [ ] Subscription creation works (if applicable)
- [ ] Subscription cancellation works (if applicable)
- [ ] Error handling displays appropriate messages
- [ ] Frontend JavaScript integration works
- [ ] Mobile payment flow works

## Best Practices

### Security
- Always validate and sanitize input data
- Use encrypted storage for sensitive settings
- Verify webhook signatures
- Implement proper error handling without exposing sensitive information

### Performance
- Use lazy loading for subscription modules
- Cache API responses when appropriate
- Minimize external API calls
- Use efficient database queries

### User Experience
- Provide clear error messages
- Show loading states during payment processing
- Support mobile-responsive payment flows
- Implement proper redirect handling

### Code Quality
- Follow PSR-4 autoloading standards
- Use type hints and return types
- Write comprehensive tests
- Document all public methods
- Follow FluentCart coding standards

## Troubleshooting

### Common Issues

1. **Gateway not appearing in admin**
   - Check if gateway is properly registered
   - Verify class autoloading
   - Check for PHP errors in logs

2. **Settings not saving**
   - Verify `methodHandler` property is set correctly
   - Check field definitions in `fields()` method
   - Ensure proper sanitization

3. **Payment processing fails**
   - Check API credentials
   - Verify webhook endpoints
   - Review error logs
   - Test in sandbox mode first

4. **Subscription module not working**
   - Verify subscription module is registered
   - Check if gateway has 'subscriptions' in supported features
   - Ensure proper inheritance from AbstractSubscriptionModule

### Debug Mode

Enable debug logging:
```php
// Add to wp-config.php
define('FLUENT_CART_DEBUG', true);

// In your gateway
if (defined('FLUENT_CART_DEBUG') && FLUENT_CART_DEBUG) {
    fluent_cart_add_log('Debug Info', $debugData, 'info');
}
```

This comprehensive guide covers all aspects of integrating a new payment gateway into FluentCart. Follow these patterns and best practices to create robust, secure, and user-friendly payment integrations.
