---
title: Products API
description: FluentCart Products API documentation with complete endpoint reference and usage examples.
---

# Products API

The Products API provides comprehensive endpoints for managing products in FluentCart. This includes creating, reading, updating, and deleting products, as well as managing product variations, attributes, and integrations.

## Base URL

```
https://yoursite.com/wp-json/fluent-cart/v2/products
```

## Authentication

All endpoints require authentication and appropriate permissions:

- **Authentication**: WordPress Application Password or Cookie


## List Products

**GET** `/products`

Retrieve a paginated list of products with optional filtering and searching.

### Parameters

| Parameter         | Type    | Description                                        | Default    |
| ----------------- | ------- | -------------------------------------------------- | ---------- |
| `filter_type`     | string  | Product filter type (simple/advanced)              | simple     |
| `per_page`        | integer | Number of products per page                        | 10         |
| `page`            | integer | Current page number                                | 1          |
| `sort_by`         | string  | Field to sort products by                          | ID         |
| `sort_type`       | string  | Sort order (ASC/DESC)                              | DESC       |
| `with[]`          | array   | Related data to include (e.g., detail, variants). <strong>➕ show options</strong>: <ul><li><code>detail</code> — include the product detail object</li><li><code>detail.variants.media</code> — include variant media nested under product detail</li><li><code>variants:post_id,available</code> — include variants but only with the <code>post_id</code> and <code>available</code> fields</li><li><code>categories</code> — include product categories</li></ul><p><strong>Example:</strong> <code>?with[]=detail&amp;with[]=detail.variants.media&amp;with[]=variants:post_id,available&amp;with[]=categories</code></p> | -          |
| `search`          | string  | Search keyword                                     | -          |
| `active_view`     | string  | Current active view or context. <strong>➕ options</strong>: <ul><li><code>draft</code> — draft products</li><li><code>physical</code> — physical product view</li><li><code>publish</code> — published products</li><li><code>digital</code> — digital product view</li><li><code>subscribable</code> — subscription-capable products</li></ul><p><strong>Example:</strong> <code>active_view=draft</code></p> | all        |
| `user_tz`         | string  | User’s timezone for GMT conversion                 | Asia/Dhaka |
| `advanced_filters`| json    | Advanced relation-based filters. Provide an array of rule objects (see example below). | -          |





<blockquote>

`advanced_filters` expects an array of rule-groups. Each inner array is a group of rules combined with AND. Multiple groups are combined with OR.

Example boolean interpretation:

<code> [[A, B], [C]] -> (A AND B) OR (C) </code>
</blockquote>

### Search by Name

Use the `search` query parameter to match product title/content. This is the simplest way to find products by name.

Example:

`GET /wp-json/fluent-cart/v2/products?search=zipper+hoodie`

(Use `advanced_filters` only when you need relation-based rules; name search is simpler via `search`.)

### Search by Order Count

Find products based on related order items count or presence.

Payload example (single rule group — AND group with one rule):

```json
[
  [
    {
      "source": ["order","has"],
      "filter_type": "relation",
      "relation": "orderItems",
      "operator": "!=",
      "value": 1
    }
  ]
]
```

UI mapping: Order Count -> `source[0] = "order"`, `relation = "orderItems"`, operators map from UI labels (e.g. "Doesn't equal" -> `!=`).

### Search by Variation Count

Find products by number of variants.

Example: products with less than 1 variant

```json
[
  [
    {
      "source": ["variations","has"],
      "filter_type": "relation",
      "relation": "variants",
      "operator": "<",
      "value": 1
    }
  ]
]
```

### Search by Variant ID

Check if a product's variants include a specific variation item (by ID).

Example: variation items includes ID 185

```json
{
  "filter_type": "advanced",
  "advanced_filters": [
    [
      {
        "source": ["variations", "variation_items"],
        "filter_type": "relation",
        "operator": "contains",
        "value": [185],
        "column": "id",
        "relation": "variants"
      }
    ]
  ]
}
```

### Search by Variation Type

Filter products by variation type field (e.g. `simple`, `simple_variations`).

Example: variation_type equals "simple"

```json
[
  [
    {
      "source": ["variations","variation_type"],
      "filter_type": "relation",
      "relation": "detail",
      "column": "variation_type",
      "operator": "=",
      "value": "simple"
    }
  ]
]
```

### Search by Categories

Check product membership in product categories (use term IDs).

Example: product in category ID 2

```json
[
  [
    {
      "source": ["taxonomy","product-categories"],
      "filter_type": "relation",
      "relation": "wpTerms",
      "column": "term_id",
      "operator": "contains",
      "value": [2]
    }
  ]
]
```


### Combining multiple rules (AND / OR)

Rules are grouped into inner arrays (AND) and the top-level array groups those with OR. Use multiple rules inside an inner array to require all of them (AND). Use multiple inner arrays to create alternative groups (OR).

Simple example: (A AND B) OR C

```json
[
  [ A, B ],
  [ C ]
]
```

Real example (two groups — shown as OR):

```json
[
  [
    {"source":["order","has"],"filter_type":"relation","operator":"!=","value":1,"relation":"orderItems"},
    {"source":["variations","has"],"filter_type":"relation","operator":"<","value":1,"relation":"variants"}
  ],
  [
    {"source":["taxonomy","product-categories"],"filter_type":"relation","operator":"contains","value":[2],"column":"term_id","relation":"wpTerms"}
  ]
]
```


Operator quick mapping (UI → payload): Doesn't equal=`!=`, Less Than=`<`, Greater Than=`>`, Is=`=`, Includes=`contains`.


#### Response

```json
{
  "products": {
    "current_page": 1,
    "data": [
      {
        "ID": 74,
        "post_author": "1",
        "post_date": "2025-09-24 05:12:35",
        "post_date_gmt": "2025-09-24 05:12:35",
        "post_content": "This stylish zipper hoodie is designed for versatility and comfort. Featuring a full-length zipper, it is easy to layer over t-shirts or under coats during cooler months. The hood offers added warmth, while the lightweight yet durable material ensures long-lasting wear. Ideal for casual outings, gym sessions, or simply lounging around, this hoodie provides a modern twist to the classic design.",
        "post_title": "Zipper Hoodie",
        "post_excerpt": "A stylish zipper hoodie with modern detailing, perfect for casual wear and layering during cooler months.",
        "post_status": "publish",
        "comment_status": "open",
        "ping_status": "closed",
        "post_password": "",
        "post_name": "zipper-hoodie-24-09-2025-05:12:35",
        "to_ping": "",
        "pinged": "",
        "post_modified": "2025-09-24 05:12:35",
        "post_modified_gmt": "2025-09-24 05:12:35",
        "post_content_filtered": "",
        "post_parent": "0",
        "guid": "https://yoursite.com/?items=zipper-hoodie-24-09-2025-05:12:35",
        "menu_order": "0",
        "post_type": "fluent-products",
        "post_mime_type": "",
        "comment_count": "0",
        "view_url": "https://yoursite.com/item/zipper-hoodie-24-09-2025-05:12:35/",
        "edit_url": "https://yoursite.com/wp-admin/post.php?post=74&action=edit"
      }
    ],
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=1",
    "from": 1,
    "last_page": 10,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=10",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=2",
        "label": "2",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/products",
    "per_page": 1,
    "prev_page_url": null,
    "to": 1,
    "total": 10
  }
}
```


## Product Details

```json
{
    "product": {
        "ID": 7529385,
        "post_author": "5",
        "post_date": "2025-10-11 11:50:31",
        "post_date_gmt": "2025-10-11 11:50:31",
        "post_content": "",
        "post_title": "Sample Digital Product",
        "post_excerpt": "",
        "post_status": "draft",
        "comment_status": "closed",
        "ping_status": "closed",
        "post_password": "",
        "post_name": "sample-digital-product",
        "to_ping": "",
        "pinged": "",
        "post_modified": "2025-10-11 11:50:31",
        "post_modified_gmt": "2025-10-11 11:50:31",
        "post_content_filtered": "",
        "post_parent": "0",
        "guid": "https://cart.junior.ninja/?post_type=fluent-products&#038;p=7529385",
        "menu_order": "0",
        "post_type": "fluent-products",
        "post_mime_type": "",
        "comment_count": "0",
        "thumbnail": "https://cart.junior.ninja/wp-content/uploads/2025/06/white-navy-athletic-shoe-2.jpeg",
        "detail": {
            "id": 52,
            "post_id": 7529385,
            "fulfillment_type": "digital",
            "min_price": 2000,
            "max_price": 3000,
            "default_variation_id": "0",
            "default_media": null,
            "manage_stock": "1",
            "stock_availability": "in-stock",
            "variation_type": "simple_variations",
            "manage_downloadable": "1",
            "other_info": {
                "tax_class": null,
                "active_editor": null,
                "shipping_class": 3,
                "group_pricing_by": "payment_type",
                "sold_individually": "no",
                "use_pricing_table": "no"
            },
            "created_at": "2025-10-11T11:39:14+00:00",
            "updated_at": "2025-10-11T11:50:31+00:00",
            "featured_media": {
                "id": 7529266,
                "url": "https://cart.junior.ninja/wp-content/uploads/2025/06/white-navy-athletic-shoe-2.jpeg",
                "title": "white-navy-athletic-shoe-2"
            },
            "formatted_min_price": "&#36;20.00",
            "formatted_max_price": "&#36;30.00",
            "gallery_image": {
                "meta_id": "703",
                "post_id": 7529385,
                "meta_key": "fluent-products-gallery-image",
                "meta_value": [
                    {
                        "id": 7529266,
                        "url": "https://cart.junior.ninja/wp-content/uploads/2025/06/white-navy-athletic-shoe-2.jpeg",
                        "title": "white-navy-athletic-shoe-2"
                    },
                    {
                        "id": 7529265,
                        "url": "https://cart.junior.ninja/wp-content/uploads/2025/06/white-navy-athletic-shoe-1.jpeg",
                        "title": "white-navy-athletic-shoe-1"
                    },
                    {
                        "id": 7529260,
                        "url": "https://cart.junior.ninja/wp-content/uploads/2025/06/unnamed-5.png",
                        "title": "unnamed (5)"
                    }
                ]
            }
        }
    }
}
```

## Create Product

**POST** `/products`

Create a new product.

#### Parameters

When creating a product, the following parameters can be pass:

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `post_title` | string | Product title | Yes |
| `post_status` | string | Post status (e.g. `draft`, `publish`) | No (default: `draft`) |
| `detail.fulfillment_type` | string | Fulfillment type for the product (e.g. `digital`, `physical`) | Yes |


#### Request Body

```json
{
  "post_title": "Dynamic Product",
  "post_status": "draft",
  "detail": {
    "fulfillment_type": "digital",
  }
}
```


### Create Product Pricing (need update)
<!-- 
**POST** `/products`

Create pricing for the created product.

#### Request Body

```json
{
  "ID": 7529320,
  "post_author": 5,
  "post_date": "2025-09-24T15:48:31+06:00",
  "post_date_gmt": "0000-00-00 00:00:00",
  "post_content": "",
  "post_title": "Dynamic Product 2",
  "post_excerpt": "",
  "post_status": "draft",
  "comment_status": "closed",
  "ping_status": "closed",
  "post_password": "",
  "post_name": "",
  "to_ping": "",
  "pinged": "",
  "post_modified": "2025-09-24 09:48:31",
  "post_modified_gmt": "0000-00-00 00:00:00",
  "post_content_filtered": "",
  "post_parent": 0,
  "guid": "https://cart.junior.ninja/?post_type=fluent-products&p=7529320",
  "menu_order": 0,
  "post_type": "fluent-products",
  "post_mime_type": "",
  "comment_count": 0,
  "view_url": "https://cart.junior.ninja/?post_type=fluent-products&p=7529320",
  "edit_url": "https://cart.junior.ninja/wp-admin/post.php?post=7529320&action=edit",
  "detail": {
    "id": 42,
    "post_id": 7529320,
    "fulfillment_type": "digital",
    "min_price": "0",
    "max_price": "0",
    "default_variation_id": 0,
    "default_media": "",
    "manage_stock": "0",
    "stock_availability": "in-stock",
    "variation_type": "simple",
    "manage_downloadable": "0",
    "other_info": {
      "active_editor": "wp-editor",
      "group_pricing_by": "repeat_interval",
      "sold_individually": "no",
      "use_pricing_table": "yes"
    },
    "created_at": "2025-09-24T09:48:31+00:00",
    "updated_at": "2025-09-24T09:48:31+00:00",
    "featured_media": "",
    "gallery_image": ""
  },
  "variants": [
    {
      "id": 177,
      "post_id": 7529320,
      "media_id": "",
      "serial_index": 1,
      "sold_individually": "0",
      "variation_title": "Dynamic Product 2",
      "variation_identifier": "",
      "manage_stock": "0",
      "payment_type": "",
      "stock_status": "in-stock",
      "backorders": "0",
      "total_stock": 1,
      "on_hold": 0,
      "committed": 0,
      "available": 1,
      "fulfillment_type": "digital",
      "item_status": "active",
      "manage_cost": false,
      "item_price": "20",
      "item_cost": "0",
      "compare_price": "",
      "shipping_class": "",
      "other_info": {
        "description": "",
        "payment_type": "onetime",
        "times": "",
        "repeat_interval": "",
        "trial_days": "",
        "billing_summary": "",
        "manage_setup_fee": "no",
        "signup_fee_name": "",
        "signup_fee": "0",
        "setup_fee_per_item": "no"
      },
      "downloadable": false,
      "created_at": "2025-09-24T09:48:31+00:00",
      "updated_at": "2025-09-24T09:48:31+00:00",
      "thumbnail": "",
      "formatted_total": "$0.00",
      "media": "",
      "rowId": 0,
      "new_stock": 1,
      "adjusted_quantity": 0
    }
  ]
}
```

#### Response

```json
{
    "data": {
        "ID": 7529320,
        "product_details": null
    },
    "message": "Product has been created successfully"
}
```

#### Example Request

```bash
curl --location 'https://cart.junior.ninja/wp-json/fluent-cart/v2/products/7529320/pricing' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic Zmx1ZW50Y2FydDpqbXZwIHk5TEogV2pPNSBIbWpyIGd4dlUgYnlENQ==' \
--data '{
  "post_title": "Dynamic Product 2",
  "post_status": "publish",
  "detail": {
    "fulfillment_type": "digital",
    "min_price": "0",
    "max_price": "0",
    "default_variation_id": 0,
    "default_media": "",
    "manage_stock": "0",
    "stock_availability": "in-stock",
    "variation_type": "simple",
    "manage_downloadable": "0",
    "other_info": {
      "active_editor": "wp-editor",
      "group_pricing_by": "repeat_interval",
      "sold_individually": "no",
      "use_pricing_table": "yes"
    },
    "created_at": "2025-09-24T09:48:31+00:00",
    "updated_at": "2025-09-24T09:48:31+00:00",
    "featured_media": "",
    "gallery_image": ""
  },
  "variants": [
    {
      "id": 177,
      "post_id": 7529320,
      "media_id": "",
      "serial_index": 1,
      "sold_individually": "0",
      "variation_title": "Dynamic Product 2",
      "variation_identifier": "",
      "manage_stock": "0",
      "payment_type": "",
      "stock_status": "in-stock",
      "backorders": "0",
      "total_stock": 1,
      "on_hold": 0,
      "committed": 0,
      "available": 1,
      "fulfillment_type": "digital",
      "item_status": "active",
      "manage_cost": false,
      "item_price": "50",
      "item_cost": "0",
      "compare_price": "",
      "shipping_class": "",
      "other_info": {
        "description": "",
        "payment_type": "onetime",
        "times": "",
        "repeat_interval": "",
        "trial_days": "",
        "billing_summary": "",
        "manage_setup_fee": "no",
        "signup_fee_name": "",
        "signup_fee": "0",
        "setup_fee_per_item": "no"
      },
      "downloadable": false,
      "created_at": "2025-09-24T09:48:31+00:00",
      "updated_at": "2025-09-24T09:48:31+00:00",
      "thumbnail": "",
      "formatted_total": "$0.00",
      "media": "",
      "rowId": 0,
      "new_stock": 1,
      "adjusted_quantity": 0
    }
  ]
}'
``` -->


### Get Product Details

**GET** `/products/{product}`

Retrieve detailed information about a specific product.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `product` | integer | Product ID |

#### Response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 33,
      "post_id": 7529108,
      "variations": [
        {
          "id": 145,
          "post_id": 7529108,
          "serial_index": 6,
          "sold_individually": 0,
          "variation_title": "Unlimited Sites Lifetime License",
          "variation_identifier": "6",
          "manage_stock": "0",
          "payment_type": "onetime",
          "stock_status": "in-stock",
          "backorders": 0,
          "total_stock": 0,
          "on_hold": 0,
          "committed": 0,
          "available": 0,
          "fulfillment_type": "digital",
          "item_status": "active",
          "manage_cost": "false",
          "item_price": 129900,
          "item_cost": 0,
          "compare_price": 0,
          "shipping_class": "0",
          "other_info": {
            "payment_type": "onetime"
          },
          "downloadable": "1",
          "created_at": "2021-09-22T07:09:20+00:00",
          "updated_at": "2025-06-06T14:36:34+00:00",
          "thumbnail": null,
          "formatted_total": "&#36;1,299.00",
          "media": null
        }
      ],
      "detail": {
        "id": 33,
        "post_id": 7529108,
        "fulfillment_type": "digital",
        "min_price": 8900,
        "max_price": 129900,
        "default_variation_id": "145",
        "default_media": null,
        "manage_stock": "0",
        "stock_availability": "in-stock",
        "variation_type": "simple_variations",
        "manage_downloadable": "1",
        "other_info": {
          "group_pricing_by": "repeat_interval",
          "use_pricing_table": "yes"
        },
        "created_at": "2021-09-22T07:09:20+00:00",
        "updated_at": "2025-09-24T09:09:50+00:00",
        "featured_media": null,
        "gallery_image": {
          "meta_id": "63",
          "post_id": 7529108,
          "meta_key": "fluent-products-gallery-image",
          "meta_value": []
        }
      }
    }
  }
}
```

#### Error Response

```json
{
  "message": "Product not found",
  "data": null
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/products/33" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Update Product

**PUT** `/products/{postId}/pricing`

Update product pricing information.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId` | integer | Product ID |

#### Request Body

```json
{
  "price": 3000,
  "sale_price": 2500,
  "sku": "SP-001-UPDATED"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "price": 3000,
      "sale_price": 2500,
      "sku": "SP-001-UPDATED",
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v1/products/1/pricing" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 3000,
    "sale_price": 2500
  }'
```

## Delete Product

**DELETE** `/products/{product}`

Delete a product (soft delete).

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `product` | integer | Product ID |

#### Response

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v1/products/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```


### Set Product Image

**GET** `/products/{variantId}/thumbnail`

Set product image for a variant.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `variantId` | integer | Variant ID |

#### Response

```json
{
  "success": true,
  "data": {
    "image": {
      "id": 1,
      "url": "https://example.com/image.jpg",
      "alt": "Product image"
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/products/1/thumbnail" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Update Variant Option

**POST** `/products/{postId}/update-variant-option`

Update a product variant option.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId` | integer | Product ID |

#### Request Body

```json
{
  "variant_id": 1,
  "option_name": "Size",
  "option_value": "Large"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "variant": {
      "id": 1,
      "options": {
        "Size": "Large"
      },
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/products/1/update-variant-option" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": 1,
    "option_name": "Size",
    "option_value": "Large"
  }'
```

### Add Product Terms

**POST** `/products/add-product-terms`

Add terms (categories, tags) to a product.

#### Request Body

```json
{
  "product_id": 1,
  "terms": [
    {
      "taxonomy": "product_category",
      "term_id": 1
    },
    {
      "taxonomy": "product_tag",
      "term_id": 2
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "terms": [
        {
          "taxonomy": "product_category",
          "term_id": 1
        },
        {
          "taxonomy": "product_tag",
          "term_id": 2
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/products/add-product-terms" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "terms": [
      {
        "taxonomy": "product_category",
        "term_id": 1
      }
    ]
  }'
```

### Bulk Actions

**POST** `/products/do-bulk-action`

Perform bulk actions on multiple products.

#### Request Body

```json
{
  "action": "update_status",
  "product_ids": [1, 2, 3],
  "data": {
    "status": "draft"
  }
}
```

#### Available Actions

- `update_status` - Update status of multiple products
- `delete` - Delete multiple products
- `export` - Export multiple products

#### Response

```json
{
  "success": true,
  "data": {
    "processed": 3,
    "failed": 0,
    "results": [
      {
        "product_id": 1,
        "success": true
      },
      {
        "product_id": 2,
        "success": true
      },
      {
        "product_id": 3,
        "success": true
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/products/do-bulk-action" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_status",
    "product_ids": [1, 2, 3],
    "data": {
      "status": "draft"
    }
  }'
```

## Product Variations

### List Variations

**GET** `/products/variants`

List all product variations.

#### Response

```json
{
  "success": true,
  "data": {
    "variations": [
      {
        "id": 1,
        "product_id": 1,
        "title": "Small",
        "price": 2000,
        "sku": "SP-001-S",
        "stock_quantity": 50
      }
    ]
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v1/products/variants" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Create Variation

**POST** `/products/variants`

Create a new product variation.

#### Request Body

```json
{
  "product_id": 1,
  "title": "Large",
  "price": 3000,
  "sku": "SP-001-L",
  "stock_quantity": 25,
  "options": {
    "Size": "Large",
    "Color": "Red"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "variation": {
      "id": 2,
      "product_id": 1,
      "title": "Large",
      "price": 3000,
      "sku": "SP-001-L",
      "stock_quantity": 25,
      "created_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v1/products/variants" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "title": "Large",
    "price": 3000,
    "sku": "SP-001-L"
  }'
```


## Rate Limiting

- **List operations**: 100 requests per hour
- **Create operations**: 50 requests per hour
- **Update operations**: 200 requests per hour
- **Delete operations**: 20 requests per hour

## Related Documentation

- [Orders API](./orders) - Order management endpoints
- [Customers API](./customers) - Customer management endpoints
- [Database Models](/database/models) - Product data models
- [Developer Hooks](/hooks/) - Product-related hooks
