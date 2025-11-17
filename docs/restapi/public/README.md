# OpenAPI Specification Files

This directory contains modular OpenAPI specification files that are automatically merged at runtime.

## File Structure

- **`fluentcart-base.json`** - FluentCart base specification with common info, servers, security, and shared schemas
- **`orders/`** - Directory containing individual operation files:
  - `list-orders.json` - GET List Orders operation with OrderListResponse schema
  - `create-order.json` - POST Create Order operation with CreateOrderRequest and OrderResponse schemas
  - `get-order.json` - GET Get Order Details operation with OrderResponse schema
  - `update-order.json` - POST Update Order operation with UpdateOrderRequest and OrderResponse schemas
  - `delete-order.json` - DELETE Delete Order operation
  - `mark-as-paid.json` - POST Mark Order as Paid operation with OrderResponse schema
  - `refund-order.json` - POST Refund Order operation with Refund and OrderResponse schemas
  - `update-statuses.json` - PUT Update Order Statuses operation with OrderResponse schema

## Adding New Operations

To add a new operation:

1. Create a new JSON file in the appropriate directory (e.g., `orders/new-operation.json`)
2. Include the path, operation definition, and all required schemas:
   ```json
   {
     "paths": {
       "/orders/{id}/action": {
         "post": {
           "operationId": "newOperation",
           "summary": "POST New Operation",
           "description": "Description of the operation",
           "tags": ["Orders"],
           "security": [
             {
               "wordpressAuth": []
             }
           ],
           "requestBody": { ... },
           "responses": { ... }
         }
       }
     },
     "components": {
       "schemas": {
         "RequestSchema": { ... },
         "ResponseSchema": { ... }
       }
     }
   }
   ```
3. Add the filename to the `specFiles` array in `.vitepress/theme/index.js`

## Benefits

- **Modular**: Each operation is in its own file
- **Collaborative**: Multiple writers can work on different operations simultaneously
- **Maintainable**: Easy to update individual operations without conflicts
- **Self-contained**: Each file includes all schemas it needs
- **Automatic Merging**: All specs are merged at runtime



fetch('https://YourWebsite.com/wp-json/fluent-cart/v2/orders/7536299', {
  method: 'DELETE',
  headers: {
    Authorization: 'Basic Zmx1ZW50Y2FydDpnUGFpIDZ5aEcgS3A0dSBlek9lIDdWa1EgVWNqdw=='
  }
})