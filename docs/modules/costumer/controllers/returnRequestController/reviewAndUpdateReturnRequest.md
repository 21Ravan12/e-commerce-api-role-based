# reviewAndUpdateReturnRequest.md

This method handles the **admin review and update of a return request** in a secure, validated, and auditable manner.

---

## Flow Breakdown

### 1. Transaction Tracking & Timing
- Generates or retrieves a unique `transactionId` from request headers (`x-request-id`) or creates a new 16-byte hex ID.
- Captures high-resolution start time for performance logging.

### 2. Initial Logging
- Logs the start of the admin update operation, including the requester’s IP.

### 3. Content-Type Validation
- Ensures the request's `Content-Type` is `application/json`.
- Throws a `415 Unsupported Media Type` error if invalid.

### 4. Return Request ID Validation
- Checks if `req.params.id` is a valid MongoDB ObjectId.
- Throws a `400 Bad Request` error if the ID format is invalid.

### 5. Request Body Validation
- Validates the incoming JSON body against `returnRequestAdminUpdateSchema`.
- Configured to:
  - Stop after all errors (`abortEarly: false`).
  - Strip unknown fields (`stripUnknown: true`).
  - Disallow unknown keys (`allowUnknown: false`).
  - Remove label wrapping on error messages.
- On validation failure, constructs a detailed error object with field-specific messages.
- Throws a `422 Unprocessable Entity` error with validation details.

### 6. Authorization Check
- Verifies the requesting user has `admin` role.
- Throws a `403 Forbidden` error if unauthorized.

### 7. Updating the Return Request
- Calls `ReturnRequest.updateAdminReturnRequest` with the validated data and return request ID.
- This method updates the return request fields allowed for admins.

### 8. Audit Logging
- Records the update event with:
  - Event type and action
  - Entity details (return request ID)
  - Admin user ID and IP info
  - User-Agent string
  - Metadata containing changed fields, new values, transaction ID, and update type
- Ensures traceability and accountability for admin actions.

### 9. Response Construction (HATEOAS)
- Returns a JSON response indicating success with:
  - Updated return request summary (id, status, refund, admin notes)
  - HATEOAS links for:
    - Admin self resource
    - Customer-facing return request resource

### 10. Security Headers
- Sets HTTP headers to enhance security:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy: default-src 'self'`
  - Includes `X-Request-ID` header with the transaction ID for tracking.

### 11. Success Logging
- Logs completion including elapsed time (in milliseconds), admin ID, and return request ID.

---

## Error Handling

- Catches all errors during processing.
- Logs detailed error info including stack trace, admin ID, request body, and return request ID.
- Sends standardized error JSON response with:
  - `success: false`
  - Error message and optional validation details
  - `transactionId` for correlation
  - Link to API documentation for updating return requests
- Responds with appropriate HTTP status code (`error.statusCode` or `500` by default).

---

## Summary

This method ensures that only authorized admins can update return requests with strict input validation, comprehensive logging (including audit trails), and secure HTTP practices. It provides clear feedback and traceability on success and failure, facilitating robust admin operations in the return management workflow.

---

## 📥 Request Body Example (JSON)

```json
{
  "status": "approved",
  "refundAmount": 49.99,
  "description": "Return approved after inspection",
  "returnShippingMethod": "courier",
  "adminNotes": "Customer provided valid reason, refund processed"
}
