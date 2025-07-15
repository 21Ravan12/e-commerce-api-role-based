# getReturnRequest.md

This file documents the `getReturnRequest` controller method, which retrieves detailed information about a specific return request. The function ensures secure access, proper validation, error handling, logging, and response formatting (including HATEOAS links).

---

## ✅ Purpose
Retrieve a return request by ID for the currently authenticated user or an admin. This endpoint ensures:
- **Secure access control**
- **Detailed, structured response**
- **Traceability via transaction IDs and logging**

---

## 🔁 Function Signature
```js
async getReturnRequest(req, res)
````

* **req.params.id**: ID of the return request to retrieve.
* **req.user**: Authenticated user making the request (must have `role` and `_id`).
* **req.headers\['x-request-id']** *(optional)*: Used for request tracing; generated if not provided.

---

## ⚙️ Process Breakdown

### 1. **Transaction ID & Timer Setup**

```js
const transactionId = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');
const startTime = process.hrtime();
```

* Used for **tracing** and **logging**.
* Ensures unique traceability even without external tracing systems.

---

### 2. **Input Validation**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id))
```

* Checks if the provided ID is a valid MongoDB ObjectId.
* Returns a 400 error if invalid.

---

### 3. **Database Retrieval**

```js
const returnRequest = await ReturnRequest.getReturnRequest({ id, userId, userRole });
```

* Calls a model/service method to fetch the return request scoped by `userId` and `role`.
* Ensures users can only fetch their own data unless they’re admins.

---

### 4. **Authorization Check**

```js
if (req.user.role !== 'admin' && !returnRequest.customerId._id.equals(req.user._id))
```

* Restricts access unless the user is:

  * The original requester (`customerId`)
  * An admin
* Throws `403 Unauthorized` if the condition fails.

---

### 5. **Response Construction (HATEOAS)**

```js
const response = {
  success: true,
  data: {
    returnRequest: { ... },
    _links: {
      self: { href: ... },
      update: { href: ..., method: 'PATCH' },
      cancel: { href: ..., method: 'DELETE' }
    }
  }
};
```

* Returns structured data including:

  * Return status, refund amount, customer, order, etc.
  * Conditional data for `exchangeProduct` if applicable
  * **HATEOAS links**: Provides clients with navigable actions

---

### 6. **Security Headers**

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .set('Content-Security-Policy', "default-src 'self'")
  .set('X-Request-ID', transactionId)
```

* Adds standard HTTP security headers to prevent XSS, clickjacking, MIME sniffing.
* Echoes `X-Request-ID` for client-side traceability.

---

### 7. **Logging**

```js
logger.info(`[${transactionId}] Return request retrieved in ${elapsedTime}ms`)
```

* Logs total request duration and result metadata.
* Helps with monitoring performance and identifying bottlenecks.

---

## ❌ Error Handling

### Catch Block

* Logs error with:

  * Stack trace
  * User ID
  * Request ID
* Sends a structured JSON error response:

```js
{
  success: false,
  error: "message",
  transactionId,
  _links: {
    documentation: { href: '/api-docs/returns#get-return-request' }
  }
}
```

* Includes HTTP status based on the thrown `statusCode`.

---

## 🔐 Access Control

Only users who:

* Are admins, or
* Are the original requesters
  can retrieve return requests.

---

## 🧾 Summary

| Feature           | Description                                 |
| ----------------- | ------------------------------------------- |
| Validation        | Ensures valid ID format                     |
| Authorization     | Verifies user ownership or admin role       |
| Structured Output | Rich response with nested objects and links |
| Security          | Adds key headers for API hardening          |
| Logging & Tracing | Uses transaction ID and `process.hrtime()`  |
| HATEOAS           | Client guidance through `_links`            |
| Error Reporting   | Graceful error structure with documentation |

---

## 📥 Request Body Example (JSON)

This endpoint **does not require a request body** as it retrieves a return request by ID passed in the URL path parameter. Authentication is expected via headers (e.g., JWT token).

### Example Request

```http
GET /api/v1/returns/{returnRequestId}
Headers:
  Authorization: Bearer <token>
  X-Request-Id: <optional-unique-request-id>
