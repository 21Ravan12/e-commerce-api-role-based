# addAttachment.md

This method handles the uploading of **file attachments** to a knowledge base article. It validates input, processes multiple files asynchronously, logs user activity for audit purposes, and returns structured feedback to the client.

---

## 📥 Method: `addAttachment(req, res)`

This is an **asynchronous controller method** designed to:
- Validate article ID
- Accept multiple uploaded files
- Attach them to an article
- Log each upload
- Return detailed feedback

---

### 🧪 Step-by-Step Breakdown

#### 1. **Logging the request**
```js
logger.info(`Add attachment request for article ID: ${req.params.id} from IP: ${req.ip}`);
````

Logs basic metadata for observability and traceability.

#### 2. **Validate Article ID**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid article ID');
}
```

Ensures the `id` in the request path is a valid MongoDB ObjectId.

#### 3. **Validate and Extract Files**

```js
const files = req.files;
```

Assumes middleware (like `multer` or `express-fileupload`) has parsed incoming files into `req.files`.

#### 4. **Process Each File**

```js
const results = await Promise.all(files.map(async (file) => {
  ...
}));
```

Handles each file using `Promise.all` for parallel processing.

##### File-specific actions:

* Extract metadata like `originalname`, `mimetype`, `size`, and `path`.
* Create an attachment via `addAttachment(articleId, userId, attachmentData)`.
* Log the operation using `AuditLog.createLog()` with detailed file and user metadata.

#### 5. **Audit Logging**

Each upload is logged with:

* `action`: e.g., `knowledge_base_add_attachment`
* `source`: user's role
* `targetModel`: `Article`
* `targetId`: article ID
* `performedBy`: current user ID
* `details`: filename, type, size, and attachment ID

This ensures traceability and compliance for sensitive knowledge base operations.

#### 6. **Handle Partial Failures**

```js
const failedUploads = results.filter(r => !r.success);
```

Collects failed upload attempts and throws a single summarized error if any uploads failed.

#### 7. **Success Response**

```js
res.status(201).json({
  success: true,
  message: "...",
  attachments: [...],
  articleId: req.params.id,
  timestamp: ...
});
```

Returns:

* Attachment count
* Metadata (IDs, URLs, size, type)
* Original request context (article ID, timestamp)

#### 8. **Error Handling**

```js
logger.error(`Attachment upload failed: ${error.message}`, {...});
this.handleError(res, error);
```

Logs the failure with full stack trace and user context, then delegates to `handleError()` (likely a shared error responder).

---

## 📦 Dependencies Used

* `mongoose`: For ObjectId validation
* `logger`: Custom logging service
* `addAttachment()`: Likely a service layer function to persist attachments
* `AuditLog.createLog()`: Audit tracking for compliance and debugging
* `req.files`: Middleware-injected uploaded file array
* `req.user`: Authenticated user context

---

## ✅ Summary

This method ensures that file attachments to articles are:

* **Validated** (both file and article ID)
* **Securely linked** to users and content
* **Audited** for compliance and traceability
* **Error-tolerant**, handling partial failures with clarity
* **User-friendly**, returning clear metadata on uploaded files


## 📥 Request Body Example (JSON)

This endpoint expects a **multipart/form-data** request since it handles file uploads. The request body should include one or more files under the key `files` and an optional `description` field for the attachment(s).

```json
{
  "description": "Optional description for the attachment"
}
````

### Example (Multipart Form Data):

* **files**: One or multiple file(s) to upload (e.g., PDF, image, document)
* **description**: (string) Description or notes about the attachment

---

**Note:**

* Files must be sent as actual file uploads, not as base64 or JSON strings.
* The `description` field is optional and applies to all attached files in the request.
* The article ID is provided as a URL path parameter (`/articles/:id/attachments`).
