---
title: Product Model
description: FluentCart Product model documentation with attributes, scopes, relationships, and methods.
---

# Product Model

| DB Table Name | {wp_db_prefix}_posts (WordPress posts table) |
| ------------- | --------------------------------------------- |
| Schema        | [Check Schema](/database/schema#posts-table) |
| Source File   | fluent-cart/app/Models/Product.php            |
| Name Space    | FluentCart\App\Models                          |
| Class         | FluentCart\App\Models\Product                  |

## Attributes

| Attribute          | Data Type | Comment |
| ------------------ | --------- | ------- |
| ID                 | Integer   | Primary Key (WordPress post ID) |
| post_author        | Integer   | Post author ID |
| post_date          | Date Time | Post creation date |
| post_date_gmt      | Date Time | Post creation date (GMT) |
| post_content       | Text      | Post content |
| post_title         | String    | Post title |
| post_excerpt       | Text      | Post excerpt |
| post_status        | String    | Post status (publish, draft, etc.) |
| comment_status     | String    | Comment status |
| ping_status        | String    | Ping status |
| post_password      | String    | Post password (hidden) |
| post_name          | String    | Post slug |
| to_ping            | Text      | URLs to ping (hidden) |
| pinged             | Text      | URLs that have been pinged (hidden) |
| post_modified      | Date Time | Post last modified date |
| post_modified_gmt  | Date Time | Post last modified date (GMT) |
| post_content_filtered | Text   | Filtered post content (hidden) |
| post_parent        | Integer   | Parent post ID (hidden) |
| guid               | String    | Global unique identifier |
| menu_order         | Integer   | Menu order (hidden) |
| post_type          | String    | Post type (`fluent-products`) |
| post_mime_type     | String    | Post MIME type (hidden) |
| comment_count      | Integer   | Comment count (hidden) |

### Appended Attributes

| Attribute   | Data Type | Comment |
| ----------- | --------- | ------- |
| thumbnail   | String    | Product thumbnail URL (from `getThumbnailAttribute()`) |

### Searchable Attributes

| Attribute   |
| ----------- |
| post_title  |
| post_status |

## Usage

Please check [Model Basic](/database/models) for Common methods.

### Accessing Attributes

```php
$product = FluentCart\App\Models\Product::find(1);

$product->ID; // returns WordPress post ID
$product->post_title; // returns product title
$product->post_content; // returns product description
$product->post_status; // returns product status
$product->thumbnail; // returns thumbnail URL (appended attribute)
```

## Methods

Along with Global Model methods, this model has few helper methods.

### getHasSubscriptionAttribute()

Check if product has subscription variants. Iterates over all variants and returns `true` if any variant has `payment_type` set to `subscription` in its `other_info`.

* Returns `Boolean` - True if product has subscription variants

```php
$product = FluentCart\App\Models\Product::find(1);
$hasSubscription = $product->has_subscription; // returns boolean
```

### getThumbnailAttribute()

Get product thumbnail URL. Returns the featured media URL from the product detail, or a placeholder SVG if no featured media is set.

* Returns `String` - Thumbnail URL or placeholder

```php
$product = FluentCart\App\Models\Product::find(1);
$thumbnail = $product->thumbnail; // returns thumbnail URL
```

### getViewUrlAttribute()

Get product view URL

* Returns `String` - Product permalink

```php
$product = FluentCart\App\Models\Product::find(1);
$viewUrl = $product->view_url; // returns product URL
```

### getEditUrlAttribute()

Get product edit URL in WordPress admin

* Returns `String` - Edit URL

```php
$product = FluentCart\App\Models\Product::find(1);
$editUrl = $product->edit_url; // returns edit URL
```

### getTagsAttribute()

Get product tags via WordPress taxonomy `product-tags`.

* Returns `Array|false` - Product tags (WP_Term objects) or false if none

```php
$product = FluentCart\App\Models\Product::find(1);
$tags = $product->tags; // returns product tags
```

### getCategoriesAttribute()

Get product categories via WordPress taxonomy `product-categories`.

* Returns `Array|false` - Product categories (WP_Term objects) or false if none

```php
$product = FluentCart\App\Models\Product::find(1);
$categories = $product->categories; // returns product categories
```

### getCategories()

Get product categories using `get_the_terms()` with taxonomy `product-categories`.

* Returns `Array|false|WP_Error` - Product categories

```php
$product = FluentCart\App\Models\Product::find(1);
$categories = $product->getCategories();
```

### getTags()

Get product tags using `get_the_terms()` with taxonomy `product-tags`.

* Returns `Array|false|WP_Error` - Product tags

```php
$product = FluentCart\App\Models\Product::find(1);
$tags = $product->getTags();
```

### getMediaUrl($size = 'thumbnail')

Get product media URL using `get_the_post_thumbnail_url()`.

* Parameters: `$size` (String) - Image size (default: `'thumbnail'`)
* Returns `String|false` - Media URL or false

```php
$product = FluentCart\App\Models\Product::find(1);
$mediaUrl = $product->getMediaUrl('large'); // returns media URL
```

### images()

Get all product images including featured image, gallery images, and variant images. Returns a structured array with image type, URL, alt text, and attachment ID.

* Returns `Array` - Array of image arrays with keys: `type`, `url`, `alt`, `product_title`, `attachment_id` (and `variation_title`, `variation_id` for variant images)

```php
$product = FluentCart\App\Models\Product::with('variants')->find(1);
$images = $product->images();

// Each image has the structure:
// ['type' => 'gallery_image|thumbnail|variation_image', 'url' => '...', 'alt' => '...', ...]
```

### isBundleProduct()

Check if the product is a bundle product by looking at the `is_bundle_product` flag in the product detail's `other_info`.

* Returns `Boolean` - True if bundle product

```php
$product = FluentCart\App\Models\Product::with('detail')->find(1);
$isBundle = $product->isBundleProduct(); // returns boolean
```

### soldIndividually()

Check if the product is sold individually (quantity limited to 1) by reading the `sold_individually` flag from the product detail's `other_info`.

* Returns `Boolean` - True if sold individually

```php
$product = FluentCart\App\Models\Product::with('detail')->find(1);
$isSoldIndividually = $product->soldIndividually(); // returns boolean
```

### isStock()

Check if the product is in stock. Handles both regular and bundle products. For bundle products, it also checks stock status of all child variations.

* Returns `Boolean` - True if in stock

```php
$product = FluentCart\App\Models\Product::with(['detail', 'variants'])->find(1);
$inStock = $product->isStock(); // returns boolean
```

### getProductMeta($metaKey, $objectType = null, $default = null)

Get product meta value from the `fct_meta` table via the `ProductMeta` model.

* Parameters:
    * `$metaKey` (String) - Meta key
    * `$objectType` (String|null) - Object type filter (optional)
    * `$default` (Mixed) - Default value if not found (optional)
* Returns `Mixed` - Meta value or default

```php
$product = FluentCart\App\Models\Product::find(1);

// Without object type
$metaValue = $product->getProductMeta('custom_field', null, 'default');

// With object type
$metaValue = $product->getProductMeta('license_settings', 'product_integration');
```

### updateProductMeta($metaKey, $metaValue, $objectType = null)

Update or create product meta value in the `fct_meta` table via the `ProductMeta` model. If the meta key already exists, updates it; otherwise creates a new entry.

* Parameters:
    * `$metaKey` (String) - Meta key
    * `$metaValue` (Mixed) - Meta value
    * `$objectType` (String|null) - Object type (optional)
* Returns `FluentCart\App\Models\ProductMeta` - The created or updated ProductMeta instance

```php
$product = FluentCart\App\Models\Product::find(1);

// Without object type
$meta = $product->updateProductMeta('custom_field', 'new_value');

// With object type
$meta = $product->updateProductMeta('custom_field', 'new_value', 'product_integration');
```

### getTermByType($type)

Get term relationships for the product filtered by a specific taxonomy type. Joins through `term_taxonomy` and `terms` tables.

* Parameters: `$type` (String) - Taxonomy type (e.g., `'product-categories'`, `'product-tags'`)
* Returns `HasMany` - Query builder with term data

```php
$product = FluentCart\App\Models\Product::find(1);
$terms = $product->getTermByType('product-categories');
```

### duplicateProduct($productId, array $options = [])

Static method that duplicates a product including its detail, variants, downloadable files, taxonomies, and post meta. The new product is created as a draft.

* Parameters:
    * `$productId` (Integer) - The ID of the product to duplicate
    * `$options` (Array) - Duplication options:
        * `import_stock_management` (Boolean) - Copy stock management settings (default: `false`)
        * `import_license_settings` (Boolean) - Copy license settings (default: `false`)
        * `import_downloadable_files` (Boolean) - Copy downloadable files (default: `false`)
* Returns `Integer` - The new product ID
* Throws `RuntimeException` - If product not found or duplication fails
* Fires action: `fluent_cart/product_duplicated`

```php
use FluentCart\App\Models\Product;

// Basic duplication
$newProductId = Product::duplicateProduct(123);

// Duplication with options
$newProductId = Product::duplicateProduct(123, [
    'import_stock_management' => true,
    'import_license_settings' => true,
    'import_downloadable_files' => true,
]);
```

## Relations

This model has the following relationships that you can use

### detail

Access the product details.

*   Returns `FluentCart\App\Models\ProductDetail` (HasOne)

```php
$product = FluentCart\App\Models\Product::find(1);
$details = $product->detail;
```

### variants

Access the product variations.

*   Returns `Collection` of `FluentCart\App\Models\ProductVariation` (HasMany)

```php
$product = FluentCart\App\Models\Product::find(1);
$variants = $product->variants;
```

### downloadable_files

Access the product downloads.

*   Returns `Collection` of `FluentCart\App\Models\ProductDownload` (HasMany)

```php
$product = FluentCart\App\Models\Product::find(1);
$downloads = $product->downloadable_files;
```

### postmeta

Access the product gallery image post meta. Filtered to only return the `fluent-products-gallery-image` meta key.

*   Returns `FluentCart\App\Models\WpModels\PostMeta` (HasOne)

```php
$product = FluentCart\App\Models\Product::find(1);
$postmeta = $product->postmeta;
```

### wp_terms

Access the WordPress term relationships for this product.

*   Returns `Collection` of `FluentCart\App\Models\WpModels\TermRelationship` (HasMany)

```php
$product = FluentCart\App\Models\Product::find(1);
$terms = $product->wp_terms;
```

### orderItems

Access the order items for this product.

*   Returns `Collection` of `FluentCart\App\Models\OrderItem` (HasMany)

```php
$product = FluentCart\App\Models\Product::find(1);
$orderItems = $product->orderItems;
```

### wpTerms()

Access the WordPress term taxonomies through the term relationships table (hasManyThrough).

*   Returns `Collection` of `FluentCart\App\Models\WpModels\TermTaxonomy` (HasManyThrough)

```php
$product = FluentCart\App\Models\Product::find(1);
$terms = $product->wpTerms;
```

### categories()

Get product categories relationship. Uses `getTermByType('product-categories')` internally.

*   Returns `HasMany` with joined term data

```php
$product = FluentCart\App\Models\Product::find(1);
$categories = $product->categories;
```

### tags()

Get product tags relationship. Uses `getTermByType('product-tags')` internally.

*   Returns `HasMany` with joined term data

```php
$product = FluentCart\App\Models\Product::find(1);
$tags = $product->tags;
```

### thumbUrl

Access the product thumbnail URL via post meta. Joins through `_thumbnail_id` meta key to get the `_wp_attached_file` value.

*   Returns `FluentCart\App\Models\WpModels\PostMeta` with additional `image` attribute (HasOne)

```php
$product = FluentCart\App\Models\Product::find(1);
$thumbUrl = $product->thumbUrl;
$imageFile = $thumbUrl->image; // relative file path
```

### licensesMeta

Access the license settings meta for this product. Filtered to `meta_key = 'license_settings'`.

*   Returns `FluentCart\App\Models\ProductMeta` (HasOne)

```php
$product = FluentCart\App\Models\Product::find(1);
$licenseMeta = $product->licensesMeta;
```

### integrations

Access the product integration meta entries. Filtered to `object_type = 'product_integration'`.

*   Returns `Collection` of `FluentCart\App\Models\ProductMeta` (HasMany)

```php
$product = FluentCart\App\Models\Product::find(1);
$integrations = $product->integrations;
```

## Scopes

This model has the following scopes that you can use

### published()

Get only published products

```php
$products = FluentCart\App\Models\Product::published()->get();
```

### statusOf($status)

Get products by specific status

```php
$products = FluentCart\App\Models\Product::statusOf('publish')->get();
```

### adminAll()

Get all products for admin view (includes all admin-visible statuses)

```php
$products = FluentCart\App\Models\Product::adminAll()->get();
```

### cartable()

Get cartable products (excludes products with license meta and filters to non-subscription variants with media loaded)

```php
$products = FluentCart\App\Models\Product::cartable()->get();
```

### applyCustomSortBy($sortKey, $sortType = 'DESC')

Apply custom sorting. Valid sort keys: `id`, `date`, `title`, `price`. When sorting by `price`, joins the `fct_product_details` table and sorts by `min_price`.

* Parameters: `$sortKey` (String) - Sort key (`id`|`date`|`title`|`price`), `$sortType` (String) - Sort direction (`ASC`|`DESC`)

```php
$products = FluentCart\App\Models\Product::applyCustomSortBy('title', 'ASC')->get();
$products = FluentCart\App\Models\Product::applyCustomSortBy('price', 'DESC')->get();
```

### byVariantTypes($type)

Filter by variant types. Valid types: `physical`, `digital`, `subscription`, `onetime`, `simple`, `variations`.

* Parameters: `$type` (String) - Variant type

```php
$products = FluentCart\App\Models\Product::byVariantTypes('physical')->get();
$products = FluentCart\App\Models\Product::byVariantTypes('subscription')->get();
$products = FluentCart\App\Models\Product::byVariantTypes('simple')->get();
```

### filterByTaxonomy($taxonomies)

Filter by taxonomies. Accepts an associative array where keys are taxonomy names and values are arrays of term IDs.

* Parameters: `$taxonomies` (Array) - Taxonomy filters

```php
$products = FluentCart\App\Models\Product::filterByTaxonomy([
    'product-categories' => [1, 2, 3],
    'product-brands' => [4, 5, 6],
])->get();
```

### bundle()

Get only bundle products (products where `other_info->is_bundle_product` is `'yes'` in the product detail).

```php
$products = FluentCart\App\Models\Product::bundle()->get();
```

### nonBundle()

Get only non-bundle products (products where `other_info->is_bundle_product` is not `'yes'` or is null in the product detail).

```php
$products = FluentCart\App\Models\Product::nonBundle()->get();
```

## Global Scope

The Product model applies a global scope that automatically filters queries to only include posts with `post_type = 'fluent-products'` and excludes `auto-draft` status. This scope is applied on all queries. Additionally, when creating a new Product, the `post_type` is automatically set to `fluent-products`.

## Usage Examples

### Creating a Product

```php
use FluentCart\App\Models\Product;

$product = Product::create([
    'post_title' => 'Sample Product',
    'post_content' => 'Product description',
    'post_status' => 'publish',
]);
// post_type is automatically set to 'fluent-products' via the creating event
```

### Retrieving Products

```php
// Get all published products
$products = Product::published()->get();

// Get product by ID
$product = Product::find(1);

// Get products with variations
$products = Product::with('variants')->get();

// Get products with detail and variants
$products = Product::with(['detail', 'variants'])->get();
```

### Updating a Product

```php
$product = Product::find(1);
$product->post_title = 'Updated Product Title';
$product->save();
```

### Deleting a Product

```php
$product = Product::find(1);
$product->delete();
```

---
