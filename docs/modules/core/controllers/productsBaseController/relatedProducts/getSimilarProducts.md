# getSimilarProducts.md

This method handles fetching and returning products similar to a specified product, optimizing performance by using caching with Redis.

---

## Function: `getSimilarProducts(req, res)`

### Purpose
- To retrieve a list of products similar to the product identified by `productId` from the request parameters.
- To serve results quickly by caching responses and reducing repeated database queries.

### Workflow

1. **Logging Request**
   - Logs an informational message including the requested product ID and the client's IP address for monitoring and debugging.

2. **Input Extraction**
   - Reads the `productId` from `req.params`.
   - Reads an optional `limit` query parameter to define how many similar products to return, defaulting to 5 if not provided.

3. **Cache Handling**
   - Constructs a Redis cache key in the format: `products:similar:<productId>:<limit>`.
   - Attempts to fetch cached similar products using this key.
   - If cached data exists, parses it from JSON and immediately returns it with HTTP status 200, avoiding database access.

4. **Database Query**
   - If cache miss occurs, calls `Product.getSimilarProducts(productId, { limit })` to query the database or service layer for similar products.

5. **Caching Results**
   - Stores the retrieved similar products in Redis under the constructed cache key.
   - Sets an expiration time (`EX`) of 1800 seconds (30 minutes) to keep the cache fresh.

6. **Response**
   - Sends the similar products as JSON with HTTP status 200.

7. **Error Handling**
   - Logs any error message and stack trace.
   - Returns HTTP 404 if error message contains "not found" (e.g., product doesn't exist).
   - Returns HTTP 500 for all other errors.
   - Sends a JSON error response containing the error message.

---

## Summary

- Implements **efficient caching** with Redis to minimize redundant DB queries.
- Provides **flexible limit parameter** with a default fallback.
- Uses structured **logging** for traceability.
- Employs clear **error differentiation** between "not found" and server errors.
- Returns consistent JSON responses for both success and error cases.


## 📥 Request Body Example (JSON)

This endpoint **does not require a request body** as it fetches similar products based on a product ID provided in the URL path and an optional query parameter.

---

### Request parameters:

* **Path Parameter**:
  `productId` (string, required) — The ID of the product for which to find similar products.

* **Query Parameter**:
  `limit` (integer, optional, default: 5) — Maximum number of similar products to return.

---

### Example URL:

```
GET /products/{productId}/similar?limit=5
```

### Example: No request body needed

```json
{}
```

*Note: Since this is a GET request, the payload is empty.*
