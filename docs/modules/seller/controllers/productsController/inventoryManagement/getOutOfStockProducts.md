# getOutOfStockProducts.md

This file documents the `getOutOfStockProducts` controller method. It handles incoming HTTP requests to retrieve products that are currently **out of stock**. The function is designed to be used in an admin panel, inventory system, or reporting dashboard.

---

## 🧠 Function Overview

```js
async getOutOfStockProducts(req, res) { ... }
````

This is an **asynchronous Express route handler** that returns a list of products whose stock quantity is zero.

---

## 🔍 Step-by-Step Explanation

### 1. **Logging the Request**

```js
logger.info(`Out of stock products request from IP: ${req.ip}`);
```

* Logs the incoming request with the client's IP address for monitoring and auditing purposes.

### 2. **Parsing the Query Parameter**

```js
const { limit = 50 } = req.query;
```

* Extracts an optional `limit` from the query string (e.g., `/products/out-of-stock?limit=100`).
* Defaults to 50 if not provided, preventing excessive data load by default.

### 3. **Fetching Out-of-Stock Products**

```js
const products = await Product.getOutOfStockProducts({ limit });
```

* Calls a static method on the `Product` model (presumably Mongoose or Sequelize) to fetch products with `stock <= 0`.
* The `limit` parameter ensures only a specific number of records are returned for efficiency.

### 4. **Sending Success Response**

```js
res.status(200).json(products);
```

* Sends back the resulting array of out-of-stock product objects with HTTP `200 OK`.

---

## ❌ Error Handling

### Catch Block

```js
logger.error(`Out of stock products error: ${error.message}`, { stack: error.stack });
```

* Logs the error message and stack trace for debugging purposes.

### Status Code Decision

```js
const statusCode = error.message.includes('Not authorized') ? 403 : 500;
```

* Dynamically assigns status code:

  * `403 Forbidden` for authorization errors.
  * `500 Internal Server Error` for general failures.

### Error Response

```js
res.status(statusCode).json({ error: error.message });
```

* Sends a descriptive error message back to the client in JSON format.

---

## ✅ Use Cases

* Displaying low-stock or unavailable items in admin dashboards.
* Automatically triggering restock alerts or purchase orders.
* Monitoring inventory health in real time.

---

## 🔐 Assumptions

* `Product.getOutOfStockProducts()` is a database-layer function that filters out products with no stock left.
* This route may require middleware-based authentication in a real-world application.

---

## 🌐 Example Request

```
GET /api/products/out-of-stock?limit=25
```

## ✅ Example Success Response

```json
[
  { "id": "1", "name": "Wireless Mouse", "stock": 0 },
  { "id": "2", "name": "Bluetooth Headphones", "stock": 0 }
]
```

## ❗ Example Error Response

```json
{
  "error": "Not authorized to access this resource"
}
```

---

````md
## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body.  
All input is handled via query parameters.

```json
{}
````

> ℹ️ Use the `limit` query parameter in the URL to control the number of results:

```
GET /products/out-of-stock?limit=25
 ```
