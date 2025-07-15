# searchProducts.md

This file documents the `searchProducts` controller method, responsible for handling **product search requests** with filtering, pagination, sorting, and caching capabilities. The method aims to deliver fast, flexible, and efficient querying for e-commerce product listings.

---

## 📥 Request Parameters (`req.query`)
The method supports a wide range of query parameters:

- `q` (required): The main **search term** (string).
- `page`: Pagination page (default = 1).
- `limit`: Number of items per page (default = 25).
- `sort`: Sort order (default = `-createdAt` for newest first).
- `minPrice` / `maxPrice`: Optional price range filters.
- `category`: Filter by product category.
- `brand`: Filter by brand name.
- `...otherFilters`: Captures any additional custom filters dynamically.

If the `q` (query) parameter is missing, a `400 Bad Request` is returned.

---

## 🧠 Caching with Redis

To reduce DB load and speed up repeated queries:

- A **unique cache key** is generated using `JSON.stringify(req.query)`.
- Redis is checked for cached results using `RedisClient.get(cacheKey)`.
- If found, the cached JSON is parsed and returned immediately.
- Otherwise, the request proceeds and results are **cached for 10 minutes** (`EX`, 600s) using `RedisClient.set`.

---

## 🔍 Filter Construction

Filters are dynamically built to support flexible querying:

- **Price Range**:
  - Adds MongoDB query operators `$gte` and `$lte` to a `price` object if `minPrice` or `maxPrice` are present.
- **Category & Brand**:
  - Matches documents where `categories` or `brand` field equals the specified values.
- **Additional Filters**:
  - Any extra query params (from `...otherFilters`) are automatically included.

---

## ⚙️ Options Setup

Pagination and sorting are configured using:

```js
const options = {
  page: parseInt(page),
  limit: parseInt(limit),
  sort
};
````

These options are passed to a reusable utility method for execution.

---

## 🔁 Reusable Search Execution

Search is delegated to a utility function:

```js
const result = await searchProductsUtil(Product, query, filters, options);
```

* This likely performs full-text search or keyword matching on the `Product` model while applying the given filters and options.

---

## ✅ Successful Response Format

Returned JSON follows a structured schema:

```json
{
  "products": [...],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 147,
    "pages": 6
  }
}
```

This metadata helps frontends render pagination controls and understand the result range.

---

## ❌ Error Handling

* All exceptions are logged using a custom `logger`.
* Any internal server errors return a `500` with the error message for debugging.

---

## 📌 Logging

* Logs the requester’s IP at the beginning for tracing and analytics:

  ```js
  logger.info(`Product search request from IP: ${req.ip}`);
  ```
* Errors include full stack traces in the logs for deeper diagnosis:

  ```js
  logger.error(`Product search error: ${error.message}`, { stack: error.stack });
  ```

---

## Summary

The `searchProducts` method is a **high-performance, user-friendly product search handler** with:

* Full-text query + dynamic filters
* Intelligent pagination/sorting
* Redis-based caching
* Robust error logging
* Easily extensible structure


## 📥 Request Body Example (JSON)

> This endpoint uses **query parameters**, not a JSON body.  
> However, here is an example of how you'd structure the request **parameters** in a tool like Postman using the "Params" tab:

```

GET /api/products/search

Query Params:

* q: "wireless headphones"          // Required - search keyword
* page: 2                           // Optional - pagination (default: 1)
* limit: 10                         // Optional - items per page (default: 25)
* sort: "price"                     // Optional - sort field, e.g., "price", "-createdAt"
* minPrice: 50                      // Optional - minimum price filter
* maxPrice: 300                     // Optional - maximum price filter
* category: "electronics"           // Optional - filter by category slug or ID
* brand: "sony"                     // Optional - filter by brand
* color: "black"                    // Optional - any additional dynamic filters

```

📝 **Note:** This API supports additional dynamic filters through query parameters beyond `category` and `brand`, like `color`, `size`, etc., which will be passed into the `otherFilters` object.
