# addToCart.md

This function `addToCart` handles adding a product to the authenticated user's shopping cart. It performs the operation, logs the event for auditing, and returns the updated cart info or an error response.

---

## Function Overview

### Input
- Extracts from `req.body`:
  - `productId`: ID of the product to add
  - `quantity`: Number of items to add
  - `size`, `color`: Optional product variants/details
- Retrieves `userId` from `req.user._id` (assumes user is authenticated and user info is injected into request)

### Core Logic
- Calls `User.addToCart(userId, productId, quantity, { size, color })` which:
  - Updates the user's cart in the database
  - Returns the updated cart information including product details and quantities

### Audit Logging
- On success:
  - Creates an audit log entry with event type `CART_ADD`
  - Logs user ID, action type (`create`), source (`api`), success status, IP address, truncated user agent string
  - Metadata includes product ID, product name, quantity, size, and color
- On failure:
  - Also logs the failed attempt with error message and product ID for traceability

### Response
- On success:
  - Sends HTTP 200 with the updated cart data in JSON format
- On failure:
  - Sends HTTP 500 with an error message JSON
  - Logs the error message for diagnostics

---

## Error Handling
- Catches any exceptions during cart update or logging
- Ensures failure events are auditable
- Provides informative error response to client

---

## Summary
This method tightly integrates cart updating and audit logging to maintain both user experience and system security/tracking. It assumes:
- User authentication middleware populates `req.user`
- `User.addToCart` handles DB logic and returns consistent product/cart data
- `AuditLog.createLog` records audit events asynchronously
- `logger` records server-side errors for monitoring

## 📥 Request Body Example (JSON)

```json
{
  "productId": "60f7b2f9e13e2c001e8d3b4a",
  "quantity": 2,
  "size": "M",
  "color": "black"
}
