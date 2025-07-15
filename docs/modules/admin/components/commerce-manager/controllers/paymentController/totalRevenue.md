# getTotalRevenue.md

This function `getTotalRevenue` handles an HTTP request to fetch aggregated payment revenue data within a specified date range and optionally filtered by customer and currency. It also logs the request lifecycle for auditing and troubleshooting.

---

## 🔍 Overview

- Endpoint to retrieve total revenue summary from the `Payment` model.
- Supports optional query parameters:
  - `start_date` (ISO 8601 string) — start of the date range; defaults to 30 days ago.
  - `end_date` (ISO 8601 string) — end of the date range; defaults to current date/time.
  - `customer_id` — filter revenue for a specific customer; defaults to the authenticated user.
  - `currency` — filter revenue by currency code (e.g., "USD").

---

## ⏱ Logging

- Uses `AdminLog.createTimedAdminLog` to create a timed log entry at the start of the request.
- Captures metadata such as:
  - Action: `'get_total_revenue'`
  - Target model: `'Payment'`
  - User ID and email (if authenticated)
  - Client IP and user-agent
  - Query parameters and customer context
- Upon completion or failure, updates the log entry with status and details.

---

## 🗓 Date Parsing & Validation

- Parses `start_date` and `end_date` from query parameters or applies defaults.
- Validates the date formats; if invalid, responds with HTTP 400 and descriptive error.
- Error logged and recorded in admin log with validation error flag.

---

## 🔎 Revenue Data Retrieval

- Determines the `customerId` filter from query or current user.
- Calls `Payment.getTotalRevenue` method with parameters:
  - `startDate`, `endDate`, `customerId`, and optional `currency`.
- Expects `revenueData` object containing:
  - `total`: sum of payments
  - `currency`: currency code (default "USD" if missing)
  - `count`: number of payments
  - `byCurrency`: breakdown by currency

---

## 📊 Response Construction

- Returns JSON with:
  - `success: true`
  - `start_date` and `end_date` as Date objects
  - `total_revenue` sum
  - `currency`
  - `payment_count`
  - `average_payment` calculated safely (0 if no payments)
  - `breakdown_by_currency` for detailed reporting
  - `links`:
    - URL to payment list filtered by approved status and date range
    - Link to API documentation section for this report

- Sets HTTP headers for security (`X-Content-Type-Options`, `X-Frame-Options`) and caching (5 minutes).

---

## 🚨 Error Handling

- Catches exceptions, including validation errors.
- Logs error details with stack trace (only in development).
- Completes admin log entry marking failure with error details.
- Responds with:
  - HTTP 400 for validation errors (e.g., invalid dates)
  - HTTP 500 for server errors
- Includes user-friendly error messages and format guidance for validation errors.

---

## 📝 Summary

This function is a robust, secure, and well-logged API handler to query payment revenue statistics over time with optional filters. It combines careful input validation, detailed audit logging, and standardized error reporting to ensure maintainability and usability in production environments.


## 📥 Request Body Example (JSON)

This endpoint uses **query parameters** for input; no JSON request body is required.

Example query parameters for a GET request to `/total-revenue`:

```json
{
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "customer_id": "507f1f77bcf86cd799439011",
  "currency": "USD"
}
````

**Notes:**

* `start_date` and `end_date` are optional ISO 8601 dates (format `YYYY-MM-DD`). Defaults to last 30 days if omitted.
* `customer_id` is optional; defaults to the authenticated user's ID.
* `currency` is optional; filters revenue by currency code if provided.
