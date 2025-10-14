---
title: Licensing API (Pro)
description: FluentCart Pro Licensing API for software license management and activation.
---

# Licensing API (Pro)

The Licensing API provides comprehensive software license management capabilities for FluentCart Pro. This API allows you to manage software licenses, track activations, and integrate with external license management systems.

## Base URL

All Licensing API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Licensing API endpoints require authentication with the `manage_fluent_cart_settings` capability.

## License Management

### 1. Get License Details

Retrieve details for the current FluentCart Pro license.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/settings/license`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:** None

**Example Request:**

```bash
curl -X GET "http://localhost/wp-json/fluent-cart/v2/settings/license" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]"
```

### 2. Activate License

Activate a FluentCart Pro license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/settings/license`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:**
  - `license_key` (string, required): The license key to activate

**Example Request:**

```bash
curl -X POST "http://localhost/wp-json/fluent-cart/v2/settings/license" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]" \
-H "Content-Type: application/json" \
-d '{"license_key": "your-license-key-here"}'
```

### 3. Deactivate License

Deactivate the current FluentCart Pro license.

- **Endpoint:** `DELETE /wp-json/fluent-cart/v2/settings/license`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:** None

**Example Request:**

```bash
curl -X DELETE "http://localhost/wp-json/fluent-cart/v2/settings/license" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]"
```

## Product License Management

### 1. Get All Licenses

Retrieve all product licenses.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/licensing/licenses`
- **Authentication:** Requires `licenses/view` permission.
- **Parameters:** None

### 2. Get Customer Licenses

Retrieve all licenses for a specific customer.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/licensing/licenses/customer/{id}`
- **Authentication:** Requires `licenses/view` permission.
- **Parameters:**
  - `id` (int, required): Customer ID

### 3. Get License Details

Retrieve details for a specific license.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/licensing/licenses/{id}`
- **Authentication:** Requires `licenses/view` permission.
- **Parameters:**
  - `id` (int, required): License ID

### 4. Regenerate License Key

Regenerate the license key for a specific license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/licensing/licenses/{id}/regenerate-key`
- **Authentication:** Requires `licenses/manage` permission.
- **Parameters:**
  - `id` (int, required): License ID

### 5. Extend License Validity

Extend the validity period of a license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/licensing/licenses/{id}/extend-validity`
- **Authentication:** Requires `licenses/manage` permission.
- **Parameters:**
  - `id` (int, required): License ID
  - `days` (int, required): Number of days to extend

### 6. Update License Status

Update the status of a license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/licensing/licenses/{id}/update_status`
- **Authentication:** Requires `licenses/manage` permission.
- **Parameters:**
  - `id` (int, required): License ID
  - `status` (string, required): New status (active, inactive, expired, etc.)

### 7. Update License Limit

Update the activation limit for a license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/licensing/licenses/{id}/update_limit`
- **Authentication:** Requires `licenses/manage` permission.
- **Parameters:**
  - `id` (int, required): License ID
  - `limit` (int, required): New activation limit

### 8. Deactivate Site

Deactivate a specific site from a license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/licensing/licenses/{id}/deactivate_site`
- **Authentication:** Requires `licenses/manage` permission.
- **Parameters:**
  - `id` (int, required): License ID
  - `site_id` (int, required): Site ID to deactivate

### 9. Activate Site

Activate a site for a license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/licensing/licenses/{id}/activate_site`
- **Authentication:** Requires `licenses/manage` permission.
- **Parameters:**
  - `id` (int, required): License ID
  - `site_url` (string, required): Site URL to activate

### 10. Delete License

Delete a license permanently.

- **Endpoint:** `DELETE /wp-json/fluent-cart/v2/licensing/licenses/{id}/delete`
- **Authentication:** Requires `licenses/delete` permission.
- **Parameters:**
  - `id` (int, required): License ID

## Product License Settings

### 1. Get Product License Settings

Retrieve license settings for a specific product.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/licensing/products/{id}/settings`
- **Authentication:** Requires `licenses/view` permission.
- **Parameters:**
  - `id` (int, required): Product ID

### 2. Save Product License Settings

Save license settings for a specific product.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/licensing/products/{id}/settings`
- **Authentication:** Requires `licenses/manage` permission.
- **Parameters:**
  - `id` (int, required): Product ID
  - `settings` (object, required): License settings object

## Customer License Management

### 1. Get Customer Licenses

Retrieve all licenses for the current customer.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/customer-profile/licenses`
- **Authentication:** Requires customer authentication.
- **Parameters:** None

### 2. Get License Details

Retrieve details for a specific license by license key.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/customer-profile/licenses/{license_key}`
- **Authentication:** Requires customer authentication.
- **Parameters:**
  - `license_key` (string, required): License key

### 3. Get License Activations

Retrieve all activations for a specific license.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/customer-profile/licenses/{license_key}/activations`
- **Authentication:** Requires customer authentication.
- **Parameters:**
  - `license_key` (string, required): License key

### 4. Deactivate Site

Deactivate a site from a customer's license.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/customer-profile/licenses/{license_key}/deactivate_site`
- **Authentication:** Requires customer authentication.
- **Parameters:**
  - `license_key` (string, required): License key
  - `site_id` (int, required): Site ID to deactivate

**Example Response (Success):**

```json
{
  "message": "License found",
  "license": {
    "id": 123,
    "customer_id": 456,
    "product_id": 789,
    "license_key": "YOUR_LICENSE_KEY_HERE",
    "status": "active",
    "expires_at": "2024-12-31 23:59:59",
    "domain_limit": 5,
    "active_domains": [
      {"id": 1, "domain": "site1.com"},
      {"id": 2, "domain": "site2.com"}
    ],
    "created_at": "2023-01-01 10:00:00",
    "updated_at": "2023-06-15 11:30:00"
  }
}
```

**Example Response (Error - License Not Found):**

```json
{
  "message": "License not found",
  "errors": [
    {
      "code": 404,
      "message": "License not found"
    }
  ]
}
```

### 2. Activate License

Activate a license for a specific domain.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/settings/license`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:**
  - `license_key` (string, required): The license key to activate.
  - `domain` (string, required): The domain where the license is being activated.

**Example Request:**

```bash
curl -X POST "http://localhost/wp-json/fluent-cart/v2/settings/license" \
-H "Content-Type: application/json" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]" \
-d '{
  "license_key": "YOUR_LICENSE_KEY_HERE",
  "domain": "newsite.com"
}'
```

**Example Response (Success):**

```json
{
  "message": "License activated successfully",
  "license": {
    "id": 123,
    "customer_id": 456,
    "product_id": 789,
    "license_key": "YOUR_LICENSE_KEY_HERE",
    "status": "active",
    "expires_at": "2024-12-31 23:59:59",
    "domain_limit": 5,
    "active_domains": [
      {"id": 1, "domain": "site1.com"},
      {"id": 2, "domain": "site2.com"},
      {"id": 3, "domain": "newsite.com"}
    ],
    "created_at": "2023-01-01 10:00:00",
    "updated_at": "2023-06-15 11:30:00"
  }
}
```

**Example Response (Error - Invalid License Key):**

```json
{
  "message": "Invalid license key",
  "errors": [
    {
      "code": 400,
      "message": "Invalid license key"
    }
  ]
}
```

**Example Response (Error - Domain Limit Reached):**

```json
{
  "message": "License domain limit reached",
  "errors": [
    {
      "code": 403,
      "message": "License domain limit reached"
    }
  ]
}
```

### 3. Deactivate License

Deactivate a license for a specific domain.

- **Endpoint:** `DELETE /wp-json/fluent-cart/v2/settings/license`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:**
  - `license_key` (string, required): The license key to deactivate.
  - `domain` (string, required): The domain from which the license is being deactivated.

**Example Request:**

```bash
curl -X DELETE "http://localhost/wp-json/fluent-cart/v2/settings/license" \
-H "Content-Type: application/json" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]" \
-d '{
  "license_key": "YOUR_LICENSE_KEY_HERE",
  "domain": "old-site.com"
}'
```

**Example Response (Success):**

```json
{
  "message": "License deactivated successfully",
  "license": {
    "id": 123,
    "customer_id": 456,
    "product_id": 789,
    "license_key": "YOUR_LICENSE_KEY_HERE",
    "status": "active",
    "expires_at": "2024-12-31 23:59:59",
    "domain_limit": 5,
    "active_domains": [
      {"id": 1, "domain": "site1.com"},
      {"id": 2, "domain": "site2.com"}
    ],
    "created_at": "2023-01-01 10:00:00",
    "updated_at": "2023-06-15 11:30:00"
  }
}
```

**Example Response (Error - Domain Not Found):**

```json
{
  "message": "Domain not found for this license",
  "errors": [
    {
      "code": 404,
      "message": "Domain not found for this license"
    }
  ]
}
```

## License Model

### License Attributes

```php
use FluentCartPro\App\Modules\Licensing\Models\License;

class License extends Model
{
    protected $table = 'fct_licenses';
    
    protected $fillable = [
        'customer_id',
        'product_id',
        'variation_id',
        'order_id',
        'subscription_id',
        'license_key',
        'status',
        'expiration_date',
        'limit',
        'activation_count',
        'domain_limit',
        'created_at',
        'updated_at'
    ];
    
    protected $casts = [
        'expiration_date' => 'datetime',
        'limit' => 'integer',
        'activation_count' => 'integer',
        'domain_limit' => 'integer'
    ];
}
```

### License Status Management

```php
// Activate a license
$license->activate();

// Deactivate a license
$license->deactivate();

// Expire a license
$license->expire();

// Check if license is expired
if ($license->isExpired()) {
    echo "License has expired";
}

// Check activation limit
$remainingActivations = $license->getActivationLimit();
if ($remainingActivations === 'unlimited') {
    echo "Unlimited activations";
} else {
    echo "Remaining activations: " . $remainingActivations;
}
```

## Automatic License Generation

The Licensing module automatically generates licenses when orders are completed:

```php
use FluentCartPro\App\Modules\Licensing\Hooks\Handlers\LicenseGenerationHandler;

class LicenseGenerationHandler
{
    public function register()
    {
        // Generate licenses when order is paid
        add_action('fluent_cart/order_paid', [$this, 'maybeGenerateLicensesOnPurchaseSuccess'], 10, 1);
        
        // Revoke licenses on full refund
        add_action('fluent_cart/order_fully_refunded', [$this, 'maybeRevokeLicensesOnFullRefund'], 10, 1);
        
        // Extend licenses on subscription renewal
        add_action('fluent_cart/subscription_renewed', [$this, 'maybeExtendOnRenewal'], 10, 1);
        
        // Expire licenses when subscription expires
        add_action('fluent_cart/payments/subscription_expired', [$this, 'maybeExpireLicenseOnSubscriptionExpired'], 10, 1);
    }
    
    public function maybeGenerateLicensesOnPurchaseSuccess($order)
    {
        // Check if products require licenses
        foreach ($order->order_items as $item) {
            if ($this->productRequiresLicense($item->product_id)) {
                $this->generateLicenseForItem($order, $item);
            }
        }
    }
}
```

## License Hooks and Filters

### License Generation Hooks

```php
// Before license generation
add_action('fluent_cart/license/before_generate', function($order, $product) {
    // Custom validation before generating license
    if ($product->requires_manual_approval) {
        // Queue for manual approval
        return false;
    }
}, 10, 2);

// After license generation
add_action('fluent_cart/license/generated', function($license) {
    // Send license email to customer
    wp_mail(
        $license->customer->email,
        'Your License Key',
        "Your license key: {$license->license_key}"
    );
    
    // Log license generation
    error_log("License generated: {$license->license_key}");
}, 10, 1);

// License activation
add_action('fluent_cart/license/activated', function($license, $domain) {
    // Track activation
    $license->incrementActivationCount();
    
    // Send activation confirmation
    wp_mail(
        $license->customer->email,
        'License Activated',
        "Your license has been activated on {$domain}"
    );
}, 10, 2);
```

### License Filters

```php
// Modify license data in customer view
add_filter('fluent_cart/customer/view', function($customer, $args) {
    $licenses = License::where('customer_id', $customer->id)->get();
    
    if (!$licenses->isEmpty()) {
        $customer->licenses = $licenses->map(function($license) {
            return [
                'id' => $license->id,
                'product_name' => $license->product->post_title,
                'license_key' => $license->license_key,
                'status' => $license->status,
                'expires_at' => $license->expiration_date
            ];
        });
    }
    
    return $customer;
}, 10, 2);

// Modify license data in order view
add_filter('fluent_cart/order/view', function($order, $args) {
    $licenses = License::where('order_id', $order->id)->get();
    
    if (!$licenses->isEmpty()) {
        $order['licenses'] = $licenses;
    }
    
    return $order;
}, 10, 2);
```

## License Validation

```php
use FluentCartPro\App\Modules\Licensing\Services\LicenseHelper;

// Validate license key
$isValid = LicenseHelper::validateLicenseKey($licenseKey, $domain);

if ($isValid) {
    echo "License is valid";
} else {
    echo "Invalid license";
}

// Check license status
$status = LicenseHelper::getLicenseStatus($licenseKey);
// Returns: 'active', 'inactive', 'expired', 'suspended'
```

## Error Handling

### Common Error Responses

#### Invalid License Key
```json
{
  "message": "Invalid license key",
  "errors": [
    {
      "code": 400,
      "message": "Invalid license key"
    }
  ]
}
```

#### License Not Found
```json
{
  "message": "License not found",
  "errors": [
    {
      "code": 404,
      "message": "License not found"
    }
  ]
}
```

#### Domain Limit Reached
```json
{
  "message": "License domain limit reached",
  "errors": [
    {
      "code": 403,
      "message": "License domain limit reached"
    }
  ]
}
```

#### License Already Active
```json
{
  "message": "License already active",
  "errors": [
    {
      "code": 409,
      "message": "License already active"
    }
  ]
}
```

---

**Related Documentation:**
- [Roles & Permissions API](./roles-permissions) - User role management
- [Order Bump API](./order-bump) - Promotional features
- [REST API Overview](../api/) - General API information
