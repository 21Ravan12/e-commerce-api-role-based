# removeFromCart.md

This method handles the **removal of a single item from a user's cart** in an e-commerce or shopping application. It ensures data consistency, secure access, and proper auditing.

---

## 🔧 Method: `removeFromCart(req, res)`

### 📥 Inputs
- **`req.params.itemId`**: The cart item ID to be removed.
- **`req.user._id`**: The authenticated user’s ID (injected by auth middleware).
- **`req.ip`**: IP address of the request (used for auditing).
- **`req.get('User-Agent')`**: Captures client information (browser/device), limited to 200 characters.

---

## 🔄 Core Logic

### `const result = await User.removeFromCart(userId, itemId);`
- Calls a custom static method (`User.removeFromCart`) to:
  - Locate the user’s cart.
  - Find and remove the item matching `itemId`.
  - Return the details of the removed item (e.g., `productId`, `quantity`).

---

## 🛡️ Audit Logging

### ✅ On Success
If item removal succeeds, it logs the operation to `AuditLog`:

- **`event`**: `'CART_REMOVE'` – identifies the type of action.
- **`action`**: `'delete'` – CRUD operation type.
- **`status`**: `'success'`
- **`metadata`**: Stores context-specific info:
  - `itemId`
  - `productId`: ID of the product removed
  - `quantity`: Number of units removed

### ❌ On Failure
If an error occurs:
- Logs the failure in `AuditLog` with:
  - Same structure, but `status: 'failure'`
  - Captures the error message in `metadata.error`.

---

## 📤 Output

- **On success**:  
  - Returns `200 OK` with `result` (i.e., details of the removed item).
- **On failure**:
  - Logs the error.
  - Returns `500 Internal Server Error` with the error message in JSON.

---

## 📝 Example Response

### Success (`200 OK`)
```json
{
  "message": "Item removed",
  "itemDetails": {
    "itemId": "abc123",
    "productId": "p98765",
    "quantity": 2
  }
}
````

### Failure (`500`)

```json
{
  "error": "Item not found in cart"
}
```

---

## 🧱 Dependencies

* `User.removeFromCart`: User model static method that handles actual DB update.
* `AuditLog.createLog`: Custom service for recording audit trails.
* `logger.error`: Logs internal server-side errors (e.g., to file or console).

---

## 🛡️ Security

* Requires authentication (`req.user._id` is assumed to be verified).
* Prevents manipulation by ensuring only the owner of the cart can modify it.

---

## ✅ Summary

This function provides a **secure**, **audited**, and **modular** way to remove items from a user's cart. It ensures transparency through detailed logs and proper error handling while maintaining a clean separation of concerns.

## 📥 Request Body Example (JSON)

_No request body is required for this endpoint._

This operation uses the `itemId` from the **URL path parameter** and the authenticated user's ID from the JWT token/session. Ensure the user is logged in and the `Authorization` header is correctly set.
