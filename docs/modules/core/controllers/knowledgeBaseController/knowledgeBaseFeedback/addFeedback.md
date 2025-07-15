# addFeedback.md

This method `addFeedback` handles adding user feedback (comments and helpfulness rating) to a specific article identified by its ID.

---

## Function Overview

### Purpose
- Receives feedback data from the client for a given article.
- Validates the request and article ID.
- Stores the feedback in the database.
- Logs the feedback action for auditing.
- Returns a success or failure response.

---

## Step-by-step Explanation

1. **Logging the Request**
   - Logs an informational message including the article ID and the client IP address.

2. **Article ID Validation**
   - Checks if the provided article ID (`req.params.id`) is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.
   - Throws an error if invalid.

3. **Content-Type Validation**
   - Ensures the incoming request has `Content-Type: application/json`.
   - Throws an error if the content type does not match.

4. **Extracting Feedback Data**
   - Destructures `comment` and `isHelpful` fields from the JSON body of the request.

5. **Adding Feedback**
   - Calls an external `addFeedback` function, passing:
     - Article ID.
     - Feedback details: comment, helpfulness flag, and IP address.
     - The authenticated user's ID if available (`req.user?._id`).
   - Waits for the feedback creation result.

6. **Audit Logging**
   - Creates an audit log entry recording:
     - The action name (`knowledge_base_add_feedback`).
     - The event (`add_feedback`).
     - The source (`web`).
     - The article ID targeted.
     - The performing user ID.
     - IP address and User-Agent header for traceability.

7. **Response**
   - Sends HTTP 201 Created with JSON containing:
     - A message indicating success or error with feedback.
     - The newly created feedback's ID.
     - A timestamp of the response.

8. **Error Handling**
   - Any errors during processing are caught and handled by `this.handleError(res, error)`, which sends an appropriate error response.

---

## Summary

This method ensures secure, validated, and auditable addition of feedback to articles, supporting traceability and consistent API behavior for clients submitting feedback.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it retrieves feedback based on the article ID provided in the URL path parameter.

Example:

_No request body needed_
