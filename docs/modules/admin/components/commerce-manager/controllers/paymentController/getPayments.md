# getPayments.md

This function `getPayments` handles an authenticated API request to fetch paginated and filtered payment records, with detailed logging, error handling, and security headers.

---

## 🕒 Timed Admin Logging

- At the start, it creates a **timed admin log entry** via `AdminLog.createTimedAdminLog` to track this action (`get_payments`).
- Logs include:
  - Action name, target model (`Payment`),
  - Requesting user ID and email,
  - IP address and user-agent header,
  - Source (`web`),
  - Redacted query parameters,
  - Customer ID and admin role flag.
- `logEntry` marks the start; `complete()` finalizes the log after success or failure.

---

## 📝 Query Parameter Extraction & Sanitization

- Extracts query parameters from `req.query` with default values:
  - Pagination: `page` (default 1), `limit` (default 10)
  - Filters: `payment_status`, `payment_method`, `currency`, `min_amount`, `max_amount`, `start_date`, `end_date`, `search`
  - Sorting: `sortBy` (default `payment_date`), `sortOrder` (default `desc`)
- Creates a sanitized copy of query parameters for logging, redacting sensitive values like amounts and search strings.

---

## 🔍 Payment Retrieval

- Calls a separate `getPayments` function passing:
  - The `Payment` model,
  - Customer ID (`req.user._id`),
  - Parsed pagination values,
  - Filter options from query,
  - Sorting options.
- Receives a `response` object containing paginated payment data, total counts, etc.

---

## ✅ Successful Response Handling

- Completes the admin log with status `'success'` and detailed info:
  - Final pagination info (current page, limit, total results, total pages),
  - Count of returned records,
  - Applied (redacted) filters,
  - Sorting details.
- Sets HTTP security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
- Sets rate-limit headers to inform client of usage.
- Responds with HTTP 200 and JSON payload containing payment data.

---

## ❌ Error Handling

- On error, prepares an error details object including:
  - Error message and stack trace (in development),
  - Redacted query parameters,
  - Customer ID and IP,
  - Error type.
- If the error is a validation error, it adds specific validation messages.
- Completes the admin log with status `'failed'` and error details.
- Responds with:
  - HTTP 400 for validation errors with a clear "Validation error" message,
  - HTTP 500 for other errors with "Internal server error" message,
  - Includes error message and optionally error details and system error info in dev mode.

---

## Summary

This method ensures:

- Secure, paginated, and filtered retrieval of payment records,
- Comprehensive audit logging for admin actions with start/end timing,
- Sensitive data redaction in logs,
- Appropriate HTTP headers for security and rate limiting,
- Clear client feedback on errors with proper HTTP status codes.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it is a GET request that uses query parameters for filtering and pagination. Below is an example of the query parameters that can be sent in the URL:

```json
{
  "page": 1,
  "limit": 10,
  "payment_status": "completed",
  "payment_method": "credit_card",
  "currency": "USD",
  "min_amount": 10,
  "max_amount": 1000,
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-12-31T23:59:59Z",
  "search": "invoice123",
  "sortBy": "payment_date",
  "sortOrder": "desc"
}
````

* **page** (integer, optional): Page number for pagination (default: 1)
* **limit** (integer, optional): Number of results per page (default: 10)
* **payment\_status** (string, optional): Filter payments by status (e.g., "completed", "pending")
* **payment\_method** (string, optional): Filter by payment method (e.g., "credit\_card", "paypal")
* **currency** (string, optional): Filter by currency code (e.g., "USD", "EUR")
* **min\_amount** (number, optional): Minimum payment amount filter
* **max\_amount** (number, optional): Maximum payment amount filter
* **start\_date** (ISO8601 date string, optional): Filter payments made after this date
* **end\_date** (ISO8601 date string, optional): Filter payments made before this date
* **search** (string, optional): Search term to filter payments (e.g., invoice number)
* **sortBy** (string, optional): Field to sort by (default: "payment\_date")
* **sortOrder** (string, optional): Sort order, either "asc" or "desc" (default: "desc")
