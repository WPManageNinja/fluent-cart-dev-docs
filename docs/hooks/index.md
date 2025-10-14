# Hooks

FluentCart provides a comprehensive hook system that allows you to extend and customize the plugin's functionality without modifying core files.

## Hook Types

### [Actions](/hooks/actions)
Actions allow you to execute custom code at specific points in the plugin's execution flow.

### [Filters](/hooks/filters)
Filters allow you to modify data before it's processed or displayed.

## Getting Started

To use hooks in your custom code, you can add them to your theme's `functions.php` file or in a custom plugin.

```php
// Example of using an action hook
add_action('fluent_cart_after_checkout', function($order) {
    // Your custom code here
});

// Example of using a filter hook
add_filter('fluent_cart_product_price', function($price, $product) {
    // Modify the price
    return $price;
}, 10, 2);
```