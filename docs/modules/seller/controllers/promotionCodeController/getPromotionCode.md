# getPromotionCode.md

This method handles an HTTP request to retrieve a specific **promotion code** by its ID. It belongs to a controller (likely for admin or marketing tools) and interacts with a `PromotionCode` model. It includes validation, response enhancement with computed values, and secure response headers.

---

## 📥 Route & Purpose

### `GET /promotion-codes/:id`
- Fetches a promotion code by its ID.
- Enhances the result with **virtual properties** like `isActive` and `remainingUses`.
- Returns appropriate HTTP status codes based on the result or error.

---

## 🔧 Core Logic Breakdown

### 1. **Logging the Request**
```js
logger.info(`Get promotion code request for ID: ${req.params.id} from IP: ${req.ip}`);
````

* Logs the ID of the promotion code being requested and the requester’s IP address for auditing or monitoring purposes.

---

### 2. **Fetching the Promotion Code**

```js
const promotionCode = await PromotionCode.findPromotionCodeById(req.params.id);
```

* Retrieves the promotion code from the database using a custom method `findPromotionCodeById`.
* If no result is found, responds with:

```js
return res.status(404).json({ error: 'Promotion code not found' });
```

---

### 3. **Enhancing the Response**

Adds useful virtual/computed properties to the response:

* **`isActive`**:
  Checks if the promotion code is currently active based on:

  * Status (`'active'`)
  * Date range (`startDate <= now <= endDate`)

```js
const isActive = promotionCode.status === 'active' && 
                 now >= new Date(promotionCode.startDate) && 
                 now <= new Date(promotionCode.endDate);
```

* **`remainingUses`**:
  If a `usageLimit` is set, calculates how many uses are left:

```js
remainingUses: promotionCode.usageLimit 
  ? promotionCode.usageLimit - promotionCode.usageCount 
  : null
```

* **`links`**:
  Provides helpful links for frontends or clients:

```js
links: {
  list: '/promotion-codes',
  edit: `/admin/promotion-codes/${promotionCode._id}/edit`
}
```

---

### 4. **Setting Security Headers**

Applies two security-related HTTP headers:

* `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing attacks.
* `X-Frame-Options: DENY`: Prevents the response from being embedded in an iframe (mitigates clickjacking).

---

### 5. **Error Handling**

All errors are caught and logged with stack trace and context:

```js
logger.error(`Get promotion code error: ${error.message}`, { 
  stack: error.stack,
  promotionCodeId: req.params.id 
});
```

If the error is due to an invalid ID format, it returns a 400 error:

```js
if (error.message === 'Invalid promotion code ID format') {
  return res.status(400).json({ error: error.message });
}
```

Otherwise, it defaults to a 500 Internal Server Error:

```js
res.status(500).json({ 
  error: 'Internal server error',
  message: error.message
});
```

---

## ✅ Final Output (on success)

```json
{
  "promotionCode": {
    "_id": "60f...",
    "code": "SUMMER2025",
    "status": "active",
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-06-30T23:59:59.000Z",
    "usageLimit": 100,
    "usageCount": 20,
    "isActive": true,
    "remainingUses": 80
  },
  "links": {
    "list": "/promotion-codes",
    "edit": "/admin/promotion-codes/60f.../edit"
  }
}
```

---

## 🧩 Dependencies

* `PromotionCode.findPromotionCodeById(id)`: Data access layer abstraction.
* `logger`: Centralized logging service.
* `req.ip`, `req.params.id`: Used for tracking and data lookup.

---

## 📥 Request Body Example (JSON)

This endpoint does **not require a request body**.

The `GET /promotion-codes/:id` endpoint retrieves a promotion code by its ID, which should be provided as a **URL parameter**, not in the body.
