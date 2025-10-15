---
title: Integration Methods
description: Different approaches to integrate payment gateways with FluentCart depending on your use case
---

# Integration Methods

Choose the right integration approach based on your needs, technical requirements, and deployment scenario. FluentCart supports multiple integration patterns for maximum flexibility.

## Integration Approaches

### 1. Plugin-based Integration (Recommended)

**Best for:** Third-party developers, marketplace distribution, isolated functionality

**Advantages:**
- Clean separation from FluentCart core
- Easy to distribute and install
- Independent updates
- WordPress plugin standards

**Example Structure:**
```
your-gateway-plugin/
├── your-gateway.php
├── includes/
│   └── PaymentMethods/
│       └── YourGateway/
└── assets/
```

**Implementation:**
```php
// your-gateway.php
add_action('fluent_cart/register_payment_methods', function() {
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', new YourGateway());
});
```

### 2. Theme Integration

**Best for:** Theme-specific customizations, single-site deployments

**Advantages:**
- No additional plugin required
- Theme-specific styling
- Direct control over presentation

**Example Structure:**
```
your-theme/
├── functions.php
├── fluent-cart/
│   └── gateways/
│       └── your-gateway/
└── assets/
```

**Implementation:**
```php
// functions.php
require_once get_template_directory() . '/fluent-cart/gateways/your-gateway/YourGateway.php';

add_action('fluent_cart/register_payment_methods', function() {
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', new YourGateway());
});
```

### 3. Must-Use Plugin Integration

**Best for:** Site-specific requirements, hosting provider integrations

**Advantages:**
- Always active (cannot be deactivated)
- Loads before regular plugins
- Perfect for hosting-specific gateways

**Example Structure:**
```
wp-content/mu-plugins/
├── your-gateway.php
└── your-gateway/
    └── includes/
```

**Implementation:**
```php
// wp-content/mu-plugins/your-gateway.php
require_once __DIR__ . '/your-gateway/includes/YourGateway.php';

add_action('fluent_cart/register_payment_methods', function() {
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', new YourGateway());
});
```

### 4. FluentCart Pro Add-on

**Best for:** Advanced integrations, commercial distributions

**Advantages:**
- Access to Pro features
- Integrated licensing
- Professional support

**Example Structure:**
```
fluent-cart-pro/
├── app/Modules/PaymentMethods/
│   └── YourGateway/
└── boot/
    └── payment-methods.php
```

**Implementation:**
```php
// In FluentCart Pro context
class YourGateway extends AbstractPaymentGateway
{
    public static function register()
    {
        fluent_cart_api()->registerCustomPaymentMethod('your_gateway', new self());
    }
}
```

## Registration Patterns

### Standard Registration

The most common approach using the registration hook:

```php
add_action('fluent_cart/register_payment_methods', function() {
    // Ensure FluentCart is available
    if (!function_exists('fluent_cart_api')) {
        return;
    }
    
    $gateway = new YourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### Conditional Registration

Register gateway only when conditions are met:

```php
add_action('fluent_cart/register_payment_methods', function() {
    // Check if required dependencies are available
    if (!class_exists('YourGatewaySDK') || !function_exists('curl_init')) {
        return;
    }
    
    // Check if already registered to avoid conflicts
    if (App::gateway('your_gateway')) {
        return;
    }
    
    $gateway = new YourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### Dynamic Registration

Register gateway based on configuration or environment:

```php
add_action('fluent_cart/register_payment_methods', function() {
    $config = get_option('your_gateway_config');
    
    if (!$config || !$config['enabled']) {
        return;
    }
    
    // Create gateway with specific configuration
    $gateway = new YourGateway($config);
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

## Namespace Strategies

### Plugin Namespace

```php
namespace YourCompany\FluentCartGateways\YourGateway;

use FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway;

class YourGateway extends AbstractPaymentGateway
{
    // Implementation
}
```

### Vendor Namespace

```php
namespace Vendor\PaymentGateways\FluentCart;

class YourGateway extends \FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway
{
    // Implementation
}
```

### Theme Namespace

```php
namespace ThemeName\Integrations\FluentCart;

class YourGateway extends \FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway
{
    // Implementation
}
```

## Environment-Specific Integration

### Development Environment

```php
add_action('fluent_cart/register_payment_methods', function() {
    if (!defined('WP_DEBUG') || !WP_DEBUG) {
        return; // Only load in development
    }
    
    $gateway = new DevYourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('dev_your_gateway', $gateway);
});
```

### Staging Environment

```php
add_action('fluent_cart/register_payment_methods', function() {
    if (wp_get_environment_type() !== 'staging') {
        return;
    }
    
    $gateway = new YourGateway();
    $gateway->setTestMode(true);
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### Production Environment

```php
add_action('fluent_cart/register_payment_methods', function() {
    if (wp_get_environment_type() !== 'production') {
        return;
    }
    
    $gateway = new YourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

## Multi-Site Integration

### Network-Wide Gateway

```php
// In mu-plugins or network-activated plugin
add_action('fluent_cart/register_payment_methods', function() {
    if (!is_multisite()) {
        return;
    }
    
    // Register for all sites in network
    $gateway = new NetworkYourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### Site-Specific Gateway

```php
add_action('fluent_cart/register_payment_methods', function() {
    // Only register for specific sites
    $allowed_sites = [1, 3, 5]; // Site IDs
    
    if (!in_array(get_current_blog_id(), $allowed_sites)) {
        return;
    }
    
    $gateway = new YourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

## Dependency Management

### Required Plugin Check

```php
add_action('fluent_cart/register_payment_methods', function() {
    $required_plugins = [
        'fluent-cart/fluent-cart.php',
        'your-dependency/your-dependency.php'
    ];
    
    foreach ($required_plugins as $plugin) {
        if (!is_plugin_active($plugin)) {
            return;
        }
    }
    
    $gateway = new YourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### Class Existence Check

```php
add_action('fluent_cart/register_payment_methods', function() {
    $required_classes = [
        'FluentCart\\App\\Modules\\PaymentMethods\\Core\\AbstractPaymentGateway',
        'YourSDK\\Client'
    ];
    
    foreach ($required_classes as $class) {
        if (!class_exists($class)) {
            return;
        }
    }
    
    $gateway = new YourGateway();
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

## Configuration-Based Integration

### Database Configuration

```php
add_action('fluent_cart/register_payment_methods', function() {
    $config = get_option('your_gateway_settings');
    
    if (!$config || $config['status'] !== 'active') {
        return;
    }
    
    $gateway = new YourGateway();
    $gateway->configure($config);
    
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### File-Based Configuration

```php
add_action('fluent_cart/register_payment_methods', function() {
    $config_file = WP_CONTENT_DIR . '/gateway-configs/your-gateway.json';
    
    if (!file_exists($config_file)) {
        return;
    }
    
    $config = json_decode(file_get_contents($config_file), true);
    
    $gateway = new YourGateway($config);
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### Environment Variable Configuration

```php
add_action('fluent_cart/register_payment_methods', function() {
    $api_key = getenv('YOUR_GATEWAY_API_KEY');
    
    if (!$api_key) {
        return;
    }
    
    $gateway = new YourGateway([
        'api_key' => $api_key,
        'environment' => getenv('YOUR_GATEWAY_ENV') ?: 'production'
    ]);
    
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

## Advanced Integration Patterns

### Factory Pattern

```php
class YourGatewayFactory
{
    public static function create($config = [])
    {
        $environment = $config['environment'] ?? 'production';
        
        switch ($environment) {
            case 'development':
                return new DevYourGateway($config);
            case 'staging':
                return new StagingYourGateway($config);
            default:
                return new YourGateway($config);
        }
    }
}

add_action('fluent_cart/register_payment_methods', function() {
    $config = get_option('your_gateway_config', []);
    $gateway = YourGatewayFactory::create($config);
    
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
});
```

### Service Container Integration

```php
class GatewayServiceProvider
{
    public function register()
    {
        // Register dependencies
        app()->singleton('your.gateway.api', function() {
            return new YourGatewayAPI();
        });
        
        app()->singleton('your.gateway.settings', function() {
            return new YourGatewaySettings();
        });
        
        // Register gateway
        add_action('fluent_cart/register_payment_methods', function() {
            $gateway = new YourGateway(
                app('your.gateway.settings'),
                app('your.gateway.api')
            );
            
            fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
        });
    }
}
```

## Error Handling and Fallbacks

### Graceful Degradation

```php
add_action('fluent_cart/register_payment_methods', function() {
    try {
        $gateway = new YourGateway();
        
        // Test gateway connectivity
        if ($gateway->testConnection()) {
            fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
        } else {
            error_log('Your Gateway: Connection test failed, gateway not registered');
        }
        
    } catch (Exception $e) {
        error_log('Your Gateway: Registration failed - ' . $e->getMessage());
        
        // Optionally register a fallback gateway
        $fallback = new FallbackGateway();
        fluent_cart_api()->registerCustomPaymentMethod('fallback_gateway', $fallback);
    }
});
```

### Multiple Gateway Variants

```php
add_action('fluent_cart/register_payment_methods', function() {
    $gateways = [
        'your_gateway_credit_card' => new YourGatewayCreditCard(),
        'your_gateway_bank_transfer' => new YourGatewayBankTransfer(),
        'your_gateway_digital_wallet' => new YourGatewayDigitalWallet()
    ];
    
    foreach ($gateways as $slug => $gateway) {
        if ($gateway->isAvailable()) {
            fluent_cart_api()->registerCustomPaymentMethod($slug, $gateway);
        }
    }
});
```

## Best Practices

### 1. Check Dependencies Early

```php
add_action('fluent_cart/register_payment_methods', function() {
    // Early return if requirements not met
    if (!function_exists('fluent_cart_api')) {
        return;
    }
    
    if (!class_exists('YourGatewaySDK')) {
        if (is_admin()) {
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p>Your Gateway SDK is required but not found.</p></div>';
            });
        }
        return;
    }
    
    // Continue with registration
});
```

### 2. Use Proper Error Handling

```php
add_action('fluent_cart/register_payment_methods', function() {
    try {
        $gateway = new YourGateway();
        fluent_cart_api()->registerCustomPaymentMethod('your_gateway', $gateway);
        
    } catch (Exception $e) {
        // Log error but don't break the site
        error_log('Gateway registration failed: ' . $e->getMessage());
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            wp_die('Gateway registration failed: ' . $e->getMessage());
        }
    }
});
```

### 3. Implement Proper Hooks

```php
// Use the correct priority for your needs
add_action('fluent_cart/register_payment_methods', function() {
    // Your registration code
}, 10); // Default priority

// For gateways that depend on other gateways
add_action('fluent_cart/register_payment_methods', function() {
    // Your dependent gateway
}, 20); // Later priority
```

---

**Next:** [Security Guide](./security) to implement proper security measures for your integration.
