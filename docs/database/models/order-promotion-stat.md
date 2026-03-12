---
title: Order Promotion Stat Model
description: FluentCart Pro OrderPromotionStat model documentation with attributes, scopes, relationships, and methods.
---

<Badge type="warning" text="Pro" />

# Order Promotion Stat Model

| DB Table Name | {wp_db_prefix}_fct_order_promotion_stats               |
| ------------- | ----------------------------------------------------- |
| Schema        | [Check Schema](/database/schema#fct-order-promotion-stats-table) |
| Source File   | fluent-cart-pro/app/Modules/Promotional/Models/OrderPromotionStat.php |
| Name Space    | FluentCartPro\App\Modules\Promotional\Models          |
| Class         | FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat |
| Plugin        | FluentCart Pro                                         |

## Properties

- **Table**: `fct_order_promotion_stats`
- **Primary Key**: `id`
- **Guarded**: `['id']`
- **Fillable**: `['promotion_id', 'order_id', 'object_id', 'amount', 'status']`

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| id                 | Integer   | Primary Key |
| promotion_id       | Integer   | Reference to order promotion |
| order_id           | Integer   | Reference to order |
| object_id          | Integer   | Reference to object (product, variation, etc.) |
| amount             | Decimal   | Promotion amount |
| status             | String    | Promotion status |
| created_at         | Date Time | Creation timestamp |
| updated_at         | Date Time | Last update timestamp |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$orderPromotionStat = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::find(1);

$orderPromotionStat->id; // returns id
$orderPromotionStat->promotion_id; // returns promotion ID
$orderPromotionStat->order_id; // returns order ID
$orderPromotionStat->object_id; // returns object ID
$orderPromotionStat->amount; // returns amount
$orderPromotionStat->status; // returns status
```

## Relations

This model has the following relationships that you can use

### order

Access the associated order (BelongsTo)

* return `FluentCart\App\Models\Order` Model

#### Example:

```php
// Accessing Order
$order = $orderPromotionStat->order;

// For Filtering by order relationship
$orderPromotionStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::whereHas('order', function($query) {
    $query->where('status', 'completed');
})->get();
```

### promotion

Access the associated order promotion (BelongsTo)

* return `FluentCartPro\App\Modules\Promotional\Models\OrderPromotion` Model

#### Example:

```php
// Accessing Promotion
$promotion = $orderPromotionStat->promotion;

// For Filtering by promotion relationship
$orderPromotionStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::whereHas('promotion', function($query) {
    $query->where('status', 'active');
})->get();
```

## Usage Examples

### Create Order Promotion Stat

```php
$orderPromotionStat = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::create([
    'promotion_id' => 1,
    'order_id' => 123,
    'object_id' => 456,
    'amount' => 15.99,
    'status' => 'applied'
]);
```

### Get Stats by Promotion

```php
$promotionStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::where('promotion_id', 1)->get();
```

### Get Stats by Order

```php
$orderStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::where('order_id', 123)->get();
```

### Get Stats by Status

```php
$appliedStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::where('status', 'applied')->get();
$declinedStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::where('status', 'declined')->get();
```

### Get Stats with Order and Promotion Information

```php
$statsWithDetails = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::with(['order', 'promotion'])->get();

foreach ($statsWithDetails as $stat) {
    echo "Order: " . $stat->order->id;
    echo "Promotion: " . $stat->promotion->title;
    echo "Amount: " . $stat->amount;
}
```

### Get Stats by Amount Range

```php
$highValueStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::where('amount', '>', 50.00)->get();
$lowValueStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::where('amount', '<=', 10.00)->get();
```

### Update Order Promotion Stat

```php
$orderPromotionStat = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::find(1);
$orderPromotionStat->update([
    'status' => 'completed',
    'amount' => 20.00
]);
```

### Get Stats by Object ID

```php
$objectStats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::where('object_id', 456)->get();
```

### Get Stats for Date Range

```php
$stats = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::whereBetween('created_at', ['2024-01-01', '2024-01-31'])->get();
```

### Delete Order Promotion Stat

```php
$orderPromotionStat = FluentCartPro\App\Modules\Promotional\Models\OrderPromotionStat::find(1);
$orderPromotionStat->delete();
```

---

**Plugin**: FluentCart Pro
