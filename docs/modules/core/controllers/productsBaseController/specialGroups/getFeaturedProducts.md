# getFeaturedProducts.md

This function handles HTTP requests to retrieve a list of featured products with caching and logging.

---

## Function: `getFeaturedProducts(req, res)`

### Purpose
- Fetches a limited number of featured products.
- Utilizes Redis caching to improve performance and reduce database load.
- Logs request and error information for monitoring and debugging.

---

### Workflow

1. **Logging Request**
   - Logs the incoming request IP for traceability using `logger.info`.

2. **Limit Parsing**
   - Reads the `limit` query parameter from the request.
   - Defaults to `10` if not provided or invalid.

3. **Cache Lookup**
   - Constructs a Redis cache key based on the limit (`products:featured:<limit>`).
   - Checks Redis for cached product data.
   - If found, immediately returns cached products as JSON with HTTP status `200`.

4. **Fetching from Database**
   - If no cached data, calls `Product.getFeaturedProducts(Product, { limit })` to fetch featured products from the data source.
   - This is the main logic function that queries the database or service.

5. **Caching Result**
   - Stores the fetched product list in Redis as a JSON string.
   - Sets cache expiration to 3600 seconds (1 hour) to keep data fresh.

6. **Response**
   - Sends the fetched (or cached) products as a JSON response with HTTP status `200`.

7. **Error Handling**
   - Logs any errors with `logger.error`, including the error message and stack trace.
   - Returns HTTP status `500` with an error message in JSON format.

---

### Notes
- The function uses asynchronous operations with `async/await`.
- It expects `RedisClient`, `Product`, and `logger` to be properly initialized and imported.
- Caching significantly improves response time and reduces repeated database calls for the same data.


## 📥 Request Body Example (JSON)

```json
{}
```
