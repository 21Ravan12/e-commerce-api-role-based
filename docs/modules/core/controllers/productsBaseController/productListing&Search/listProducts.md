# listProducts.md

This method handles **product listing with advanced query support**, caching, filtering, and response shaping. It is designed to be **performant**, **flexible**, and **cache-aware**, serving paginated, sorted, and optionally trimmed product data.

---

## 🔧 Function: `listProducts(req, res)`

### Overview:
Responds to HTTP requests for listing products. It processes query parameters for pagination, sorting, field selection, and filtering, while also leveraging Redis for caching results to improve performance.

---

## 🛠️ Breakdown of Functionality

### 1. **Logging**
```js
logger.info(`List products request from IP: ${req.ip}`);
````

Logs the request origin for monitoring and audit purposes.

---

### 2. **Extract Query Parameters**

```js
const {
  page = 1,
  limit = 25,
  sort = '-createdAt',
  fields,
  populate = 'categories,brand',
  ...rawFilters
} = req.query;
```

* `page` and `limit`: control pagination.
* `sort`: supports multi-field sorting (e.g., `-createdAt,name`).
* `fields`: comma-separated list to select only specific product fields in response.
* `populate`: relations to include (e.g., categories, brand).
* `rawFilters`: additional query parameters (e.g., price range, tags) are used for filtering.

---

### 3. **Filter Preparation**

```js
const filter = {
  ...rawFilters,
  status: { $ne: 'archived' }
};
```

* Applies filters from the query.
* Excludes archived products by default.

---

### 4. **Sorting Logic**

```js
const sortObj = {};
sort.split(',').forEach(field => {
  const direction = field.startsWith('-') ? -1 : 1;
  const key = field.replace(/^-/, '');
  sortObj[key] = direction;
});
```

* Converts sort string into a MongoDB-compatible sort object.
* Example: `'name,-price'` → `{ name: 1, price: -1 }`.

---

### 5. **Redis Caching (Read)**

```js
const cacheKey = `products:list:${JSON.stringify(req.query)}`;
const cached = await RedisClient.get(cacheKey);
if (!cached) {
  return res.status(200).json(JSON.parse(cached));
}
```

* Tries to fetch a cached version of the response.
* Cache key is derived from the query parameters.
* *Bug Note:* Logic should be `if (cached) return res...`, current check is likely inverted.

---

### 6. **Database Query via Utility**

```js
const result = await listProducts({
  filter,
  sort: sortObj,
  page: Number(page),
  limit: Number(limit),
  populate,
  skip: (page - 1) * limit
});
```

* Delegates to a utility function (`listProducts`) to fetch results.
* Applies filters, sort, pagination, and population.

---

### 7. **Field Limiting (Projection)**

```js
if (fields) {
  const selected = fields.split(',');
  result.products = result.products.map(product => {
    const trimmed = {};
    selected.forEach(field => {
      if (product.hasOwnProperty(field)) {
        trimmed[field] = product[field];
      }
    });
    return trimmed;
  });
}
```

* If `fields` is provided, trims each product object to only those fields.
* Helps optimize response size and customize client data needs.

---

### 8. **Redis Caching (Write)**

```js
await RedisClient.set(cacheKey, JSON.stringify(result), 'EX', 600);
```

* Stores the final result in Redis.
* Cache expires after 600 seconds (10 minutes).

---

### 9. **Final Response**

```js
res.status(200).json(result);
```

* Sends the JSON response back to the client.

---

### 10. **Error Handling**

```js
catch (error) {
  logger.error(`List products error: ${error.message}`, { stack: error.stack });
  res.status(500).json({ error: error.message });
}
```

* Logs the error with stack trace.
* Responds with HTTP 500 and error message.

---

## 🧠 Summary

This controller method is a **robust and scalable** implementation for listing products with:

* Smart defaults,
* Flexible query parsing,
* Field-level response customization,
* Redis-based caching, and
* Safe error handling.


## 📥 Request Body Example (JSON)

This endpoint uses **query parameters** in the URL, so there is **no JSON body** required in the request.

Instead, send parameters like this in the URL:
```

GET /api/products?page=1\&limit=10\&sort=-createdAt\&fields=name,price\&populate=categories,brand

```

### 🔹 Supported Query Parameters

| Parameter   | Type     | Description                                                                 |
|-------------|----------|-----------------------------------------------------------------------------|
| `page`      | Number   | Page number for pagination (default: `1`)                                   |
| `limit`     | Number   | Number of products per page (default: `25`)                                 |
| `sort`      | String   | Sorting order, comma-separated. Use `-field` for descending (e.g., `-createdAt`) |
| `fields`    | String   | Comma-separated list of fields to return (e.g., `name,price,brand`)         |
| `populate`  | String   | Fields to populate (default: `categories,brand`)                            |
| `...filters`| Various  | Additional Mongo-style filters (e.g., `status=active`)                      |

🧠 **Note**: This is a `GET` request. Do **not** use a JSON body — instead, include filters and options in the query string.
```
