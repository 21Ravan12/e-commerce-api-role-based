# removeFromWishlist.md

This function handles the **removal of a product from a user's wishlist** via an API endpoint. It performs the removal, logs the event for auditing, and returns the updated result or an error.

---

## Function: `removeFromWishlist(req, res)`

### Input
- **`req.params.productId`**: The ID of the product to remove from the wishlist.
- **`req.user._id`**: The authenticated user's ID, extracted from the request context.

### Workflow
1. **Remove product from wishlist**  
   Calls `User.removeFromWishlist(userId, productId)` which performs the actual removal in the database and returns the updated info, including product details.

2. **Audit Logging (Success)**  
   After successful removal, it creates a detailed audit log entry with:
   - `event`: `'WISHLIST_REMOVE'`
   - `user`: The user ID performing the action
   - `action`: `'delete'`
   - `source`: `'api'` (indicates the origin)
   - `status`: `'success'`
   - `ip`: IP address of the requester (`req.ip`)
   - `userAgent`: User-Agent header truncated to 200 chars for size control
   - `metadata`: Includes `productId`, `productName`, and `productPrice` from the result

3. **Response**  
   Sends HTTP 200 with the result JSON to the client.

### Error Handling
- If an error occurs during removal:
  - Creates a failure audit log with:
    - `status`: `'failure'`
    - `metadata`: Contains error message and `productId`
  - Logs the error message with `logger.error`.
  - Responds with HTTP 500 and an error JSON `{ error: <message> }`.

---

## Summary
This function ensures **robust handling** of wishlist removals, maintaining detailed **audit trails** for both successful and failed attempts, aiding in security and troubleshooting. It relies on proper authentication middleware to set `req.user._id` and expects `User.removeFromWishlist` and `AuditLog.createLog` to be implemented elsewhere.

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. The necessary data is provided through:

- **URL Parameter**: `productId` (ID of the product to remove from wishlist)
- **Authenticated User**: Extracted from the JWT or session (`req.user._id`)
