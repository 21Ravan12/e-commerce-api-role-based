# reorderProductMedia.md

This function handles **reordering the media items** (images/videos) associated with a product. It is designed as an Express route handler that processes a reorder request securely and logs the action.

---

## Function: `async reorderProductMedia(req, res)`

### Purpose
- Reorders the media items of a specific product based on a new sequence provided by the client.
- Ensures proper authorization and validation.
- Logs the reorder action for audit purposes.

---

### Workflow

1. **Logging the Request**
   - Logs an info message including the product ID and client IP to track reorder attempts.

2. **Extract Input**
   - Reads `mediaIds` from `req.body`.
   - `mediaIds` is expected to be an array containing the IDs of media items in the new desired order.

3. **Perform Reorder**
   - Calls `Product.reorderProductMedia(productId, mediaIds, user)` method:
     - `productId` from `req.params.id`.
     - `mediaIds` array.
     - `req.user` representing the authenticated user making the request.
   - This method performs the actual reorder logic (not shown here) and returns the updated product info.

4. **Audit Logging**
   - After successful reorder, creates an audit log entry via `AuditLog.createLog` with:
     - Action type (`update`)
     - Target entity (`product`) and its ID
     - User performing the action (`userId`)
     - Request IP and user agent string
     - Event identifier (`product_media_reordered`)
     - Metadata describing the action (`media_reorder`)
   - This ensures changes are traceable for security and compliance.

5. **Respond to Client**
   - Returns HTTP 200 status with the reorder result in JSON.

---

### Error Handling

- Logs error details including stack trace for debugging.
- Determines HTTP status code based on error message:
  - `403 Forbidden` if user is unauthorized.
  - `400 Bad Request` if `mediaIds` is missing or invalid.
  - `404 Not Found` if the product does not exist.
  - `500 Internal Server Error` for all other unexpected errors.
- Responds with JSON containing the error message.

---

### Summary

This route controller:
- Validates and delegates the reorder operation to the product model.
- Provides clear audit trail entries for administrative oversight.
- Implements robust error handling with informative client responses.
- Maintains security by verifying the requesting user's permissions.

## 📥 Request Body Example (JSON)

```json
{
  "mediaIds": [
    "60f7a9b2e1d2c12d4c8b4567",
    "60f7a9b2e1d2c12d4c8b4568",
    "60f7a9b2e1d2c12d4c8b4569"
  ]
}
