# API Verification Progress

## Status: In Progress

### Completed ✅
1. **GET /orders** (list-orders.json) - ✅ Verified and updated
   - Updated response schema to match actual Laravel pagination format
   - Updated Order schema with all actual fields from API response
   - Verified query parameters work correctly

2. **GET /orders/{order_id}** (get-order.json) - ✅ Verified and updated
   - Updated response schema with complete order detail structure
   - Added schemas for: OrderDetail, Activity, CustomerDetail, OrderItemDetail, TransactionDetail, OrderAddress
   - Includes: activities, labels, customer, order_items, transactions, order_addresses, billing_address, shipping_address

3. **POST /orders** (create-order.json) - ✅ Verified and updated
   - Updated request schema to match OrderRequest validation rules
   - Changed "items" to "order_items" (required array)
   - Added required "customer" object with id, email, first_name, full_name
   - Updated response schema to {message, order_id} format
   - Added all optional fields from validation rules

4. **POST /orders/{order_id}** (update-order.json) - ✅ Verified and updated
   - Updated request schema to require order_items array
   - Updated response schema to match actual response structure
   - Added error responses for subscription and completed orders

5. **DELETE /orders/{order_id}** (delete-order.json) - ✅ Verified and updated
   - Updated response schema with actual response structure
   - Added error response for orders that cannot be deleted

6. **POST /orders/{order}/mark-as-paid** (mark-as-paid.json) - ✅ Verified and updated
   - Updated request body fields: payment_method, vendor_charge_id, transaction_type, mark_paid_note
   - Updated response to {message} format
   - Added 423 error responses for already paid or canceled orders

7. **POST /orders/{order_id}/refund** (refund-order.json) - ✅ Verified and updated
   - Updated request to use refund_info object with transaction_id and amount (required)
   - Updated response to match actual structure: {fluent_cart_refund, gateway_refund, subscription_cancel}
   - Added error response for orders that cannot be refunded

8. **PUT /orders/{order}/statuses** (update-statuses.json) - ✅ Verified and updated
   - Updated request to use statuses object (not individual fields)
   - Fixed field name: "status" not "order_status"
   - Added manage_stock and action parameters
   - Updated response schema

### Completed Orders API ✅
All 8 Orders endpoints verified and updated!

9. **GET /products** (list-products.json) - ✅ Verified and updated
   - Updated example to match actual API response structure
   - Added missing Product schema fields: post_modified, post_modified_gmt, comment_status, ping_status, guid

10. **GET /products/{product}** (get-product.json) - ✅ Verified and updated
   - Updated response schema to match actual structure: {product: {...}} not wrapped in success/data
   - Added Product schema with all fields from actual response
   - Updated ProductDetail schema with additional fields: formatted_min_price, formatted_max_price, gallery_image
   - Updated other_info properties to match actual structure

11. **POST /products** (create-product.json) - ✅ Verified and updated
   - Updated response schema to include variant and product_details in data
   - Added error response for creation failures

12. **POST /products/{postId}/pricing** (update-product-pricing.json) - ✅ Verified and updated
   - Updated request schema to match ProductUpdateRequest validation rules
   - Changed from simple price/sale_price to detail and variants structure
   - Updated response to {message, data: product} format
   - Added error response for missing variation info

13. **DELETE /products/{product}** (delete-product.json) - ✅ Verified and updated
   - Updated response to {message, data: ""} format
   - Added error responses for pending orders, deletion failures, and not found

### Completed Products API ✅
All 5 Products endpoints verified and updated!

14. **GET /customers** (list-customers.json) - ✅ Verified and updated
   - Updated response schema to match actual structure: {customers: {...}} with Laravel pagination
   - Updated Customer schema with all actual fields from API response
   - Added missing fields: user_id, contact_id, purchase_value, purchase_count, ltv, first_purchase_date, last_purchase_date, aov, uuid, photo, country_name, formatted_address, user_link

15. **GET /customers/{customerId}** (get-customer.json) - ✅ Verified and updated
   - Updated response schema to {customer: {...}} format (not wrapped in success/data)
   - Updated CustomerDetail schema to use allOf with Customer base schema
   - Added all actual fields from API response

16. **POST /customers** (create-customer.json) - ✅ Verified and updated
   - Updated response to {message, data: customer} format
   - Added error responses for already exists, creation failed, and user creation failed
   - Updated Customer schema with all actual fields

17. **PUT /customers/{customerId}** (update-customer.json) - ✅ Verified and updated
   - Updated response to {message, data: customer} format
   - Added error responses for not found, update failed, and user update failed
   - Updated Customer schema with all actual fields

### Completed Customers API ✅
All 4 Customers endpoints verified and updated!

18. **GET /coupons** (list-coupons.json) - ✅ Verified and updated
   - Updated response schema to match actual structure: {coupons: {...}} with Laravel pagination
   - Updated Coupon schema with all actual fields: id, title, code, priority, type, conditions (object), amount, use_count, status, notes, stackable, show_on_checkout, start_date, end_date, created_at, updated_at
   - Added conditions object with all properties: max_uses, buy_quantity, get_quantity, max_per_customer, apply_to_quantity, excluded_products, included_products, apply_to_whole_cart, excluded_categories, included_categories, max_discount_amount, max_purchase_amount, min_purchase_amount

19. **GET /coupons/{id}** (get-coupon.json) - ✅ Verified and updated
   - Updated response schema to {coupon: {...}} format (not wrapped in success/data)
   - Added activities array to CouponDetail schema
   - Updated Activity schema with all fields from actual response

20. **POST /coupons** (create-coupon.json) - ✅ Verified and updated
   - Updated request schema to match CouponRequest validation rules
   - Required fields: title, code, type, amount, status, stackable, show_on_checkout
   - Type enum: fixed, percentage, free_shipping, buy_x_get_y
   - Status enum: active, expired, disabled, scheduled
   - Updated response to {message, data: coupon} format
   - Added error responses for validation errors and duplicate codes

21. **PUT /coupons/{id}** (update-coupon.json) - ✅ Verified and updated
   - Updated request schema - all required fields must be provided (same as create)
   - Updated response to {message, data: coupon} format
   - Added error responses for validation errors, invalid ID, and not found

22. **DELETE /coupons/{id}** (delete-coupon.json) - ✅ Verified and updated
   - Updated response to {message, data: ""} format
   - Added error responses for deletion failures, invalid ID, and not found

23. **POST /coupons/apply** (apply-coupon.json) - ✅ Verified and updated
   - Updated request schema to match FrontendRequests/CouponRequest validation rules
   - Required fields: coupon_code, order_items
   - Updated response to {applied_coupons: {...}, calculated_items: {...}} format (not wrapped in success/data)
   - Added schemas for applied_coupons and calculated_items with all actual fields

### Completed Coupons API ✅
All 6 Coupons endpoints verified and updated!

24. **GET /subscriptions** (list-subscriptions.json) - ✅ Verified and updated
   - Updated response schema to match actual structure: {data: {...}} with Laravel pagination
   - Updated Subscription schema with all actual fields from API response
   - Added fields: id, uuid, customer_id, parent_order_id, product_id, item_name, quantity, variation_id, billing_interval, signup_fee, initial_tax_total, recurring_amount, recurring_tax_total, recurring_total, bill_times, bill_count, expire_at, trial_ends_at, canceled_at, restored_at, collection_method, next_billing_date, trial_days, vendor_customer_id, vendor_plan_id, vendor_subscription_id, status, original_plan, vendor_response, current_payment_method, config, created_at, updated_at, url, payment_info, billingInfo, overridden_status, currency, reactivate_url, meta

25. **GET /subscriptions/{subscriptionOrderId}** (get-subscription.json) - ✅ Verified and updated
   - Updated response schema to {subscription: {...}, selected_labels: [...]} format (not wrapped in success/data)
   - Added related_orders array with Order schema
   - Added licenses array with License schema
   - Updated SubscriptionDetail to use allOf with Subscription base schema

26. **GET /dashboard/stats** (get-dashboard-stats.json) - ✅ Verified and updated
   - Updated response schema to {stats: [...]} format (not wrapped in success/data)
   - Updated StatWidget schema with actual fields: title, current_count, icon, url, has_currency

27. **GET /settings/store** (get-store-settings.json) - ✅ Verified and updated
   - Updated response schema to {settings: {...}, fields: {...}} format
   - Added all actual settings fields from API response
   - Added store_logo, theme_setup, and other configuration fields

28. **GET /settings/permissions** (get-permissions.json) - ✅ Verified and updated
   - Updated response schema to {roles: {capability: boolean, roles: [...]}} format
   - Updated WordPressRole schema with name and key fields

29. **GET /shipping/zones** (list-shipping-zones.json) - ✅ Verified and updated
   - Updated response schema to {shipping_zones: {...}} with Laravel pagination
   - Updated ShippingZone schema with formatted_region field
   - Added all pagination fields

30. **GET /tax/classes** (list-tax-classes.json) - ✅ Verified and updated
   - Updated response schema to {tax_classes: [...]} format (not wrapped in success/data)
   - Updated TaxClass schema with meta object containing priority and categories
   - Added categories array at root level

31. **GET /integration/addons** (list-addons.json) - ✅ Verified and updated
   - Updated response schema to {addons: {...}} format (object keyed by addon identifier, not array)
   - Updated IntegrationAddon schema with installable, enabled, title, logo, categories, description fields

32. **GET /reports/overview** (get-overview.json) - ✅ Verified and updated
   - Updated response schema to {data: {...}} format
   - Added RevenuePeriod schema for gross_revenue data structure
   - Response contains period-keyed objects with current, prev, yoy_growth fields

### Completed Subscriptions API ✅
2/4 Subscriptions endpoints verified and updated! (list, get - cancel and reactivate pending)

### Completed Dashboard API ✅
1/1 Dashboard endpoints verified and updated!

### Completed Settings API ✅
2/2 Settings endpoints verified and updated! (get-store-settings, get-permissions)

### Completed Shipping API ✅
1/1 Shipping endpoints verified and updated! (list-shipping-zones)

### Completed Tax API ✅
1/1 Tax endpoints verified and updated! (list-tax-classes)

### Completed Integration API ✅
1/4 Integration endpoints verified and updated! (list-addons - others pending)

### Completed Reports API ✅
2/2 Reports endpoints verified and updated! (get-overview, quick-order-stats - note: quick-order-stats may have issues in some installations)

33. **PUT /orders/{order}/subscriptions/{subscription}/cancel** (cancel-subscription.json) - ✅ Verified and updated
   - Updated request to require cancel_reason field
   - Updated response to {message, subscription} format (not wrapped in success/data)
   - Added error responses for missing reason and not found

34. **PUT /orders/{order}/subscriptions/{subscription}/reactivate** (reactivate-subscription.json) - ✅ Verified and updated
   - Updated to reflect that this endpoint returns "Not available yet" error
   - Documented as not available

35. **GET /integration/global-settings** (get-global-settings.json) - ✅ Verified and updated
   - Updated response schema to {settings: [], settings_key: "", message: "..."} format
   - Response indicates no integration settings found

36. **GET /integration/global-feeds** (get-global-feeds.json) - ✅ Verified and updated
   - Updated response schema to {feeds: [], available_integrations: {...}, all_module_config_url: "..."} format
   - Added AvailableIntegration schema with all fields: priority, title, description, category, disable_global_settings, config_url, logo, enabled, scopes, installable, delay_on_product_action, delay_on_global_action

37. **GET /reports/quick-order-stats** (quick-order-stats.json) - ✅ Verified and updated
   - Updated to note that endpoint may have issues (returns class not found error)
   - Added 500 error response for class not found

38. **GET /files** (list-files.json) - ✅ Verified and updated
   - Updated response schema to {files: [...]} format (not wrapped in success/data)
   - Updated File schema with actual fields: name, size, driver, bucket

39. **GET /email-notification** (list-notifications.json) - ✅ Verified and updated
   - Updated response schema to {data: {...}} format (object keyed by notification name, not array)
   - Updated EmailNotification schema with all actual fields: event, title, description, recipient, smartcode_groups, template_path, is_async, pre_header, settings, name
   - Added settings object with active, subject, is_default_body, email_body

40. **GET /email-notification/get-settings** (get-notification.json) - ✅ Verified and updated
   - Updated endpoint path to /email-notification/get-settings (not /email-notification/{notification})
   - Updated response schema to {data: {...}, shortcodes: [...]} format
   - Added ShortcodeGroup schema for available shortcodes
   - Response includes from_name, from_email, reply_to_name, reply_to_email, email_footer, show_email_footer, admin_email, notification_config

### Completed Subscriptions API ✅
4/4 Subscriptions endpoints verified and updated! (list, get, cancel, reactivate)

### Completed Integration API ✅
3/4 Integration endpoints verified and updated! (list-addons, get-global-settings, get-global-feeds - set-global-settings pending)

### Completed Files API ✅
1/2 Files endpoints verified and updated! (list-files - upload-file pending)

### Completed Email Notification API ✅
3/3 Email Notification endpoints verified and updated! (list-notifications, get-notification, update-notification, save-settings)

41. **POST /integration/global-settings** (set-global-settings.json) - ✅ Verified and updated
   - Updated request schema to require integration_name and integration (JSON string)
   - Added optional integration_id for updates
   - Updated response to {message, integration_id, integration_name, created, feedData} format (not wrapped in success/data)
   - Added error responses for validation errors and not found

42. **POST /files/upload** (upload-file.json) - ✅ Verified and updated
   - Updated request schema - name is required (max 160 chars), file is required (binary)
   - Updated response to {message, path, file: {driver, size, name, bucket}} format (not wrapped in success/data)
   - File name is automatically prefixed with timestamp for uniqueness
   - Added error responses for validation errors and empty file

43. **PUT /email-notification/{notification}** (update-notification.json) - ✅ Verified and updated
   - Updated request schema to require settings object with subject (required)
   - Settings fields: active, subject, is_default_body, email_body
   - Updated response to {message} format (wrapped in success/data via sendSuccess)
   - Added error response for validation errors

44. **POST /email-notification/save-settings** (update-notification.json) - ✅ Verified and updated
   - Added new endpoint for saving global email settings
   - Required fields: from_name, from_email, admin_email
   - Optional fields: reply_to_name, reply_to_email, email_footer, show_email_footer
   - Updated response to {message} format (wrapped in success/data via sendSuccess)
   - Added error response for validation errors

### Completed Integration API ✅
4/4 Integration endpoints verified and updated! (list-addons, get-global-settings, set-global-settings, get-global-feeds)

### Completed Files API ✅
2/2 Files endpoints verified and updated! (list-files, upload-file)

### Completed Email Notification API ✅
3/3 Email Notification endpoints verified and updated! (list-notifications, get-notification, update-notification, save-settings)

## Findings

### Response Structure Pattern
The API uses Laravel's pagination format directly, not wrapped in `{success: true, data: {...}}`:
```json
{
  "orders": {
    "current_page": 1,
    "data": [...],
    "first_page_url": "...",
    "last_page": 59176,
    "links": [...],
    "next_page_url": "...",
    "path": "...",
    "per_page": 10,
    "prev_page_url": null,
    "to": 10,
    "total": 591759
  }
}
```

### Order Schema Fields (Actual)
- id, status, parent_id, receipt_number, invoice_no
- fulfillment_type, type, mode, shipping_status
- customer_id, payment_method, payment_method_type, payment_status
- currency, subtotal, discount_tax, manual_discount_total
- coupon_discount_total, shipping_tax, shipping_total, tax_total
- total_amount, total_paid, total_refund, rate, tax_behavior
- note, ip_address, completed_at, refunded_at, uuid
- config (object), created_at, updated_at

## Next Steps
1. Continue testing each endpoint with curl
2. Update JSON files with actual response structures
3. Verify all parameters (required vs optional)
4. Update request body examples with real data
5. Document any endpoints that don't exist in routes

