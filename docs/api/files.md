---
title: Files API
description: FluentCart Files API documentation with complete endpoint reference and usage examples.
---

# Files API

The Files API provides comprehensive endpoints for managing file uploads, downloads, and storage in FluentCart. This includes uploading files, managing file buckets, and handling downloadable products.

## Base URL

```
https://yoursite.com/wp-json/fluent-cart/v2/files
```

## Authentication

All endpoints require authentication and appropriate permissions:

- **Authentication**: WordPress Application Password or Cookie
- **Policy**: `StoreSensitivePolicy`
- **Permissions**: File management permissions

## Endpoints

### List Files

**GET** `/files`

Retrieve a paginated list of uploaded files.

**Policy**: `StoreSensitivePolicy`

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `driver` | string | Storage driver to filter by | local |
| `page` | integer | Page number | 1 |
| `per_page` | integer | Items per page (max 100) | 10 |
| `search` | string | Search query | - |
| `filters` | object | Filter options | - |
| `order_by` | string | Sort field | id |
| `order_type` | string | Sort direction (ASC/DESC) | DESC |

#### Filter Options

```json
{
  "file_type": "image",
  "storage_driver": "local",
  "date_from": "2024-01-01",
  "date_to": "2024-12-31"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": 1,
        "name": "product-image.jpg",
        "original_name": "product-image.jpg",
        "file_path": "/uploads/2024/01/product-image.jpg",
        "file_url": "https://yoursite.com/wp-content/uploads/2024/01/product-image.jpg",
        "file_size": 1024000,
        "file_type": "image/jpeg",
        "storage_driver": "local",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/files?page=1&per_page=20&search=product" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Upload File

**POST** `/files/upload`

Upload a new file to the storage system.

**Policy**: `StoreSensitivePolicy`

#### Request Body

**Multipart Form Data**:
- `file` - The file to upload (required)
- `name` - Custom file name (required, max 160 characters)
- `driver` - Storage driver to use (optional, default: local)
- `bucket` - Bucket/folder name (optional)

#### Response

```json
{
  "success": true,
  "data": {
    "file": {
      "id": 1,
      "name": "uploaded-file.jpg",
      "original_name": "product-image.jpg",
      "file_path": "/uploads/2024/01/uploaded-file.jpg",
      "file_url": "https://yoursite.com/wp-content/uploads/2024/01/uploaded-file.jpg",
      "file_size": 1024000,
      "file_type": "image/jpeg",
      "storage_driver": "local",
      "created_at": "2024-01-01T10:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/files/upload" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -F "file=@/path/to/file.jpg" \
  -F "name=product-image" \
  -F "driver=local" \
  -F "bucket=products"
```

#### JavaScript Example

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'product-image');
formData.append('driver', 'local');
formData.append('bucket', 'products');

const response = await fetch('https://yoursite.com/wp-json/fluent-cart/v2/files/upload', {
    method: 'POST',
    headers: {
        'Authorization': 'Basic ' + btoa('username:application_password')
    },
    body: formData
});

const result = await response.json();
```

### Get File Bucket List

**GET** `/files/bucket-list`

Get list of available file buckets/storage locations.

**Policy**: `StoreSensitivePolicy`

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `driver` | string | Storage driver to get buckets for | - |

#### Response

```json
{
  "default_bucket": "local",
  "buckets": [
    {
      "label": "local",
      "value": "local"
    },
    {
      "label": "s3-bucket",
      "value": "s3-bucket"
    }
  ]
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/files/bucket-list" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Delete File

**DELETE** `/files/delete`

Delete a file from storage.

**Policy**: `StoreSensitivePolicy`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file_path` | string | Yes | Path to the file to delete |
| `driver` | string | Yes | Storage driver name |
| `bucket` | string | No | Bucket/folder name (for cloud storage) |

#### Request Body Example

```json
{
  "file_path": "/uploads/2024/01/product-image.jpg",
  "driver": "local",
  "bucket": "products"
}
```

#### Response

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/files/delete" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/uploads/2024/01/product-image.jpg",
    "driver": "local"
  }'
```

### Upload Editor File

**POST** `/upload-editor-file`

Upload a file for use in rich text editors. Currently supports image files only.

**Policy**: `AdminPolicy`

#### Request Body

**Multipart Form Data**:
- `file` - The image file to upload (required)

#### Response

```json
{
  "success": true,
  "data": {
    "file": {
      "id": 1,
      "name": "editor-file.jpg",
      "file_url": "https://yoursite.com/wp-content/uploads/2024/01/editor-file.jpg",
      "file_size": 512000,
      "file_type": "image/jpeg"
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/upload-editor-file" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -F "file=@/path/to/editor-file.jpg"
```

## Product Downloadable Files

### Sync Downloadable Files

**POST** `/products/{postId}/sync-downloadable-files`

Sync downloadable files for a product.

**Permission Required**: `products/edit`

**Note**: This endpoint is part of the Products API. See [Products API](./products) for more details.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId` | integer | Product ID (route parameter) |

#### Request Body

```json
{
  "files": [
    {
      "file_id": 1,
      "file_name": "product-manual.pdf",
      "file_url": "https://yoursite.com/wp-content/uploads/2024/01/product-manual.pdf",
      "file_size": 2048000,
      "download_limit": 5,
      "expiry_days": 30
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
      "downloadable_files": [
        {
          "id": 1,
          "file_name": "product-manual.pdf",
          "file_url": "https://yoursite.com/wp-content/uploads/2024/01/product-manual.pdf",
          "file_size": 2048000,
          "download_limit": 5,
          "expiry_days": 30
        }
      ]
    }
  }
}
```

#### Example Request

```bash
curl -X POST "https://yoursite.com/wp-json/fluent-cart/v2/products/1/sync-downloadable-files" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {
        "file_id": 1,
        "file_name": "product-manual.pdf",
        "file_url": "https://yoursite.com/wp-content/uploads/2024/01/product-manual.pdf",
        "download_limit": 5,
        "expiry_days": 30
      }
    ]
  }'
```

### Update Downloadable File

**PUT** `/products/{downloadableId}/update`

Update a downloadable file.

**Permission Required**: `products/edit`

**Note**: This endpoint is part of the Products API. See [Products API](./products) for more details.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `downloadableId` | integer | Downloadable file ID (route parameter) |

#### Request Body

```json
{
  "file_name": "updated-manual.pdf",
  "download_limit": 10,
  "expiry_days": 60
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "downloadable_file": {
      "id": 1,
      "file_name": "updated-manual.pdf",
      "download_limit": 10,
      "expiry_days": 60,
      "updated_at": "2024-01-01T11:00:00Z"
    }
  }
}
```

#### Example Request

```bash
curl -X PUT "https://yoursite.com/wp-json/fluent-cart/v2/products/1/update" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "updated-manual.pdf",
    "download_limit": 10,
    "expiry_days": 60
  }'
```

### Delete Downloadable File

**DELETE** `/products/{downloadableId}/delete`

Delete a downloadable file.

**Permission Required**: `products/delete`

**Note**: This endpoint is part of the Products API. See [Products API](./products) for more details.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `downloadableId` | integer | Downloadable file ID (route parameter) |

#### Response

```json
{
  "success": true,
  "message": "Downloadable file deleted successfully"
}
```

#### Example Request

```bash
curl -X DELETE "https://yoursite.com/wp-json/fluent-cart/v2/products/1/delete" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

### Get Downloadable URL

**GET** `/products/getDownloadableUrl/{downloadableId}`

Get a secure download URL for a downloadable file.

**Permission Required**: `products/view`

**Note**: This endpoint is part of the Products API. See [Products API](./products) for more details.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `downloadableId` | integer | Downloadable file ID (route parameter) |

#### Response

```json
{
  "success": true,
  "data": {
    "download_url": "https://yoursite.com/wp-json/fluent-cart/v2/download/secure-token-123",
    "expires_at": "2024-01-01T12:00:00Z",
    "download_limit": 5,
    "remaining_downloads": 3
  }
}
```

#### Example Request

```bash
curl -X GET "https://yoursite.com/wp-json/fluent-cart/v2/products/getDownloadableUrl/1" \
  -H "Authorization: Basic dXNlcm5hbWU6YXBwbGljYXRpb25fcGFzc3dvcmQ="
```

## Storage Drivers

### Supported Storage Drivers

#### 1. Local Storage

```json
{
  "driver": "local",
  "path": "/wp-content/uploads/",
  "url": "https://yoursite.com/wp-content/uploads/"
}
```

#### 2. Amazon S3

```json
{
  "driver": "s3",
  "bucket": "my-fluentcart-files",
  "region": "us-east-1",
  "access_key": "AKIAIOSFODNN7EXAMPLE",
  "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
}
```

#### 3. Google Cloud Storage

```json
{
  "driver": "gcs",
  "bucket": "my-fluentcart-files",
  "project_id": "my-project",
  "key_file": "/path/to/service-account.json"
}
```

## File Types and Validation

### Supported File Types

#### Images
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

#### Documents
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `text/plain`

#### Archives
- `application/zip`
- `application/x-rar-compressed`
- `application/x-7z-compressed`

#### Audio/Video
- `audio/mpeg`
- `audio/wav`
- `video/mp4`
- `video/avi`

### File Size Limits

```json
{
  "max_file_size": 10485760,
  "max_image_size": 5242880,
  "max_document_size": 10485760,
  "max_archive_size": 52428800
}
```


