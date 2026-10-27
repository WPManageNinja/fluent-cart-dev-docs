---
title: Shipping Module
description: FluentCart Shipping module architecture, shipping zones, methods, and rate calculations.
---

# Shipping Module

The Shipping module handles shipping calculations, zone management, and delivery options in FluentCart. It provides a flexible system for configuring shipping rates based on location, product weight, and other factors.

## Architecture Overview

### Core Components

#### 1. **Shipping Zones**
Geographic areas where specific shipping methods are available.

#### 2. **Shipping Methods**
Specific delivery options within each zone (e.g., Standard, Express, Overnight).

#### 3. **Shipping Classes**
Product categories that can have different shipping rates.

#### 4. **Rate Calculations**
Dynamic pricing based on various factors like weight, distance, and product type.

## Database Models

### ShippingZone Model

```php
class ShippingZone extends Model
{
    protected $table = 'fct_shipping_zones';
    
    protected $appends = ['formatted_region'];

    protected $fillable = [
        'name',
        'region',
        'order',
        'shipping_class_id',
        'meta'
    ];
    
    public function methods(): HasMany
    {
        return $this->hasMany(ShippingMethod::class, 'zone_id', 'id')
            ->orderBy('id', 'DESC');
    }
}
```

### ShippingMethod Model

```php
class ShippingMethod extends Model
{
    protected $table = 'fct_shipping_methods';
    
    protected $fillable = [
        'zone_id',
        'title',
        'type',
        'settings',
        'amount',
        'is_enabled',
        'order',
        'states',
        'meta'
    ];

    protected $appends = ['formatted_states'];

    protected $casts = [
        'settings'   => 'array',
        'states'     => 'array',
        'is_enabled' => 'boolean'
    ];
    
    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class, 'zone_id', 'id');
    }
}
```

### ShippingClass Model

```php
class ShippingClass extends Model
{
    protected $table = 'fct_shipping_classes';
    
    protected $fillable = [
        'name',
        'cost',
        'type',
        'per_item'
    ];
    
    protected $casts = [
        'cost' => 'float'
    ];
}
```

## Shipping Zones

### Creating Shipping Zones

```php
use FluentCart\App\Models\ShippingZone;

// Create a new shipping zone
$zone = ShippingZone::create([
    'name' => 'United States',
    'region' => 'US',
    'order' => 1
]);

// Create a zone for multiple countries
$europeZone = ShippingZone::create([
    'name' => 'Europe',
    'region' => 'selection',
    'meta' => [
        'countries'      => ['GB', 'DE', 'FR', 'IT', 'ES'],
        'selection_type' => 'included'
    ],
    'order' => 2
]);

// Create a worldwide zone
$worldwideZone = ShippingZone::create([
    'name' => 'Rest of World',
    'region' => 'all', // Whole World - only one such zone per shipping class
    'order' => 3
]);
```

### Managing Zone Regions

```php
// Target a single country
$zone = ShippingZone::find(1);
$zone->region = 'US';
$zone->save();

// Target several countries: region becomes 'selection' and the list lives in meta
$zone->region = 'selection';
$zone->meta = [
    'countries'      => ['US', 'CA', 'MX'],
    'selection_type' => 'included' // or 'excluded'
];
$zone->save();

// Get the human-readable region label
$formattedRegion = $zone->formatted_region;
// 'United States', or 'Whole World' when region is 'all'
```

## Shipping Methods

### Creating Shipping Methods

The shipping module provides a flexible framework for creating custom shipping methods. You can define your own shipping method types and configurations.

#### **Custom Shipping Method**

```php
$shippingMethod = ShippingMethod::create([
    'zone_id' => 1,
    'title' => 'Standard Shipping',
    'type' => 'flat_rate',
    'amount' => 5.00, // base-currency major units, not cents
    'is_enabled' => true,
    'settings' => [
        'configure_rate'    => 'per_order',
        'class_aggregation' => 'sum_all'
    ]
]);
```

#### **Free Shipping Method**

```php
$freeShipping = ShippingMethod::create([
    'zone_id' => 1,
    'title' => 'Free Shipping',
    'type' => 'free_shipping',
    'amount' => 0,
    'is_enabled' => true,
    'settings' => []
]);
```

#### **Weight-Based Shipping**

```php
$weightBased = ShippingMethod::create([
    'zone_id' => 1,
    'title' => 'Weight Based Shipping',
    'type' => 'flat_rate',
    'amount' => 0,
    'is_enabled' => true,
    'settings' => [
        'configure_rate' => 'per_weight',
        'weight_tiers'   => [
            ['min' => 0, 'max' => 5, 'cost' => 5.00],
            ['min' => 5, 'max' => 0, 'cost' => 12.00] // max 0 = no upper bound
        ]
    ]
]);
```

### Custom Shipping Methods

#### Creating a Custom Shipping Method

```php
class ExpressShipping extends ShippingMethod
{
    public function calculateRate($cart, $address)
    {
        $baseRate = 1500; // $15 base rate
        $weightRate = $cart->getTotalWeight() * 200; // $2 per lb
        
        return $baseRate + $weightRate;
    }
    
    public function isAvailable($cart, $address)
    {
        // Only available for orders over $100
        return $cart->getTotal() >= 10000;
    }
}
```

## Shipping Classes

### Creating Shipping Classes

```php
use FluentCart\App\Models\ShippingClass;

// Create shipping classes for different product types
$fragileClass = ShippingClass::create([
    'name' => 'Fragile Items',
    'cost' => 1000, // $10 additional cost
    'type' => 'fixed',
    'per_item' => false
]);

$heavyClass = ShippingClass::create([
    'name' => 'Heavy Items',
    'cost' => 500, // $5 additional cost
    'type' => 'fixed',
    'per_item' => true // Cost per item
]);

$digitalClass = ShippingClass::create([
    'name' => 'Digital Products',
    'cost' => 0, // No shipping cost
    'type' => 'fixed',
    'per_item' => false
]);
```

### Assigning Shipping Classes to Products

```php
use FluentCart\App\Models\Product;

// Assign shipping class to a product
$product = Product::find(1);
$product->shipping_class_id = $fragileClass->id;
$product->save();

// Or through product meta
$product->updateMeta('shipping_class', $fragileClass->id);
```

## Rate Calculations

### Basic Rate Calculation

```php
class ShippingCalculator
{
    public function calculateShipping($cart, $address)
    {
        $zone = $this->getShippingZone($address);
        
        if (!$zone) {
            return null; // No shipping available
        }
        
        $methods = $zone->methods()->where('is_enabled', true)->get();
        $availableMethods = [];
        
        foreach ($methods as $method) {
            if ($this->isMethodAvailable($method, $cart, $address)) {
                $rate = $this->calculateMethodRate($method, $cart, $address);
                $availableMethods[] = [
                    'id' => $method->id,
                    'title' => $method->title,
                    'cost' => $rate,
                    'description' => $method->settings['description'] ?? ''
                ];
            }
        }
        
        return $availableMethods;
    }
    
    private function calculateMethodRate($method, $cart, $address)
    {
        switch ($method->type) {
            case 'flat_rate':
                return $method->amount;
                
            case 'free_shipping':
                $minimumAmount = $method->settings['minimum_amount'] ?? 0;
                return $cart->getTotal() >= $minimumAmount ? 0 : null;
                
            case 'table_rate':
                return $this->calculateTableRate($method, $cart);
                
            default:
                return $method->amount;
        }
    }
    
    private function calculateTableRate($method, $cart)
    {
        $rates = $method->settings['rates'] ?? [];
        $calculationType = $method->settings['calculation_type'] ?? 'weight';
        
        $value = match($calculationType) {
            'weight' => $cart->getTotalWeight(),
            'quantity' => $cart->getTotalQuantity(),
            'price' => $cart->getTotal(),
            default => $cart->getTotalWeight()
        };
        
        foreach ($rates as $rate) {
            $min = $rate['min'];
            $max = $rate['max'] == 0 ? PHP_FLOAT_MAX : $rate['max'];
            
            if ($value >= $min && $value <= $max) {
                return $rate['cost'];
            }
        }
        
        return 0; // No matching rate found
    }
}
```

### Advanced Rate Calculation with Shipping Classes

```php
class AdvancedShippingCalculator extends ShippingCalculator
{
    public function calculateMethodRate($method, $cart, $address)
    {
        $baseRate = parent::calculateMethodRate($method, $cart, $address);
        
        if ($baseRate === null) {
            return null;
        }
        
        // Add shipping class costs
        $shippingClassCost = $this->calculateShippingClassCost($cart);
        
        return $baseRate + $shippingClassCost;
    }
    
    private function calculateShippingClassCost($cart)
    {
        $totalCost = 0;
        $shippingClasses = [];
        
        foreach ($cart->getItems() as $item) {
            $product = $item->product;
            $shippingClass = $product->shippingClass;
            
            if ($shippingClass) {
                if (!isset($shippingClasses[$shippingClass->id])) {
                    $shippingClasses[$shippingClass->id] = [
                        'class' => $shippingClass,
                        'quantity' => 0
                    ];
                }
                $shippingClasses[$shippingClass->id]['quantity'] += $item->quantity;
            }
        }
        
        foreach ($shippingClasses as $classData) {
            $class = $classData['class'];
            $quantity = $classData['quantity'];
            
            if ($class->per_item) {
                $totalCost += $class->cost * $quantity;
            } else {
                $totalCost += $class->cost; // Fixed cost per order
            }
        }
        
        return $totalCost;
    }
}
```

## API Endpoints

### Shipping Zones API

#### List Shipping Zones
```http
GET /wp-json/fluent-cart/v2/shipping/zones
```

**Response:**
```json
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": 1,
        "name": "United States",
        "region": "US",
        "order": 1,
        "formatted_region": "United States",
        "methods": [
          {
            "id": 1,
            "title": "Standard Shipping",
            "type": "flat_rate",
            "amount": "5.00",
            "is_enabled": true
          }
        ]
      }
    ]
  }
}
```

#### Create Shipping Zone
```http
POST /wp-json/fluent-cart/v2/shipping/zones
```

**Request Body:**
```json
{
  "name": "Europe",
  "region": "selection",
  "order": 2
}
```

#### Update Shipping Zone
```http
PUT /wp-json/fluent-cart/v2/shipping/zones/{id}
```

**Request Body:**
```json
{
  "name": "European Union",
  "region": "selection",
  "order": 2
}
```

#### Delete Shipping Zone
```http
DELETE /wp-json/fluent-cart/v2/shipping/zones/{id}
```

### Shipping Methods API

#### Create Shipping Method
```http
POST /wp-json/fluent-cart/v2/shipping/methods
```

**Request Body:**
```json
{
  "zone_id": 1,
  "title": "Express Shipping",
  "type": "flat_rate",
  "amount": "15.00",
  "is_enabled": true,
  "settings": {
    "cost": 1500,
    "description": "Express delivery within 2-3 business days"
  }
}
```

#### Update Shipping Method
```http
PUT /wp-json/fluent-cart/v2/shipping/methods
```

**Request Body:**
```json
{
  "method_id": 1,
  "title": "Standard Shipping",
  "amount": "8.00",
  "settings": {
    "cost": 800,
    "description": "Standard delivery within 5-7 business days"
  }
}
```

#### Delete Shipping Method
```http
DELETE /wp-json/fluent-cart/v2/shipping/methods/{method_id}
```

### Shipping Classes API

#### List Shipping Classes
```http
GET /wp-json/fluent-cart/v2/shipping/classes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": 1,
        "name": "Fragile Items",
        "cost": 1000,
        "type": "fixed",
        "per_item": false
      },
      {
        "id": 2,
        "name": "Heavy Items",
        "cost": 500,
        "type": "fixed",
        "per_item": true
      }
    ]
  }
}
```

#### Create Shipping Class
```http
POST /wp-json/fluent-cart/v2/shipping/classes
```

**Request Body:**
```json
{
  "name": "Digital Products",
  "cost": 0,
  "type": "fixed",
  "per_item": false
}
```

## Frontend Integration

### Getting Available Shipping Methods

```http
GET /wp-json/fluent-cart/v2/checkout/get-available-shipping-methods
```

**Query Parameters:**
- `country_code` - Country code (e.g., 'US', 'GB')
- `timezone` - Timezone for automatic country detection

**Response:**
```json
{
  "status": true,
  "available_shipping_methods": [
    {
      "id": 1,
      "title": "Standard Shipping",
      "type": "flat_rate",
      "amount": "5.00",
      "settings": {
        "description": "Standard delivery within 5-7 business days"
      }
    },
    {
      "id": 2,
      "title": "Express Shipping",
      "type": "flat_rate",
      "amount": "15.00",
      "settings": {
        "description": "Express delivery within 2-3 business days"
      }
    }
  ]
}
```

### JavaScript Integration

```javascript
// Get available shipping methods
async function getShippingMethods(countryCode) {
  try {
    const response = await fetch(`/wp-json/fluent-cart/v2/checkout/get-available-shipping-methods?country_code=${countryCode}`);
    const data = await response.json();
    
    if (data.status) {
      return data.available_shipping_methods;
    } else {
      console.error('No shipping methods available:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return [];
  }
}

// Update shipping options in checkout
function updateShippingOptions(methods) {
  const shippingContainer = document.getElementById('shipping-options');
  
  if (methods.length === 0) {
    shippingContainer.innerHTML = '<p>No shipping methods available for this location.</p>';
    return;
  }
  
  let html = '<div class="shipping-methods">';
  
  methods.forEach(method => {
    html += `
      <div class="shipping-method">
        <input type="radio" name="shipping_method" value="${method.id}" id="shipping_${method.id}">
        <label for="shipping_${method.id}">
          <span class="method-title">${method.title}</span>
          <span class="method-cost">$${(method.amount / 100).toFixed(2)}</span>
          <span class="method-description">${method.settings.description || ''}</span>
        </label>
      </div>
    `;
  });
  
  html += '</div>';
  shippingContainer.innerHTML = html;
}

// Usage
document.addEventListener('DOMContentLoaded', async function() {
  const countrySelect = document.getElementById('country');
  
  countrySelect.addEventListener('change', async function() {
    const countryCode = this.value;
    const methods = await getShippingMethods(countryCode);
    updateShippingOptions(methods);
  });
  
  // Load initial shipping methods
  const initialCountry = countrySelect.value;
  const initialMethods = await getShippingMethods(initialCountry);
  updateShippingOptions(initialMethods);
});
```

## Custom Shipping Method Development

### Creating a Custom Shipping Method

```php
<?php
namespace FluentCart\App\Modules\Shipping\Methods;

use FluentCart\App\Models\ShippingMethod;
use FluentCart\App\Models\Cart;

class CustomShippingMethod
{
    protected $method;
    
    public function __construct(ShippingMethod $method)
    {
        $this->method = $method;
    }
    
    public function calculateRate(Cart $cart, $address)
    {
        // Custom calculation logic
        $baseRate = $this->method->amount;
        $weight = $cart->getTotalWeight();
        $distance = $this->calculateDistance($address);
        
        // Example: Base rate + weight factor + distance factor
        $rate = $baseRate + ($weight * 100) + ($distance * 50);
        
        return $rate;
    }
    
    public function isAvailable(Cart $cart, $address)
    {
        // Check if method is available for this cart/address
        $minimumOrder = $this->method->settings['minimum_order'] ?? 0;
        
        return $cart->getTotal() >= $minimumOrder;
    }
    
    private function calculateDistance($address)
    {
        // Implement distance calculation logic
        // This could use a mapping service API
        return 0; // Placeholder
    }
}
```

### Registering Custom Shipping Methods

```php
// In your module's initialization
add_action('fluentcart_loaded', function($app) {
    // Register custom shipping method type
    add_filter('fluent_cart/shipping/method_types', function($types) {
        $types['custom_method'] = [
            'title' => 'Custom Shipping',
            'class' => CustomShippingMethod::class,
            'settings' => [
                'minimum_order' => [
                    'type' => 'number',
                    'label' => 'Minimum Order Amount',
                    'default' => 0
                ],
                'custom_setting' => [
                    'type' => 'text',
                    'label' => 'Custom Setting',
                    'default' => ''
                ]
            ]
        ];
        
        return $types;
    });
});
```

## Hooks and Filters

### Shipping Calculation Hooks

```php
// Modify shipping rates before calculation
add_filter('fluent_cart/shipping/calculate_rate', function($rate, $method, $cart, $address) {
    // Apply custom logic to modify rate
    if ($cart->hasCoupon('FREE_SHIPPING')) {
        return 0; // Free shipping with coupon
    }
    
    return $rate;
}, 10, 4);

// Add custom shipping methods
add_filter('fluent_cart/shipping/available_methods', function($methods, $cart, $address) {
    // Add custom method if conditions are met
    if ($cart->getTotal() > 10000) { // Orders over $100
        $methods[] = [
            'id' => 'custom_express',
            'title' => 'Custom Express',
            'cost' => 2000,
            'description' => 'Custom express shipping for large orders'
        ];
    }
    
    return $methods;
}, 10, 3);

// Modify shipping zone selection
add_filter('fluent_cart/shipping/zone_for_address', function($zone, $address) {
    // Custom zone selection logic
    if ($address['country'] === 'US' && $address['state'] === 'CA') {
        // Special handling for California
        return ShippingZone::where('name', 'California Special')->first();
    }
    
    return $zone;
}, 10, 2);
```

### Shipping Method Hooks

```php
// Before shipping method is saved
add_action('fluent_cart/shipping/method/before_save', function($method) {
    // Validate or modify method before saving
    if ($method->type === 'custom_method') {
        // Custom validation logic
    }
});

// After shipping method is saved
add_action('fluent_cart/shipping/method/after_save', function($method) {
    // Perform actions after method is saved
    // e.g., update external shipping service
});

// Before shipping method is deleted
add_action('fluent_cart/shipping/method/before_delete', function($method) {
    // Clean up related data
});
```

---

**Next Steps:**
- [Storage Drivers](./storage) - File storage integration
- [Modules Overview](./index) - Back to modules overview
