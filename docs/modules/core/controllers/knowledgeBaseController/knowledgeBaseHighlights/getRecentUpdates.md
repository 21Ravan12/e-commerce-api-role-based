# getRecentUpdates.md

This method `getRecentUpdates` handles HTTP requests to fetch recent updates from a knowledge base or similar data source. It is designed to respond with a list of recent update entries based on query parameters, while also logging the request for auditing purposes.

---

## Function Signature
```js
async getRecentUpdates(req, res)
````

---

## Behavior Overview

1. **Logging Incoming Request:**

   * Logs the incoming request with the clients IP address for monitoring and debugging.

2. **Query Parameters:**

   * `limit` (optional, default = 5): Maximum number of update items to retrieve.
   * `days` (optional, default = 15): Time range in days to look back for recent updates.
   * Both parameters are parsed from the query string and converted to integers.

3. **Fetching Updates:**

   * Calls a helper function `getRecentUpdates(limit, days)` which queries the underlying data store to fetch the recent updates according to the parameters.
   * The helper is expected to return an array of update objects.

4. **Audit Logging:**

   * Creates an audit log entry with details about the action:

     * `action`: Identifier string (`knowledge_base_get_updates`).
     * `performedBy`: User ID performing the request (if authenticated).
     * `event`: The event type (`get_updates`).
     * `source`: Indicates request origin (`web`).
     * `ip`: Client IP address.
     * `userAgent`: Browser or client user agent string.
     * `details`: Additional metadata (in this case, the `limit` parameter).

5. **Response:**

   * Sends a 200 OK response with:

     * `data`: The array of recent updates.
     * `timestamp`: Current server time in ISO string format.

6. **Error Handling:**

   * If any error occurs during the process, it calls a method `handleError(res, error)` to send an appropriate error response.

---

## Summary

This method provides a **secure, auditable, and parameterized way** to fetch recent updates, ensuring that each request is logged with sufficient metadata and that client parameters are validated and parsed correctly before use.


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. It uses **query parameters** instead.

However, here is how the request might look when using Postman:

**GET /api/knowledge-base/updates?limit=10&days=30**

There is no JSON body to send. All parameters are passed via the URL.

**Query Parameters:**
```json
{
  "limit": 10,   // Optional - Number of updates to retrieve (default: 5)
  "days": 30     // Optional - Look back this many days (default: 15)
}
