# uploadProductMedia.md

This function `uploadProductMedia` handles uploading media files for a specific product via an API request. It integrates logging, authorization, error handling, and audit trail creation to ensure a secure and traceable media upload process.

---

## Function Breakdown

### 1. Logging the Upload Request
- Logs an informational message when a media upload request is received.
- Includes the product ID (`req.params.id`) and the client IP address (`req.ip`).

### 2. Media Upload Operation
- Calls `Product.uploadProductMedia` with:
  - `req.params.id`: The target product's unique identifier.
  - `req.files`: The uploaded media files (expected from middleware like `multer`).
  - `req.user`: The authenticated user performing the upload.
- This method handles the actual media processing, storage, and association with the product.

### 3. Audit Logging
- After a successful upload, creates a detailed audit log entry with `AuditLog.createLog`:
  - `event`: Describes the event type (`product_media_uploaded`).
  - `action`: The performed action (`update`).
  - `user`, `userId`: ID of the user who performed the upload.
  - `ip`, `userIp`: IP address of the user.
  - `userAgent`: Client user-agent string.
  - `source`: Marks this as originating from the API.
  - `entity`, `entityId`: Specifies the product entity and its ID.
  - `metadata`: Includes extra info such as the number of media files uploaded and their types (e.g., image, video).

### 4. Response to Client
- On success, responds with HTTP status `201 Created`.
- Returns JSON containing the array of newly uploaded media objects.

### 5. Error Handling
- Catches any error during the process.
- Logs the error message and stack trace with `logger.error`.
- Determines HTTP status code based on the error message:
  - `403 Forbidden` if "Not authorized".
  - `400 Bad Request` if "No files" (i.e., no files uploaded).
  - `404 Not Found` if product or resource not found.
  - `500 Internal Server Error` for other issues.
- Sends JSON response containing the error message.

---

## Summary

`uploadProductMedia` is a robust Express route handler that:
- Validates and processes product media uploads.
- Ensures only authorized users can upload.
- Maintains a comprehensive audit trail.
- Provides clear client feedback on success or failure.

## 📥 Request Body Example (JSON)

> ⚠️ This endpoint requires a **multipart/form-data** request, not raw JSON. Below is an illustrative structure of what the request includes conceptually:

### Fields:
- `files[]`: One or more media files (images/videos) to be uploaded.
- No additional JSON fields are required in the body.

### Example using Postman (form-data tab):
| Key       | Type     | Value                    | Description                    |
|-----------|----------|--------------------------|--------------------------------|
| files     | File     | (Select media file)      | Upload one or more files       |
|           | File     | (Optional additional)    | Add more by duplicating `files` field |

### Headers:
- `Authorization: Bearer <your_token>`
- `Content-Type: multipart/form-data` (automatically set by Postman)

### Example Usage Notes:
- Ensure `files` field is added as **file** type in Postman.
- The `id` parameter should be provided in the URL (e.g., `/products/:id/media/upload`).
- Supported file types and size limits depend on backend validation.
