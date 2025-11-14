# API Verification Plan

This document outlines the systematic verification process for all OpenAPI JSON files against the actual FluentCart API implementation.

## Credentials
- **Base URL**: `https://cart.junior.ninja`
- **Username**: `fluentcart`
- **Password**: `gPai 6yhG Kp4u ezOe 7VkQ Ucjw`
- **Authorization**: Basic Auth (base64 encoded: `fluentcart:gPai 6yhG Kp4u ezOe 7VkQ Ucjw`)

## Verification Process

For each endpoint, we need to:
1. ✅ Verify the route exists in `api.php` or `shipping-api.php`
2. ✅ Verify HTTP method matches (GET, POST, PUT, DELETE)
3. ✅ Test with curl and capture actual response
4. ✅ Verify all parameters (query, path, body) match actual API
5. ✅ Identify required vs optional parameters
6. ✅ Update JSON with real response schema
7. ✅ Update request body examples with real data
8. ✅ Verify response status codes
9. ✅ Document any discrepancies

## Testing Queue

### Orders API (8 operations)
- [ ] GET /orders (list-orders.json)
- [ ] POST /orders (create-order.json)
- [ ] GET /orders/{order_id} (get-order.json)
- [ ] POST /orders/{order_id} (update-order.json)
- [ ] DELETE /orders/{order_id} (delete-order.json)
- [ ] POST /orders/{order}/mark-as-paid (mark-as-paid.json)
- [ ] POST /orders/{order_id}/refund (refund-order.json)
- [ ] PUT /orders/{order}/statuses (update-statuses.json)

### Products API (5 operations)
- [ ] GET /products (list-products.json)
- [ ] POST /products (create-product.json)
- [ ] GET /products/{product} (get-product.json)
- [ ] POST /products/{postId}/pricing (update-product-pricing.json)
- [ ] DELETE /products/{product} (delete-product.json)

### Customers API (4 operations)
- [ ] GET /customers (list-customers.json)
- [ ] POST /customers (create-customer.json)
- [ ] GET /customers/{customerId} (get-customer.json)
- [ ] PUT /customers/{customerId} (update-customer.json)

### Coupons API (6 operations)
- [ ] GET /coupons (list-coupons.json)
- [ ] POST /coupons (create-coupon.json)
- [ ] GET /coupons/{id} (get-coupon.json)
- [ ] PUT /coupons/{id} (update-coupon.json)
- [ ] DELETE /coupons/{id} (delete-coupon.json)
- [ ] POST /coupons/apply (apply-coupon.json)

### Subscriptions API (4 operations)
- [ ] GET /subscriptions (list-subscriptions.json) - *May not exist in routes*
- [ ] GET /subscriptions/{subscriptionOrderId} (get-subscription.json) - *May not exist*
- [ ] PUT /orders/{order}/subscriptions/{subscription}/cancel (cancel-subscription.json)
- [ ] PUT /orders/{order}/subscriptions/{subscription}/reactivate (reactivate-subscription.json)

### Tax API (2 operations)
- [ ] GET /tax/classes (list-tax-classes.json)
- [ ] POST /tax/classes (create-tax-class.json)

### Shipping API (1 operation)
- [ ] GET /shipping/zones (list-shipping-zones.json)

### Settings API (2 operations)
- [ ] GET /settings/store (get-store-settings.json)
- [ ] POST /settings/store (save-store-settings.json)

### Reports API (2 operations)
- [ ] GET /reports/overview (get-overview.json) - *May not exist*
- [ ] GET /reports/quick-order-stats (quick-order-stats.json) - *May not exist*

### Files API (2 operations)
- [ ] GET /files (list-files.json)
- [ ] POST /files/upload (upload-file.json)

### Dashboard API (1 operation)
- [ ] GET /dashboard/stats (get-dashboard-stats.json)

### Roles & Permissions API (2 operations)
- [ ] GET /settings/permissions (get-permissions.json)
- [ ] POST /settings/permissions (save-permissions.json)

### Integration API (4 operations)
- [ ] GET /integration/addons (list-addons.json)
- [ ] GET /integration/global-settings (get-global-settings.json)
- [ ] POST /integration/global-settings (set-global-settings.json)
- [ ] GET /integration/global-feeds (get-global-feeds.json)

### Licensing API (3 operations)
- [ ] GET /reports/license-chart (get-license-chart.json) - *May not exist*
- [ ] GET /reports/license-pie-chart (get-license-pie-chart.json) - *May not exist*
- [ ] GET /reports/license-summary (get-license-summary.json) - *May not exist*

### Email Notification API (3 operations)
- [ ] GET /email-notification/ (list-notifications.json)
- [ ] GET /email-notification/{notification} (get-notification.json)
- [ ] PUT /email-notification/{notification} (update-notification.json)

## Notes

- Some endpoints may not exist in the routes (marked with *May not exist*)
- Subscriptions endpoints may be in a different route file
- Reports endpoints may be in a different route file
- We'll test each one and document findings

