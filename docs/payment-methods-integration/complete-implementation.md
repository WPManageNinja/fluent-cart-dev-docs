---
title: Complete Implementation
description: Production-ready payment gateway with all features including refunds, subscriptions, and advanced security
---

# Complete Implementation

Build a production-ready payment gateway with comprehensive features. This guide covers everything needed for a robust, secure, and feature-complete integration.

## Overview

This implementation includes:
- **All Payment Features** - Single payments, subscriptions, refunds
- **Advanced Security** - Signature verification, input validation
- **Error Handling** - Comprehensive error management and logging
- **Admin Interface** - Rich settings with validation
- **Frontend Assets** - Custom checkout experience

**Estimated Time:** 1-2 weeks for full implementation

## Complete File Structure

```
your-plugin/
├── includes/
│   └── PaymentMethods/
│       └── YourGateway/
│           ├── YourGateway.php
│           ├── YourGatewaySettings.php
│           ├── YourGatewaySubscriptions.php
│           ├── API/
│           │   ├── API.php
│           │   └── WebhookHandler.php
│           └── Assets/
│               ├── js/
│               │   └── checkout.js
│               └── css/
│                   └── styles.css
├── assets/
│   ├── images/
│   │   ├── logo.svg
│   │   └── icon.svg
└── your-plugin.php
```

## Advanced Gateway Settings

**File:** `includes/PaymentMethods/YourGateway/YourGatewaySettings.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway;

use FluentCart\App\Modules\PaymentMethods\Core\BaseGatewaySettings;
use FluentCart\App\Helpers\Helper;
use FluentCart\Framework\Support\Arr;

class YourGatewaySettings extends BaseGatewaySettings
{
    public $methodHandler = 'fluent_cart_payment_settings_your_gateway';

    public static function getDefaults()
    {
        return [
            'is_active' => 'no',
            'live_api_key' => '',
            'live_secret_key' => '',
            'live_webhook_secret' => '',
            'test_api_key' => '',
            'test_secret_key' => '',
            'test_webhook_secret' => '',
            'payment_mode' => 'test',
            'debug_mode' => 'no',
            'auto_capture' => 'yes',
            'checkout_theme' => 'light'
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

    public function getApiKey($mode = '')
    {
        if (!$mode) {
            $mode = $this->getMode(); // Get current payment mode from settings
        }
        return $this->get($mode . '_api_key');
    }

    public function getSecretKey($mode = '')
    {
        if (!$mode) {
            $mode = $this->getMode(); // Get current payment mode from settings
        }
        return Helper::decryptKey($this->get($mode . '_secret_key'));
    }

    public function getWebhookSecret($mode = '')
    {
        if (!$mode) {
            $mode = $this->getMode(); // Get current payment mode from settings
        }
        return Helper::decryptKey($this->get($mode . '_webhook_secret'));
    }

    public function isTestMode()
    {
        return $this->getMode() === 'test';
    }

    public function isDebugMode()
    {
        return $this->get('debug_mode') === 'yes';
    }

    public function shouldAutoCapture()
    {
        return $this->get('auto_capture') === 'yes';
    }
}
```

### Important: Payment Mode vs Order Mode

FluentCart distinguishes between two different "modes":

1. **Payment Mode** (`payment_mode` in settings): The current test/live configuration in payment gateway settings
   ```php
   $this->settings->getMode(); // Returns current payment mode from settings
   ```

2. **Order Mode** (`$order->mode`): The mode captured at checkout time and stored with the order
   ```php
   $order->mode; // Returns the mode when this specific order was placed
   ```

**Usage Guidelines:**
- **For API calls**: Use order mode from `$order->mode` to ensure consistency with the original transaction
- **For settings/configuration**: Use payment mode from `$this->settings->getMode()`
- **For transaction storage**: Always store `payment_mode` as `$order->mode` to preserve checkout-time context
- **For transaction URLs**: Use the stored `payment_mode` from transaction data

## Comprehensive API Handler

**File:** `includes/PaymentMethods/YourGateway/API/API.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway\API;

class API
{
    private $settings;
    private $baseUrl;
    private $headers;

    public function __construct($settings)
    {
        $this->settings = $settings;
        $this->baseUrl = $settings->isTestMode() 
            ? 'https://api-test.yourgateway.com/v1' 
            : 'https://api.yourgateway.com/v1';
        
        $this->headers = [
            'Authorization' => 'Bearer ' . $settings->getApiKey(),
            'Content-Type' => 'application/json',
            'User-Agent' => 'FluentCart/' . FLUENT_CART_PLUGIN_VERSION,
        ];
    }

    public function createPayment($paymentData)
    {
        return $this->makeRequest('POST', '/payments', $paymentData);
    }

    public function capturePayment($paymentId, $amount = null)
    {
        $data = [];
        if ($amount) {
            $data['amount'] = $amount;
        }
        
        return $this->makeRequest('POST', "/payments/{$paymentId}/capture", $data);
    }

    public function refundPayment($paymentId, $amount, $reason = '')
    {
        $data = [
            'amount' => $amount,
            'reason' => $reason
        ];
        
        return $this->makeRequest('POST', "/payments/{$paymentId}/refund", $data);
    }

    public function getPayment($paymentId)
    {
        return $this->makeRequest('GET', "/payments/{$paymentId}");
    }

    public function createSubscription($subscriptionData)
    {
        return $this->makeRequest('POST', '/subscriptions', $subscriptionData);
    }

    public function cancelSubscription($subscriptionId)
    {
        return $this->makeRequest('POST', "/subscriptions/{$subscriptionId}/cancel");
    }

    public function updateSubscription($subscriptionId, $data)
    {
        return $this->makeRequest('PUT', "/subscriptions/{$subscriptionId}", $data);
    }

    private function makeRequest($method, $endpoint, $data = [])
    {
        $args = [
            'method' => $method,
            'headers' => $this->headers,
            'timeout' => 30,
        ];

        if (!empty($data) && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $args['body'] = json_encode($data);
        }

        if ($this->settings->isDebugMode()) {
            fluent_cart_add_log('Your Gateway API Request', [
                'method' => $method,
                'endpoint' => $endpoint,
                'data' => $data
            ], 'info');
        }

        $response = wp_remote_request($this->baseUrl . $endpoint, $args);

        if (is_wp_error($response)) {
            $this->logError('API Request Failed', $response->get_error_message());
            return new \WP_Error('api_error', $response->get_error_message());
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if ($this->settings->isDebugMode()) {
            fluent_cart_add_log('Your Gateway API Response', [
                'status_code' => $code,
                'response' => $data
            ], 'info');
        }

        if ($code >= 400) {
            $errorMessage = $data['error']['message'] ?? 'Unknown error';
            $this->logError('API Error', $errorMessage, $data);
            return new \WP_Error('api_error', $errorMessage, $data);
        }

        return $data;
    }

    private function logError($title, $message, $context = [])
    {
        fluent_cart_add_log("Your Gateway: {$title}", [
            'message' => $message,
            'context' => $context
        ], 'error');
    }

    public function verifyWebhookSignature($payload, $signature)
    {
        $expectedSignature = hash_hmac('sha256', $payload, $this->settings->getWebhookSecret());
        return hash_equals($expectedSignature, $signature);
    }
}
```

## Subscription Support

**File:** `includes/PaymentMethods/YourGateway/YourGatewaySubscriptions.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway;

use FluentCart\App\Modules\PaymentMethods\Core\AbstractSubscriptionModule;
use FluentCart\App\Models\Subscription;
use YourPlugin\PaymentMethods\YourGateway\API\API;

class YourGatewaySubscriptions extends AbstractSubscriptionModule
{
    private $settings;

    public function __construct()
    {
        $this->settings = new YourGatewaySettings();
    }

    public function fetchSubscription($data, $order, $subscription)
    {
        $api = new API($this->settings);
        $vendorSubscriptionId = $subscription->vendor_subscription_id;

        if (!$vendorSubscriptionId) {
            throw new \Exception('Subscription ID not found');
        }

        $response = $api->makeRequest('GET', "/subscriptions/{$vendorSubscriptionId}");

        if (is_wp_error($response)) {
            throw new \Exception($response->get_error_message());
        }

        return [
            'status' => $response['status'],
            'next_billing_date' => $response['next_billing_at'],
            'amount' => $response['amount'],
            'currency' => $response['currency']
        ];
    }

    public function cancelSubscription($data, $subscriptionId)
    {
        $subscription = Subscription::find($subscriptionId);
        
        if (!$subscription || !$subscription->vendor_subscription_id) {
            throw new \Exception('Subscription not found');
        }

        $api = new API($this->settings);
        $response = $api->cancelSubscription($subscription->vendor_subscription_id);

        if (is_wp_error($response)) {
            throw new \Exception($response->get_error_message());
        }

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => current_time('mysql')
        ]);

        return [
            'success' => true,
            'message' => 'Subscription cancelled successfully'
        ];
    }

    public function reactivateSubscription($data, $subscriptionId)
    {
        $subscription = Subscription::find($subscriptionId);
        
        if (!$subscription || !$subscription->vendor_subscription_id) {
            throw new \Exception('Subscription not found');
        }

        $api = new API($this->settings);
        $response = $api->updateSubscription($subscription->vendor_subscription_id, [
            'status' => 'active'
        ]);

        if (is_wp_error($response)) {
            throw new \Exception($response->get_error_message());
        }

        $subscription->update([
            'status' => 'active'
        ]);

        return [
            'success' => true,
            'message' => 'Subscription reactivated successfully'
        ];
    }
}
```

## Advanced Web Hook Handler

**File:** `includes/PaymentMethods/YourGateway/API/WebhookHandler.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway\API;

use FluentCart\App\Models\Order;
use FluentCart\App\Models\OrderTransaction;
use FluentCart\App\Models\Subscription;

class WebhookHandler
{
    private $settings;
    private $api;

    public function __construct($settings)
    {
        $this->settings = $settings;
        $this->api = new API($settings);
    }

    public function handle()
    {
        $payload = file_get_contents('php://input');
        $signature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';

        if (!$this->verifySignature($payload, $signature)) {
            $this->logSecurity('Invalid webhook signature', $payload);
            http_response_code(401);
            exit('Unauthorized');
        }

        $data = json_decode($payload, true);
        
        if (!$data) {
            http_response_code(400);
            exit('Invalid JSON');
        }

        $this->processEvent($data);
        
        http_response_code(200);
        exit('OK');
    }

    private function verifySignature($payload, $signature)
    {
        if (!$signature) {
            return false;
        }

        return $this->api->verifyWebhookSignature($payload, $signature);
    }

    private function processEvent($data)
    {
        $eventType = $data['event'] ?? '';
        
        try {
            switch ($eventType) {
                case 'payment.completed':
                    $this->handlePaymentCompleted($data);
                    break;
                    
                case 'payment.failed':
                    $this->handlePaymentFailed($data);
                    break;
                    
                case 'payment.refunded':
                    $this->handlePaymentRefunded($data);
                    break;
                    
                case 'subscription.created':
                    $this->handleSubscriptionCreated($data);
                    break;
                    
                case 'subscription.cancelled':
                    $this->handleSubscriptionCancelled($data);
                    break;
                    
                case 'subscription.payment_succeeded':
                    $this->handleSubscriptionPayment($data);
                    break;
                    
                default:
                    $this->logInfo("Unhandled event type: {$eventType}", $data);
            }
        } catch (\Exception $e) {
            $this->logError("Webhook processing failed for {$eventType}", $e->getMessage(), $data);
        }
    }

    private function handlePaymentCompleted($data)
    {
        $paymentId = $data['payment']['id'];
        $transaction = OrderTransaction::where('vendor_charge_id', $paymentId)->first();
        
        if (!$transaction) {
            $this->logError('Payment completed but transaction not found', $paymentId);
            return;
        }

        $order = $transaction->order;
        
        $transaction->update([
            'status' => 'completed',
            'completed_at' => current_time('mysql')
        ]);

        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing'
        ]);

        // Fire FluentCart core events
        do_action('fluent_cart/payment_success', [
            'order' => $order,
            'transaction' => $transaction,
            'gateway' => 'your_gateway'
        ]);

        // Fire payment completed event
        do_action('fluent_cart/payment_completed', [
            'order' => $order,
            'transaction' => $transaction,
            'gateway' => 'your_gateway'
        ]);

        // Fire gateway-specific event
        do_action('fluent_cart/payments/your_gateway/payment_completed', [
            'order' => $order,
            'transaction' => $transaction,
            'gateway_data' => $data
        ]);

        $this->logInfo('Payment completed successfully', $paymentId);
    }

    private function handlePaymentFailed($data)
    {
        $paymentId = $data['payment']['id'];
        $reason = $data['payment']['failure_reason'] ?? 'Unknown reason';
        
        $transaction = OrderTransaction::where('vendor_charge_id', $paymentId)->first();
        
        if (!$transaction) {
            return;
        }

        $order = $transaction->order;
        
        $transaction->update([
            'status' => 'failed',
            'meta' => array_merge($transaction->meta ?? [], [
                'failure_reason' => $reason
            ])
        ]);

        $order->update([
            'payment_status' => 'failed',
            'status' => 'failed'
        ]);

        // Fire FluentCart core events
        do_action('fluent_cart/payment_failed', [
            'order' => $order,
            'transaction' => $transaction,
            'gateway' => 'your_gateway',
            'error_message' => $reason
        ]);

        // Fire gateway-specific event
        do_action('fluent_cart/payments/your_gateway/payment_failed', [
            'order' => $order,
            'transaction' => $transaction,
            'gateway_data' => $data,
            'failure_reason' => $reason
        ]);
    }

    private function handlePaymentRefunded($data)
    {
        $paymentId = $data['payment']['id'];
        $refundAmount = $data['refund']['amount'];
        $refundId = $data['refund']['id'];
        
        $parentTransaction = OrderTransaction::where('vendor_charge_id', $paymentId)->first();
        
        if (!$parentTransaction) {
            return;
        }

        // Create refund transaction
        OrderTransaction::create([
            'order_id' => $parentTransaction->order_id,
            'transaction_id' => $refundId,
            'type' => 'refund',
            'status' => 'completed',
            'amount' => $refundAmount,
            'currency' => $parentTransaction->currency,
            'gateway' => 'your_gateway',
            'meta' => [
                'parent_transaction_id' => $parentTransaction->id,
                'refund_reason' => $data['refund']['reason'] ?? ''
            ]
        ]);

        do_action('fluent_cart/order_refunded', [
            'order' => $parentTransaction->order,
            'transaction' => $parentTransaction,
            'refund_amount' => $refundAmount,
            'gateway' => 'your_gateway'
        ]);
    }

    private function handleSubscriptionCreated($data)
    {
        $subscriptionId = $data['subscription']['id'];
        $orderId = $data['subscription']['metadata']['order_id'] ?? '';
        
        if (!$orderId) {
            return;
        }

        $order = Order::where('uuid', $orderId)->first();
        
        if (!$order) {
            return;
        }

        $subscription = Subscription::where('order_id', $order->id)->first();
        
        if ($subscription) {
            $subscription->update([
                'vendor_subscription_id' => $subscriptionId,
                'status' => 'active'
            ]);

            // Fire FluentCart subscription activated event
            do_action('fluent_cart/subscription_activated', [
                'subscription' => $subscription,
                'order' => $order,
                'customer' => $order->customer
            ]);

            // Fire gateway-specific event
            do_action('fluent_cart/payments/your_gateway/subscription_created', [
                'subscription' => $subscription,
                'order' => $order,
                'gateway_data' => $data
            ]);
        }
    }

    private function handleSubscriptionCancelled($data)
    {
        $subscriptionId = $data['subscription']['id'];
        
        $subscription = Subscription::where('vendor_subscription_id', $subscriptionId)->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => current_time('mysql')
            ]);

            // Fire FluentCart subscription canceled event
            do_action('fluent_cart/subscription_canceled', [
                'subscription' => $subscription,
                'order' => $subscription->order,
                'customer' => $subscription->customer,
                'reason' => $data['subscription']['cancellation_reason'] ?? 'Cancelled via gateway'
            ]);

            // Fire gateway-specific event
            do_action('fluent_cart/payments/your_gateway/subscription_canceled', [
                'subscription' => $subscription,
                'gateway_data' => $data
            ]);
        }
    }

    private function handleSubscriptionPayment($data)
    {
        $subscriptionId = $data['subscription']['id'];
        $paymentId = $data['payment']['id'];
        
        $subscription = Subscription::where('vendor_subscription_id', $subscriptionId)->first();
        
        if (!$subscription) {
            return;
        }

        // Create new transaction for subscription payment
        $renewalTransaction = OrderTransaction::create([
            'order_id' => $subscription->order_id,
            'subscription_id' => $subscription->id,
            'transaction_id' => $paymentId,
            'type' => 'subscription_payment',
            'status' => 'completed',
            'amount' => $data['payment']['amount'],
            'currency' => $data['payment']['currency'],
            'gateway' => 'your_gateway'
        ]);

        // Update subscription
        $subscription->update([
            'next_billing_date' => $data['subscription']['next_billing_at']
        ]);

        // Fire FluentCart subscription renewed event
        do_action('fluent_cart/subscription_renewed', [
            'subscription' => $subscription,
            'order' => $subscription->order,
            'customer' => $subscription->customer,
            'transaction' => $renewalTransaction
        ]);

        // Fire gateway-specific event
        do_action('fluent_cart/payments/your_gateway/subscription_payment_received', [
            'subscription' => $subscription,
            'transaction' => $renewalTransaction,
            'gateway_data' => $data
        ]);
    }

    private function logInfo($message, $context = [])
    {
        fluent_cart_add_log("Your Gateway Web Hook: {$message}", $context, 'info');
    }

    private function logError($message, $error, $context = [])
    {
        fluent_cart_add_log("Your Gateway Web Hook Error: {$message}", [
            'error' => $error,
            'context' => $context
        ], 'error');
    }

    private function logSecurity($message, $context = [])
    {
        fluent_cart_add_log("Your Gateway Security: {$message}", $context, 'warning');
    }
}
```

## Complete Gateway Class

**File:** `includes/PaymentMethods/YourGateway/YourGateway.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway;

use FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway;
use FluentCart\App\Services\Payments\PaymentInstance;
use FluentCart\App\Models\OrderTransaction;
use FluentCart\Framework\Support\Arr;
use YourPlugin\PaymentMethods\YourGateway\API\API;
use YourPlugin\PaymentMethods\YourGateway\API\WebhookHandler;

class YourGateway extends AbstractPaymentGateway
{
    public array $supportedFeatures = [
        'payment',
        'refund',
        'webhook',
        'subscriptions',
        'partial_refund'
    ];

    public function __construct()
    {
        parent::__construct(
            new YourGatewaySettings(),
            new YourGatewaySubscriptions()
        );
    }

    public function meta(): array
    {
        return [
            'title' => __('Your Gateway', 'your-plugin'),
            'route' => 'your_gateway',
            'slug' => 'your_gateway',
            'description' => __('Accept payments securely with Your Gateway', 'your-plugin'),
            'logo' => plugin_dir_url(dirname(__FILE__)) . 'assets/images/logo.svg',
            'icon' => plugin_dir_url(dirname(__FILE__)) . 'assets/images/icon.svg',
            'brand_color' => '#007cba',
            'status' => $this->settings->get('is_active') === 'yes',
            'supported_features' => $this->supportedFeatures,
            'tag' => $this->settings->isTestMode() ? 'test' : null
        ];
    }

    public function boot()
    {
        // Register web hook handlers
        add_action('wp_ajax_your_gateway_webhook', [$this, 'handleWebhook']);
        add_action('wp_ajax_nopriv_your_gateway_webhook', [$this, 'handleWebhook']);
        
        // Enqueue frontend assets
        add_action('wp_enqueue_scripts', [$this, 'enqueueAssets']);
    }

    public function makePaymentFromPaymentInstance(PaymentInstance $paymentInstance)
    {
        $order = $paymentInstance->order;
        $transaction = $paymentInstance->transaction;

        if ($paymentInstance->subscription) {
            return $this->handleSubscriptionPayment($paymentInstance);
        }

        return $this->handleSinglePayment($paymentInstance);
    }

    private function handleSinglePayment(PaymentInstance $paymentInstance)
    {
        $order = $paymentInstance->order;
        $transaction = $paymentInstance->transaction;

        $paymentData = [
            'amount' => $transaction->total,
            'currency' => $transaction->currency,
            'metadata' => [
                'order_id' => $order->uuid,
                'transaction_id' => $transaction->uuid
            ],
            'customer' => [
                'email' => $order->email,
                'name' => trim($order->first_name . ' ' . $order->last_name)
            ],
            'success_url' => $this->getSuccessUrl($transaction),
            'cancel_url' => $this->getCancelUrl(),
            'auto_capture' => $this->settings->shouldAutoCapture()
        ];

        $api = new API($this->settings, $order->mode); // Pass order mode for API consistency
        $result = $api->createPayment($paymentData);

        if (is_wp_error($result)) {
            return [
                'success' => false,
                'message' => $result->get_error_message()
            ];
        }

        // Store payment ID with order mode
        $transaction->update([
            'vendor_charge_id' => $result['id'],
            'payment_mode' => $order->mode, // Store order mode from checkout time
            'meta' => array_merge($transaction->meta ?? [], [
                'gateway_response' => $result
            ])
        ]);

        return [
            'success' => true,
            'redirect_url' => $result['checkout_url'],
            'payment_id' => $result['id']
        ];
    }

    private function handleSubscriptionPayment(PaymentInstance $paymentInstance)
    {
        $subscription = $paymentInstance->subscription;
        $order = $paymentInstance->order;
        $transaction = $paymentInstance->transaction;

        $subscriptionData = [
            'customer' => [
                'email' => $order->email,
                'name' => trim($order->first_name . ' ' . $order->last_name)
            ],
            'plan_id' => $this->getPlanId($subscription),
            'metadata' => [
                'order_id' => $order->uuid,
                'subscription_id' => $subscription->uuid
            ],
            'success_url' => $this->getSuccessUrl($transaction),
            'cancel_url' => $this->getCancelUrl()
        ];

        $api = new API($this->settings);
        $result = $api->createSubscription($subscriptionData);

        if (is_wp_error($result)) {
            return [
                'success' => false,
                'message' => $result->get_error_message()
            ];
        }

        $subscription->update([
            'vendor_subscription_id' => $result['id']
        ]);

        return [
            'success' => true,
            'redirect_url' => $result['checkout_url'],
            'subscription_id' => $result['id']
        ];
    }

    public function processRefund($transaction, $amount, $args = [])
    {
        if (!$transaction->vendor_charge_id) {
            return new \WP_Error('refund_error', 'Payment ID not found');
        }

        $api = new API($this->settings);
        $reason = Arr::get($args, 'reason', 'Refund requested');
        
        $result = $api->refundPayment($transaction->vendor_charge_id, $amount, $reason);

        if (is_wp_error($result)) {
            return $result;
        }

        return [
            'success' => true,
            'refund_id' => $result['id'],
            'amount' => $result['amount']
        ];
    }

    public function handleIPN()
    {
        $handler = new WebhookHandler($this->settings);
        $handler->handle();
    }

    public function handleWebhook()
    {
        $this->handleIPN();
    }

    public function getOrderInfo(array $data)
    {
        return [
            'gateway_config' => [
                'test_mode' => $this->settings->isTestMode(),
                'public_key' => $this->settings->getApiKey(),
                'theme' => $this->settings->get('checkout_theme')
            ],
            'supported_currencies' => $this->getSupportedCurrencies()
        ];
    }

    public function fields(): array
    {
        $webhookUrl = $this->getWebhookUrl();
        
        return [
            'is_active' => [
                'type' => 'yes_no',
                'label' => __('Enable Your Gateway', 'your-plugin'),
                'default' => 'no'
            ],
            'payment_mode' => [
                'type' => 'tabs',
                'schema' => [
                    [
                        'type' => 'tab',
                        'label' => __('Live Mode', 'your-plugin'),
                        'value' => 'live',
                        'schema' => $this->getLiveFields($webhookUrl)
                    ],
                    [
                        'type' => 'tab',
                        'label' => __('Test Mode', 'your-plugin'),
                        'value' => 'test',
                        'schema' => $this->getTestFields($webhookUrl)
                    ]
                ]
            ],
            'auto_capture' => [
                'type' => 'yes_no',
                'label' => __('Auto Capture Payments', 'your-plugin'),
                'default' => 'yes',
                'help_text' => __('Automatically capture payments when authorized', 'your-plugin')
            ],
            'checkout_theme' => [
                'type' => 'select',
                'label' => __('Checkout Theme', 'your-plugin'),
                'options' => [
                    'light' => __('Light', 'your-plugin'),
                    'dark' => __('Dark', 'your-plugin')
                ],
                'default' => 'light'
            ],
            'debug_mode' => [
                'type' => 'yes_no',
                'label' => __('Debug Mode', 'your-plugin'),
                'default' => 'no',
                'help_text' => __('Enable detailed logging for troubleshooting', 'your-plugin')
            ]
        ];
    }

    private function getLiveFields($webhookUrl)
    {
        return [
            'live_api_key' => [
                'type' => 'text',
                'label' => __('Live API Key', 'your-plugin'),
                'required' => true
            ],
            'live_secret_key' => [
                'type' => 'password',
                'label' => __('Live Secret Key', 'your-plugin'),
                'required' => true
            ],
            'live_webhook_secret' => [
                'type' => 'password',
                'label' => __('Live Web Hook Secret', 'your-plugin'),
                'required' => true
            ],
            'live_webhook_info' => [
                'type' => 'html_attr',
                'label' => __('Web Hook URL', 'your-plugin'),
                'value' => sprintf(
                    '<p><strong>Web Hook URL:</strong><br><code>%s</code></p><p>Configure this URL in your gateway dashboard to receive payment notifications.</p>',
                    esc_html($webhookUrl)
                )
            ]
        ];
    }

    private function getTestFields($webhookUrl)
    {
        return [
            'test_api_key' => [
                'type' => 'text',
                'label' => __('Test API Key', 'your-plugin'),
                'required' => true
            ],
            'test_secret_key' => [
                'type' => 'password',
                'label' => __('Test Secret Key', 'your-plugin'),
                'required' => true
            ],
            'test_webhook_secret' => [
                'type' => 'password',
                'label' => __('Test Web Hook Secret', 'your-plugin'),
                'required' => true
            ],
            'test_webhook_info' => [
                'type' => 'html_attr',
                'label' => __('Web Hook URL', 'your-plugin'),
                'value' => sprintf(
                    '<p><strong>Web Hook URL:</strong><br><code>%s</code></p><p>Configure this URL in your gateway dashboard to receive payment notifications.</p>',
                    esc_html($webhookUrl)
                )
            ]
        ];
    }

    public function enqueueAssets()
    {
        if (!is_page() || !$this->isCheckoutPage()) {
            return;
        }

        wp_enqueue_script(
            'your-gateway-checkout',
            plugin_dir_url(dirname(__FILE__)) . 'assets/js/checkout.js',
            ['jquery'],
            '1.0.0',
            true
        );

        wp_enqueue_style(
            'your-gateway-styles',
            plugin_dir_url(dirname(__FILE__)) . 'assets/css/styles.css',
            [],
            '1.0.0'
        );

        wp_localize_script('your-gateway-checkout', 'yourGatewayConfig', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('your_gateway_nonce'),
            'test_mode' => $this->settings->isTestMode(),
            'theme' => $this->settings->get('checkout_theme')
        ]);
    }

    private function isCheckoutPage()
    {
        // Implement logic to detect if current page is checkout
        return true;
    }

    private function getWebhookUrl()
    {
        return admin_url('admin-ajax.php?action=your_gateway_webhook');
    }

    private function getSuccessUrl($transaction)
    {
        return site_url('?fluent-cart=payment-success&transaction=' . $transaction->uuid);
    }

    private function getCancelUrl()
    {
        return site_url('?fluent-cart=payment-cancelled');
    }

    private function getPlanId($subscription)
    {
        // Map FluentCart subscription to gateway plan ID
        return 'your_plan_id';
    }

    private function getSupportedCurrencies()
    {
        return ['USD', 'EUR', 'GBP', 'CAD'];
    }

    public static function validateSettings($data): array
    {
        $mode = Arr::get($data, 'payment_mode', 'test');
        $apiKey = Arr::get($data, $mode . '_api_key');

        if (empty($apiKey)) {
            return [
                'status' => 'failed',
                'message' => __('API key is required.', 'your-plugin')
            ];
        }

        // Test API connection
        $settings = new YourGatewaySettings();
        $settings->settings = $data;
        
        $api = new API($settings);
        $testResult = $api->makeRequest('GET', '/account');

        if (is_wp_error($testResult)) {
            return [
                'status' => 'failed',
                'message' => __('Failed to connect to gateway: ', 'your-plugin') . $testResult->get_error_message()
            ];
        }

        return [
            'status' => 'success',
            'message' => __('Gateway connection verified successfully!', 'your-plugin')
        ];
    }
}
```

## Frontend Assets

**File:** `includes/PaymentMethods/YourGateway/Assets/js/checkout.js`

```javascript
(function($) {
    'use strict';

    const YourGatewayCheckout = {
        init: function() {
            this.bindEvents();
            this.loadGatewaySDK();
        },

        bindEvents: function() {
            $(document).on('click', '.your-gateway-payment-button', this.handlePayment.bind(this));
            $(document).on('fluent_cart_payment_method_selected', this.onPaymentMethodSelected.bind(this));
        },

        loadGatewaySDK: function() {
            if (window.YourGatewaySDK) {
                this.initializeSDK();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.yourgateway.com/v1/checkout.js';
            script.onload = () => this.initializeSDK();
            document.head.appendChild(script);
        },

        initializeSDK: function() {
            if (!window.YourGatewaySDK) {
                console.error('Your Gateway SDK failed to load');
                return;
            }

            this.gateway = window.YourGatewaySDK.init({
                publicKey: yourGatewayConfig.public_key,
                environment: yourGatewayConfig.test_mode ? 'sandbox' : 'production',
                theme: yourGatewayConfig.theme
            });
        },

        onPaymentMethodSelected: function(event, data) {
            if (data.gateway === 'your_gateway') {
                this.setupPaymentForm();
            }
        },

        setupPaymentForm: function() {
            const $container = $('.your-gateway-payment-container');
            
            if (!$container.length) {
                return;
            }

            // Initialize gateway-specific UI elements
            this.gateway.elements.create({
                container: $container[0],
                onReady: () => {
                    $container.removeClass('loading');
                },
                onError: (error) => {
                    this.showError(error.message);
                }
            });
        },

        handlePayment: function(event) {
            event.preventDefault();
            
            const $button = $(event.target);
            const $form = $button.closest('form');
            
            this.showLoading();
            
            // Get order info from FluentCart
            this.getOrderInfo().then((orderData) => {
                return this.gateway.createPayment({
                    amount: orderData.amount,
                    currency: orderData.currency,
                    customerEmail: orderData.customer.email,
                    successUrl: orderData.success_url,
                    cancelUrl: orderData.cancel_url
                });
            }).then((result) => {
                if (result.error) {
                    throw new Error(result.error.message);
                }
                
                // Redirect to payment page
                window.location.href = result.paymentUrl;
                
            }).catch((error) => {
                this.hideLoading();
                this.showError(error.message);
            });
        },

        getOrderInfo: function() {
            return $.ajax({
                url: yourGatewayConfig.ajax_url,
                method: 'POST',
                data: {
                    action: 'fluent_cart_get_order_info',
                    gateway: 'your_gateway',
                    nonce: yourGatewayConfig.nonce
                }
            });
        },

        showLoading: function() {
            $('.your-gateway-payment-button').prop('disabled', true).text('Processing...');
        },

        hideLoading: function() {
            $('.your-gateway-payment-button').prop('disabled', false).text('Pay Now');
        },

        showError: function(message) {
            const $error = $('.your-gateway-error-message');
            $error.text(message).show();
            
            setTimeout(() => {
                $error.fadeOut();
            }, 5000);
        }
    };

    $(document).ready(function() {
        YourGatewayCheckout.init();
    });

})(jQuery);
```

## Registration and Initialization

**File:** `your-plugin.php`

```php
<?php
/*
Plugin Name: Your Gateway for FluentCart
Plugin URI: https://yourgateway.com/fluentcart
Description: Complete payment gateway integration for FluentCart with support for payments, refunds, and subscriptions
Version: 1.0.0
Author: Your Name
License: GPL v2 or later
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('YOUR_GATEWAY_PLUGIN_VERSION', '1.0.0');
define('YOUR_GATEWAY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('YOUR_GATEWAY_PLUGIN_URL', plugin_dir_url(__FILE__));

// Autoload classes
spl_autoload_register(function ($class) {
    $prefix = 'YourPlugin\\PaymentMethods\\YourGateway\\';
    $base_dir = YOUR_GATEWAY_PLUGIN_DIR . 'includes/PaymentMethods/YourGateway/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Initialize plugin
add_action('plugins_loaded', function() {
    // Check if FluentCart is active
    if (!function_exists('fluent_cart_api')) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-error"><p>';
            echo __('Your Gateway requires FluentCart to be installed and activated.', 'your-plugin');
            echo '</p></div>';
        });
        return;
    }

    // Register the gateway
    add_action('fluent_cart/register_payment_methods', function() {
        $gateway = new \YourPlugin\PaymentMethods\YourGateway\YourGateway();
        fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
    });
});

// Activation hook
register_activation_hook(__FILE__, function() {
    // Create necessary database tables or perform setup
    flush_rewrite_rules();
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Cleanup if needed
    flush_rewrite_rules();
});
```

## Critical: IPN/Webhook Handling Architecture

**This is the most critical part of payment gateway implementation** - proper webhook/IPN handling ensures reliable payment processing.

### The FluentCart Webhook Pattern

FluentCart uses a sophisticated **three-layer webhook processing pattern** based on the Paddle gateway implementation:

#### 1. Entry Point: `handleIPN()`
```php
public function handleIPN()
{
    // Entry point for all webhooks - delegates to main processor
    $this->verifyAndProcess();
}
```

#### 2. Main Processor: `verifyAndProcess()`
```php
/**
 * Main webhook processor - handles verification and routing
 * This method follows the exact pattern used by Paddle gateway
 */
private function verifyAndProcess()
{
    $rawPayload = file_get_contents('php://input');
    $payload = json_decode($rawPayload, true);

    if (!$payload) {
        $this->sendWebhookResponse(400, 'Invalid JSON payload');
        return;
    }

    // Verify webhook signature if not disabled
    if (!$this->settings->isWebhookVerificationDisabled()) {
        $webhookSecret = $this->settings->getWebhookSecret();
        if (empty($webhookSecret)) {
            error_log('Your Gateway Webhook Failed: Webhook secret not configured');
            $this->sendWebhookResponse(500, 'Webhook secret not configured');
            return;
        }

        if (!$this->verifyWebhookSignature($rawPayload, $webhookSecret)) {
            error_log('Your Gateway Webhook Failed: Invalid webhook signature');
            $this->sendWebhookResponse(401, 'Invalid webhook signature');
            return;
        }
    }

    // Find the related order using gateway helper
    $order = $this->getOrderFromWebhookData($payload);
    if (!$order) {
        $this->sendWebhookResponse(200, 'Order not found');
        return;
    }

    // Validate event type
    $eventType = $payload['event'] ?? '';
    $acceptedEvents = [
        'payment.completed', 'payment.failed', 'payment.refunded',
        'subscription.created', 'subscription.canceled', 'subscription.updated'
    ];

    if (!in_array($eventType, $acceptedEvents)) {
        $this->sendWebhookResponse(200, 'Event type not handled');
        return;
    }

    // Log webhook for debugging (same as Paddle)
    do_action('fluent_cart/your_gateway_webhook_received', [
        'event_type' => $eventType,
        'data' => $payload,
        'raw' => $rawPayload,
        'order' => $order
    ]);

    // Process the webhook event using FluentCart's action system
    $eventTypeFormatted = str_replace('.', '_', $eventType);
    
    if (has_action('fluent_cart/payments/your_gateway/webhook_' . $eventTypeFormatted)) {
        do_action('fluent_cart/payments/your_gateway/webhook_' . $eventTypeFormatted, [
            'event_type' => $eventType,
            'data' => $payload,
            'raw' => $rawPayload,
            'order' => $order
        ]);
        
        $this->sendWebhookResponse(200, 'Webhook processed successfully');
    } else {
        $this->sendWebhookResponse(200, 'No handler found for event type');
    }
}
```

#### 3. Event-Specific Handlers
```php
/**
 * Initialize webhook event handlers in boot() method
 */
private function initWebhookHandlers()
{
    // Register handlers for specific webhook events (same pattern as Paddle)
    add_action('fluent_cart/payments/your_gateway/webhook_payment_completed', [$this, 'handleWebhookPaymentCompleted'], 10, 1);
    add_action('fluent_cart/payments/your_gateway/webhook_payment_failed', [$this, 'handleWebhookPaymentFailed'], 10, 1);
    add_action('fluent_cart/payments/your_gateway/webhook_payment_refunded', [$this, 'handleWebhookPaymentRefunded'], 10, 1);
    add_action('fluent_cart/payments/your_gateway/webhook_subscription_created', [$this, 'handleWebhookSubscriptionCreated'], 10, 1);
    add_action('fluent_cart/payments/your_gateway/webhook_subscription_canceled', [$this, 'handleWebhookSubscriptionCanceled'], 10, 1);
}

/**
 * Handle payment completed webhook - use service methods, not manual hooks
 */
public function handleWebhookPaymentCompleted($webhookData)
{
    $payload = $webhookData['data'] ?? [];
    $order = $webhookData['order'] ?? null;
    $paymentId = $payload['payment']['id'] ?? '';

    if (!$order || !$paymentId) {
        return false;
    }

    $transaction = OrderTransaction::where('vendor_charge_id', $paymentId)->first();
    if (!$transaction || $transaction->status === Status::TRANSACTION_SUCCEEDED) {
        return false;
    }

    // Update transaction details
    $transaction->update([
        'status' => Status::TRANSACTION_SUCCEEDED,
        'vendor_charge_id' => $paymentId,
        // ... other transaction fields
    ]);

    // Use FluentCart's StatusHelper instead of manual hook firing
    (new StatusHelper($order))->syncOrderStatuses($transaction);
    
    // StatusHelper automatically fires all necessary hooks
    return true;
}
```

### Key Webhook Architecture Points

1. **Single Entry Point**: All webhooks go through `handleIPN()`
2. **Centralized Verification**: `verifyAndProcess()` handles security and routing
3. **Action-Based Dispatch**: Uses WordPress actions for event routing
4. **Service Method Integration**: Individual handlers use FluentCart service methods
5. **Proper Error Handling**: Comprehensive error responses and logging
6. **Order Context**: Always provides order context to handlers

This pattern ensures:
- ✅ Reliable webhook processing
- ✅ Proper security verification
- ✅ Consistent error handling
- ✅ Easy debugging and logging
- ✅ Integration with FluentCart's service layer

## Essential FluentCart Service Methods & Events

**Important**: FluentCart provides sophisticated service classes that automatically handle hook firing and related logic. Instead of manually firing hooks, use these service methods for proper integration.

### Payment Confirmation Services

#### StatusHelper (Primary Method for Payment Updates)
```php
// Use StatusHelper to sync order status - automatically fires all payment hooks
(new \FluentCart\App\Helpers\StatusHelper($order))->syncOrderStatuses($transaction);

// This automatically handles:
// - fluent_cart/payment_success (for successful payments)
// - fluent_cart/payment_failed (for failed payments)
// - fluent_cart/payment_status_changed
// - fluent_cart/order_status_changed
// - Order total calculations
// - Status synchronization
```

#### Advanced Payment Confirmation (Like Paddle Gateway)
```php
// For complex payment confirmations with detailed data
public function confirmPaymentSuccessByCharge($transaction, $args = [])
{
    $vendorChargeId = Arr::get($args, 'vendor_charge_id');
    $charge = Arr::get($args, 'charge');
    
    // Update transaction with payment details
    $transaction->update([
        'status' => Status::TRANSACTION_SUCCEEDED,
        'vendor_charge_id' => $vendorChargeId,
        'payment_method' => 'your_gateway',
        // ... other fields
    ]);
    
    // Use StatusHelper to sync everything
    (new \FluentCart\App\Helpers\StatusHelper($order))->syncOrderStatuses($transaction);
    
    return $order;
}
```

### Refund Services

#### Refund Service (Primary Method for Refunds)
```php
// Use Refund service - automatically handles all refund hooks and logic
\FluentCart\App\Services\Payments\Refund::createOrRecordRefund([
    'vendor_charge_id' => $refundId,
    'payment_method' => 'your_gateway',
    'status' => 'refunded',
    'total' => $refundAmount,
], $parentTransaction);

// This automatically handles:
// - fluent_cart/order_refunded
// - fluent_cart/order_fully_refunded or fluent_cart/order_partially_refunded
// - Refund transaction creation
// - Order total updates
```

### Subscription Services

#### Subscription Renewals
```php
// Use SubscriptionService for renewals - automatically handles subscription hooks
\FluentCart\App\Modules\Subscriptions\Services\SubscriptionService::recordManualRenewal(
    $subscription, 
    $transaction, 
    [
        'billing_info' => $billingInfo,
        'subscription_args' => $subscriptionArgs
    ]
);

// This automatically handles:
// - fluent_cart/subscription_renewed
// - Subscription status updates
// - Next billing date calculations
// - Related transaction processing
```

#### Subscription Activation
```php
// FluentCart automatically fires subscription_activated when status changes
// Use subscription re-sync for status updates
$subscription->reSyncFromRemote();

// Or update subscription manually and let FluentCart handle events
$subscription->update([
    'status' => Status::SUBSCRIPTION_ACTIVE,
    'vendor_subscription_id' => $vendorSubscriptionId
]);
```

### Manual Hook Firing (Only When Service Methods Don't Apply)

```php
// These are automatically handled by StatusHelper, but can be used manually if needed
do_action('fluent_cart/payment_success', [
    'order' => $order,
    'transaction' => $transaction,
    'gateway' => 'your_gateway'
]);

do_action('fluent_cart/payment_failed', [
    'order' => $order,
    'transaction' => $transaction,
    'gateway' => 'your_gateway'
]);
```

#### Gateway-Specific Events

For your own gateway, you can fire custom events that follow FluentCart's naming convention:

```php
// Gateway-specific webhook events
do_action('fluent_cart/payments/your_gateway/webhook_payment_failed', $data);
do_action('fluent_cart/payments/your_gateway/webhook_order_refunded', $data);
```

## Key Service Method Benefits

### Why Use Service Methods Instead of Manual Hook Firing

1. **Automatic Hook Management**: Service methods fire all related hooks in the correct order
2. **Data Consistency**: Ensures all related data is updated consistently
3. **Error Handling**: Built-in error handling and validation
4. **Future Compatibility**: Service methods evolve with FluentCart updates
5. **Less Code**: Reduces boilerplate code in your gateway implementation

### Service Method Pattern Used by All Official Gateways

```php
// Example from Paddle Gateway webhook handler
public function handleTransactionPaid($webhookData)
{
    // ... webhook validation and data extraction ...
    
    // Use Confirmations service method instead of manual updates
    (new Confirmations())->confirmPaymentSuccessByCharge($transactionModel, [
        'vendor_charge_id' => $paddleTransactionId,
        'charge' => $paddleTransaction
    ]);
    
    // Service method automatically handles:
    // - Transaction updates
    // - Order status sync  
    // - Hook firing
    // - Subscription processing (if applicable)
}
```

### Service Methods Reference

| Use Case | Service Method | What It Handles |
|----------|----------------|-----------------|
| Payment Success | `StatusHelper()->syncOrderStatuses()` | All payment success hooks, order status updates |
| Payment Failure | `StatusHelper()->syncOrderStatuses()` | All payment failure hooks, order status updates |
| Refunds | `Refund::createOrRecordRefund()` | All refund hooks, refund transaction creation |
| Subscription Renewals | `SubscriptionService::recordManualRenewal()` | All subscription renewal hooks and logic |
| Order Status Changes | `StatusHelper()->changeOrderStatus()` | Order status change hooks |

## Implementation Best Practices
do_action('fluent_cart/subscription_renewed', [
    'subscription' => $subscription,
    'order' => $renewalOrder,
    'customer' => $customer,
    'transaction' => $transaction
]);

// Subscription Canceled - Fire when subscription is canceled
do_action('fluent_cart/subscription_canceled', [
    'subscription' => $subscription,
    'order' => $order,
    'customer' => $customer,
    'reason' => $cancellationReason
]);

// Subscription Expired - Fire when subscription expires
do_action('fluent_cart/subscription_expired', [
    'subscription' => $subscription,
    'order' => $order,
    'customer' => $customer
]);
```

#### Advanced Subscription Events

```php
// Subscription Status Changed - Generic status change event
do_action('fluent_cart/payments/subscription_status_changed', [
    'subscription' => $subscription,
    'order' => $order,
    'customer' => $customer,
    'old_status' => $oldStatus,
    'new_status' => $newStatus
]);

// Dynamic subscription status events
do_action('fluent_cart/payments/subscription_' . $status, [
    'subscription' => $subscription,
    'order' => $order,
    'customer' => $customer
]);

// Examples of dynamic events:
// fluent_cart/payments/subscription_active
// fluent_cart/payments/subscription_paused  
// fluent_cart/payments/subscription_past_due
// fluent_cart/payments/subscription_trialing
```

### Gateway-Specific Events

Create your own event namespace for gateway-specific integrations:

```php
// Generic gateway events
do_action('fluent_cart/payments/your_gateway/webhook_received', [
    'event_type' => $eventType,
    'webhook_data' => $rawData,
    'order' => $order
]);

// Specific payment events
do_action('fluent_cart/payments/your_gateway/payment_completed', $data);
do_action('fluent_cart/payments/your_gateway/payment_failed', $data);
do_action('fluent_cart/payments/your_gateway/webhook_order_refunded', $data);

// Subscription events
do_action('fluent_cart/payments/your_gateway/subscription_created', $data);
do_action('fluent_cart/payments/your_gateway/subscription_canceled', $data);
do_action('fluent_cart/payments/your_gateway/subscription_payment_received', $data);

// Web hook events (following Paddle/Stripe pattern)
do_action('fluent_cart/payments/your_gateway/webhook_' . $eventType, [
    'event_type' => $eventType,
    'data' => $webhookData,
    'order' => $order
]);
```

### Event Data Standards

#### Required Fields

Always include these core fields in your event data:

```php
$eventData = [
    'order' => $order,              // Order model instance
    'transaction' => $transaction,   // Transaction model instance
    'gateway' => 'your_gateway',     // Your gateway identifier
    'customer' => $customer,         // Customer model instance (if available)
];
```

#### Optional But Recommended Fields

```php
$eventData = [
    // Core fields...
    'webhook_data' => $rawWebhookData,    // Original webhook payload
    'gateway_response' => $apiResponse,    // Gateway API response
    'error_message' => $errorMessage,      // For failed events
    'failure_reason' => $failureReason,    // Specific failure reason
    'refund_amount' => $refundAmount,      // For refund events
    'refund_id' => $refundId,             // Gateway refund identifier
];
```

### Using FluentCart's Event Dispatcher

For complex events, use FluentCart's event dispatcher system:

```php
use FluentCart\App\Events\Order\OrderPaid;
use FluentCart\App\Events\Subscription\SubscriptionActivated;

// Fire order paid event (includes listeners and logging)
(new OrderPaid($order, $customer, $transaction))->dispatch();

// Fire subscription activated event
(new SubscriptionActivated($subscription, $order, $customer))->dispatch();
```

### Event Timing Guidelines

1. **Fire events after database updates** - Ensure data consistency
2. **Fire core events before gateway-specific events** - Allow core processing first
3. **Include error handling** - Events should not break payment flow
4. **Use appropriate hooks** - Match event to actual business logic

```php
// Good: Fire events after database updates
$transaction->update(['status' => 'completed']);
$order->update(['payment_status' => 'paid']);

// Then fire events
do_action('fluent_cart/payment_success', $eventData);
do_action('fluent_cart/payments/your_gateway/payment_completed', $eventData);
```

### Integration Benefits

These events enable:

1. **FluentCart Pro Features**
   - License generation and management
   - Advanced analytics and reporting
   - Subscription management features

2. **Third-Party Integrations**
   - CRM synchronization
   - Email marketing automation
   - Analytics and tracking
   - Membership site integration

3. **Custom Business Logic**
   - Custom fulfillment workflows
   - Inventory management
   - Customer lifecycle management
   - Revenue recognition

## Testing Your Implementation

### 1. Unit Tests

Create basic tests for your gateway:

```php
// tests/YourGatewayTest.php
class YourGatewayTest extends \PHPUnit\Framework\TestCase
{
    public function test_gateway_registration()
    {
        $gateway = new YourGateway();
        $this->assertInstanceOf(AbstractPaymentGateway::class, $gateway);
    }
    
    public function test_supported_features()
    {
        $gateway = new YourGateway();
        $this->assertTrue($gateway->has('payment'));
        $this->assertTrue($gateway->has('refund'));
        $this->assertTrue($gateway->has('subscriptions'));
    }
}
```

### 2. Integration Testing

1. **Test Payment Flow:**
   - Create test order
   - Process payment
   - Verify web hook handling
   - Check order status updates

2. **Test Refund Flow:**
   - Process refund through admin
   - Verify API calls
   - Check transaction records

3. **Test Subscription Flow:**
   - Create subscription
   - Process recurring payments
   - Test cancellation

## Production Checklist

- [ ] API credentials configured for live mode
- [ ] Web hook URL configured in gateway dashboard
- [ ] SSL certificate installed and verified
- [ ] Error logging implemented
- [ ] Security measures in place
- [ ] Performance optimized
- [ ] User experience tested
- [ ] Documentation completed

## Advanced Features

For additional functionality, consider implementing:

- **Multi-currency support**
- **Fraud detection integration**
- **Advanced reporting**
- **Custom payment forms**
- **Mobile app support**
- **Multi-vendor support**

---

**Next:** [Security Guide](./security) to implement proper security measures for production use.
