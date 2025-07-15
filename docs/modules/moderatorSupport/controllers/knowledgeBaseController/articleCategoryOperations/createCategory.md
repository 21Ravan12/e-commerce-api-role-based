# createCategory.md

This function `createCategory` handles the creation of a new category in the system, ensuring proper validation, logging, and auditing.

---

## Workflow Explanation

### 1. Request Logging
- Logs the incoming request's IP address using `logger.info` for traceability.

### 2. Content-Type Validation
- Checks if the request's `Content-Type` header is `application/json`.
- Throws an error if the request is not JSON to enforce API contract.

### 3. Extracting Category Data
- Reads the category data from the request body (`req.body`).
- Adds the `createdBy` field using the authenticated user ID (`req.user._id`) to associate the category with its creator.

### 4. Category Creation
- Calls an asynchronous `createCategory` function (presumably a service or model method) with the prepared data.
- Awaits the result which includes success status and the newly created category ID.

### 5. Audit Logging
- Creates an audit log entry for the action using `AuditLog.createLog`.
- Logs details such as:
  - Action type (`knowledge_base_create_category`),
  - Event name (`create_category`),
  - Source (`moderator`),
  - Target model and ID (`Category`, new category's `_id`),
  - User performing the action (`req.user._id`),
  - Request IP and User-Agent,
  - Additional details like the category name.

### 6. Response
- Sends HTTP status `201 Created` on success.
- Returns a JSON payload with:
  - A success or failure message based on the result,
  - The created category's ID,
  - The current timestamp in ISO format.

### 7. Error Handling
- Catches any errors thrown during processing.
- Delegates error response handling to a helper method `this.handleError(res, error)`.

---

## Summary
- Ensures request format correctness.
- Creates a category tied to the authenticated user.
- Logs and audits the creation event comprehensively.
- Returns clear success/failure feedback with relevant metadata.

## 📥 Request Body Example (JSON)

When creating a new category, send a JSON payload with the necessary category details. Ensure the `Content-Type` header is set to `application/json`.

```json
{
  "name": "Productivity",
  "description": "Articles and guides related to boosting productivity",
  "parentCategoryId": "60f7b2c8d2a4e60017f2a6d9", // Optional: ID of the parent category
  "isVisible": true, // Optional: Visibility flag (default: true)
  "order": 1 // Optional: Display order
}
