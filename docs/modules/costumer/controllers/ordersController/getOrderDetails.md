# getOrderDetails.md

This function handles the retrieval of detailed information about a specific user order. It ensures secure access, formats the response for frontend consumption, and logs both successful and failed access attempts for auditing purposes.

---

## 🔧 Method Signature

```js
async getOrderDetails(req, res)
````

This is an Express route handler meant to be used in a protected endpoint (with authenticated users).

---

## 📥 Input

* `req.params.orderId`: ID of the order to fetch (from the URL path).
* `req.user._id`: The authenticated user's ID, injected by authentication middleware.
* `req.ip`: IP address of the requester, used for logging.
* `req.get('User-Agent')`: Browser/device information, used for auditing.

---

## 🔍 Logic Breakdown

### 1. **Extract Parameters**

```js
const { orderId } = req.params;
const userId = req.user._id;
```

* These values are needed to safely retrieve the order and ensure it belongs to the requesting user.

---

### 2. **Database Query**

```js
const order = await Order.getOrder(orderId, userId);
```

* Uses a **static method** `Order.getOrder` to retrieve the order while verifying the `userId`.
* Prevents users from accessing others' orders.

---

### 3. **Error Handling: Order Not Found**

```js
if (!order) {
  return res.status(404).json({ error: 'Order not found' });
}
```

* Sends a 404 response if no matching order is found for the current user.

---

### 4. **Format the Response**

```js
const formattedOrder = { ... };
```

* The order is structured to be frontend-friendly.
* Fields include:

  * Basic info: `_id`, `orderNumber`, `status`, timestamps
  * Payment: `paymentMethod`, `paymentStatus`, `subtotal`, `total`, etc.
  * Shipping: `shippingAddress`, `shippingMethod`, `estimatedDelivery`
  * Items:

    * Each item includes product metadata from `idProduct`, quantity, and prices at the time of purchase.
  * `history`: Optional, contains order status change logs or updates.

---

### 5. **Audit Log: Success**

```js
await AuditLog.createLog({ event: 'ORDER_DETAILS_ACCESS', status: 'success', ... });
```

* Records an audit entry upon successful retrieval.
* Captures key metadata:

  * `orderId`, `orderNumber`, `status`, `totalAmount`
  * Device and IP info
  * Action type (`read`), source (`api`)

---

### 6. **Send Success Response**

```js
res.status(200).json({
  order: formattedOrder,
  message: 'Order details retrieved successfully'
});
```

* Delivers the structured order data back to the client.

---

## ❌ Error Handling

If anything fails during execution (DB error, logic bug, etc.):

### 1. **Audit Log: Failure**

```js
await AuditLog.createLog({ status: 'failure', metadata: { error, stack } });
```

* Logs the error event with diagnostic details (stack trace in development mode only).

### 2. **Error Response**

```js
res.status(500).json({
  error: 'Failed to fetch order details',
  details: process.env.NODE_ENV === 'development' ? error.message : undefined
});
```

* Returns a generic message in production, with optional debug info in development.

---

## ✅ Summary

This method:

* Authenticates and authorizes access to user orders
* Formats a complete and consistent order object
* Maintains observability with structured audit logs
* Returns appropriate HTTP status codes (`200`, `404`, `500`)

---

## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it uses URL parameters and authentication context.

- **Path Parameter:**
  - `orderId` (string): The unique identifier of the order to retrieve.

- **Headers:**
  - `Authorization`: Bearer token with a valid user JWT.
  
Example request (no body):
