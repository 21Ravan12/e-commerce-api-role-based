# updateReturnRequest.md

This function `updateReturnRequest` handles **updating a customer’s return request** with validation, auditing, security, and structured responses.

---

## Overview

- Receives an HTTP request to update a specific return request by ID.
- Validates input, authenticates user, and ensures only allowed fields are updated.
- Logs actions and errors with a unique transaction ID for traceability.
- Returns a structured success or error JSON response with HATEOAS links.

---

## Detailed Explanation

### 1. Transaction ID and Timing

- Extracts `x-request-id` header or generates a random 16-byte hex string as `transactionId` for tracing.
- Records start time with `process.hrtime()` for performance logging.

### 2. Logging Start

- Logs initiation of the update process with client IP.

### 3. Content-Type Validation

- Rejects requests if content type is not `application/json` with HTTP status 415 (Unsupported Media Type).

### 4. Return Request ID Validation

- Validates `req.params.id` is a valid MongoDB ObjectId.
- Responds with 400 (Bad Request) if invalid.

### 5. Payload Validation

- Uses `returnRequestCustomerUpdateSchema` (likely a Joi schema) to validate request body.
- Allows only specific fields to be updated, strips unknown properties.
- On validation error, returns HTTP 422 with detailed error messages keyed by field.

### 6. Update Operation

- Calls `ReturnRequest.updateCustomerReturnRequest` with the return request ID, user ID, and validated data.
- Expects the updated return request and the old values before update for audit purposes.

### 7. Audit Logging

- Creates an audit log entry recording:
  - Event type and action (`RETURN_REQUEST_UPDATED` / `update`)
  - Entity details (type and ID)
  - User performing the update
  - Source (web), IP, user agent, transaction ID
  - Metadata including old/new values, changed fields, and update type ("customer")

### 8. Response Preparation

- Builds a success JSON response with:
  - Updated return request summary (ID, status, description, shipping method)
  - HATEOAS links for self and tracking endpoint
  - Success message and flag

### 9. Security Headers

- Sets HTTP headers to improve security:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy: default-src 'self'`
  - `X-Request-ID` echoing the transaction ID

### 10. Send Response

- Sends HTTP 200 OK with the JSON response.

### 11. Performance Logging

- Logs the total time taken to process the update request with transaction ID.

---

## Error Handling

- Catches all errors in the try-catch block.
- Logs detailed error info including stack trace, user ID, request ID, and input data.
- Returns a structured error response with:
  - `success: false`
  - Error message and optionally validation details
  - Transaction ID for troubleshooting correlation
  - Link to API documentation for this endpoint
- Uses appropriate HTTP status codes (custom or default 500).

---

## Summary

`updateReturnRequest` is a robust, secure, and traceable method to update return requests by customers, featuring:

- Input validation and sanitization
- Precise error reporting and audit trails
- Security-conscious HTTP headers
- Transaction tracing via unique IDs
- Use of HATEOAS for RESTful API discoverability

---

## 📥 Request Body Example (JSON)

```json
{
  "description": "Updated reason for return due to product defect",
  "returnShippingMethod": "courier_pickup",
  "additionalNotes": "Please pick up between 9 AM and 5 PM"
}
