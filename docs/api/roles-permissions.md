---
title: Roles & Permissions API (Pro)
description: FluentCart Pro Roles & Permissions API for user role and permission management.
---

# Roles & Permissions API (Pro)

The Roles & Permissions API allows you to manage user roles and capabilities within FluentCart Pro, enabling fine-grained access control for shop managers and other personnel.

## Base URL

All Roles & Permissions API endpoints are prefixed with the same base URL as the core API:

```
/wp-json/fluent-cart/v2/
```

## Authentication

All Roles & Permissions API endpoints require authentication with the `manage_fluent_cart_settings` capability.

## Role Management

### 1. Get All Roles

Retrieve a list of all available FluentCart roles.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/roles`
- **Authentication:** Requires `RolePolicy` permission.
- **Parameters:** None

**Example Request:**

```bash
curl -X GET "http://localhost/wp-json/fluent-cart/v2/roles" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]"
```

### 2. Get Role Managers

Retrieve a list of users who can manage roles.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/roles/managers`
- **Authentication:** Requires `RolePolicy` permission.
- **Parameters:** None

### 3. Get User List

Retrieve a list of users for role assignment.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/roles/user-list`
- **Authentication:** Requires `RolePolicy` permission.
- **Parameters:** None

### 4. Create Role

Create a new custom role.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/roles`
- **Authentication:** Requires `RolePolicy` permission.
- **Parameters:**
  - `title` (string, required): Role title
  - `description` (string, optional): Role description
  - `capabilities` (array, required): Array of capabilities

**Example Request:**

```bash
curl -X POST "http://localhost/wp-json/fluent-cart/v2/roles" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]" \
-H "Content-Type: application/json" \
-d '{
  "title": "Product Manager",
  "description": "Manages products and inventory",
  "capabilities": ["products/view", "products/manage"]
}'
```

### 5. Get Role Details

Retrieve details for a specific role.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/roles/{key}`
- **Authentication:** Requires `RolePolicy` permission.
- **Parameters:**
  - `key` (string, required): Role key/identifier

### 6. Update Role

Update an existing role.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/roles/{key}`
- **Authentication:** Requires `RolePolicy` permission.
- **Parameters:**
  - `key` (string, required): Role key/identifier
  - `title` (string, optional): Role title
  - `description` (string, optional): Role description
  - `capabilities` (array, optional): Array of capabilities

### 7. Delete Role

Delete a custom role.

- **Endpoint:** `DELETE /wp-json/fluent-cart/v2/roles/{key}`
- **Authentication:** Requires `RolePolicy` permission.
- **Parameters:**
  - `key` (string, required): Role key/identifier

**Example Response:**

```json
{
  "message": "Roles retrieved successfully",
  "roles": [
    {
      "title": "Shop Manager",
      "description": "Manages all aspects of the shop, including products, orders, and customers."
    },
    {
      "title": "Product Manager",
      "description": "Manages products and inventory."
    },
    {
      "title": "Order Manager",
      "description": "Manages customer orders and fulfillment."
    }
  ]
}
```

### 2. Assign Role to User

Assign a specific FluentCart role to a user.

- **Endpoint:** `POST /wp-json/fluent-cart/v2/roles`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:**
  - `user_id` (int, required): The ID of the user.
  - `role_key` (string, required): The key of the role to assign (e.g., `shop_manager`, `product_manager`).

**Example Request:**

```bash
curl -X POST "http://localhost/wp-json/fluent-cart/v2/roles" \
-H "Content-Type: application/json" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]" \
-d '{
  "user_id": 1,
  "role_key": "shop_manager"
}'
```

**Example Response (Success):**

```json
{
  "message": "Role synced successfully",
  "is_updated": true
}
```

**Example Response (Error - User Not Found):**

```json
{
  "message": "User not found",
  "errors": [
    {
      "code": 404,
      "message": "User not found"
    }
  ]
}
```

### 3. Remove Role from User

Remove a specific FluentCart role from a user.

- **Endpoint:** `DELETE /wp-json/fluent-cart/v2/roles/{key}`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:**
  - `key` (string, required): The key of the role to remove.
  - `user_id` (int, required): The ID of the user.

**Example Request:**

```bash
curl -X DELETE "http://localhost/wp-json/fluent-cart/v2/roles/shop_manager" \
-H "Content-Type: application/json" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]" \
-d '{
  "user_id": 1
}'
```

**Example Response (Success):**

```json
{
  "message": "Role deleted successfully"
}
```

### 4. Get Users with Shop Role (Managers)

Retrieve a list of users who have a shop management role.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/roles/managers`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:** None

**Example Request:**

```bash
curl -X GET "http://localhost/wp-json/fluent-cart/v2/roles/managers" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]"
```

**Example Response:**

```json
{
  "message": "Managers retrieved successfully",
  "managers": [
    {
      "ID": 1,
      "display_name": "Admin User",
      "user_email": "admin@example.com"
    },
    {
      "ID": 5,
      "display_name": "Shop Manager John",
      "user_email": "john@example.com"
    }
  ]
}
```

### 5. Get User List (for Role Assignment)

Retrieve a paginated list of users, optionally filtered by search terms or IDs, excluding those with admin roles. This is useful for selecting users to assign roles to.

- **Endpoint:** `GET /wp-json/fluent-cart/v2/roles/user-list`
- **Authentication:** Requires `manage_fluent_cart_settings` capability.
- **Parameters:**
  - `search` (string, optional): Search term for display name or email.
  - `user_ids` (array|string, optional): Comma-separated list of user IDs.
  - `per_page` (int, optional): Number of users per page (default: 10).
  - `page` (int, optional): Current page number (default: 1).

**Example Request (Search by email):**

```bash
curl -X GET "http://localhost/wp-json/fluent-cart/v2/roles/user-list?search=john@example.com" \
-H "Authorization: Basic [YOUR_BASE64_ENCODED_CREDENTIALS]"
```

**Example Response:**

```json
{
  "message": "Users retrieved successfully",
  "users": {
    "data": [
      {
        "ID": 5,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "total": 1,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

## Permission Management

### Available Roles

#### Shop Manager
- **Capabilities:** Full access to all FluentCart features
- **Description:** Manages all aspects of the shop, including products, orders, and customers.

#### Product Manager
- **Capabilities:** Product management, inventory control
- **Description:** Manages products and inventory.

#### Order Manager
- **Capabilities:** Order management, customer service
- **Description:** Manages customer orders and fulfillment.

#### Customer Service
- **Capabilities:** Customer support, order assistance
- **Description:** Provides customer support and order assistance.

### Role Assignment

```php
use FluentCart\App\Services\Permission\PermissionManager;

// Assign role to user
$isUpdated = PermissionManager::attachRole($userId, $roleKey);

if ($isUpdated instanceof \WP_Error) {
    echo "Error: " . $isUpdated->get_error_message();
} else {
    echo "Role assigned successfully";
}

// Remove role from user
$isUpdated = PermissionManager::detachRole($userId, $roleKey);

if ($isUpdated instanceof \WP_Error) {
    echo "Error: " . $isUpdated->get_error_message();
} else {
    echo "Role removed successfully";
}
```

### Get Users with Shop Roles

```php
// Get all users with shop management roles
$managers = PermissionManager::getUsersWithShopRole();

foreach ($managers as $manager) {
    echo "Manager: " . $manager->display_name . " (" . $manager->user_email . ")\n";
}
```

## Role Hooks and Filters

### Role Assignment Hooks

```php
// Before role assignment
add_action('fluent_cart/role/before_assign', function($userId, $roleKey) {
    // Custom validation before assigning role
    if ($this->userHasConflictingRole($userId, $roleKey)) {
        return new \WP_Error('conflicting_role', 'User already has a conflicting role');
    }
}, 10, 2);

// After role assignment
add_action('fluent_cart/role/assigned', function($userId, $roleKey) {
    // Update user capabilities
    update_user_capabilities($userId, $roleKey);
    
    // Send role assignment notification
    wp_mail(
        get_userdata($userId)->user_email,
        'Role Assigned',
        "You have been assigned the role: {$roleKey}"
    );
    
    // Log role assignment
    error_log("Role assigned: {$roleKey} to user {$userId}");
}, 10, 2);

// Before role removal
add_action('fluent_cart/role/before_remove', function($userId, $roleKey) {
    // Check if user has pending tasks
    if ($this->userHasPendingTasks($userId)) {
        return new \WP_Error('pending_tasks', 'User has pending tasks that must be completed first');
    }
}, 10, 2);

// After role removal
add_action('fluent_cart/role/removed', function($userId, $roleKey) {
    // Remove user capabilities
    remove_user_capabilities($userId, $roleKey);
    
    // Log role removal
    error_log("Role removed: {$roleKey} from user {$userId}");
    
    // Notify administrators
    wp_mail(
        get_option('admin_email'),
        'Role Removed',
        "Role {$roleKey} has been removed from user {$userId}"
    );
}, 10, 2);
```

### Role Filters

```php
// Modify available roles
add_filter('fluent_cart/roles/available', function($roles) {
    // Add custom role
    $roles['custom_manager'] = [
        'title' => 'Custom Manager',
        'description' => 'Custom management role with specific capabilities',
        'capabilities' => ['custom_capability_1', 'custom_capability_2']
    ];
    
    return $roles;
});

// Modify role capabilities
add_filter('fluent_cart/role/capabilities', function($capabilities, $roleKey) {
    if ($roleKey === 'shop_manager') {
        // Add custom capability to shop manager
        $capabilities[] = 'custom_shop_capability';
    }
    
    return $capabilities;
}, 10, 2);

// Modify user list for role assignment
add_filter('fluent_cart/roles/user_list', function($users, $args) {
    // Filter out users who shouldn't be assigned roles
    return $users->filter(function($user) {
        return !$this->userIsExcluded($user->ID);
    });
}, 10, 2);
```

## Custom Role Development

### Creating Custom Roles

```php
// Register custom role
add_action('fluent_cart/roles/register', function() {
    $customRole = new CustomRole();
    $customRole->register();
});

class CustomRole
{
    public function register()
    {
        // Define custom role
        $roleData = [
            'title' => 'Custom Manager',
            'description' => 'Custom management role with specific capabilities',
            'capabilities' => [
                'manage_products',
                'view_orders',
                'custom_capability'
            ]
        ];
        
        // Register role with PermissionManager
        PermissionManager::registerRole('custom_manager', $roleData);
    }
}
```

### Custom Role Capabilities

```php
// Add custom capabilities
add_action('fluent_cart/roles/capabilities', function($capabilities) {
    $capabilities['custom_capability'] = [
        'title' => 'Custom Capability',
        'description' => 'Allows access to custom functionality'
    ];
    
    return $capabilities;
});

// Check custom capability
add_filter('fluent_cart/user/can', function($can, $capability, $userId) {
    if ($capability === 'custom_capability') {
        return $this->userHasCustomCapability($userId);
    }
    
    return $can;
}, 10, 3);
```

## Error Handling

### Common Error Responses

#### User Not Found
```json
{
  "message": "User not found",
  "errors": [
    {
      "code": 404,
      "message": "User not found"
    }
  ]
}
```

#### Invalid Role
```json
{
  "message": "Invalid role",
  "errors": [
    {
      "code": 400,
      "message": "Invalid role"
    }
  ]
}
```

#### Permission Denied
```json
{
  "message": "Permission denied",
  "errors": [
    {
      "code": 403,
      "message": "Permission denied"
    }
  ]
}
```

#### Role Already Assigned
```json
{
  "message": "Role already assigned",
  "errors": [
    {
      "code": 409,
      "message": "Role already assigned"
    }
  ]
}
```

---

**Related Documentation:**
- [Licensing API](./licensing) - Software license management
- [Order Bump API](./order-bump) - Promotional features
- [REST API Overview](../api/) - General API information
