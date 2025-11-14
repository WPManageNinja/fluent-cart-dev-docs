---
title: API Reference
description: Complete FluentCart API documentation generated from OpenAPI specification
---

# API Reference

This page displays the complete FluentCart API documentation generated from the OpenAPI specification.

## Overview

The FluentCart API provides comprehensive endpoints for managing your e-commerce operations including orders, products, customers, coupons, subscriptions, and more. All endpoints have been verified and tested against the live API to ensure accuracy.

## Authentication

All endpoints require authentication using WordPress Application Password. The format is `username:application_password` which should be base64-encoded and sent in the `Authorization` header as `Basic {encoded_credentials}`.

## API Sections

### Orders

- [List Orders](/operations/orders/list-orders) - Retrieve a paginated list of orders with optional filtering
- [Get Order](/operations/orders/get-order) - Get detailed information about a specific order
- [Create Order](/operations/orders/create-order) - Create a new order with items and customer information
- [Update Order](/operations/orders/update-order) - Update an existing order's information
- [Delete Order](/operations/orders/delete-order) - Delete an order from the system
- [Mark as Paid](/operations/orders/mark-as-paid) - Mark an order as paid manually
- [Refund Order](/operations/orders/refund-order) - Process a refund for an order
- [Update Statuses](/operations/orders/update-statuses) - Update order statuses (payment, shipping, order status)

### Products

- [List Products](/operations/products/list-products) - Retrieve a paginated list of products
- [Get Product](/operations/products/get-product) - Get detailed information about a specific product
- [Create Product](/operations/products/create-product) - Create a new product
- [Update Product Pricing](/operations/products/update-product-pricing) - Update product pricing and details
- [Delete Product](/operations/products/delete-product) - Delete a product

### Customers

- [List Customers](/operations/customers/list-customers) - Retrieve a paginated list of customers
- [Get Customer](/operations/customers/get-customer) - Get detailed information about a specific customer
- [Create Customer](/operations/customers/create-customer) - Create a new customer
- [Update Customer](/operations/customers/update-customer) - Update customer information

### Coupons

- [List Coupons](/operations/coupons/list-coupons) - Retrieve a paginated list of coupons
- [Get Coupon](/operations/coupons/get-coupon) - Get detailed information about a specific coupon
- [Create Coupon](/operations/coupons/create-coupon) - Create a new discount coupon
- [Update Coupon](/operations/coupons/update-coupon) - Update an existing coupon
- [Delete Coupon](/operations/coupons/delete-coupon) - Delete a coupon
- [Apply Coupon](/operations/coupons/apply-coupon) - Apply a coupon to an order or cart

### Subscriptions

- [List Subscriptions](/operations/subscriptions/list-subscriptions) - Retrieve a paginated list of subscriptions
- [Get Subscription](/operations/subscriptions/get-subscription) - Get detailed information about a specific subscription
- [Cancel Subscription](/operations/subscriptions/cancel-subscription) - Cancel a subscription
- [Reactivate Subscription](/operations/subscriptions/reactivate-subscription) - Reactivate a cancelled subscription (not available yet)

### Dashboard

- [Get Dashboard Stats](/operations/dashboard/get-dashboard-stats) - Retrieve dashboard statistics and widgets

### Settings

- [Get Store Settings](/operations/settings/get-store-settings) - Retrieve store settings
- [Save Store Settings](/operations/settings/save-store-settings) - Save store settings

### Shipping

- [List Shipping Zones](/operations/shipping/list-shipping-zones) - Retrieve a paginated list of shipping zones

### Tax

- [List Tax Classes](/operations/tax/list-tax-classes) - Retrieve all tax classes
- [Create Tax Class](/operations/tax/create-tax-class) - Create a new tax class

### Integration

- [List Addons](/operations/integration/list-addons) - Retrieve a list of available integration addons
- [Get Global Settings](/operations/integration/get-global-settings) - Retrieve global settings for integrations
- [Set Global Settings](/operations/integration/set-global-settings) - Save or update global settings for an integration
- [Get Global Feeds](/operations/integration/get-global-feeds) - Retrieve all global integration feeds

### Reports

- [Get Overview](/operations/reports/get-overview) - Retrieve a comprehensive overview report with key metrics
- [Quick Order Stats](/operations/reports/quick-order-stats) - Retrieve quick statistics about orders

### Files

- [List Files](/operations/files/list-files) - Retrieve a list of uploaded files
- [Upload File](/operations/files/upload-file) - Upload a new file to the storage system

### Email Notification

- [List Notifications](/operations/email-notification/list-notifications) - Retrieve all available email notifications
- [Get Notification](/operations/email-notification/get-notification) - Retrieve settings and available shortcodes for email notifications
- [Update Notification](/operations/email-notification/update-notification) - Update settings for a specific email notification or save global email settings

### Roles & Permissions

- [Get Permissions](/operations/roles-permissions/get-permissions) - Retrieve a list of available WordPress roles and permissions
- [Save Permissions](/operations/roles-permissions/save-permissions) - Save role permissions configuration

## Interactive Documentation

Use the interactive API documentation below to explore endpoints, view request/response examples, and test API calls directly from your browser.

<OASpec />
