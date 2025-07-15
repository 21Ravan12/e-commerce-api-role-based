# getWishlist.md

This function handles the **retrieval of the authenticated user’s wishlist items** and logs the access event for auditing purposes.

---

## Function: `getWishlist(req, res)`

### Purpose
Fetches the wishlist items for the currently authenticated user and returns them in the response JSON. Additionally, it records an audit log entry both for successful accesses and failures.

### Step-by-step explanation

1. **Retrieve User ID**
   - Extracts `userId` from `req.user._id` assuming authentication middleware populated `req.user`.

2. **Prepare Data Object**
   - Creates a `data` object containing the user ID, which is passed to the data layer method.

3. **Fetch Wishlist Items**
   - Calls `User.getWishlistItems(userId, data)` to asynchronously get the user's wishlist.
   - Assumes `User` model has this static method which returns an array of wishlist items.

4. **Audit Logging (Success)**
   - Uses `AuditLog.createLog` to record an audit event of type `'WISHLIST_ACCESS'`.
   - Logs include:
     - Event name, user ID, action type (`read`), source (`api`), and status (`success`).
     - Client IP address (`req.ip`) and truncated user-agent string (max 200 chars).
     - Metadata includes the count of items retrieved (`itemCount`).

5. **Respond with Wishlist**
   - Sends HTTP 200 with a JSON body containing the `items` array.

---

### Error Handling

- In case of any error during the process:
  - Creates a failure audit log with the same event details but with status `'failure'`.
  - Includes the error message in the metadata.
  - Logs the error message to a logger service.
  - Sends HTTP 500 response with a generic error message.

---

### Summary

- Ensures secure, audited access to the user's wishlist.
- Maintains transparency by logging both successful and failed attempts.
- Provides a clear JSON response with the wishlist items on success.

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body.

The authenticated user’s wishlist is fetched using their token-derived user ID. Ensure the request includes a valid `Authorization` header (Bearer token).
