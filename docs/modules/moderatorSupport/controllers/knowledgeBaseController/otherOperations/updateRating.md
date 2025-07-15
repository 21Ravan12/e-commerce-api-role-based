# updateRating.md

This function handles updating a specific rating resource with a new value, ensuring input validation, authorization, logging, and audit trail creation.

---

## Function: `updateRating(req, res)`

### Purpose
To update an existing rating identified by `ratingId` with a new numeric value submitted by an authenticated user.

---

### Step-by-step Explanation

1. **Logging Request Start**
   - Logs an informational message with the rating ID and the requester's IP address for traceability.

2. **Content-Type Validation**
   - Checks that the request's content type is JSON (`application/json`).
   - Throws an error if this condition is not met to ensure correct data format.

3. **Rating ID Validation**
   - Validates the `ratingId` parameter to ensure it is a valid MongoDB ObjectId.
   - Prevents malformed or malicious IDs from causing issues downstream.

4. **Rating Value Validation**
   - Extracts `value` from the request body.
   - Ensures the rating is an integer between 1 and 5 inclusive.
   - Throws an error if the rating value is outside this range.

5. **Perform Update**
   - Calls an asynchronous `updateRating` service method with:
     - The `Rating` model reference.
     - The target rating ID.
     - The updated data `{ value }`.
     - The ID of the authenticated user performing the update (`req.user._id`).
   - This likely performs authorization and updates the database.

6. **Audit Logging**
   - Creates an audit log entry recording the update event with:
     - Action type and event name.
     - Model and target rating ID.
     - User performing the action.
     - Request IP and User-Agent header.
     - Details including the new rating value.
   - This supports accountability and change tracking.

7. **Response**
   - Returns HTTP 200 status with a JSON payload confirming success.
   - Includes the updated rating's ID and current timestamp.

8. **Error Handling**
   - Catches any error during the process and forwards it to a centralized error handler method `handleError`.

---

### Summary
The `updateRating` function ensures robust validation and secure updating of rating data, accompanied by detailed logging and audit trail creation to maintain system integrity and user accountability.

## 📥 Request Body Example (JSON)

When making a `PATCH` or `PUT` request to update a rating via the `/ratings/:ratingId` endpoint, the request body must be in `application/json` format and should include the new rating value.

Here is an example of a valid request body:

```json
{
  "value": 4
}
