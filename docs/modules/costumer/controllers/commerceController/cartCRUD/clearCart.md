# clearCart.md

This method handles the **clearing of a user's shopping cart** and logs the action for auditing purposes. It is designed to be used in a secure, authenticated API environment where `req.user` is populated by authentication middleware.

---

## 📦 Function: `clearCart(req, res)`

### ✅ Success Flow

1. **Extract User ID**
   - `const userId = req.user._id;`
   - Assumes `req.user` is set (user is authenticated).
   
2. **Clear Cart via Model**
   - Calls a static method: `User.clearCart(userId)`
   - This method should remove all cart items associated with the user and return a result, including metadata (e.g., `{ itemsRemoved: 5 }`).

3. **Audit Logging**
   - Logs the operation in the `AuditLog` model for traceability and compliance.
   - Log includes:
     - `event`: `'CART_CLEAR'`
     - `user`: User ID
     - `action`: `'delete'`
     - `source`: `'api'`
     - `status`: `'success'`
     - `ip`: Client IP address
     - `userAgent`: Trimmed browser agent string (max 200 chars)
     - `metadata`: `{ itemsRemoved: result.itemsRemoved }`

4. **Return Response**
   - Sends a 200 OK response with the result of the cart-clearing operation.

---

### ❌ Error Handling

If an error occurs:

1. **Audit Failure Log**
   - Similar to success log, but:
     - `status`: `'failure'`
     - `metadata`: `{ error: error.message }`
     - Logs user ID if available (`req.user?._id`).

2. **Logging**
   - Outputs an error to the application logger: `logger.error(...)`.

3. **Send Error Response**
   - Responds with `500 Internal Server Error` and a JSON error message.

---

## 🔐 Assumptions & Dependencies

- `req.user` is available and authenticated.
- `User.clearCart(userId)` exists and performs cart deletion.
- `AuditLog.createLog(logData)` logs events for auditing purposes.
- `logger.error()` is a custom or third-party logger (e.g., Winston, Bunyan).
- `req.get('User-Agent')` is trimmed to avoid oversized input.

---

## 📝 Summary

The `clearCart` function is a **robust and auditable** endpoint that:
- Safely removes all items from a user’s cart.
- Records both successful and failed attempts in an audit log.
- Helps track client behavior (IP & user-agent) for compliance or debugging.

## 📥 Request Body Example (JSON)

This endpoint does **not require a request body**. It clears the authenticated user's cart based on the user ID extracted from the JWT token.

```json
{}
