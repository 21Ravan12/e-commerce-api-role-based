# fetchCategories.md

This file documents the logic behind the `fetchCategories` controller method, which handles client requests to retrieve category data from the database. It supports flexible filtering, sorting, and pagination, and is designed to serve both admin and public-facing use cases.

---

## 📥 Function: `async fetchCategories(req, res)`

Handles HTTP GET requests for fetching categories.

---

## 🛡️ Logging

```js
logger.info(`Fetch all categories request from IP: ${req.ip}`);
````

* Logs each request's originating IP for auditing and security monitoring purposes.

---

## 📦 Category Fetch Logic

```js
const categoriesData = await Category.fetchCategories({...});
```

* Uses a **static method** `Category.fetchCategories()` which performs the actual data retrieval.
* Accepts a query configuration object based on `req.query` parameters from the incoming HTTP request.

---

## 🔍 Query Parameters Supported

| Parameter  | Type      | Description                                                                |
| ---------- | --------- | -------------------------------------------------------------------------- |
| `admin`    | `boolean` | Whether to apply admin-level filtering (e.g., include inactive or hidden). |
| `include`  | `string`  | If set to `'children'`, includes sub-categories or nested children.        |
| `page`     | `number`  | Page number for pagination.                                                |
| `limit`    | `number`  | Maximum number of categories per page.                                     |
| `status`   | `string`  | Filter by category status (e.g., active, inactive).                        |
| `type`     | `string`  | Filter by category type (e.g., product, service, blog).                    |
| `active`   | `boolean` | Filter only active categories.                                             |
| `upcoming` | `boolean` | Filter for categories marked as upcoming.                                  |
| `expired`  | `boolean` | Filter for expired or archived categories.                                 |
| `search`   | `string`  | Keyword search across category titles or descriptions.                     |
| `sort`     | `string`  | Sort order or field (e.g., `createdAt:desc`).                              |

---

## ✅ Successful Response

```js
res.status(200).json(categoriesData);
```

* Sends a JSON response containing the retrieved category data.
* Status code `200 OK` is returned on success.

---

## ❌ Error Handling

```js
logger.error(`Fetch all categories error: ${error.message}`, { stack: error.stack });
```

* Logs any unexpected server or logic errors along with stack trace.

```js
const statusCode = error.message.includes('not found') ? 404 : 500;
res.status(statusCode).json({ error: error.message });
```

* Responds with:

  * `404 Not Found` if error message includes `"not found"`.
  * `500 Internal Server Error` for all other cases.

---

## 🔒 Design Considerations

* **Flexible Querying**: Supports a wide range of filters, making it suitable for dashboards, search interfaces, and public category listings.
* **Safe Defaults**: All parameters are optional; logic for handling undefined values resides in the `Category.fetchCategories()` implementation.
* **Scalable Logging**: Uses a centralized logger service for consistent logging across the app.
* **Robust Error Management**: Differentiates between expected (e.g., "not found") and unexpected errors.

---

```md
## 📥 Request Body Example (JSON)

**Note:** This endpoint uses **query parameters**, not a JSON request body. You should send parameters in the URL like this:

```

GET /categories?admin=true\&include=children\&page=1\&limit=20\&status=active\&type=physical\&search=electronics\&sort=name

However, for documentation purposes, here's a conceptual JSON representation of the supported query parameters:

```json
{
  "admin": "true",              // Optional: Include admin-specific categories
  "include": "children",        // Optional: Include subcategories if set to 'children'
  "page": 1,                    // Optional: Page number for pagination
  "limit": 20,                  // Optional: Number of categories per page
  "status": "active",           // Optional: Filter by status ('active', 'inactive', etc.)
  "type": "physical",           // Optional: Filter by type ('physical', 'digital', etc.)
  "active": true,               // Optional: Return only currently active categories
  "upcoming": false,            // Optional: Filter upcoming categories
  "expired": false,             // Optional: Filter expired categories
  "search": "electronics",      // Optional: Keyword search
  "sort": "name"                // Optional: Sorting field (e.g., 'name', '-createdAt')
}

Send these as **query parameters** in Postman, not in the request body.
