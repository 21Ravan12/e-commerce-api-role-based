# updateCategory.md

This method handles HTTP requests to update an existing category by its ID. It validates the request, performs the update, logs the action for auditing, and returns a JSON response.

---

## Function: `updateCategory(req, res)`

### Overview
- Processes a category update request.
- Ensures input validation and security.
- Records the update event for audit tracking.

### Detailed Explanation

1. **Logging Request Info**
   - Logs the incoming update request with category ID and client IP.
   - Useful for monitoring and debugging.

2. **Content-Type Validation**
   - Checks if the request's content type is `application/json`.
   - Throws an error if the request body format is invalid.

3. **Category ID Validation**
   - Uses `mongoose.Types.ObjectId.isValid()` to verify the category ID parameter is a valid MongoDB ObjectId.
   - Prevents invalid or malformed IDs from proceeding.

4. **Extract Update Data**
   - Reads the update payload from `req.body`.
   - This should contain the fields and values to modify on the category.

5. **Perform Update Operation**
   - Calls an external `updateCategory` function (assumed imported) with:
     - The category ID (`req.params.id`),
     - The update data (`updateData`),
     - The ID of the user making the request (`req.user._id`).
   - Expects a result object indicating success or failure.

6. **Audit Logging**
   - Creates a new audit log entry recording:
     - The action type (`knowledge_base_update_category`),
     - The event (`update_category`),
     - The source role (`moderator`),
     - The affected model and ID (`Category`, category ID),
     - The user performing the update,
     - Client IP and user-agent for traceability,
     - Details about which fields were updated.
   - This ensures changes are traceable and auditable.

7. **Response**
   - Sends a JSON response with HTTP 200 status:
     - A success or failure message based on the update result.
     - The category ID.
     - A timestamp of the response time.

8. **Error Handling**
   - Any error during the process is caught and passed to a generic error handler method `handleError`, which sends an appropriate error response.

---

### Summary

This method securely updates a category while ensuring:

- Proper validation of inputs.
- Detailed audit trail for moderation actions.
- Clear client feedback on operation status.

## 📥 Request Body Example (JSON)
```json
{
  "name": "Updated Category Name",
  "description": "A brief description of the updated category",
  "parentCategoryId": "60f6b2f5a3c9b4d5e7f12345",  // Optional: ID of a parent category if applicable
  "isActive": true,                                 // Optional: status of the category
  "metadata": {                                    // Optional: any additional metadata
    "customField1": "value1",
    "customField2": "value2"
  }
}
