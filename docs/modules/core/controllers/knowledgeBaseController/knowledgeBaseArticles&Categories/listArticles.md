# listArticles.md

This method, `listArticles(req, res)`, is a controller action responsible for handling **HTTP requests to list knowledge base articles**. It supports pagination, filtering, sorting, logging, and auditing. Below is a breakdown of its functionality:

---

## 📥 Input: Query Parameters

The method supports the following query parameters:

- `page` *(default: 1)* — Current pagination page.
- `limit` *(default: 10)* — Number of articles per page.
- `status` *(default: 'draft')* — Filters articles by their publication status (`draft`, `published`, etc.).
- `sort` *(default: 'createdAt')* — Field by which to sort the results.
- `order` *(default: 'desc')* — Sorting order: descending (`desc`) or ascending (`asc`).
- `category` *(optional)* — Filters articles by their assigned category.

These parameters are parsed and sanitized before being passed to the service layer.

---

## ⚙️ Core Logic

1. **Log Request Origin**
   - Logs the incoming request’s IP for traceability using `logger.info`.

2. **Build Options Object**
   - Constructs the `options` object with properly typed values (e.g., `parseInt` for `page` and `limit`).
   - Dynamically builds the `sort` object using the provided field and order.
   - Includes optional filters like `status` and `category`.

   ```js
   const options = {
     page: parseInt(page),
     limit: parseInt(limit),
     sort: { [sort]: order === 'desc' ? -1 : 1 },
     status,
     category
   };

3. **Fetch Articles**

   * Calls the `listArticles(options)` service function to fetch filtered and sorted article data from the database.

4. **Audit Logging**

   * Uses `AuditLog.createLog()` to persist a record of the listing action for accountability and analytics.
   * Includes metadata such as:

     * Action name
     * Source (`web`)
     * IP address
     * User performing the action (`req.user?._id`)
     * User-Agent header
     * Pagination and category filters used

5. **Return Response**

   * Responds with:

     * `data`: array of articles
     * `pagination`: metadata (current `page`, `limit`, and `total` items returned)
     * `timestamp`: ISO-formatted server time

   Response is returned with HTTP `200 OK`.

---

## ❌ Error Handling

If any error is thrown during the process (e.g., database issues, invalid input), the `catch` block triggers:

```js
this.handleError(res, error);
```

This ensures consistent and centralized error responses.

---

## ✅ Summary

* Handles **GET** requests to list articles.
* Supports filtering, sorting, and pagination.
* Uses **audit logging** for traceability and compliance.
* Returns a structured response with metadata.
* Logs origin IP and device info.

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. All parameters are passed via **query string**.

However, here’s an example of how the query parameters might be structured conceptually as JSON (for reference or when using Postman in "Params" tab):

```json
{
  "page": 1,
  "limit": 10,
  "status": "published",
  "sort": "createdAt",
  "order": "desc",
  "category": "guides"
}
