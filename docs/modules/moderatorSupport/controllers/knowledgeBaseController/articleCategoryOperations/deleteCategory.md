# deleteCategory.md

This function `deleteCategory` handles the deletion of a category by an authenticated user (typically a moderator). It performs validation, deletion, audit logging, and responds with success or failure information.

---

## Function Breakdown

### 1. Logging the Request
- Logs the incoming delete request with the category ID and requester’s IP for traceability:
  ```js
  logger.info(`Delete category request for ID: ${req.params.id} from IP: ${req.ip}`);

### 2. Validate Category ID

* Uses `mongoose.Types.ObjectId.isValid` to ensure the provided category ID in the URL parameter is a valid MongoDB ObjectId.
* Throws an error if invalid to prevent unnecessary DB queries or malicious input.

### 3. Extract Deletion Reason

* Reads an optional `reason` from the request body.
* Defaults to `'Deleted by moderator'` if no reason is provided.

### 4. Perform Deletion

* Calls an asynchronous helper function `deleteCategory(id, userId, reason)` which:

  * Deletes the category with the given ID.
  * Records which user performed the deletion.
  * Saves the reason for auditing.

### 5. Audit Logging

* After deletion, creates a detailed audit log entry capturing:

  * Action type: `'knowledge_base_delete_category'`
  * Event: `'delete_category'`
  * Source: `'moderator'`
  * Target model and ID (the deleted category)
  * User performing the action
  * IP address and user agent for security context
  * Additional details like reason and category name

### 6. Response to Client

* Returns HTTP 200 with JSON including:

  * A success or failure message based on the `result.success` flag.
  * The deleted category’s ID.
  * Current timestamp in ISO format.

### 7. Error Handling

* Catches all errors and delegates to `this.handleError(res, error)`, which presumably formats and sends an appropriate error response.

---

## Summary

This method ensures secure, validated, and auditable deletion of categories with clear communication back to the client and detailed logging for moderation and compliance purposes.

## 📥 Request Body Example (JSON)

```json
{
  "reason": "Outdated category, no longer relevant"
}
