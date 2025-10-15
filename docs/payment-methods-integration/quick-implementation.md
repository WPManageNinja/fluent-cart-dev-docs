---
title: Quick Implementation
description: Fast setup guide for integrating a basic payment gateway with FluentCart
---

# Quick Implementation

Get your payment gateway integrated with FluentCart quickly with this streamlined approach. Perfect for developers who want to get up and running fast with essential features.

## Overview

This guide focuses on the minimum viable implementation covering:
- Basic gateway registration
- Payment processing
- Settings configuration
- Order completion

**Estimated Time:** 2-4 hours for a basic implementation

## File Structure

Create these files in your plugin:

```
your-plugin/
├── includes/
│   └── PaymentMethods/
│       └── YourGateway/
│           ├── YourGateway.php
│           ├── YourGatewaySettings.php
│           └── API.php
└── your-plugin.php
```

## Step 1: Create Gateway Settings

**File:** `includes/PaymentMethods/YourGateway/YourGatewaySettings.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway;

use FluentCart\App\Modules\PaymentMethods\Core\BaseGatewaySettings;
use FluentCart\App\Helpers\Helper;

class YourGatewaySettings extends BaseGatewaySettings
{
    public $methodHandler = 'fluent_cart_payment_settings_your_gateway';

    public static function getDefaults()
    {
        return [
            'is_active' => 'no',
            'api_key' => '',
            'secret_key' => '',
            'test_mode' => 'yes',
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

    public function getApiKey()
    {
        return $this->get('api_key');
    }

    public function getSecretKey()
    {
        return Helper::decryptKey($this->get('secret_key'));
    }

    public function isTestMode()
    {
        return $this->get('test_mode') === 'yes';
    }
}
```

## Step 2: Create API Handler

**File:** `includes/PaymentMethods/YourGateway/API.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway;

class API
{
    private $settings;
    private $baseUrl;

    public function __construct(YourGatewaySettings $settings)
    {
        $this->settings = $settings;
        $this->baseUrl = $settings->isTestMode() 
            ? 'https://api-test.yourgateway.com' 
            : 'https://api.yourgateway.com';
    }

    public function createPayment($paymentData)
    {
        $response = wp_remote_post($this->baseUrl . '/payments', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->settings->getApiKey(),
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode($paymentData),
            'timeout' => 30
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'message' => $response->get_error_message()
            ];
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        $code = wp_remote_retrieve_response_code($response);

        if ($code >= 400) {
            return [
                'success' => false,
                'message' => $data['error'] ?? 'Payment failed'
            ];
        }

        return [
            'success' => true,
            'payment_id' => $data['id'],
            'redirect_url' => $data['checkout_url']
        ];
    }

    public function getPaymentStatus($paymentId)
    {
        $response = wp_remote_get($this->baseUrl . '/payments/' . $paymentId, [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->settings->getApiKey(),
            ],
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
}
```

## Step 3: Create Main Gateway Class

**File:** `includes/PaymentMethods/YourGateway/YourGateway.php`

```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway;

use FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway;
use FluentCart\App\Services\Payments\PaymentInstance;
use FluentCart\App\Models\Order;

class YourGateway extends AbstractPaymentGateway
{
    public array $supportedFeatures = [
        'payment',
        'webhook'
    ];

    public function __construct()
    {
        parent::__construct(new YourGatewaySettings());
    }

    public function meta(): array
    {
        return [
            'title' => __('Your Gateway', 'your-plugin'),
            'route' => 'your_gateway',
            'slug' => 'your_gateway',
            'description' => __('Accept payments with Your Gateway', 'your-plugin'),
            'logo' => plugin_dir_url(__FILE__) . 'assets/logo.svg',
            'icon' => plugin_dir_url(__FILE__) . 'assets/icon.svg',
            'brand_color' => '#007cba',
            'status' => $this->settings->get('is_active') === 'yes',
            'supported_features' => $this->supportedFeatures
        ];
    }

    public function boot()
    {
        // Register webhook handler
        add_action('wp_ajax_your_gateway_webhook', [$this, 'handleWebhook']);
        add_action('wp_ajax_nopriv_your_gateway_webhook', [$this, 'handleWebhook']);
        
        // Register individual webhook event handlers
        $this->initWebhookHandlers();
    }

    /**
     * Initialize webhook event handlers
     */
    private function initWebhookHandlers()
    {
        // Register handlers for specific webhook events
        add_action('fluent_cart/payments/your_gateway/webhook_payment_completed', [$this, 'handleWebhookPaymentCompleted'], 10, 1);
        add_action('fluent_cart/payments/your_gateway/webhook_payment_failed', [$this, 'handleWebhookPaymentFailed'], 10, 1);
        add_action('fluent_cart/payments/your_gateway/webhook_payment_refunded', [$this, 'handleWebhookPaymentRefunded'], 10, 1);
    }

    public function makePaymentFromPaymentInstance(PaymentInstance $paymentInstance)
    {
        $order = $paymentInstance->order;
        $transaction = $paymentInstance->transaction;

        $paymentData = [
            'amount' => $transaction->total,
            'currency' => $transaction->currency,
            'order_id' => $order->uuid,
            'customer_email' => $order->email,
            'return_url' => $this->getSuccessUrl($transaction),
            'cancel_url' => $this->getCancelUrl()
        ];

        $api = new API($this->settings);
        $result = $api->createPayment($paymentData);

        if ($result['success']) {
            // Store payment ID for later reference
            $transaction->update([
                'vendor_charge_id' => $result['payment_id']
            ]);

            return [
                'success' => true,
                'redirect_url' => $result['redirect_url']
            ];
        }

        return [
            'success' => false,
            'message' => $result['message']
        ];
    }

    public function handleIPN()
    {
        // Entry point for all webhooks - delegates to verifyAndProcess
        $this->verifyAndProcess();
    }

    /**
     * Main webhook processor - handles verification and routing
     */
    private function verifyAndProcess()
    {
        $rawPayload = file_get_contents('php://input');
        $payload = json_decode($rawPayload, true);

        if (!$payload) {
            $this->sendWebhookResponse(400, 'Invalid JSON payload');
            return;
        }

        // Verify webhook signature
        if (!$this->verifyWebhookSignature($rawPayload)) {
            error_log('Your Gateway Webhook Failed: Invalid signature');
            $this->sendWebhookResponse(401, 'Invalid signature');
            return;
        }

        // Find the related order
        $order = $this->getOrderFromWebhookData($payload);
        if (!$order) {
            $this->sendWebhookResponse(200, 'Order not found');
            return;
        }

        // Get event type
        $eventType = $payload['event'] ?? '';
        
        // Validate event type
        $acceptedEvents = ['payment.completed', 'payment.failed', 'payment.refunded'];
        if (!in_array($eventType, $acceptedEvents)) {
            $this->sendWebhookResponse(200, 'Event type not handled');
            return;
        }

        // Log webhook for debugging
        do_action('fluent_cart/your_gateway_webhook_received', [
            'event_type' => $eventType,
            'data' => $payload,
            'raw' => $rawPayload,
            'order' => $order
        ]);

        // Process the specific webhook event
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

    /**
     * Verify webhook signature
     */
    private function verifyWebhookSignature($payload)
    {
        $signature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
        $secretKey = $this->settings->getSecretKey();
        
        if (!$signature || !$secretKey) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secretKey);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Get order from webhook data
     */
    private function getOrderFromWebhookData($payload)
    {
        // Extract order identifier from webhook data
        $orderId = $payload['order_id'] ?? '';
        $transactionId = $payload['transaction_id'] ?? '';
        
        if ($orderId) {
            return \FluentCart\App\Models\Order::find($orderId);
        }
        
        if ($transactionId) {
            $transaction = \FluentCart\App\Models\OrderTransaction::where('vendor_charge_id', $transactionId)->first();
            return $transaction ? $transaction->order : null;
        }
        
        return null;
    }

    /**
     * Send webhook response
     */
    private function sendWebhookResponse($code, $message)
    {
        http_response_code($code);
        echo $message;
        exit;
    }

    /**
     * Handle payment completed webhook event
     */
    public function handleWebhookPaymentCompleted($webhookData)
    {
        $payload = $webhookData['data'] ?? [];
        $order = $webhookData['order'] ?? null;
        $paymentId = $payload['payment']['id'] ?? '';

        if (!$order || !$paymentId) {
            return false;
        }

        $transaction = \FluentCart\App\Models\OrderTransaction::where('vendor_charge_id', $paymentId)->first();
        
        if (!$transaction) {
            return false;
        }

        // Update transaction status
        $transaction->update([
            'status' => 'completed',
            'vendor_charge_id' => $paymentId
        ]);

        // Use FluentCart's StatusHelper to sync order status and fire hooks
        (new \FluentCart\App\Helpers\StatusHelper($order))->syncOrderStatuses($transaction);

        return true;
    }

    /**
     * Handle payment failed webhook event
     */
    public function handleWebhookPaymentFailed($webhookData)
    {
        $payload = $webhookData['data'] ?? [];
        $order = $webhookData['order'] ?? null;
        $paymentId = $payload['payment']['id'] ?? '';

        if (!$order || !$paymentId) {
            return false;
        }

        $transaction = \FluentCart\App\Models\OrderTransaction::where('vendor_charge_id', $paymentId)->first();
        
        if (!$transaction) {
            return false;
        }

        // Update transaction status
        $transaction->update([
            'status' => 'failed',
            'vendor_charge_id' => $paymentId
        ]);

        // Use FluentCart's StatusHelper to sync order status and fire hooks
        (new \FluentCart\App\Helpers\StatusHelper($order))->syncOrderStatuses($transaction);

        return true;
    }

    /**
     * Handle payment refunded webhook event
     */
    public function handleWebhookPaymentRefunded($webhookData)
    {
        $payload = $webhookData['data'] ?? [];
        $order = $webhookData['order'] ?? null;
        $refundData = $payload['refund'] ?? [];
        
        if (!$order || !$refundData) {
            return false;
        }

        $refundAmount = $refundData['amount'] ?? 0;
        $refundId = $refundData['id'] ?? '';
        $parentTransactionId = $refundData['transaction_id'] ?? '';

        $parentTransaction = \FluentCart\App\Models\OrderTransaction::where('vendor_charge_id', $parentTransactionId)->first();
        
        if (!$parentTransaction) {
            return false;
        }

        // Use FluentCart's Refund service to handle refunds
        \FluentCart\App\Services\Payments\Refund::createOrRecordRefund([
            'vendor_charge_id' => $refundId,
            'payment_method' => 'your_gateway',
            'status' => 'refunded',
            'total' => $refundAmount,
        ], $parentTransaction);

        return true;
    }

    public function handleWebhook()
    {
        $this->handleIPN();
    }

    public function getOrderInfo(array $data)
    {
        // Return order information for frontend
        return [
            'gateway_config' => [
                'test_mode' => $this->settings->isTestMode(),
                'public_key' => $this->settings->getApiKey()
            ]
        ];
    }

    public function fields(): array
    {
        $webhookUrl = site_url('?fluent-cart=fct_payment_listener_ipn&method=your_gateway');
        
        $webhookInstructions = '<div style="padding:12px 0;">'
            . '<p><strong>' . __('Webhook URL:', 'your-plugin') . '</strong> '
            . '<code>' . esc_html($webhookUrl) . '</code></p>'
            . '<p>' . __('Configure this URL in your payment provider dashboard to receive real-time payment notifications.', 'your-plugin') . '</p>'
            . '</div>';

        $testSchema = [
            'test_api_key' => [
                'value' => '',
                'label' => __('Test API Key', 'your-plugin'),
                'type' => 'password',
                'placeholder' => __('Your test API key', 'your-plugin'),
                'help_text' => __('Get your test API key from your payment provider dashboard', 'your-plugin')
            ],
            'test_secret_key' => [
                'value' => '',
                'label' => __('Test Secret Key', 'your-plugin'),
                'type' => 'password',
                'placeholder' => __('Your test secret key', 'your-plugin'),
                'help_text' => __('Used to verify webhook signatures', 'your-plugin')
            ],
            'test_webhook_instructions' => [
                'value' => $webhookInstructions,
                'label' => __('Webhook Configuration', 'your-plugin'),
                'type' => 'html_attr'
            ]
        ];

        $liveSchema = [
            'live_api_key' => [
                'value' => '',
                'label' => __('Live API Key', 'your-plugin'),
                'type' => 'password',
                'placeholder' => __('Your live API key', 'your-plugin'),
                'help_text' => __('Get your live API key from your payment provider dashboard', 'your-plugin')
            ],
            'live_secret_key' => [
                'value' => '',
                'label' => __('Live Secret Key', 'your-plugin'),
                'type' => 'password',
                'placeholder' => __('Your live secret key', 'your-plugin'),
                'help_text' => __('Used to verify webhook signatures', 'your-plugin')
            ],
            'live_webhook_instructions' => [
                'value' => $webhookInstructions,
                'label' => __('Webhook Configuration', 'your-plugin'),
                'type' => 'html_attr'
            ]
        ];

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
                        'label' => __('Live credentials', 'your-plugin'),
                        'value' => 'live',
                        'schema' => $liveSchema
                    ],
                    [
                        'type' => 'tab',
                        'label' => __('Test credentials', 'your-plugin'),
                        'value' => 'test',
                        'schema' => $testSchema
                    ]
                ]
            ],
            'payment_title' => [
                'value' => __('Your Gateway', 'your-plugin'),
                'label' => __('Payment Method Title', 'your-plugin'),
                'type' => 'text',
                'placeholder' => __('Your Gateway', 'your-plugin')
            ],
            'payment_description' => [
                'value' => __('Pay securely with Your Gateway', 'your-plugin'),
                'label' => __('Payment Method Description', 'your-plugin'),
                'type' => 'textarea',
                'placeholder' => __('Payment method description', 'your-plugin')
            ]
        ];
    }

    private function verifyWebhook($payload)
    {
        $signature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
        $expectedSignature = hash_hmac('sha256', $payload, $this->settings->getSecretKey());
        
        return hash_equals($expectedSignature, $signature);
    }

    private function getSuccessUrl($transaction)
    {
        return site_url('?fluent-cart=payment-success&transaction=' . $transaction->uuid);
    }

    private function getCancelUrl()
    {
        return site_url('?fluent-cart=payment-cancelled');
    }
}
```

## Step 4: Register the Gateway

**File:** `your-plugin.php`

```php
<?php
/*
Plugin Name: Your Gateway for FluentCart
Description: Payment gateway integration for FluentCart
Version: 1.0.0
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Include your gateway files
require_once plugin_dir_path(__FILE__) . 'includes/PaymentMethods/YourGateway/YourGatewaySettings.php';
require_once plugin_dir_path(__FILE__) . 'includes/PaymentMethods/YourGateway/API.php';
require_once plugin_dir_path(__FILE__) . 'includes/PaymentMethods/YourGateway/YourGateway.php';

// Register the gateway when FluentCart is ready
add_action('fluent_cart/register_payment_methods', function() {
    if (!function_exists('fluent_cart_api')) {
        return; // FluentCart not active
    }
    
    $gateway = new \YourPlugin\PaymentMethods\YourGateway\YourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

## Step 5: Test Your Integration

1. **Activate your plugin** in WordPress admin
2. **Navigate to** FluentCart → Settings → Payment Methods
3. **Configure your gateway** with test credentials
4. **Enable the gateway** and save settings
5. **Test a payment** on your checkout page

## Essential FluentCart Service Methods & Events

**Important**: FluentCart provides service classes that automatically handle hook firing. Instead of manually firing hooks, use these service methods:

### Payment Confirmation Services

#### StatusHelper (Recommended Approach)
```php
// Use StatusHelper to sync order status - automatically fires all payment hooks
(new \FluentCart\App\Helpers\StatusHelper($order))->syncOrderStatuses($transaction);

// This automatically fires:
// - fluent_cart/payment_success (for successful payments)
// - fluent_cart/payment_failed (for failed payments)
// - fluent_cart/payment_status_changed
// - fluent_cart/order_status_changed
```

#### Refund Service (Recommended Approach)
```php
// Use Refund service - automatically handles all refund hooks and logic
\FluentCart\App\Services\Payments\Refund::createOrRecordRefund([
    'vendor_charge_id' => $refundId,
    'payment_method' => 'your_gateway',
    'status' => 'refunded',
    'total' => $refundAmount,
], $parentTransaction);

// This automatically fires:
// - fluent_cart/order_refunded
// - fluent_cart/order_fully_refunded or fluent_cart/order_partially_refunded
```

### Subscription Services

#### For Subscription Renewals
```php
// Use SubscriptionService for renewals - automatically handles subscription hooks
\FluentCart\App\Modules\Subscriptions\Services\SubscriptionService::recordManualRenewal(
    $subscription, 
    $transaction, 
    $renewalArgs
);

// This automatically fires subscription-related hooks
```

### Manual Hook Firing (Only if service methods don't cover your needs)

#### Payment Events
```php
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

### Gateway-Specific Events

For your own gateway, you can also fire custom events that follow FluentCart's naming convention:

```php
// Gateway-specific webhook events
do_action('fluent_cart/payments/your_gateway/webhook_payment_failed', $data);
do_action('fluent_cart/payments/your_gateway/webhook_order_refunded', $data);
```

## Key Points

- **Use service methods first**: FluentCart's service classes handle most hook firing automatically
- **StatusHelper** is your main tool for payment status updates
- **Refund service** handles all refund scenarios  
- **SubscriptionService** handles subscription lifecycle
- Only fire hooks manually when service methods don't cover your specific needs
- Always follow FluentCart's naming conventions for custom events

### Gateway-Specific Events

For your own gateway, you can also fire custom events that follow FluentCart's naming convention:

```php
// Gateway-specific webhook events
do_action('fluent_cart/payments/your_gateway/webhook_payment_failed', $data);
do_action('fluent_cart/payments/your_gateway/webhook_order_refunded', $data);
```

### Why These Service Methods Matter

These events are essential because they:

1. **Trigger FluentCart's internal processes** - Order status updates, email notifications, inventory management
2. **Enable third-party integrations** - CRM sync, analytics tracking, membership access
3. **Support FluentCart Pro features** - License generation, subscription management, advanced reporting  
4. **Maintain data consistency** - Ensures all parts of FluentCart stay synchronized

### Event Data Format

Always include these core fields in your event data:

```php
$eventData = [
    'order' => $order,              // Order model instance
    'transaction' => $transaction,   // Transaction model instance  
    'customer' => $customer,         // Customer model instance (if available)
    'gateway' => 'your_gateway',     // Your gateway identifier
    'webhook_data' => $rawData       // Original webhook data (for debugging)
];
```

### Using FluentCart's Built-in Helper

FluentCart's `AbstractPaymentGateway` provides a helper method that automatically fires the core events:

```php
// In your webhook processing method
$this->updateOrderDataByOrder($order, [
    'status' => 'completed',
    'total' => $transaction->total,
    'gateway_response' => json_encode($webhookData)
], $transaction);
```

This method automatically handles:
- Order status updates
- Transaction status updates  
- Firing `fluent_cart/payment_success` or `fluent_cart/payment_failed` events
- Triggering inventory management
- Sending notifications

## Web Hook Setup

Configure webhooks in your payment provider dashboard:

- **Webhook URL:** `https://yoursite.com/wp-admin/admin-ajax.php?action=your_gateway_webhook`
- **Events:** payment.completed, payment.failed
- **Signature:** Use your secret key for HMAC SHA256

## What's Next?

This quick implementation covers the basics. For production use, consider:

- **[Complete Implementation](./complete-implementation)** - Add refunds, subscriptions, and advanced features
- **[Security Guide](./security)** - Implement proper security measures
- **[Error Handling](./error-handling)** - Robust error handling and logging

## Common Issues

### Gateway Not Appearing
- Ensure FluentCart is active
- Check that your hook is registered correctly
- Verify class namespaces and file paths

### Payment Not Processing
- Check API credentials in test mode
- Verify webhook URL is accessible
- Review error logs for API responses

### Settings Not Saving
- Confirm field definitions in `fields()` method
- Check methodHandler property matches your gateway

---

**Next:** [Complete Implementation](./complete-implementation) for production-ready features.
