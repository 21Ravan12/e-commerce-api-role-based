# getOrders.md

This file documents the `getOrders` controller method, responsible for handling authenticated user requests to **retrieve their past orders**. It includes **input validation**, **pagination**, **filtering by status**, **data formatting**, and **auditing** via structured logs.

---

## 📥 Input & Request Handling

### Request Source
- Triggered by a `GET /orders` API call.
- Requires user to be authenticated (`req.user._id` must be available).

### Query Parameters
- `page` (default = `1`): For pagination.
- `limit` (default = `10`): Number of orders per page.
- `status` (optional): Filters orders by their status (e.g., `pending`, `shipped`, `cancelled`).

### Input Validation
- Uses `getOrdersSchema` (likely a Joi schema) to validate `page`, `limit`, and `status`.
- If validation fails, returns `400 Bad Request` with field-specific error messages:
```json
{
  "errors": [
    { "field": "page", "message": "Page must be a positive number" },
    ...
  ]
}
````

---

## 📦 Data Fetching

### `Order.getCustomerOrders(userId, page, limit, status)`

* Efficient database query that:

  * Paginates results based on `page` and `limit`.
  * Applies a `status` filter directly in the database query (more efficient than in-memory filtering).
* Returns a structure like:

```js
{
  orders: [...],
  total: <number>,
  page: <number>,
  pages: <number>,
  limit: <number>
}
```

---

## 📋 Order Formatting

Each order is transformed into a lightweight, frontend-friendly format:

```js
{
  _id,
  orderNumber,               // Defaults to 'ORD-XXXXXX' if not present
  status,
  total,
  estimatedDelivery,
  paymentMethod,
  createdAt,
  itemCount,                 // Number of items in the order
  previewImage               // First product's main image (if any)
}
```

---

## 🧾 Audit Logging

### On Success

* Logs the successful read operation via `AuditLog.createLog`.
* Includes metadata:

  * Number of orders returned
  * Pagination values
  * Status filter used
  * IP and User-Agent

### On Failure

* Logs the failed attempt with:

  * Error message
  * Original query parameters
  * User info, IP, and User-Agent

This improves **traceability** and **security monitoring**.

---

## 📤 Response Structure

On success:

```json
{
  "orders": [...],        // Formatted order data
  "count": 10,            // Orders in this page
  "total": 42,            // Total orders
  "page": 1,
  "pages": 5,
  "limit": 10
}
```

On error:

```json
{
  "error": "Failed to fetch orders",
  "details": "Error message here" // Only in development
}
```

---

## 🔐 Error Handling & Safety

* Fully wrapped in a `try-catch` block.
* All runtime errors are logged and audited.
* Leaks minimal information unless in development mode (`NODE_ENV === 'development'`).

---

## ✅ Summary

`getOrders` is a secure, paginated, filterable endpoint designed to:

* Retrieve user orders efficiently from the DB.
* Return clear and minimal JSON responses.
* Ensure system observability via structured logging.

## 📥 Request Body Example (JSON)

This endpoint does not accept a request body.  
All input parameters are provided via **query string parameters**.

However, for documentation purposes, here’s an example of how the **query parameters** would look if they were represented in JSON format:

```json
{
  "page": 1,
  "limit": 10,
  "status": "delivered"
}
