# getLowStockProducts.md

This function handles the **retrieval of low stock products** and is typically used in inventory management dashboards or alerts for restocking. It is defined as an asynchronous Express route controller method.

---

## 🔧 Function: `getLowStockProducts(req, res)`

### Purpose
Fetch a list of products that are **low in stock**, with an optional limit on the number of items returned.

---

## 📥 Request Handling

- **Logging**: Logs the request origin using `req.ip` for traceability.
  ```js
  logger.info(`Low stock products request from IP: ${req.ip}`);

* **Query Parameter**:

  * `limit`: (optional) Specifies how many products to return.
  * Defaults to `50` if not provided.
  * Parsed and cast to a number to prevent type errors.

  ```js
  const { limit = 50 } = req.query;
  ```

---

## 📦 Product Retrieval

* Calls `Product.getLowStockProducts(Number(limit))`, which is assumed to:

  * Be a custom static method defined on the `Product` model.
  * Query products based on a "low stock" condition (e.g., `quantity < threshold`).
* Returns the result as a JSON array.

  ```js
  const products = await Product.getLowStockProducts(Number(limit));
  res.status(200).json(products);
  ```

---

## ❌ Error Handling

* Catches any thrown errors during execution.

* Logs the error message and stack trace.

  ```js
  logger.error(`Low stock products error: ${error.message}`, { stack: error.stack });
  ```

* Sets appropriate HTTP status:

  * Returns `403` if the error message includes "Not authorized".
  * Otherwise, defaults to `500 Internal Server Error`.

  ```js
  const statusCode = error.message.includes('Not authorized') ? 403 : 500;
  ```

* Sends a JSON response with the error message.

  ```js
  res.status(statusCode).json({ error: error.message });
  ```

---

## ✅ Summary

| Feature          | Description                                       |
| ---------------- | ------------------------------------------------- |
| Method Type      | `GET` (typically)                                 |
| Query Params     | `limit` (optional)                                |
| Success Response | `200 OK` with array of low stock products         |
| Error Responses  | `403` if unauthorized, `500` otherwise            |
| Dependencies     | `Product.getLowStockProducts`, `logger`, `req.ip` |

## 📥 Request Body Example (JSON)

This endpoint does not require a request body.

Instead, it accepts an optional query parameter:

```http
GET /products/low-stock?limit=20
