# addToWishlist.md

This function implements the **"Add to Wishlist"** feature for authenticated users. It handles adding a specified product to the user's wishlist and logs the operation for auditing and debugging purposes.

---

## Function: `addToWishlist(req, res)`

### Purpose
- Adds a product, identified by `productId` from the request body, to the currently authenticated user's wishlist.
- Logs both successful and failed attempts in an audit log for traceability.

### Process Flow

1. **Extract Input Data**
   - Retrieves `productId` from `req.body`.
   - Retrieves the authenticated user's ID from `req.user._id`.

2. **Wishlist Update**
   - Calls the model method `User.addToWishlist(userId, productId)`.
   - This method is responsible for adding the product to the user's wishlist and returns detailed info about the updated wishlist and product.

3. **Audit Logging (Success)**
   - Creates a new audit log entry via `AuditLog.createLog` with:
     - `event`: 'WISHLIST_ADD'
     - `user`: current user ID
     - `action`: 'create'
     - `source`: 'api' (indicating API origin)
     - `status`: 'success'
     - `ip`: the IP address of the request
     - `userAgent`: truncated User-Agent header string (up to 200 chars)
     - `metadata`: includes `productId`, product name, and price from the result

4. **Response**
   - Sends HTTP 200 status with the updated wishlist data in JSON format.

5. **Error Handling**
   - Catches any error during the process.
   - Logs a failure audit record with similar metadata but status set to 'failure' and including the error message.
   - Logs the error message to a `logger` service.
   - Returns HTTP 500 status with error details in JSON.

---

## Summary

- Ensures **atomicity and traceability** of the "add to wishlist" operation.
- Relies on model-layer `User.addToWishlist` for business logic.
- Uses `AuditLog` for comprehensive event logging.
- Handles errors gracefully and reports them both in logs and API response.

## 📥 Request Body Example (JSON)

```json
{
  "productId": "64e8c9472f1b0f001f5aabcd"
}
