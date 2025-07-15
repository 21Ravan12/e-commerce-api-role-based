# getFeaturedArticles.md

This method handles the retrieval of featured articles for the client, providing controlled access and auditing each request.

---

## Function: `getFeaturedArticles(req, res)`

### Purpose
Fetches a list of featured articles, limited by a query parameter, and returns them in a JSON response. It also logs the request for audit and monitoring purposes.

---

### Flow Breakdown

1. **Logging Incoming Request**
   - Logs the incoming request along with the client IP address (`req.ip`) using a logger service for traceability.

2. **Query Parameter: `limit`**
   - Reads the `limit` parameter from the query string (`req.query.limit`).
   - Defaults to `5` if not provided.
   - Parses `limit` as an integer to control how many articles are fetched.

3. **Fetch Featured Articles**
   - Calls an asynchronous function `getFeaturedArticles(limit)` which retrieves the featured articles from the data source (database, cache, or external service).
   - This is assumed to return an array of article objects.

4. **Audit Logging**
   - Creates an audit log entry via `AuditLog.createLog()` with details:
     - `action`: Identifies the action as 'knowledge_base_get_featured'.
     - `performedBy`: The user ID if authenticated (`req.user?._id`).
     - `event`: Event type 'get_featured'.
     - `source`: Indicates the request source, here 'web'.
     - `ip`: Client IP address.
     - `userAgent`: User-Agent header from the request.
     - `details`: Includes the `limit` used.
   - This allows monitoring and tracking usage of the featured articles endpoint.

5. **Successful Response**
   - Sends a HTTP 200 status with JSON payload:
     - `data`: The array of featured articles.
     - `timestamp`: ISO string of the current server time to indicate freshness.

6. **Error Handling**
   - If any error occurs, it is caught and passed to a generic error handler method `this.handleError(res, error)`.
   - This handler is responsible for sending appropriate error responses and logging.

---

### Summary
This method provides a **secure, logged, and parameterized** way to serve featured articles while maintaining detailed audit logs for each request, enabling traceability and usage analysis.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it retrieves featured articles via a GET request with query parameters.

Example query parameters:

```json
{
  "limit": 5
}
````

* `limit` (optional): Number of featured articles to retrieve. Defaults to 5 if omitted.
