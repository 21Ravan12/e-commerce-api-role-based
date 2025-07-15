# addRating.md

This function `addRating` handles adding a user rating to an article in a knowledge base system. It performs input validation, records the rating, logs the action for auditing, and responds appropriately.

---

## Function Breakdown

### 1. Logging Request Info
- Logs the incoming request with article ID and client IP for traceability.

### 2. Validate Article ID
- Uses Mongoose to check if `req.params.id` is a valid MongoDB ObjectId.
- Throws an error if invalid to prevent malformed database queries.

### 3. Validate Content-Type
- Checks that the request content type is `'application/json'`.
- Throws an error if the content type is incorrect, ensuring API consistency.

### 4. Extract and Validate Rating Value
- Extracts `value` from the JSON body.
- Ensures the rating is between 1 and 5 inclusive.
- Throws an error if the rating is out of range.

### 5. Add Rating to Database
- Calls an external `addRating` service/function passing:
  - The article ID (`req.params.id`)
  - The rating value
  - The authenticated user's ID (`req.user?._id`), if available

### 6. Audit Logging
- Records the action in an audit log for security and monitoring.
- Captures details like action type, event name, source (web), target article ID, user performing the action, IP address, user agent, and rating value.

### 7. Response Handling
- Sends back HTTP 201 Created on success.
- Response JSON includes:
  - A success or failure message.
  - The rating document ID.
  - A timestamp of the action.

### 8. Error Handling
- Any thrown errors are caught and delegated to `this.handleError(res, error)` to return an appropriate error response.

---

## Summary
This method ensures robust validation and auditability when users submit ratings, maintaining data integrity and security while providing meaningful responses to the client.


## 📥 Request Body Example (JSON)

```json
{
  "value": 4
}

* **value**: *integer* — The rating score to assign to the article, must be between 1 and 5 inclusive.