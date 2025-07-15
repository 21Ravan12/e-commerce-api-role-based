# addCategory.md

This document explains the logic and flow of the `addCategory` controller method, which handles **admin category creation** in a secure, validated, and auditable way.

---

## 📥 Purpose

The function `addCategory(req, res)`:
- Validates the request and user.
- Logs the operation in a detailed admin audit trail.
- Uses a static model method to add a category.
- Handles and reports errors gracefully.

---

## 🛡️ Step-by-Step Breakdown

### 1. **Admin Audit Log Initialization**
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({...});
````

* Creates a "timed" audit log that will later be marked as **success** or **failure**.
* Includes action context: user ID/email, IP, user-agent, and request metadata.

---

### 2. **Request Metadata Logging**

```js
logger.info(`Category creation request from IP: ${req.ip}`);
```

* Adds a server-side trace for easier debugging and log tracking.

---

### 3. **Content-Type Validation**

```js
if (!req.is('application/json')) { ... }
```

* Ensures the request is sending JSON.
* Fails early with a 415 status if incorrect content type is used.
* Updates audit log with `validationError: true`.

---

### 4. **Input Schema Validation**

```js
const { error, value } = categorySchema.validate(req.body, {...});
```

* Uses a `categorySchema` (likely Joi or Yup) to:

  * Reject unknown fields
  * Return all validation errors at once (`abortEarly: false`)
* If validation fails:

  * Constructs readable error messages
  * Logs validation error details to `AuditLog`
  * Returns a `400 Bad Request`

---

### 5. **Category Creation**

```js
const { category, auditLogData } = await Category.addCategory(...);
```

* Calls a model method to actually add the category:

  * Handles slug generation, parent assignment, uniqueness, etc.
  * Returns both the created category and related audit log data.

---

### 6. **Audit Log Finalization (Success)**

```js
await AuditLog.createLog(auditLogData);
await complete({ status: 'success', details: { ... } });
```

* Logs a normal audit event for the operation (`createLog`).
* Finalizes the "timed" log with success details.

---

### 7. **Response Construction**

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .status(201)
  .json({...});
```

* Sends a secure and well-structured JSON response:

  * With metadata like `view` and `edit` links.
  * 201 Created status.

---

## ❌ Error Handling

### Categorized Error Responses

```js
const statusCode = error.message.includes(...) ? ... : 500;
```

* Maps known error patterns to meaningful HTTP statuses:

  * 400: Validation or bad input
  * 404: Not found
  * 409: Conflict (e.g., duplicate category)
  * 415: Unsupported Media Type
  * 500: Internal Server Error

### Conditional Error Details

```js
if (error.details) errorDetails.validationDetails = error.details;
```

* Only include detailed validation info when relevant.

### Development Stack Tracing

```js
stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
```

* Exposes stack trace only in development.

### Final Audit Log (Failure)

```js
await complete({ status: 'failed', details: errorDetails });
```

* Ensures the audit trail captures **why** the operation failed.

### Response to Client

```js
res.status(statusCode).json({ error: error.message, ... });
```

* Sends clear error response to client with optional debug info.

---

## ✅ Security Highlights

* Requires authenticated admin user via `req.user`.
* Validates content type and input structure.
* Prevents injection by stripping unknown fields.
* Logs every step for traceability and accountability.

---

## 📦 Dependencies Used

* `AuditLog`: Custom logging module for admin operations.
* `logger`: App-wide logging service (likely Winston or similar).
* `categorySchema`: Validation schema (e.g., Joi/Yup).
* `Category.addCategory`: Encapsulates DB logic, returns both entity and audit info.

---

## 🧪 Response Example (Success)

```json
{
  "message": "Category created successfully",
  "category": {
    "id": "64f3a12...",
    "name": "Tools",
    "slug": "tools",
    "parentCategory": null,
    "isActive": true
  },
  "links": {
    "view": "/categories/tools",
    "edit": "/admin/categories/64f3a12.../edit"
  }
}
```

---

## 📥 Request Body Example (JSON)

```json
{
  "name": "New Category Name",
  "slug": "new-category-name",
  "parentCategory": "60f7a0c2b4d3f814c8a6a1b2",  // Optional: MongoDB ObjectId of parent category
  "isActive": true  // Optional: defaults to true if omitted
}
