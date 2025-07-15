# getProduct.md

This function `getProduct` is an Express.js controller method designed to **fetch product details by ID**, leveraging caching and error handling for efficient and reliable responses.

---

## Function Overview

### Purpose
- Retrieve a product by its unique MongoDB ObjectId.
- Support optional population of related data based on query parameters.
- Utilize Redis caching to minimize database hits and improve performance.
- Log key events and errors for monitoring and debugging.

---

## Detailed Explanation

### 1. Logging the Request
- Logs an info message including the requested product ID and the client's IP address:
  ```js
  logger.info(`Fetch product request for ID: ${req.params.id} from IP: ${req.ip}`);
````

### 2. ID Validation

* Validates the `req.params.id` to ensure it is a valid MongoDB ObjectId using:

  ```js
  mongoose.Types.ObjectId.isValid(req.params.id)
  ```
* Throws an error with message `'Invalid product ID'` if the ID is invalid, which results in a `400 Bad Request` response.

### 3. Cache Lookup

* Constructs a Redis cache key using the product ID:

  ```js
  const cacheKey = `product:${req.params.id}`;
  ```
* Attempts to retrieve cached product data with:

  ```js
  const cachedProduct = await RedisClient.get(cacheKey);
  ```
* If found, parses the cached JSON string and immediately returns the product with a `200 OK` status, bypassing the database.

### 4. Database Fetch

* If not cached, calls a model method `Product.getProduct` passing:

  * The product ID.
  * An options object with `populateRelated` set based on the query parameter `populateRelated=true`.
* This method fetches the product from the database, optionally populating related data (e.g., categories, reviews).

### 5. Caching the Result

* After retrieving the product, caches it in Redis with an expiration time of 3600 seconds (1 hour):

  ```js
  await RedisClient.set(cacheKey, JSON.stringify(product), 'EX', 3600);
  ```

### 6. Sending the Response

* Responds with the product JSON and HTTP status `200 OK`.

### 7. Error Handling

* Catches any errors during the process.
* Logs the error message and stack trace.
* Determines an appropriate HTTP status code:

  * `400` if the error message includes `'Invalid'`.
  * `404` if it includes `'not found'`.
  * Defaults to `500` for other errors.
* Sends a JSON response with the error message and the determined status code.

---

## Summary

This method ensures **efficient retrieval of product data** with validation, caching, and robust error handling, improving API responsiveness and reliability.

## 📥 Request Body Example (JSON)
This endpoint does **not require** a request body.
All necessary data is passed via the **URL parameter** (`:id`) and optional **query parameter** (`populateRelated`).

Example usage:
GET /api/products/60f7c8e2b4d3f02f887fa0d3?populateRelated=true


If you attempt to include a request body, it will be ignored.
