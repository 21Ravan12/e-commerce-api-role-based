# getFrequentlyBoughtTogether.md

This function handles HTTP requests to retrieve a list of products that are frequently bought together with a given product. It leverages caching for improved performance and returns the results in JSON format.

---

## Function: `getFrequentlyBoughtTogether(req, res)`

### Purpose
- To provide clients with a list of products commonly purchased alongside a specified product.
- Improves response speed by using Redis caching.
- Logs request details and handles errors gracefully.

### Workflow

1. **Logging the Request**  
   Logs the incoming request with the product ID and client IP for monitoring and debugging purposes.
   ```js
   logger.info(`Frequently bought together request for ID: ${req.params.productId} from IP: ${req.ip}`);

2. **Extracting Parameters**

   * `productId` from URL parameters (`req.params.productId`).
   * `limit` from query parameters (`req.query.limit`), defaulting to 5 if not provided.

3. **Cache Key Construction**
   Builds a Redis cache key based on the product ID and limit to uniquely identify cached results.

   ```js
   const cacheKey = `products:fbt:${productId}:${limit}`;
   ```

4. **Cache Retrieval**
   Attempts to fetch cached results from Redis using the cache key.

   * If cache exists, parse and return the cached JSON response immediately with HTTP status 200.

5. **Fetching Data**
   If cache is missing:

   * Calls a model method `Product.getFrequentlyBoughtTogether(productId, { limit })` to retrieve the data from the database or business logic layer.

6. **Caching Results**
   Stores the fetched product list in Redis with an expiration of 1 hour (`3600` seconds) to improve subsequent request performance.

   ```js
   await RedisClient.set(cacheKey, JSON.stringify(products), 'EX', 3600);
   ```

7. **Response**
   Sends the product list as a JSON response with HTTP status 200.

8. **Error Handling**

   * Logs error messages and stack traces for troubleshooting.
   * Responds with HTTP status `404` if the error message indicates "not found", otherwise responds with `500`.
   * Returns a JSON object containing the error message.

---

### Summary

This method optimizes frequent product association lookups by:

* Using Redis caching to minimize repeated database queries.
* Handling dynamic limits on results.
* Providing robust logging and error handling.
* Returning clean JSON responses for easy client consumption.


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body.  
All necessary data is passed via **URL parameters** and optional **query parameters**.

### ✅ Example Usage:
```

GET /api/products/frequently-bought-together/64a7d4f2c3e8b2c5d1a12345?limit=3

```

### 🧾 Parameters:
- `productId` (URL param) – ID of the product to find related purchases for (required)
- `limit` (query param) – Number of related products to return (optional, default: 5)
```
