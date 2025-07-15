# deletePromotionCode.md

This function handles the **deletion of a promotion code** via an HTTP request in an admin panel or API. It includes **authorization, validation, deletion logic, auditing, and security headers**. It’s designed to be robust, secure, and informative both for the client and the system's audit trail.

---

## 🔧 Function: `deletePromotionCode(req, res)`

### ✅ Purpose
Deletes a promotion code identified by `req.params.id` and returns a detailed response. Only accessible to admin users.

---

## 🛡️ Step-by-Step Breakdown

### 1. **Log the request**
```js
logger.info(`Promotion code deletion request for ID: ${req.params.id} from IP: ${req.ip}`);
````

Logs the incoming request with promotion code ID and IP address for traceability.

---

### 2. **Authorization Check**

```js
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Not authorized' });
}
```

Ensures the requester is an admin. If not, it returns a **403 Forbidden**.

---

### 3. **Delete the Promotion Code**

```js
const deletedCode = await PromotionCode.deletePromotionCode(req.params.id);
```

Uses a static model method `deletePromotionCode(id)` to perform the deletion logic, which likely includes checks for ID validity and usage status.

---

### 4. **Audit Logging**

```js
await AuditLog.createLog({ ... });
```

Creates a structured audit trail entry to ensure accountability and traceability:

* Event: `PROMOTION_CODE_DELETED`
* Entity info (type, ID, code, type)
* Source: "web"
* Actor: current user and IP
* User agent info
* Custom metadata for the deleted code

---

### 5. **Response Construction**

```js
const response = {
  message: "Promotion code deleted successfully",
  deletedCode,
  timestamp: new Date().toISOString(),
  links: {
    list: '/promotion-codes',
    create: '/promotion-codes'
  }
};
```

Builds a rich response with:

* Success message
* Deleted promotion code details
* Timestamp
* Helpful links to relevant endpoints (e.g., listing or creating promotion codes)

---

### 6. **Secure Headers and Final Response**

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .status(200)
  .json(response);
```

Adds security headers:

* `nosniff`: prevents MIME sniffing attacks
* `DENY`: blocks the page from being framed (protection from clickjacking)

---

## ⚠️ Error Handling

All errors are caught and handled with contextual HTTP status codes and messages:

### 1. **Client Errors**

* `400`: Invalid ID format
* `404`: Promotion code not found
* `409`: Cannot delete a used promotion code (includes `usageCount`)

### 2. **Server Errors**

```js
res.status(500).json({ error: 'Internal server error', message: error.message });
```

Fallback for unexpected issues.

All errors are logged:

```js
logger.error(`Promotion code deletion error: ${error.message}`, { stack: error.stack });
```

---

## 📌 Summary

* **Authorization**: Admin-only access
* **Validation & Deletion**: Delegated to model-level method
* **Audit Logging**: Rich event capture
* **Error Safety**: Graceful with informative HTTP codes
* **Security**: Headers and detailed logging
* **REST Best Practices**: Follows proper semantics and response structuring

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body.

The promotion code to be deleted is identified via the `:id` URL parameter. However, the request **must include a valid authenticated admin token** in the headers.
