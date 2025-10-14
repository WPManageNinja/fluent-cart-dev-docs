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

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
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

#### Request Body

**Multipart Form Data**:
- `file` - The file to upload
- `storage_driver` - Storage driver to use (optional)
- `folder` - Folder path (optional)
- `public` - Whether file should be public (optional)

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
  -F "storage_driver=local" \
  -F "folder=products"
```

#### JavaScript Example

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('storage_driver', 'local');
formData.append('folder', 'products');

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

#### Response

```json
{
  "success": true,
  "data": {
    "buckets": [
      {
        "name": "local",
        "type": "local",
        "path": "/wp-content/uploads/",
        "url": "https://yoursite.com/wp-content/uploads/",
        "available_space": 1073741824,
        "used_space": 536870912
      },
      {
        "name": "s3-bucket",
        "type": "s3",
        "region": "us-east-1",
        "bucket": "my-fluentcart-files",
        "url": "https://s3.amazonaws.com/my-fluentcart-files/",
        "available_space": 1073741824000,
        "used_space": 107374182400
      }
    ]
  }
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

#### Request Body

```json
{
  "file_id": 1,
  "file_path": "/uploads/2024/01/product-image.jpg"
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
    "file_id": 1,
    "file_path": "/uploads/2024/01/product-image.jpg"
  }'
```

### Upload Editor File

**POST** `/upload-editor-file`

Upload a file for use in rich text editors.

#### Request Body

**Multipart Form Data**:
- `file` - The file to upload
- `editor_type` - Type of editor (optional)

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
  -F "file=@/path/to/editor-file.jpg" \
  -F "editor_type=tinymce"
```

## Product Downloadable Files

### Sync Downloadable Files

**POST** `/products/{postId}/sync-downloadable-files`

Sync downloadable files for a product.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId` | integer | Product ID |

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

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `downloadableId` | integer | Downloadable file ID |

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

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `downloadableId` | integer | Downloadable file ID |

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

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `downloadableId` | integer | Downloadable file ID |

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

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| `file_not_found` | File with specified ID not found |
| `file_upload_failed` | File upload failed |
| `file_too_large` | File exceeds size limit |
| `invalid_file_type` | File type not allowed |
| `storage_driver_error` | Storage driver error occurred |
| `insufficient_permissions` | User lacks required permissions |
| `validation_error` | Request data validation failed |
| `download_limit_exceeded` | Download limit exceeded |
| `download_expired` | Download link has expired |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "file_too_large",
    "message": "File size exceeds maximum allowed size of 10MB"
  }
}
```

## Rate Limiting

- **List operations**: 100 requests per hour
- **Upload operations**: 50 requests per hour
- **Delete operations**: 20 requests per hour
- **Download operations**: 1000 requests per hour

## Security Considerations

### File Upload Security

1. **File Type Validation**: Only allow specific file types
2. **File Size Limits**: Enforce maximum file sizes
3. **Virus Scanning**: Scan uploaded files for malware
4. **Secure Storage**: Use secure storage drivers
5. **Access Control**: Implement proper access controls

### Download Security

1. **Secure URLs**: Generate time-limited download URLs
2. **Access Control**: Verify user permissions
3. **Download Limits**: Enforce download limits
4. **Expiry Dates**: Set download expiry dates
5. **Audit Logging**: Log all download activities

## Related Documentation

- [Products API](./products) - Product management endpoints
- [Orders API](./orders) - Order management endpoints
- [Storage Drivers](/modules/storage) - Storage driver configuration
- [Database Models](/database/models) - File data models
- [Developer Hooks](/hooks/) - File-related hooks

## Next Steps

Continue with file management:

1. **[Products API](./products)** - Manage product files
2. **[Orders API](./orders)** - Handle order downloads
3. **[Storage Drivers](/modules/storage)** - Configure storage systems
4. **[Database Models](/database/models)** - Understand file data structure

## Previous/Next Navigation

- **Previous**: [Coupons API](./coupons) - Coupon management endpoints
- **Next**: [Products API](./products) - Product management endpoints

---

