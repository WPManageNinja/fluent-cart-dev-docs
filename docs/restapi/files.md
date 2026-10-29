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

### Stored file names

The name a file is stored under is not the name you send. The upload handler builds it from the `name` field plus the uploaded file's own extension, and the local driver then appends a marker and a Unix timestamp plus the extension again:

```
<name>.<ext>__fluent-cart__.<timestamp>.<ext>
```

Uploading `ebook.pdf` with `name=my-ebook` stores `my-ebook.pdf__fluent-cart__.1793187676.pdf`. The extension appears twice, and the stored name is what every other endpoint on this page expects as `file_path`. For display, split on `__fluent-cart__` and keep the first part.

---

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
| `per_page` | integer | query | No | Maximum number of files to return (default: `10`). Read by the local driver only — S3 and R2 return every matching object regardless. |

`per_page` is a cap on the whole result, not a page size — the endpoint returns the first `per_page` names and takes no page or offset parameter, so reach further into a large directory with `search` rather than by paging. Files are returned in `scandir` order (alphabetical). Dotfiles and anything ending in `.php` are never listed.

#### Response

```json
{
  "files": [
    {
      "name": "ebook.pdf__fluent-cart__.1710345600.pdf",
      "size": 2048576,
      "driver": "local",
      "bucket": ""
    },
    {
      "name": "software-v2.zip__fluent-cart__.1710345700.zip",
      "size": 10485760,
      "driver": "local",
      "bucket": ""
    }
  ]
}
```

#### Unknown driver

A `driver` that is not one of the store's active storage drivers is refused with `422`, and the response names the drivers that are available. `GET /files` and `GET /files/bucket-list` both check this; upload and delete do not.

```json
{
  "message": "Invalid driver. Available drivers: local",
  "available_drivers": ["local"]
}
```

When no storage driver is enabled at all, the message is `No storage drivers are enabled. Please enable a storage driver from the storage settings.` and `available_drivers` is empty.

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

Uploads to the local driver pass two gates. WordPress must first resolve the file to a known extension and MIME type; then that extension is checked against the blocked list: `php`, `phtml`, `html`, `htm`, `svg`, `exe`, `sh`, `bat`, `cmd`, `dll`.

The list can be customized via the `fluent_cart/local_file_blocked_extensions` filter, which also receives the resolved file data as its second argument.

#### Response

```json
{
  "message": "File Uploaded Successfully",
  "path": "my-ebook.pdf__fluent-cart__.1710345600.pdf",
  "file": {
    "driver": "local",
    "size": 2048576,
    "name": "my-ebook.pdf__fluent-cart__.1710345600.pdf",
    "bucket": ""
  }
}
```

#### Error Responses

**Missing `name` (422)** — validation errors are keyed by field, not by `message`:

```json
{
  "name": {
    "required": "The name field is required."
  }
}
```

**No file part in the request (422):**

```json
{
  "message": "Failed To Upload File",
  "additional": "File is empty"
}
```

**Rejected file type (500)** — the local driver returns a `WP_Error`, which surfaces as a server error rather than a validation error. Two distinct codes:

```json
{
  "code": "invalid_file_type",
  "message": "Invalid or unsupported file type.",
  "data": null
}
```

`invalid_file_type` means `wp_check_filetype_and_ext()` could not agree on an extension and MIME type for the upload — the usual cause is an extension WordPress does not allow. `forbidden_type` (`This file type is not allowed.`) means the extension resolved fine but is on the blocked list below.

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

The local driver has no buckets, so the default call returns `{"default_bucket": "", "buckets": []}`. `default_bucket` is the first entry of `buckets`, not a separately configured default.

- **Policy:** `StoreSensitivePolicy`
- **Permission:** `store/sensitive`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `driver` | string | query | No | Storage driver to query (default: `local`) |

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
  "path": "my-ebook.pdf__fluent-cart__.1710345600.pdf"
}
```

#### Error Responses

Every failure here is a `422`.

**Missing parameters** — keyed by field:
```json
{
  "file_path": {
    "required": "The file_path field is required."
  },
  "driver": {
    "required": "The driver field is required."
  }
}
```

**Relative path segments** — a `file_path` containing `..` is refused for every driver before the driver is called:
```json
{
  "message": "Invalid file path"
}
```

**File not found:**
```json
{
  "message": "File not found"
}
```

A local path that resolves outside the storage directory reports as not found rather than as rejected, so the response cannot be used to probe for files elsewhere on disk.

**Permission denied (local driver):**
```json
{
  "message": "You are not allowed to delete file"
}
```

#### Example

```bash
curl -X DELETE "https://example.com/wp-json/fluent-cart/v2/files/delete?file_path=my-ebook.pdf__fluent-cart__.1710345600.pdf&driver=local" \
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

Both are `422`.

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
