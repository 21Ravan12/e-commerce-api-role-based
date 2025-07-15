# getReturnRequests.md

This function `getReturnRequests` handles fetching paginated, filtered, and sorted return request records for users via an HTTP API endpoint. It includes detailed logging, security headers, validation, and HATEOAS-style pagination links.

---

## Workflow Overview

1. **Transaction Tracking & Logging:**
   - Generates a unique `transactionId` from header `x-request-id` or creates a new 16-byte hex string.
   - Logs the start of the request with client IP and transaction ID.
   - Measures elapsed time using `process.hrtime()` for performance monitoring.

2. **Query Parameters & Pagination:**
   - Reads pagination parameters from query:
     - `page` (default: 1)
     - `limit` (default: 10)
   - Supports filtering parameters:
     - `status`: Must be one of allowed return statuses (`pending`, `approved`, `rejected`, `processing`, `completed`, `refunded`).
     - `returnType`: Must be one of `refund`, `exchange`, `store_credit`.
     - `orderId`: Must be a valid MongoDB ObjectId if provided.

3. **Access Control:**
   - Builds MongoDB query conditionally:
     - If user is **not admin**, limits query to their own returns (`customerId` equals current user ID).
     - Admin users can query all return requests.

4. **Sorting:**
   - Supports multi-field sorting via `sort` query param, e.g., `sort=-createdAt,name`.
   - Defaults to sorting by `createdAt` descending.

5. **Data Fetching:**
   - Calls `ReturnRequest.getReturnRequests` with constructed query, pagination, sorting, and user context.
   - Expects response containing array of return requests and total count.

6. **Response Construction:**
   - Maps return request objects into a client-friendly format with key fields:
     - Return request details (`id`, `reason`, `status`, etc.)
     - Related customer and order IDs.
     - Optionally includes exchange product info if applicable.
   - Includes pagination metadata: `page`, `limit`, `total`, `pages`.
   - Provides HATEOAS `_links` for `self`, `first`, `last`, and conditional `prev`/`next` pages.

7. **Security Headers:**
   - Sets HTTP headers to improve security:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Content-Security-Policy: default-src 'self'`
     - Returns the `X-Request-ID` header with the transaction ID for tracing.

8. **Error Handling:**
   - Catches any errors during processing.
   - Logs detailed error info including stack, user ID, query params, and transaction ID.
   - Sends standardized JSON error response with:
     - `success: false`
     - Error message and optional details.
     - The same `transactionId` for correlation.
     - A link to API documentation for return requests.

9. **Performance Logging:**
   - On success, logs the count of records returned and processing time in milliseconds.

---

## Summary

This method is a robust, secure, and user-aware endpoint handler that:

- Enforces role-based data access.
- Validates and sanitizes input parameters.
- Supports pagination and sorting with HATEOAS links.
- Returns consistent and well-structured JSON responses.
- Implements detailed logging for operational visibility.
- Adds security-related HTTP headers.
- Provides a helpful error response format for client troubleshooting.

---

## 📥 Request Body Example (JSON)

This endpoint uses **query parameters** and **headers** for filtering and pagination; it does **not** require a request body. Below is an example of relevant inputs via query string and headers:

```json
{
  "headers": {
    "Authorization": "Bearer <your_jwt_token>",
    "X-Request-Id": "123e4567-e89b-12d3-a456-426614174000"
  },
  "queryParameters": {
    "page": "1",
    "limit": "10",
    "status": "pending",
    "returnType": "refund",
    "orderId": "507f1f77bcf86cd799439011",
    "sort": "-createdAt"
  }
}
