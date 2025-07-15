# getAdminOrders.md

This document explains the functionality and workflow of the `getAdminOrders` controller method. This function is used by admins to **fetch and filter orders** from the database, with **detailed logging**, **strict access control**, **query validation**, and **custom response formatting**.

---

## 📝 Function: `getAdminOrders(req, res)`

### ✅ 1. Admin Activity Logging (Start)
The method begins by creating a **timed log entry** using `AdminLog.createTimedAdminLog()`. It logs metadata like:
- **Action**: `'get_admin_orders'`
- **Target model**: `'Order'`
- **Performed by**: `req.user._id` and `req.user.email`
- **Client details**: IP and User-Agent
- **Request details**: All filter, sort, and pagination query parameters

This returns:
- `logEntry`: reference to the created log
- `complete(status, details)`: function to finalize the log at the end

---

### 🔒 2. Authorization Check
Checks if the user has an `admin` role:
- If **not authorized**, logs the failure and returns a `403 Forbidden` response with error message.

---

### 🧹 3. Query Extraction & Defaults
Pulls filter, sort, and pagination options from `req.query`:
```js
page, limit, status, customerId, dateFrom, dateTo, sortBy, sortOrder, minTotal, maxTotal
````

With defaults like:

* `page = 1`
* `limit = 10`
* `sortBy = 'createdAt'`
* `sortOrder = 'desc'`

---

### ✅ 4. Input Validation

Uses a `getAdminOrdersSchema` (likely a Joi schema) to validate query parameters. If invalid:

* Logs validation error via `complete()`
* Returns a `400 Bad Request` with detailed field-level error messages

---

### 🔍 5. Building the MongoDB Query

Creates a flexible query object based on filters:

* **Status**: `query.status = status`
* **Customer ID**:

  * Validates format via `mongoose.Types.ObjectId.isValid()`
  * Assigned to `query.idCustomer`
* **Date range** (`createdAt`):

  * Adds `$gte` and `$lte` conditions
* **Total amount**:

  * Applies min/max to `query.total`

---

### 📦 6. Fetching Orders

Calls a model method:

```js
Order.fetchAdminOrders(customerId, page, limit, query, sortBy, sortOrder)
```

Expected to return:

* `orders`: matching order documents
* `total`: total count of results
* `page`: current page
* `pages`: total pages

---

### 🧾 7. Response Formatting

Each order is mapped into a structured object with:

* Basic info: `_id`, `orderNumber`, `status`, `total`, `createdAt`, `updatedAt`
* Payment: `paymentMethod`, `paymentStatus`
* Customer: ID, full name, and email (if available)
* Items: product ID, quantity, price, subtotal
* Shipping: address, method, cost
* Extras (admin-only): `notes`, `internalFlags`

---

### ✅ 8. Finalizing Log (Success)

Calls `complete()` with:

* `status: 'success'`
* Result metadata: count, filters, pagination, sort options

Returns a `200 OK` response with:

* `orders`: formatted array
* `count`: length of result set
* `total`: total orders matching query
* `page`, `pages`, `filters`: contextual info for frontend

---

### ❌ 9. Error Handling

Catches any internal error:

* Logs via `complete(status: 'failed')` with:

  * Error message
  * Stack trace (only in development)
  * Original query parameters
* Responds with `500 Internal Server Error` and optional details in dev mode.

---

## 🛡️ Summary

| Concern            | Handled By                             |
| ------------------ | -------------------------------------- |
| Admin Access       | `req.user.role !== 'admin'`            |
| Audit Logging      | `AdminLog.createTimedAdminLog()`       |
| Validation         | `getAdminOrdersSchema.validate()`      |
| Filtering          | Status, customer, date, total          |
| Pagination/Sorting | `page`, `limit`, `sortBy`, `sortOrder` |
| Output Formatting  | Customized `orders.map()` response     |
| Error Safety       | Try/catch with full log context        |


## 📥 Request Body Example (JSON)

This endpoint uses **query parameters** for filtering, pagination, and sorting. Below is an example of how you would structure the query parameters in your request URL:

```json
{
  "status": "completed",
  "customerId": "60b8d295f1d3c726d8fef8a4",
  "dateFrom": "2025-01-01T00:00:00.000Z",
  "dateTo": "2025-12-31T23:59:59.999Z",
  "minTotal": 50,
  "maxTotal": 500,
  "page": 1,
  "limit": 20,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
````

* **status** (string, optional): Filter orders by their status (e.g., `"pending"`, `"completed"`, `"cancelled"`).
* **customerId** (string, optional): MongoDB ObjectId of the customer to filter orders.
* **dateFrom** (ISO 8601 date string, optional): Start date for filtering order creation date.
* **dateTo** (ISO 8601 date string, optional): End date for filtering order creation date.
* **minTotal** (number, optional): Minimum order total amount to filter.
* **maxTotal** (number, optional): Maximum order total amount to filter.
* **page** (integer, optional, default `1`): Page number for pagination.
* **limit** (integer, optional, default `10`): Number of orders per page.
* **sortBy** (string, optional, default `"createdAt"`): Field to sort orders by.
* **sortOrder** (string, optional, default `"desc"`): Sort direction (`"asc"` or `"desc"`).

> **Note:** These parameters are passed as URL query parameters, e.g.:

```
GET /admin/orders?status=completed&customerId=60b8d295f1d3c726d8fef8a4&dateFrom=2025-01-01T00:00:00.000Z&dateTo=2025-12-31T23:59:59.999Z&minTotal=50&maxTotal=500&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```
