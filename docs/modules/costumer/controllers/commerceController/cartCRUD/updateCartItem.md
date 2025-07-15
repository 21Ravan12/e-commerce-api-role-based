# updateCartItem.md

This function handles updating a specific item in the authenticated user's shopping cart. It performs the update, logs the action for auditing, and sends an appropriate HTTP response.

---

## Function: `updateCartItem(req, res)`

### Input
- **Route parameter:** `itemId` — the identifier of the cart item to update.
- **Request body:** `updates` — an object containing fields to update (e.g., quantity, size, color).
- **Authenticated user:** obtained from `req.user._id`.

### Process
1. **Update cart item:**
   - Calls `User.updateCartItem(userId, itemId, updates)` which applies the changes to the user's cart in the database.
   - `result` contains the updated item details.

2. **Audit logging (success):**
   - Creates an audit log entry recording the cart update event with:
     - Event type: `'CART_UPDATE'`
     - User performing the action
     - Action: `'update'`
     - Source: `'api'`
     - Status: `'success'`
     - Client IP address (`req.ip`)
     - User-Agent string (truncated to 200 chars)
     - Metadata with updated item info (itemId, productId, quantity, size, color)

3. **Response:**
   - Returns HTTP status `200 OK` with the updated cart item data as JSON.

---

### Error Handling
- If any error occurs during the update:
  1. An audit log entry is created with:
     - Status: `'failure'`
     - Error message included in metadata.
  2. The error is logged internally with `logger.error`.
  3. Responds with HTTP status `500 Internal Server Error` and an error message in JSON.

---

### Summary
This function ensures that:
- Only the authenticated user's cart is modified.
- All cart update attempts (success or failure) are logged for security and traceability.
- Proper HTTP responses are sent reflecting the operation outcome.

## 📥 Request Body Example (JSON)

When updating a cart item, send a JSON object with any of the following optional fields to modify the item's details:

```json
{
  "quantity": 2,
  "size": "L",
  "color": "black"
}
