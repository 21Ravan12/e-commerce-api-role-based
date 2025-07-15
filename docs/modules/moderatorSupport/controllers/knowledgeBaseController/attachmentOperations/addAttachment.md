# addAttachment.md

This method handles **adding file attachments to an article** and logs the operation for auditing purposes. It supports uploading multiple files, validates inputs, and responds with detailed success or error information.

---

## Function: `addAttachment(req, res)`

### Purpose
- To upload one or more attachments to a specific article identified by `req.params.id`.
- To validate inputs and user permissions.
- To log the action for audit tracking.
- To return a structured JSON response about the upload status.

---

### Step-by-Step Explanation

1. **Logging the Request**
   - Logs the incoming attachment request with the article ID and client IP using a custom `logger`.

2. **Validate Article ID**
   - Uses `mongoose.Types.ObjectId.isValid` to ensure the provided article ID in the URL is valid.
   - Throws an error if the ID format is invalid, preventing further processing.

3. **File Validation and Extraction**
   - Retrieves uploaded files from `req.files` (supporting multiple files).
   - Each file is individually checked for validity (`file` object existence).

4. **Attachment Data Construction**
   - For each file, creates an `attachmentData` object including:
     - `originalname` (supports different file property names)
     - `mimetype`
     - `size`
     - `path` (handles different file storage paths)
     - `description` (from `req.body`)

5. **Attachment Addition Logic**
   - Calls an async helper function `addAttachment(articleId, attachmentData, user)` to save the attachment linked to the article.
   - Awaits all attachment upload promises with `Promise.all` for concurrency.

6. **Audit Logging**
   - For each successful attachment, creates an audit log entry with:
     - Action type (`knowledge_base_add_attachment`)
     - Event type (`add_attachment`)
     - User role and ID who performed the action
     - Target model (`Article`) and target ID
     - Client IP and User-Agent
     - Details about the attachment (filename, size, type, attachment ID)

7. **Error Handling on Uploads**
   - Checks if any attachment upload failed.
   - Aggregates error messages and throws a combined error if any failure occurred.

8. **Success Response**
   - Responds with HTTP status `201 Created`.
   - Returns JSON containing:
     - `success: true`
     - Count of attachments added
     - Array of attachments with IDs, URLs, descriptions, sizes, and MIME types
     - The associated article ID
     - Current timestamp (ISO format)

9. **Error Catching**
   - Logs detailed error info including article ID, user ID, and stack trace.
   - Uses a helper `handleError(res, error)` method to send appropriate error responses.

---

### Summary
This function robustly manages file uploads as attachments to articles with input validation, concurrency, detailed audit logging, and clear success/failure reporting. It is designed for reliability and traceability in content management workflows.

## 📥 Request Body Example (JSON)

This endpoint accepts **multipart/form-data** to upload one or more attachments to a specific article.

### Example Form Data Fields:

- **files** (file[]) — One or multiple files to upload.  
- **description** (string, optional) — A text description to associate with each uploaded attachment.

---

### Sample cURL for uploading multiple files:

```bash
curl --request POST "https://api.example.com/articles/{id}/attachments" \
  --header "Authorization: Bearer <token>" \
  --form "files=@/path/to/file1.pdf" \
  --form "files=@/path/to/image2.jpg" \
  --form "description=Supporting documents for article"
