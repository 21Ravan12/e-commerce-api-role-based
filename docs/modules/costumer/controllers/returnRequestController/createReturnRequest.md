# createReturnRequest.md

This function handles the creation of a **return request** for a customer's order. It is designed with strict validation, clear error messaging, security best practices, and comprehensive logging for auditability and traceability.

---

## 🔄 Overview
**Function**: `createReturnRequest(req, res)`  
**Purpose**: Accept and process return/exchange/refund requests submitted by customers.  
**Flow**: Validate → Authorize → Check Order → Verify Conditions → Create Return → Respond

---

## 📥 Input Handling

### `transactionId`
- A unique ID is generated or retrieved from the request header (`x-request-id`) to trace the request.

### `Content-Type` Validation
- Ensures that the request has `Content-Type: application/json`.
- If not, throws a `415 Unsupported Media Type` error.

### `Payload Validation`
- Uses `returnRequestSchema` (likely Joi) to validate the body.
- Options:
  - `abortEarly: false`: Collect all errors.
  - `stripUnknown`: Remove unknown fields.
  - `allowUnknown: false`: Disallow unknown fields entirely.
- Errors are returned as a field-based object with `422 Unprocessable Entity`.

---

## 🔐 Authentication & Authorization

### Customer Verification
- Retrieves user by `req.user._id`.
- Only allows users with role `customer` or `admin`.
- Otherwise, throws a `403 Forbidden` error.

---

## 📦 Order Verification

### Order Check
- Uses `Order.getOrderDetails(orderId, userId)` to:
  - Ensure order exists.
  - Belongs to the user.
  - Is eligible for return.
- Fails with `404 Not Found` if not satisfied.

### Return Window Validation
- Compares current date with `order.orderDate + 30 days`.
- Expires with `400 Bad Request` if outside the window.

---

## 🔄 Exchange Logic

### Product Existence & Stock
- If `returnType` is `'exchange'`:
  - `exchangeProductId` must be present.
  - Product must exist and have stock > 0.
- Fails with `400` or `404` depending on the issue.

---

## 💰 Refund Calculation

### Auto-calculate Refund (if missing)
- For `refund` or `store_credit`:
  - Refund is calculated as the total price of all items.
  - Clamped to not exceed `order.totalAmount`.

---

## 📝 Return Request Creation

### Data Format
- A structured `returnRequestData` object is built.
- Includes:
  - `customerId`, `orderId`, `reason`, etc.
  - Conditionally includes `exchangeProductId` or `refundAmount`.

### Save
- Created via `ReturnRequest.createReturnRequest`.

---

## 📜 Audit Logging

### `AuditLog.createLog`
- Logs an audit trail with:
  - `event`, `entityType`, `entityId`
  - User IP, agent, metadata (including `transactionId`)

---

## 📤 Response

### HATEOAS Links
- `self`: View return
- `track`: Check status
- `cancel`: Cancel request

### Security Headers
- Prevents sniffing, clickjacking, and limits content sources:
  - `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`

### Response Format
```json
{
  success: true,
  message: "Return request created successfully",
  data: { ... },
  _links: { ... }
}
````

---

## ⚠️ Error Handling

### Logs All Failures

* Captures stack trace, input, and user context.

### Returns Standard Error Response

```json
{
  success: false,
  error: "Error message",
  details: { ... },       // if available
  transactionId: "...",
  _links: {
    documentation: { href: "/api-docs/returns#create-return-request" }
  }
}
```

---

## 📊 Performance Logging

### Timing

* Measures request execution time using `process.hrtime()`.
* Logs time in milliseconds alongside request ID and return ID.

---

## ✅ Summary

This handler is:

* **Robust**: Strict schema validation, full error messages.
* **Secure**: Content checks, role validation, safe headers.
* **Traceable**: Transaction IDs, audit logs, user agents, detailed error logs.
* **User-Friendly**: Auto refund calculation, HATEOAS responses.
* **API-First**: Clean response format with documentation links.

---

## 📥 Request Body Example (JSON)

```json
{
  "orderId": "60d21b4667d0d8992e610c85",
  "reason": "Product damaged",
  "description": "The item arrived with a broken screen",
  "returnType": "refund",
  "returnShippingMethod": "customer",
  "returnLabelProvided": false,
  "refundAmount": 49.99
}
