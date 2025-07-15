# getMostHelpful.md

This function `getMostHelpful` handles HTTP requests to retrieve the most helpful knowledge base articles within a specified timeframe.

---

## Function Purpose
- Fetches a list of the most helpful articles based on user feedback or metrics.
- Supports optional query parameters to limit the number of results and filter by recency.

---

## Parameters
- **Request (`req`)**:
  - `req.query.limit` (optional): Number of articles to return (default is 5).
  - `req.query.days` (optional): Time window in days to consider (default is 10).
  - `req.ip`: Client IP address for logging.
  - `req.user?._id`: Optional authenticated user ID performing the request.
  - `req.get('User-Agent')`: Client user-agent string.

- **Response (`res`)**:
  - Sends a JSON response with the fetched articles or error.

---

## Workflow

1. **Logging Request Start**  
   Logs the incoming request with the client's IP using a `logger` service.

2. **Parse Query Parameters**  
   Extracts `limit` and `days` from the query string, applying defaults if missing. Converts them to integers to ensure correct data types.

3. **Fetch Articles**  
   Calls an asynchronous `getMostHelpful(limit, days)` function (assumed to be defined elsewhere) that returns the most helpful articles filtered by the number and timeframe.

4. **Audit Logging**  
   Records an audit log entry for the action `"knowledge_base_get_helpful"` with metadata including:
   - The user ID (if authenticated),
   - The event name,
   - Source (`web`),
   - Client IP and User-Agent,
   - Request details such as the limit parameter.

5. **Send Success Response**  
   Returns HTTP status 200 with a JSON object containing:
   - `data`: The array of most helpful articles,
   - `timestamp`: Current ISO timestamp of the response.

6. **Error Handling**  
   If any step fails, calls `this.handleError(res, error)` to send an appropriate error response.

---

## Summary
`getMostHelpful` is a robust controller method that:
- Provides paginated and time-filtered access to helpful articles,
- Tracks user actions for audit purposes,
- Logs requests for monitoring,
- Handles errors gracefully.


## 📥 Request Body Example (JSON)

This endpoint uses **query parameters**, not a JSON request body. Therefore, the body should be left empty. Example request using query string:

```

GET /api/knowledge-base/helpful?limit=5\&days=10

```

If you're using Postman, leave the **Body** tab empty and configure the parameters under the **Params** tab like so:

| Key   | Value | Description                           |
|--------|--------|---------------------------------------|
| limit | 5      | (Optional) Number of articles to fetch |
| days  | 10     | (Optional) Lookback period in days     |
