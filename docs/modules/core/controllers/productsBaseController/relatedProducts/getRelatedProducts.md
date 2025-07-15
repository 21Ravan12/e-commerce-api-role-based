# getRelatedProducts.md

This file documents the `getRelatedProducts` controller method, which handles HTTP requests to retrieve a list of related products based on a given product ID.

---

## 🔧 Function Signature

```js
async getRelatedProducts(req, res)
````

This is an asynchronous Express route handler designed to return related product data in response to a client request.

---

## 📥 Input Parameters

* **`req.params.productId`**:
  The unique identifier of the product for which related items should be found. It is extracted from the URL path (e.g., `/products/:productId/related`).

* **`req.query.limit`** (optional):
  Determines how many related products to return. Defaults to `5` if not provided.

---

## ⚙️ Core Logic

1. **Logging**:

   ```js
   logger.info(`Related products request for ID: ${req.params.productId} from IP: ${req.ip}`);
   ```

   Logs the incoming request for tracing and monitoring purposes, including the target product ID and requester’s IP address.

2. **Parameter Parsing**:

   ```js
   const productId = req.params.productId;
   const { limit = 5 } = req.query;
   ```

   Extracts `productId` and query param `limit`, converting the limit to an integer using `parseInt`.

3. **Business Logic Call**:

   ```js
   const relatedProducts = await Product.getRelatedProducts(productId, { limit: parseInt(limit) });
   ```

   Delegates the task to the `Product.getRelatedProducts` method — this likely uses similarity logic (e.g., category, tags, purchase patterns) to fetch matching products.

4. **Success Response**:

   ```js
   res.status(200).json(relatedProducts);
   ```

   Sends the list of related products as a JSON response with HTTP status `200 OK`.

---

## ❌ Error Handling

* If an error occurs, it's logged:

  ```js
  logger.error(`Related products error: ${error.message}`, { stack: error.stack });
  ```
* An appropriate HTTP status code is determined:

  * `404` if the error message contains `'not found'`
  * Otherwise, fallback to `500` for internal server errors
* A JSON error response is sent back to the client:

  ```js
  res.status(statusCode).json({ error: error.message });
  ```

---

## 🧪 Example Usage

**Request:**

```
GET /products/abc123/related?limit=3
```

**Response:**

```json
[
  { "id": "xyz001", "name": "Similar Product A", ... },
  { "id": "xyz002", "name": "Similar Product B", ... },
  { "id": "xyz003", "name": "Similar Product C", ... }
]
```

---

## 📦 Dependencies

* **`Product.getRelatedProducts(productId, options)`**:
  Business logic method responsible for determining which products are "related".

* **`logger`**:
  A custom logging utility for error/info tracking.

---

## ✅ Summary

`getRelatedProducts` is a robust controller function that:

* Accepts a product ID and optional `limit`,
* Retrieves related product data via a model method,
* Handles logging and graceful error reporting.


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. It accepts parameters via the URL path and query string only.

---

### Parameters

| Parameter   | Location | Type   | Required | Description                                                             |
| ----------- | -------- | ------ | -------- | ----------------------------------------------------------------------- |
| `productId` | Path     | String | Yes      | The ID of the product to find related products for.                     |
| `limit`     | Query    | Number | No       | Optional. Limits the number of related products returned. Default is 5. |

---

### Example Request

```
GET /products/1234567890abcdef/related?limit=5
```

*No JSON body is required or expected.*
