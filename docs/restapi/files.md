---
title: Files API
description: FluentCart REST API endpoints for managing downloadable files and file storage.
---

# Files API

Upload, manage, and delete downloadable files. Supports multiple storage drivers including local and cloud storage.

**Base URL:** `https://your-site.com/wp-json/fluent-cart/v2`

**Policy:** `StoreSensitivePolicy` (file management), `AdminPolicy` (editor file upload)

---

## File Management

### List Files

<badge type="tip">GET</badge> `/fluent-cart/v2/files`

Retrieve a list of files from the specified storage driver. Returns file metadata including name, size, driver, and bucket information.

- **Policy:** `StoreSensitivePolicy`
- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `driver` | string | query | No | Storage driver to use (default: `local`). Supported values depend on configured storage drivers (e.g., `local`, `s3`). |
| `search` | string | query | No | Filter files by name (case-insensitive substring match) |
| `per_page` | integer | query | No | Maximum number of files to return (default: `10`) |

#### Response

```json
{
  "files": [
    {
      "name": "ebook__fluent-cart__.1710345600.pdf",
      "size": 2048576,
      "driver": "local",
      "bucket": ""
    },
    {
      "name": "software-v2__fluent-cart__.1710345700.zip",
      "size": 10485760,
      "driver": "local",
      "bucket": ""
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/files?driver=local&search=ebook&per_page=20" \
  -u "username:app_password"
```

---

### Upload File

<badge type="warning">POST</badge> `/fluent-cart/v2/files/upload`

Upload a downloadable file to the specified storage driver. The file is stored with a unique name appended with a timestamp to prevent collisions.

- **Policy:** `StoreSensitivePolicy`
- **Permission:** `store/sensitive`
- **Content-Type:** `multipart/form-data`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `file` | file | body | Yes | The file to upload |
| `name` | string | body | Yes | Display name for the file (max 160 characters). The file extension is appended automatically from the uploaded file. |
| `driver` | string | body | No | Storage driver to use (default: `local`) |

#### Blocked File Extensions

The following file types are blocked by default for the local driver: `php`, `phtml`, `html`, `htm`, `svg`, `exe`, `sh`, `bat`, `cmd`, `dll`.

This list can be customized via the `fluent_cart/local_file_blocked_extensions` filter.

#### Response

```json
{
  "message": "File Uploaded Successfully",
  "path": "my-ebook__fluent-cart__.1710345600.pdf",
  "file": {
    "driver": "local",
    "size": 2048576,
    "name": "my-ebook__fluent-cart__.1710345600.pdf",
    "bucket": ""
  }
}
```

#### Error Response

```json
{
  "message": "Failed To Upload File",
  "additional": "File is empty"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/files/upload" \
  -u "username:app_password" \
  -F "file=@/path/to/ebook.pdf" \
  -F "name=my-ebook" \
  -F "driver=local"
```

---

### Get Bucket List

<badge type="tip">GET</badge> `/fluent-cart/v2/files/bucket-list`

Retrieve the list of available storage buckets for a given driver. Useful for cloud storage drivers (e.g., S3) that organize files into buckets.

- **Policy:** `StoreSensitivePolicy`
- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `driver` | string | query | No | Storage driver to query (default: `""`, uses the first active driver) |

#### Response

```json
{
  "default_bucket": "my-store-files",
  "buckets": [
    {
      "label": "my-store-files",
      "value": "my-store-files"
    },
    {
      "label": "my-store-backups",
      "value": "my-store-backups"
    }
  ]
}
```

#### Example

```bash
curl -X GET "https://example.com/wp-json/fluent-cart/v2/files/bucket-list?driver=s3" \
  -u "username:app_password"
```

---

### Delete File

<badge type="danger">DELETE</badge> `/fluent-cart/v2/files/delete`

Delete a file from the specified storage driver. For the local driver, this requires the `manage_options` WordPress capability.

- **Policy:** `StoreSensitivePolicy`
- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `file_path` | string | query | Yes | The path of the file to delete (relative to the storage directory) |
| `driver` | string | query | Yes | Storage driver where the file is stored (e.g., `local`, `s3`) |
| `bucket` | string | query | No | The bucket name (required for cloud storage drivers) |

#### Response

```json
{
  "message": "File Deleted Successfully",
  "driver": "local",
  "path": "my-ebook__fluent-cart__.1710345600.pdf"
}
```

#### Error Responses

**File not found:**
```json
{
  "message": "File not found"
}
```

**Permission denied (local driver):**
```json
{
  "message": "You are not allowed to delete file"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/files/delete?file_path=my-ebook__fluent-cart__.1710345600.pdf&driver=local" \
  -u "username:app_password"
```

---

## Editor File Upload

### Upload Editor File

<badge type="warning">POST</badge> `/fluent-cart/v2/upload-editor-file`

Upload an image file for use in the content editor (e.g., product descriptions). The image is uploaded to the WordPress Media Library via `media_handle_upload`. Only image files are accepted.

- **Policy:** `AdminPolicy`
- **Permission:** `is_super_admin`
- **Content-Type:** `multipart/form-data`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `file` | file | body | Yes | The image file to upload. Must be a valid image MIME type (e.g., `image/jpeg`, `image/png`, `image/gif`, `image/webp`). |

#### Response

Returns the WordPress attachment data prepared for JavaScript consumption (via `wp_prepare_attachment_for_js`):

```json
{
  "id": 456,
  "title": "product-banner",
  "filename": "product-banner.jpg",
  "url": "https://example.com/wp-content/uploads/2025/01/product-banner.jpg",
  "link": "https://example.com/?attachment_id=456",
  "alt": "",
  "author": "1",
  "description": "",
  "caption": "",
  "name": "product-banner",
  "status": "inherit",
  "uploadedTo": 0,
  "date": "2025-01-15T12:00:00.000Z",
  "modified": "2025-01-15T12:00:00.000Z",
  "menuOrder": 0,
  "mime": "image/jpeg",
  "type": "image",
  "subtype": "jpeg",
  "icon": "https://example.com/wp-includes/images/media/default.png",
  "dateFormatted": "January 15, 2025",
  "nonces": { ... },
  "editLink": "https://example.com/wp-admin/post.php?post=456&action=edit",
  "meta": false,
  "authorName": "admin",
  "authorLink": "https://example.com/wp-admin/profile.php",
  "filesizeInBytes": 204800,
  "filesizeHumanReadable": "200 KB",
  "sizes": {
    "thumbnail": {
      "url": "https://example.com/wp-content/uploads/2025/01/product-banner-150x150.jpg",
      "height": 150,
      "width": 150
    },
    "medium": {
      "url": "https://example.com/wp-content/uploads/2025/01/product-banner-300x200.jpg",
      "height": 200,
      "width": 300
    },
    "full": {
      "url": "https://example.com/wp-content/uploads/2025/01/product-banner.jpg",
      "height": 800,
      "width": 1200
    }
  },
  "height": 800,
  "width": 1200
}
```

#### Error Responses

**Non-image file:**
```json
{
  "message": "Error Uploading File"
}
```

**No file attached:**
```json
{
  "message": "No File Attached"
}
```

#### Example

```bash
curl -X POST "https://example.com/wp-json/fluent-cart/v2/upload-editor-file" \
  -u "username:app_password" \
  -F "file=@/path/to/product-banner.jpg"
```
