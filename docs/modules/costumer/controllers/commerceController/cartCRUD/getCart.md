# getCart.md

This file explains the logic behind the `getCart` controller function, which retrieves a user's cart data and logs the operation securely for auditing purposes.

---

## 📦 Purpose

The `getCart(req, res)` function is an **asynchronous Express.js controller** that:
- Retrieves the authenticated user's shopping cart from the database.
- Logs both successful and failed access attempts using the `AuditLog` system.
- Ensures security by checking user account status and handling errors gracefully.

---

## 🔐 Authentication & Authorization

```js
const userId = req.user._id;
````

* The route assumes the user is authenticated (middleware like `authenticate` has already populated `req.user`).
* The `userId` is extracted to query the user's cart.

### ❌ Suspension Check

```js
if (req.user.status === 'suspended') {
  return res.status(403).json({ error: 'Account suspended. Cannot access cart.' });
}
```

* If the user is suspended, cart access is blocked and a `403 Forbidden` response is returned.

---

## 🛒 Cart Retrieval

```js
const cartData = await User.getCartItems(userId, {
  populate: true,
  productFields: 'name price images stock'
});
```

* Calls a custom static method `User.getCartItems()` to fetch cart details.
* **Options**:

  * `populate: true`: Populates product details in the cart items.
  * `productFields`: Limits the populated product fields to `name`, `price`, `images`, and `stock` for efficiency.

---

## 🧾 Audit Logging (Success)

```js
await AuditLog.createLog({
  event: 'CART_ACCESS',
  user: userId,
  action: 'read',
  source: 'api',
  status: 'success',
  ...
});
```

* Logs the cart access event, including:

  * `itemCount`: Number of items in the cart.
  * `totalValue`: Total cost of items.
  * Detailed `products` array with product IDs, names, and quantities.
  * Metadata such as IP and User-Agent for traceability.

---

## ✅ Response

```js
res.status(200).json(cartData);
```

* Sends the cart data as a JSON response upon success.

---

## ❌ Error Handling

If an error occurs:

```js
await AuditLog.createLog({
  event: 'CART_ACCESS',
  user: req.user?._id,
  action: 'read',
  status: 'failure',
  ...
});
```

* A failure log is created with the error message captured in the metadata.
* The error is also logged using `logger.error()`.

```js
res.status(500).json({ error: 'Failed to fetch cart' });
```

* Returns a `500 Internal Server Error` with a generic message.

---

## 📋 Summary

| Feature               | Description                                   |
| --------------------- | --------------------------------------------- |
| Auth Required         | ✅ Yes (`req.user` is used)                    |
| Suspended Check       | ✅ Denies access with `403` if suspended       |
| Data Population       | ✅ Retrieves only selected fields from product |
| Success Audit Logging | ✅ Logs user, IP, cart details, user-agent     |
| Failure Audit Logging | ✅ Captures error message and logs the event   |
| Error Response        | ✅ Sends appropriate HTTP status and message   |

## 📥 Request Body Example (JSON)

> This endpoint **does not require a request body**.  
All necessary information (such as the user ID) is extracted from the **authenticated user's session/token**.

However, the request **must include** a valid authentication token (e.g., JWT) in the headers:

### 🔐 Required Headers:
```http
Authorization: Bearer <your_token_here>
