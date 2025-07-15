# fetchCategory.md

This document explains the logic behind the `fetchCategory` controller method, which is used to retrieve a category by its ID. It includes input validation, dynamic query handling, and structured error responses.

---

## 📥 Input & Request Handling

```js
logger.info(`Fetch category request for ID: ${req.params.id} from IP: ${req.ip}`);
````

* Logs the incoming request for traceability, capturing both the requested category ID and the IP address of the client.

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid category ID');
}
```

* Verifies whether the provided `id` in the route parameters is a valid MongoDB ObjectId.
* Throws an error early to prevent unnecessary database operations if the input is malformed.

---

## 📦 Category Fetching Logic

```js
const categoryData = await Category.fetchCategory(req.params.id, {
  admin: req.query.admin === 'true',
  includeChildren: req.query.include === 'children'
});
```

* Calls a **static method** `fetchCategory` on the `Category` model.
* Passes two optional flags based on query parameters:

  * `admin`: Enables access to additional details if the request is from an admin user.
  * `includeChildren`: If `true`, includes any nested/sub-categories.
* These flags allow flexible behavior based on frontend needs (e.g., admin dashboards vs. public views).

---

## ✅ Success Response

```js
res.status(200).json(categoryData);
```

* Returns the fetched category data with HTTP status `200 OK`.

---

## ❌ Error Handling

```js
logger.error(`Fetch category error: ${error.message}`, { stack: error.stack });
```

* Logs any errors with the message and full stack trace for debugging.

```js
const statusCode = error.message.includes('Invalid') ? 400 :
                   error.message.includes('not found') ? 404 : 500;
```

* Determines the response status code based on the error message:

  * `400 Bad Request`: Invalid ID format.
  * `404 Not Found`: Category doesn't exist.
  * `500 Internal Server Error`: All other unhandled errors.

```js
res.status(statusCode).json({ error: error.message });
```

* Sends a structured error response containing only the error message.

---

## 🔐 Summary

* **Validation**: Ensures safe and valid access to the database.
* **Dynamic Behavior**: Controlled with `admin` and `include` query params.
* **Security & Debugging**: Logs are detailed but safe; errors are user-friendly.
* **Use Case**: Suitable for both public category viewing and admin-level inspection.

---

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. All parameters are passed through the **URL path** and **query string**.

**Example URL:**
GET /categories/64f123abcde4567890123456?admin=true&include=children
| Parameter      | Location     | Type    | Required | Description                                                  |
|----------------|--------------|---------|----------|--------------------------------------------------------------|
| `id`           | Path (`:id`) | String  | ✅       | MongoDB ObjectId of the category to fetch                    |
| `admin`        | Query        | Boolean | ❌       | If `true`, returns admin-specific fields                     |
| `include`      | Query        | String  | ❌       | If `"children"`, includes child categories in the response   |

**Note:** Ensure that the `id` is a valid 24-character hex string.
