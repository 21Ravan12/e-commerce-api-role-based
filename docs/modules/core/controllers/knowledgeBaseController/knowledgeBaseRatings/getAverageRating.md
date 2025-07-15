# getAverageRating.md

This function `getAverageRating` handles an HTTP request to fetch the average rating of a specific article by its ID. It performs validation, logging, auditing, and responds with the rating data.

---

## Function: `async getAverageRating(req, res)`

### Purpose
- Retrieves the average user rating for an article identified by `req.params.id`.
- Returns the result as a JSON response with success status and metadata.

### Step-by-step Explanation

1. **Logging the Request**
   - Logs an informational message including the requested article ID and the IP address of the client making the request.
   - Helps trace usage and identify request origins.

2. **Input Validation**
   - Checks if the provided `id` parameter is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.
   - Throws an error early if invalid to prevent unnecessary database queries.

3. **Fetching Average Rating**
   - Calls an external or imported `getAverageRating` function with the article ID.
   - This function is expected to return an object containing:
     - `success` (boolean)
     - `data` (the average rating value)
     - Possibly an `error` message if it failed.

4. **Audit Logging**
   - Creates a log entry via `AuditLog.createLog` to record the action for auditing purposes.
   - Captures:
     - The action type (`knowledge_base_get_rating`)
     - Event name (`get_rating`)
     - Source (`web`)
     - Target ID (article ID)
     - The user performing the action (`req.user?._id` if authenticated)
     - IP address and User-Agent string for additional context.

5. **Sending Response**
   - On success, responds with HTTP 200 status and JSON containing:
     - `message`: Either success confirmation or failure reason.
     - `averageRating`: The retrieved rating data.
     - `timestamp`: Current server time in ISO format.

6. **Error Handling**
   - Any error thrown during processing is caught by the `catch` block.
   - Invokes `this.handleError(res, error)` to send an appropriate error response (implementation not shown here).

---

## Summary

This method encapsulates robust handling for retrieving an article’s average rating by:
- Validating input,
- Logging access,
- Recording audit trails,
- Returning structured JSON responses,
- And handling errors gracefully.


## 📥 Request Body Example (JSON)

```json
{}
```
