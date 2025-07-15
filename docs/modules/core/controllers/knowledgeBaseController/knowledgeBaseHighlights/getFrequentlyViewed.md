# getFrequentlyViewed.md

This function `getFrequentlyViewed` is an asynchronous controller method designed to handle HTTP requests for retrieving the most frequently viewed articles within a specified time frame.

---

## Function Workflow:

1. **Logging the Request:**
   - Logs the incoming request with the client's IP address for monitoring and debugging purposes using a `logger` service.

2. **Extracting Query Parameters:**
   - Reads `limit` and `days` from the request query parameters.
   - Defaults: `limit = 5` (maximum number of articles to fetch), `days = 30` (time window in days to consider).
   - Parses these parameters into integers to ensure proper typing.

3. **Fetching Data:**
   - Calls a helper function `getFrequentlyViewed(limit, days)` which queries the database or cache to return the most frequently viewed articles within the last `days`.
   - The function returns an array of article objects limited by `limit`.

4. **Audit Logging:**
   - Creates an audit log entry recording this retrieval action with details such as:
     - Action type: `'knowledge_base_get_frequent'`
     - User performing the action (`req.user?._id` if authenticated)
     - Event type: `'get_frequent'`
     - Source of request: `'web'`
     - IP address and user-agent string from the request headers
     - Parameters used (`limit` and `days`)
   - This supports security auditing and usage analytics.

5. **Sending Response:**
   - Responds with HTTP status `200 OK`.
   - Returns a JSON payload containing:
     - `data`: the list of frequently viewed articles.
     - `timestamp`: current server time in ISO format to indicate response time.

6. **Error Handling:**
   - If any error occurs during processing, it is passed to a shared `handleError` method which manages error responses gracefully.

---

## Summary:

- **Purpose:** Provide clients with the top frequently viewed knowledge base articles over a configurable recent period.
- **Input:** Query parameters `limit` and `days` (optional).
- **Output:** JSON response with article list and timestamp.
- **Side Effects:** Logs the action both in application logs and audit logs for traceability.


```md
## 📥 Request Body Example (JSON)

This endpoint **does not require a request body** since it fetches data based on query parameters.

---

### Query Parameters (optional)

| Parameter | Type   | Description                              | Default |
| --------- | ------ | -------------------------------------- | ------- |
| `limit`   | Number | Maximum number of frequently viewed articles to return | 5       |
| `days`    | Number | Time range in days to consider article views | 30      |

---

### Example Request URL

```

GET /api/articles/frequently-viewed?limit=10\&days=60

```

_No JSON body needed for this GET request._
