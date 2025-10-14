---
title: Developer Guides
description: Comprehensive guides for FluentCart development, frontend customization, and third-party integrations.
---

# FluentCart Developer Guides

This section provides comprehensive guides for developers working with FluentCart, covering frontend development, integrations, and advanced customization.

## Available Guides

### Frontend Development
- **Vue.js Integration** - Building interactive components with Vue.js
- **Template System** - Customizing FluentCart templates and layouts
- **Asset Management** - Vite configuration, SCSS compilation, and JavaScript bundling
- **Responsive Design** - Mobile-first design and touch-friendly interfaces
- **Performance Optimization** - Lazy loading, code splitting, and caching strategies

[View Frontend Development Guide →](./frontend)

### Integration Guide
- **CRM Integrations** - FluentCRM, custom CRM systems, and customer data sync
- **Email Marketing** - Mailchimp, ActiveCampaign, and other email platforms
- **Analytics & Reporting** - Google Analytics, Facebook Pixel, and custom tracking
- **Webhook Systems** - Custom webhook development and third-party integrations
- **Custom Add-ons** - Building custom plugins and extensions

[View Integration Guide →](./integrations)

## Quick Start

### Prerequisites

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Basic knowledge of WordPress development
- Familiarity with Vue.js (for frontend development)

### Development Environment

For local development, we recommend:

- **Local by Flywheel** or **XAMPP** for WordPress
- **VS Code** with PHP and Vue.js extensions
- **Git** for version control
- **Composer** for dependency management
- **Node.js** for frontend asset compilation

### Debugging Setup

Enable WordPress debugging in your `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
define('FLUENT_CART_DEBUG', true);
```

## Getting Help

### Documentation Resources

- [Database Documentation](../database/) - Complete database schema and models
- [Developer Hooks](../hooks/) - Action hooks, filter hooks, and event system
- [REST API](../api/) - Complete API documentation and examples
- [Modules](../modules/) - Module system and development guides

### Community Support

- [GitHub Issues](https://github.com/fluentcart/issues) - Bug reports and feature requests
- [Developer Community](https://community.fluentcart.com) - Community discussions
- [Documentation Issues](https://github.com/fluentcart/docs/issues) - Documentation improvements


## Related Documentation

- [Database Models](/database/models) - Data models for frontend integration
- [Developer Hooks](/hooks/) - Hooks for frontend customization
- [REST API](/api/) - API endpoints for frontend integration
- [Module System](/modules/) - Modules for frontend functionality
- [Getting Started](/getting-started) - Complete developer overview

## Next Steps

Continue with advanced development:

1. **[Frontend Development Guide](./frontend)** - Vue.js, templates, and assets
2. **[Integration Guide](./integrations)** - Third-party integrations
3. **[Module Development](/modules/)** - Build custom modules
4. **[API Integration](/api/)** - Connect with external systems

## Previous/Next Navigation

- **Previous**: [Module System](/modules/) - Building custom modules
- **Next**: [Getting Started](/getting-started) - Complete developer overview

---

