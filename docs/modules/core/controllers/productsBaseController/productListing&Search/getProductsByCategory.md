# getProductsByCategory.md

This method `getProductsByCategory` is an **asynchronous Express controller** designed to fetch and return products based on a given category. It includes **caching**, **logging**, **error handling**, and **query customization** (limit & sort).

---

## 🔄 Function Signature

```js
async getProductsByCategory(req, res)
````

Handles incoming HTTP requests to retrieve products by a specified category ID.

---

## ✅ Step-by-Step Breakdown

### 1. **Request Logging**

```js
logger.info(`Products by category request for ID: ${req.params.categoryId} from IP: ${req.ip}`);
```

* Logs the incoming request with category ID and client IP address for traceability and analytics.

---

### 2. **Extract Parameters**

```js
const categoryId = req.params.categoryId;
const { limit = 50, sort = '-isFeatured -createdAt' } = req.query;
```

* **`categoryId`**: Path parameter (e.g., `/products/category/:categoryId`)
* **`limit`**: Optional query param to limit number of returned products (default = 50)
* **`sort`**: Optional sort criteria (default = featured first, then newest)

---

### 3. **Cache Key Construction**

```js
const cacheKey = `product:category:${categoryId}:${limit}:${sort}`;
```

* Builds a unique Redis key based on the request parameters to cache results.

---

### 4. **Check Redis Cache**

```js
const cached = await RedisClient.get(cacheKey);
if (cached) {
  return res.status(200).json(JSON.parse(cached));
}
```

* If cache exists for this request, it returns the cached result to reduce DB load and improve response time.

---

### 5. **Fetch Products from Logic Layer**

```js
const products = await Product.getProductsByCategory(categoryId, {
  limit: parseInt(limit),
  sort
});
```

* Calls business logic (likely DB access) to fetch products under the specified category.
* Uses the extracted `limit` and `sort` parameters to customize the query.

---

### 6. **Store Result in Cache**

```js
await RedisClient.set(cacheKey, JSON.stringify(products), 'EX', 1800); // 30 minutes
```

* Caches the result for **30 minutes** using Redis with an expiration (`EX`) time of 1800 seconds.

---

### 7. **Respond with JSON**

```js
res.status(200).json(products);
```

* Sends the retrieved product data back to the client as a JSON response.

---

### 8. **Error Handling**

```js
logger.error(`Products by category error: ${error.message}`, { stack: error.stack });

const statusCode = error.message.includes('not found') ? 404 : 500;
res.status(statusCode).json({ error: error.message });
```

* Logs detailed error information including the stack trace.
* Responds with:

  * `404` if the error message suggests "not found"
  * `500` for all other errors

---

## 💡 Summary

This controller method is optimized for performance and scalability:

* **Caching** with Redis reduces repetitive database hits.
* **Query customization** provides flexibility for clients.
* **Logging and structured errors** support debugging and monitoring.
* **Modular design** (separation of controller and logic layer) ensures clean maintainability.


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body as it retrieves products by category ID via URL parameters and optional query parameters.

### URL Parameters
```json
{
  "categoryId": "60f7c0d2b6e8a72f3c8b4567"
}
````

### Query Parameters (optional)

```json
{
  "limit": 50,
  "sort": "-isFeatured -createdAt"
}
```

* `limit` (integer, optional): Maximum number of products to return. Defaults to 50.
* `sort` (string, optional): Sort order of results. Defaults to `-isFeatured -createdAt` (featured first, newest first).
