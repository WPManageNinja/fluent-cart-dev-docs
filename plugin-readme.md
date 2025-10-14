# FluentCart Plugin Architecture & Codebase Overview

## Plugin Information

### Core Plugin (FluentCart)
- **Plugin Name**: FluentCart - A New Era of Commerce with WordPress
- **Version**: 1.0.11
- **DB Version**: 1.0.10
- **Namespace**: `FluentCart\App\`
- **Framework**: WPFluent Framework v2.0
- **PHP Requirement**: 7.4+
- **License**: GPLv2 or later

### Pro Plugin (FluentCart Pro)
- **Plugin Name**: FluentCart Pro
- **Version**: 1.0.11
- **Namespace**: `FluentCartPro\App\`
- **Parent Namespace**: `FluentCart`
- **License**: GPLv2 or later

## Architecture Overview

FluentCart is built on the WPFluent framework and follows a modular architecture with clear separation of concerns:

### Core Components

1. **Models** - Database entities and relationships
2. **Services** - Business logic and operations
3. **Controllers** - HTTP request handling
4. **Modules** - Feature-specific functionality
5. **API** - REST API endpoints and resources
6. **Hooks** - WordPress integration and event handling
7. **Views** - Template rendering and UI components

## Database Schema

### Core Tables (37 tables total)

#### Order Management
- `fct_orders` - Main orders table
- `fct_order_items` - Individual order items
- `fct_order_transactions` - Payment transactions
- `fct_order_addresses` - Order shipping/billing addresses
- `fct_order_meta` - Order metadata
- `fct_order_operations` - Order operation logs
- `fct_order_tax_rate` - Tax calculations
- `fct_order_download_permissions` - Download permissions

#### Customer Management
- `fct_customers` - Customer records
- `fct_customer_addresses` - Customer addresses
- `fct_customer_meta` - Customer metadata

#### Product Management
- `fct_product_details` - Product configuration
- `fct_product_variations` - Product variations
- `fct_product_meta` - Product metadata
- `fct_product_downloads` - Downloadable products

#### Subscription Management
- `fct_subscriptions` - Subscription records
- `fct_subscription_meta` - Subscription metadata

#### Cart & Checkout
- `fct_carts` - Shopping cart data
- `fct_applied_coupons` - Applied coupons to orders

#### Coupon System
- `fct_coupons` - Coupon definitions

#### Shipping & Tax
- `fct_shipping_zones` - Shipping zones
- `fct_shipping_methods` - Shipping methods
- `fct_shipping_classes` - Shipping classes
- `fct_tax_classes` - Tax classes
- `fct_tax_rates` - Tax rates

#### Attribute System
- `fct_atts_groups` - Attribute groups (Color, Size, etc.)
- `fct_atts_terms` - Attribute terms within groups
- `fct_atts_relations` - Attribute relationships to objects

#### Label System
- `fct_label` - Label definitions
- `fct_label_relationships` - Polymorphic label relationships

#### System Tables
- `fct_activity` - Activity logs and audit trails
- `fct_scheduled_actions` - Background job scheduling
- `fct_meta` - Generic metadata storage
- `fct_webhook_logger` - Webhook delivery logs

### Pro Plugin Tables
- `fct_licenses` - Software licenses
- `fct_license_activations` - License activations
- `fct_license_sites` - Licensed sites
- `fct_license_meta` - License metadata
- `fct_order_promotions` - Order promotions
- `fct_order_promotion_stats` - Promotion statistics

## Model Architecture

### Base Model
- **Location**: `app/Models/Model.php`
- **Extends**: WPFluent Framework BaseModel
- **Features**: Timestamps, JSON columns, search capabilities

### Core Models

#### Order Model (`app/Models/Order.php`)
- **Table**: `fct_orders`
- **Key Features**:
  - Status management (draft, pending, completed, etc.)
  - Payment tracking
  - Refund handling
  - Receipt number generation
  - UUID support
- **Relationships**: Customer, OrderItems, Transactions, Subscriptions, Addresses
- **Scopes**: `ofOrderStatus()`, `ofPaymentStatus()`, `ofShippingStatus()`
- **Methods**: `updateStatus()`, `getTotalPaidAmount()`, `canBeRefunded()`

#### Customer Model (`app/Models/Customer.php`)
- **Table**: `fct_customers`
- **Key Features**:
  - WordPress user integration
  - Purchase statistics (LTV, AOV, purchase count)
  - Address management
  - Search capabilities
- **Relationships**: Orders, Subscriptions, Addresses, Labels
- **Scopes**: `ofActive()`, `ofArchived()`, `searchBy()`
- **Accessors**: `full_name`, `photo`, `country_name`, `formatted_address`

#### Product Model (`app/Models/Product.php`)
- **Table**: `posts` (WordPress posts table)
- **Post Type**: `fc_product`
- **Key Features**:
  - WordPress integration
  - Variation support
  - Download management
  - Stock tracking
- **Relationships**: ProductDetail, Variations, OrderItems, Downloads
- **Scopes**: `published()`, `ofType()`, `inStock()`, `onSale()`

#### Subscription Model (`app/Models/Subscription.php`)
- **Table**: `fct_subscriptions`
- **Key Features**:
  - Recurring billing
  - Trial management
  - Status tracking
  - Payment gateway integration
- **Relationships**: Customer, Order, Product, Renewals
- **Scopes**: `active()`, `cancelled()`, `expired()`, `dueForBilling()`
- **Methods**: `cancel()`, `pause()`, `resume()`, `processRenewal()`

#### Cart Model (`app/Models/Cart.php`)
- **Table**: `fct_carts`
- **Key Features**:
  - Cart persistence
  - Checkout data storage
  - UTM tracking
  - Coupon management
- **Relationships**: Customer, User, Order
- **Methods**: `getCartData()`, `setCartData()`, `isCompleted()`

#### Coupon Model (`app/Models/Coupon.php`)
- **Table**: `fct_coupons`
- **Key Features**:
  - Discount calculations
  - Usage tracking
  - Condition validation
  - Expiration management
- **Relationships**: AppliedCoupons, Orders
- **Methods**: `calculateDiscount()`, `applyToOrder()`, `validateConditions()`

#### Activity Model (`app/Models/Activity.php`)
- **Table**: `fct_activity`
- **Key Features**:
  - Audit trail
  - Polymorphic relationships
  - Status tracking
  - User attribution
- **Relationships**: User, Module (polymorphic)
- **Scopes**: `success()`, `failed()`, `ofModule()`, `recent()`

### Pro Plugin Models

#### License Model (`FluentCartPro\App\Modules\Licensing\Models\License.php`)
- **Table**: `fct_licenses`
- **Key Features**:
  - Software license management
  - Activation tracking
  - Expiration handling
  - Site management
- **Relationships**: Customer, Order, Product, Activations, Sites

## Service Layer

### Core Services

#### OrderService (`app/Services/OrderService.php`)
- Order creation and management
- Status updates
- Payment processing
- Refund handling

#### CheckoutService (`app/Services/CheckoutService.php`)
- Checkout process management
- Payment method handling
- Order creation from cart

#### TemplateService (`app/Services/TemplateService.php`)
- Template rendering
- Email templates
- Invoice generation

#### Payment Services (`app/Services/Payments/`)
- Payment gateway integration
- Transaction processing
- Subscription billing

### Module Services

#### Shipping Module (`app/Modules/Shipping/`)
- Shipping zone management
- Shipping method configuration
- Rate calculations

#### Subscription Module (`app/Modules/Subscriptions/`)
- Subscription lifecycle management
- Renewal processing
- Billing cycle handling

#### Integration Services (`app/Modules/Integrations/`)
- Third-party integrations
- Webhook handling
- API connections

## API Architecture

### REST API Structure
- **Base URL**: `/wp-json/fluent-cart/v1/`
- **Authentication**: WordPress REST API methods
- **Resources**: Comprehensive resource classes for all entities

### API Resources (`api/Resource/`)
- `OrderResource.php` - Order API endpoints
- `CustomerResource.php` - Customer API endpoints
- `ProductResource.php` - Product API endpoints
- `SubscriptionResource.php` - Subscription API endpoints
- `CartResource.php` - Cart API endpoints
- `CouponResource.php` - Coupon API endpoints

### Frontend API (`api/Resource/FrontendResource/`)
- Customer-facing API endpoints
- Cart management
- Checkout processing
- Order tracking

## Payment Gateway System

### Supported Gateways
- **Stripe** - Full integration with subscriptions
- **PayPal** - Complete PayPal integration
- **Square** - Payment processing
- **Razorpay** - International payments
- **Paystack** - African market focus
- **Mollie** - European payments
- **Authorize.Net** - Enterprise payments
- **Airwallex** - Global payments
- **COD** - Cash on delivery

### Gateway Architecture
- **Base Class**: `AbstractPaymentGateway`
- **Interface**: `PaymentGatewayInterface`
- **Manager**: `GatewayManager`
- **Settings**: `BaseGatewaySettings`

## Module System

### Core Modules

#### Payment Methods (`app/Modules/PaymentMethods/`)
- Gateway implementations
- Payment processing
- Subscription handling

#### Shipping (`app/Modules/Shipping/`)
- Zone management
- Method configuration
- Rate calculations

#### Subscriptions (`app/Modules/Subscriptions/`)
- Subscription lifecycle
- Renewal processing
- Billing management

#### Integrations (`app/Modules/Integrations/`)
- Third-party connections
- Webhook handling
- Data synchronization

#### Storage Drivers (`app/Modules/StorageDrivers/`)
- File storage abstraction
- Local storage
- S3 integration

### Pro Modules

#### Licensing (`FluentCartPro\App\Modules\Licensing/`)
- Software license management
- Activation tracking
- Site management
- Renewal handling

#### Promotional (`FluentCartPro\App\Modules\Promotional/`)
- Order promotions
- Bump offers
- Statistics tracking

## Hook System

### Action Hooks (`app/Hooks/actions.php`)
- Order lifecycle events
- Payment events
- Subscription events
- Customer events

### Filter Hooks (`app/Hooks/filters.php`)
- Data modification filters
- Validation filters
- Display filters

### Event System (`app/Events/`)
- `OrderCreated`, `OrderPaid`, `OrderRefunded`
- `SubscriptionActivated`, `SubscriptionCanceled`
- `LicenseRenewed`

## Template System

### Template Structure (`app/FC/Template/`)
- **DefaultTemplate** - Default theme templates
- **FseThemeTemplate** - Full Site Editing support
- **PageProviders** - Template page providers

### Template Features
- Responsive design
- Customizable layouts
- Email templates
- Invoice templates
- Receipt templates

## Frontend Architecture

### Vue.js Integration
- **Vite Configuration**: Modern build system
- **Component Structure**: Reusable Vue components
- **State Management**: Vuex/Pinia integration
- **Styling**: Tailwind CSS

### Template Rendering
- **Template Service**: Dynamic template loading
- **Shortcode Support**: WordPress shortcode integration
- **Widget Support**: Custom widgets
- **Block Support**: Gutenberg block integration

## Development Tools

### CLI Commands (`app/Hooks/CLI/`)
- Database management
- Data migration
- Testing utilities
- Development helpers

### Testing Framework
- **PHPUnit Integration**: Unit testing
- **Faker Support**: Test data generation
- **Mock Services**: Service mocking

### Development Environment
- **Hot Reloading**: Vite development server
- **Asset Compilation**: SCSS/JS compilation
- **Code Quality**: PHPCS, PHPStan integration

## Security Features

### Data Protection
- **Input Sanitization**: Comprehensive sanitization
- **Output Escaping**: XSS prevention
- **SQL Injection Prevention**: Prepared statements
- **CSRF Protection**: Nonce verification

### Access Control
- **Capability Checks**: WordPress capabilities
- **Role-based Access**: User role management
- **API Authentication**: Secure API access

## Performance Optimization

### Caching Strategy
- **Object Caching**: Model caching
- **Query Optimization**: Efficient database queries
- **Asset Optimization**: Minified assets
- **Lazy Loading**: On-demand loading

### Database Optimization
- **Indexing**: Strategic database indexes
- **Query Optimization**: Efficient queries
- **Batch Operations**: Bulk operations
- **Connection Pooling**: Database connection management

## Integration Capabilities

### WordPress Integration
- **Custom Post Types**: Product management
- **Taxonomies**: Categories and tags
- **User Management**: Customer integration
- **Theme Compatibility**: Theme integration

### Third-party Integrations
- **FluentCRM**: Customer relationship management
- **FluentCommunity**: Community features
- **MailChimp**: Email marketing
- **Webhook Support**: Custom integrations

## Localization

### Multi-language Support
- **Translation Files**: .po/.mo files
- **RTL Support**: Right-to-left languages
- **Currency Support**: Multi-currency
- **Date/Time Formatting**: Localized formatting

## File Structure Summary

```
fluent-cart/
├── app/
│   ├── Models/           # Database models
│   ├── Services/         # Business logic
│   ├── Http/            # Controllers, Routes, Requests
│   ├── Modules/         # Feature modules
│   ├── Hooks/           # WordPress hooks
│   ├── Events/          # Event system
│   ├── Helpers/         # Utility functions
│   ├── Views/           # Template views
│   └── FC/              # Frontend components
├── api/                 # REST API resources
├── database/            # Migrations and seeders
├── resources/           # Frontend assets
├── config/              # Configuration files
└── language/            # Translation files

fluent-cart-pro/
├── app/
│   ├── Modules/         # Pro modules
│   ├── Services/        # Pro services
│   └── Models/          # Pro models
└── resources/           # Pro frontend assets
```

## Key Search Terms for Documentation

When working on documentation, search for these key terms:

### Models & Database
- `Model.php` - Base model class
- `OrdersMigrator.php` - Database migrations
- `DBMigrator.php` - Migration management
- `Schema` - Database schema definitions

### API & Controllers
- `Resource` - API resource classes
- `Controller.php` - HTTP controllers
- `routes.php` - API routes
- `Request.php` - Form validation

### Services & Business Logic
- `Service.php` - Service classes
- `Helper.php` - Utility functions
- `Processor.php` - Data processing
- `Manager.php` - Service managers

### Hooks & Events
- `actions.php` - Action hooks
- `filters.php` - Filter hooks
- `Event.php` - Event classes
- `Listener.php` - Event listeners

### Frontend & Templates
- `Template` - Template files
- `Component` - Vue components
- `vite.config.mjs` - Build configuration
- `tailwind.config.js` - Styling configuration

### Payment & Modules
- `Gateway` - Payment gateways
- `Module.php` - Feature modules
- `Integration` - Third-party integrations
- `Webhook` - Webhook handlers

This comprehensive overview provides the foundation for creating detailed developer documentation for FluentCart.
