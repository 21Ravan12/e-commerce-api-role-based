# searchArticles.md

This file documents the `searchArticles` method, which is responsible for handling **search requests for knowledge base articles** via an HTTP API endpoint.

---

## 📥 Request Parameters

The method expects the following query parameters from the client (`req.query`):

- **`q` (required)**: The search term (minimum 3 characters).
- **`page` (optional)**: The page number for pagination (default: `1`).
- **`limit` (optional)**: The number of results per page (default: `10`).
- **`category` (optional)**: Filters search results by category if provided.

---

## 🔍 Core Logic

### 1. **Logging the Request Source**
```js
logger.info(`Search articles request from IP: ${req.ip}`);
````

Logs the origin IP address for traceability.

### 2. **Query Validation**

```js
if (!query || query.trim().length < 3) {
  throw new Error('Search query must be at least 3 characters long');
}
```

Prevents meaningless or malformed searches.

### 3. **Search Execution**

```js
const results = await searchArticles({ query, page, limit, category });
```

Delegates the actual search logic to a `searchArticles()` service, passing sanitized and parsed parameters.

---

## 📝 Audit Logging

### Logs User Search Activity

After performing the search, a structured log entry is written using `AuditLog.createLog()`:

* `action`: Identifies the high-level operation (`knowledge_base_search`)
* `event`: Specifies the event type (`search_articles`)
* `source`: The origin (e.g., `'web'`)
* `performedBy`: The authenticated user's ID (if available)
* `ip`: The user's IP address
* `userAgent`: The client’s user agent string
* `details`: Includes search query and result count

This enables traceable insights into user behavior and supports monitoring/search analytics.

---

## 📤 Response Format

If the search is successful, a `200 OK` response is returned in the following JSON structure:

```json
{
  "query": "example search",
  "results": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 7
  },
  "timestamp": "2025-06-25T18:45:32.103Z"
}
```

---

## ❌ Error Handling

If any step fails (validation, internal error, service failure), the error is caught and passed to a shared handler:

```js
this.handleError(res, error);
```

This ensures consistent and clean API error responses.

---

## ✅ Summary

* Validates input and enforces minimum query length
* Uses pagination for scalable results
* Filters by category if needed
* Delegates searching logic to a service layer
* Tracks user behavior with detailed audit logs
* Returns structured, timestamped responses

## 📥 Request Body Example (JSON)

> **Note**: This endpoint uses **query parameters**, not a JSON body. However, when using Postman, you should configure these as **Query Params** in the request URL section.


### Query Parameters:
| Key       | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| `q`       | string | ✅ Yes   | Search term (minimum 3 characters)             |
| `page`    | number | ❌ No    | Page number for pagination (default: 1)        |
| `limit`   | number | ❌ No    | Results per page (default: 10)                 |
| `category`| string | ❌ No    | Filter by article category (optional)          |

### Example Usage in Postman:
- **Method**: `GET`
- **Query Params**:
  - `q`: `react`
  - `page`: `1`
  - `limit`: `10`
  - `category`: `frontend`
