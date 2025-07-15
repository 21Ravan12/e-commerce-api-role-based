# getFeedback.md

This method, `getFeedback`, is an asynchronous Express.js controller action designed to retrieve user feedback for a specific article by its ID. It includes input validation, logging, and error handling.

---

## Step-by-step Explanation:

1. **Logging the request:**
   - Logs an informational message including the requested article ID (`req.params.id`) and the IP address of the requester (`req.ip`).

2. **Input validation:**
   - Checks if the provided `id` parameter is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.
   - Throws an error if the ID is invalid, preventing further processing.

3. **Fetching feedback:**
   - Calls an external asynchronous function `getFeedback` with the article ID to retrieve related feedback entries from the database.

4. **Audit logging:**
   - Creates an audit log entry via `AuditLog.createLog` with metadata:
     - `action`: Describes the operation performed.
     - `event`: Specific event type (`get_feedback`).
     - `source`: Request origin (here, `"web"`).
     - `targetId`: The article ID being queried.
     - `performedBy`: User ID making the request (if authenticated).
     - `ip`: Requester's IP address.
     - `userAgent`: User-Agent header string from the request.
     - `details`: Additional info, such as the count of feedback items retrieved.

5. **Sending response:**
   - Returns a JSON response with HTTP status 200 containing:
     - `articleId`: The requested article's ID.
     - `feedback`: Array of feedback objects.
     - `timestamp`: Current ISO timestamp of the response.

6. **Error handling:**
   - Any error during processing is caught and passed to `this.handleError(res, error)` to handle the response appropriately (e.g., sending error status and message).

---

## Summary

This method safely retrieves feedback for a given article, ensures valid input, records detailed audit logs for monitoring, and returns structured JSON data to the client, maintaining robust error handling throughout.


## 📥 Request Body Example (JSON)

This endpoint **does not require a request body**. All required data is passed through the URL path and headers.

```http
GET /api/knowledge-base/feedback/:id
````

### 🔐 Headers (if authenticated)

```json
{
  "Authorization": "Bearer <your_jwt_token>",
  "User-Agent": "PostmanRuntime/7.x.x"
}
```

### 📌 Path Parameter

| Parameter | Type   | Description                                         |
| --------- | ------ | --------------------------------------------------- |
| `id`      | String | The MongoDB ID of the article to fetch feedback for |
