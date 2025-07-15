# getPopularArticles.md

This method, `getPopularArticles`, handles an HTTP request to fetch a list of popular articles, providing both the data and detailed logging of the request and action.

---

## Functionality Overview

- **Purpose:** Retrieve popular articles limited by a query parameter and respond with the results in JSON format.
- **Input:** 
  - `req.query.limit` (optional) — number of articles to return; defaults to 5 if not provided.
- **Output:** 
  - JSON response containing an array of popular articles and a timestamp.

---

## Step-by-Step Explanation

1. **Logging Request Start**  
   Logs the incoming request’s IP address using a `logger` service for traceability:  
   ```js
   logger.info(`Get popular articles request from IP: ${req.ip}`);

2. **Parse Query Parameter**
   Extracts `limit` from the query string, defaults to 5, and parses it as an integer:

   ```js
   const { limit = 5 } = req.query;
   ```

3. **Fetch Articles**
   Calls an external service or helper function `getPopularArticles(limit)` that returns a list of popular articles based on the specified limit.

4. **Audit Logging**
   Creates an audit log entry recording the action performed, including:

   * Action type: `'knowledge_base_get_popular'`
   * Event: `'get_popular'`
   * Request source: `'web'`
   * User who performed the action (if authenticated)
   * IP address and User-Agent header

   This supports security and operational monitoring.

   ```js
   await AuditLog.createLog({
     action: 'knowledge_base_get_popular',
     event: 'get_popular',
     source: 'web',
     performedBy: req.user?._id,
     ip: req.ip,
     userAgent: req.get('User-Agent'),
     details: { limit }
   });
   ```

5. **Response**
   Sends back a successful HTTP 200 response with:

   * `data`: the array of popular articles
   * `timestamp`: current ISO date-time string for client reference

   ```js
   res.status(200).json({
     data: articles,
     timestamp: new Date().toISOString()
   });
   ```

6. **Error Handling**
   If any step throws an error, it is caught and passed to a generic error handler method (`this.handleError`), which presumably sends an appropriate error response.

---

## Summary

`getPopularArticles` is a robust controller method that:

* Parses user input safely,
* Fetches popular content,
* Logs audit and access information for security,
* Responds with clean JSON data,
* Handles errors gracefully.

````md
## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body.
Instead, it accepts an optional **query parameter**:

```http
GET /api/knowledge-base/popular?limit=5
````

You can modify the `limit` value to control how many popular articles are returned. If omitted, the default is `5`.

✅ Example:

```json
// No body required
```