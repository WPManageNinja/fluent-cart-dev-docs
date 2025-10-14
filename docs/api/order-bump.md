---
title: Order Bump API (Pro)
description: FluentCart Pro Order Bump API for promotional order bump management and upselling features.
---

# Order Bump API (Pro)

The Order Bump system provides advanced promotional tools for increasing average order value through strategic product offers during the checkout process. Order bumps are implemented through hooks and filters rather than REST API endpoints.

## Implementation

Order bumps are handled through the `FluentCartPro\App\Modules\Promotional\OrderBump\OrderBumpBoot` class and use the `OrderPromotion` model with `type = 'order_bump'`.

## Order Bump Hooks and Filters

### 1. Display Order Bumps

Order bumps are displayed during checkout using this action hook:

- **Action Hook:** `fluent_cart/after_order_notes`
- **Description:** Displays available order bumps during the checkout process
- **Parameters:**
  - `$data` (array): Contains the cart object and other checkout data
- **Implementation:** Handled by `OrderBumpBoot::maybeShowBumps()`

### 2. Apply/Remove Order Bump

This filter is used internally by FluentCart to apply or remove an order bump from the cart based on user interaction during checkout.

- **Filter Hook:** `fluent_cart/apply_order_bump`
- **Description:** Handles the logic for adding or removing an order bump product to/from the cart.
- **Parameters:**
  - `$message` (string): A default success or error message.
  - `$data` (array): An array containing:
    - `cart` (object): The current cart object.
    - `bump_id` (int): The ID of the order bump.
    - `request_data` (array): Request data, typically including `is_upgraded` ('yes' or 'no') to indicate if the bump should be added or removed.
- **Return:** A success message (string) or a `WP_Error` object if the operation fails.
- **Use Case:** Custom validation for applying bumps, adding custom tracking, or sending notifications when a bump is added/removed.

**Example Usage (within a custom plugin):**

```php
add_filter('fluent_cart/apply_order_bump', function($message, $data) {
    $cart = $data['cart'];
    $bumpId = $data['bump_id'] ?? 0;
    $willAdd = ($data['request_data']['is_upgraded'] ?? '') === 'yes';

    // Custom validation logic: Prevent adding bump if cart total is too high
    if ($willAdd && $cart->total > 500) {
        return new WP_Error('bump_limit_exceeded', 'This order bump cannot be added to orders over $500.');
    }

    // Custom tracking or logging
    if ($willAdd) {
        error_log("Order Bump #{$bumpId} added to cart for customer {$cart->customer_id}");
    } else {
        error_log("Order Bump #{$bumpId} removed from cart for customer {$cart->customer_id}");
    }

    return $message; // Return the original message or a custom one
}, 10, 2);
```

## Order Bump Model

### OrderPromotion Model

```php
use FluentCartPro\App\Modules\Promotional\Models\OrderPromotion;

class OrderPromotion extends Model
{
    protected $table = 'fct_order_promotions';
    
    protected $fillable = [
        'title',
        'description',
        'product_id',
        'variation_id',
        'discount_type',
        'discount_value',
        'is_active',
        'conditions',
        'settings'
    ];
    
    protected $casts = [
        'conditions' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean'
    ];
}
```

### Creating Order Bumps

```php
// Create an order bump
$orderBump = OrderPromotion::create([
    'title' => 'Premium Support Add-on',
    'description' => 'Get 1 year of premium support with your purchase',
    'product_id' => 123,
    'variation_id' => 456,
    'discount_type' => 'percentage',
    'discount_value' => 20, // 20% off
    'is_active' => true,
    'conditions' => [
        'minimum_cart_total' => 5000, // $50 minimum
        'product_categories' => ['software', 'plugins'],
        'customer_segments' => ['new_customers']
    ],
    'settings' => [
        'display_position' => 'after_order_notes',
        'auto_select' => false,
        'show_urgency' => true
    ]
]);
```

## Order Bump Display

### Order Bump Boot Class

```php
use FluentCartPro\App\Modules\Promotional\OrderBump\OrderBumpBoot;

class OrderBumpBoot
{
    public function register()
    {
        // Display order bumps in checkout
        add_action('fluent_cart/after_order_notes', [$this, 'maybeShowBumps']);
        
        // Handle order bump application
        add_filter('fluent_cart/apply_order_bump', [$this, 'applyOrderBump'], 10, 2);
    }
    
    public function maybeShowBumps($data)
    {
        $cart = $data['cart'];
        $availableBumps = $this->getAvailableBumps($cart);
        
        if (!empty($availableBumps)) {
            $this->renderOrderBumps($availableBumps, $cart);
        }
    }
    
    private function getAvailableBumps($cart)
    {
        return OrderPromotion::where('is_active', true)
            ->where(function($query) use ($cart) {
                $query->whereNull('conditions->minimum_cart_total')
                      ->orWhere('conditions->minimum_cart_total', '<=', $cart->total);
            })
            ->get();
    }
}
```

### Order Bump Application

```php
// Apply order bump to cart
add_filter('fluent_cart/apply_order_bump', function($message, $data) {
    $cart = $data['cart'];
    $bumpId = $data['bump_id'] ?? 0;
    $willAdd = $data['request_data']['is_upgraded'] ?? false;
    
    if ($willAdd) {
        $bump = OrderPromotion::find($bumpId);
        
        if ($bump && $this->isBumpAvailable($bump, $cart)) {
            // Add bump product to cart
            $cart->addItem([
                'product_id' => $bump->product_id,
                'variation_id' => $bump->variation_id,
                'quantity' => 1,
                'is_bump' => true,
                'bump_id' => $bumpId
            ]);
            
            return "Order bump added successfully";
        }
    } else {
        // Remove bump from cart
        $cart->removeBumpItems($bumpId);
        return "Order bump removed";
    }
    
    return $message;
}, 10, 2);
```

## Order Bump Conditions

### Condition Types

#### Minimum Cart Total
```php
'conditions' => [
    'minimum_cart_total' => 5000, // $50 minimum
]
```

#### Product Categories
```php
'conditions' => [
    'product_categories' => ['software', 'plugins', 'themes']
]
```

#### Customer Segments
```php
'conditions' => [
    'customer_segments' => ['new_customers', 'returning_customers']
]
```

#### Excluded Products
```php
'conditions' => [
    'excluded_products' => [123, 456, 789]
]
```

#### Date Range
```php
'conditions' => [
    'start_date' => '2024-01-01',
    'end_date' => '2024-12-31'
]
```

### Custom Conditions

```php
// Custom condition validation
add_filter('fluent_cart/order_bump/conditions', function($conditions, $bump, $cart) {
    // Add custom conditions
    $conditions['custom_condition'] = $this->checkCustomCondition($cart);
    
    return $conditions;
}, 10, 3);

private function checkCustomCondition($cart)
{
    // Custom logic here
    return $cart->customer->total_orders > 5;
}
```

## Order Bump Hooks and Filters

### Order Bump Hooks

```php
// Before order bump is displayed
add_action('fluent_cart/order_bump/before_display', function($bump, $cart) {
    // Custom logic before displaying bump
    if ($cart->hasCoupon('NO_BUMPS')) {
        return false; // Don't show bumps
    }
}, 10, 2);

// After order bump is applied
add_action('fluent_cart/order_bump/applied', function($bump, $cart) {
    // Track bump application
    error_log("Order bump applied: {$bump->title} to cart {$cart->id}");
    
    // Send notification
    wp_mail(
        get_option('admin_email'),
        'Order Bump Applied',
        "Order bump '{$bump->title}' was applied to a cart"
    );
}, 10, 2);

// Order bump conditions
add_action('fluent_cart/order_bump/conditions', function($conditions, $bump, $cart) {
    // Add custom conditions
    $conditions['custom_condition'] = $this->checkCustomCondition($cart);
    
    return $conditions;
}, 10, 3);
```

### Order Bump Filters

```php
// Modify order bump display
add_filter('fluent_cart/order_bump/display_data', function($data, $bump, $cart) {
    // Add custom data to bump display
    $data['custom_message'] = "Limited time offer!";
    $data['urgency_text'] = "Only 3 left in stock!";
    
    return $data;
}, 10, 3);

// Modify promotional settings
add_filter('fluent_cart/promotional/settings', function($settings) {
    // Add custom promotional settings
    $settings['custom_promotion'] = [
        'title' => 'Custom Promotion',
        'type' => 'checkbox',
        'default' => false
    ];
    
    return $settings;
});
```

## Order Bump Settings

### Display Settings

```php
'settings' => [
    'display_position' => 'after_order_notes', // Where to show the bump
    'auto_select' => false, // Auto-select the bump
    'show_urgency' => true, // Show urgency messaging
    'urgency_text' => 'Limited time offer!',
    'discount_display' => 'percentage', // How to show discount
    'button_text' => 'Add to Order',
    'decline_text' => 'No Thanks'
]
```

### Styling Settings

```php
'settings' => [
    'background_color' => '#f8f9fa',
    'border_color' => '#dee2e6',
    'text_color' => '#212529',
    'button_color' => '#007cba',
    'button_text_color' => '#ffffff'
]
```

## Order Bump Analytics

### Tracking Bump Performance

```php
// Track bump views
add_action('fluent_cart/order_bump/viewed', function($bump, $cart) {
    // Log bump view
    error_log("Order bump viewed: {$bump->title} by customer {$cart->customer_id}");
    
    // Store analytics data
    $this->storeBumpAnalytics($bump->id, 'viewed', $cart->customer_id);
}, 10, 2);

// Track bump conversions
add_action('fluent_cart/order_bump/converted', function($bump, $cart, $order) {
    // Log bump conversion
    error_log("Order bump converted: {$bump->title} in order {$order->id}");
    
    // Store conversion data
    $this->storeBumpAnalytics($bump->id, 'converted', $cart->customer_id, $order->id);
}, 10, 3);

private function storeBumpAnalytics($bumpId, $action, $customerId, $orderId = null)
{
    // Store analytics data in database or external service
    $analytics = [
        'bump_id' => $bumpId,
        'action' => $action,
        'customer_id' => $customerId,
        'order_id' => $orderId,
        'timestamp' => current_time('mysql')
    ];
    
    // Store in custom analytics table or external service
    $this->analyticsService->store($analytics);
}
```

---

**Related Documentation:**
- [Licensing API](./licensing) - Software license management
- [Roles & Permissions API](./roles-permissions) - User role management
- [REST API Overview](../api/) - General API information
