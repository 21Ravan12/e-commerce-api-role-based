# getPayment.md

This function `getPayment` handles retrieving payment details by ID with thorough **logging, auditing, and error handling**.

---

## Overview

- Accepts an HTTP request with a payment ID parameter (`req.params.id`).
- Logs the request start and completion asynchronously using `AdminLog` utilities.
- Fetches payment data from the database via `Payment.getPayment(id)`.
- Applies security audit for high-value or successful payments.
- Masks sensitive card data in the response.
- Sets strict security headers before responding.
- Handles errors gracefully, logging them and returning appropriate HTTP status codes.

---

## Detailed Explanation

### 1. Logging the request start

- Calls `AdminLog.createTimedAdminLog` with:
  - `action`: `'get_payment'`
  - Target model and ID (`Payment` and payment ID)
  - User info if authenticated (`req.user._id` and `req.user.email`)
  - Client IP and User-Agent headers
  - Source tagged as `'web'`
  - Additional details including request headers (`referer`, `origin`)
- This returns a `logEntry` and a `complete` callback to finalize the log later.

### 2. Fetch payment data

- Logs an informational message including payment ID and IP.
- Uses `Payment.getPayment(id)` to retrieve the payment document.
- If no payment is found:
  - Completes the log with status `'failed'` and an error message.
  - Responds with HTTP 404 and JSON `{ success: false, error: 'Payment not found' }`.

### 3. Security audit for sensitive data access

- If the payment status is `'success'` or payment amount exceeds a threshold (e.g., 10,000):
  - Creates a security audit log entry recording:
    - Action type `'high_value_payment_access'`
    - Payment ID, user performing access, amount, currency, and status.

### 4. Prepare response data

- Converts payment document to plain object.
- Masks sensitive card numbers by showing only last 4 digits, replacing others with bullet characters.
- Includes hypermedia links for:
  - The payment itself (`/payment/get/:id`)
  - The associated order (`/order/get/:orderId`)

### 5. Complete the initial log

- Calls the `complete` callback with:
  - Status `'success'`
  - Summary details of the payment (ID, amount, currency, status, order ID)
  - Response headers related to content type and security

### 6. Send HTTP response

- Sets security headers to prevent content sniffing and clickjacking:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - Adds custom header `X-Payment-ID` with payment ID
- Responds with HTTP 200 and JSON containing the masked payment data.

### 7. Error handling

- On any error during processing:
  - Completes the log with status `'failed'` including error message, stack trace (in development), payment ID, and error type.
  - Logs the error with stack and payment ID.
  - Responds with HTTP 500 and a JSON error payload including:
    - `success: false`
    - Generic `'Internal server error'` message
    - Detailed error message only in development
    - Error code or default `'SERVER_ERROR'`

---

## Summary

This method provides **secure**, **audited**, and **transparent** payment retrieval:

- Protects sensitive payment information.
- Records all access for admin review.
- Ensures consistent response headers for security.
- Gracefully handles missing data and unexpected errors.


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body as it retrieves payment details via a `GET` request using the payment ID passed as a URL parameter.

Example URL:
```

GET /payment/get/\:id

```

- `:id` — The unique identifier of the payment to retrieve.

Since this is a **GET** request, no JSON body is sent.
