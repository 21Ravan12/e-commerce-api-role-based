# createOrder.md

This file explains the logic behind the `createOrder` controller method. This function handles the complete lifecycle of an e-commerce order: from validation, cart processing, stock checks, promotion handling, tax/shipping calculation, to payment processing and audit logging. It ensures robust error handling and user feedback throughout.

---

## 🧾 Step-by-Step Flow

### 1. **Extract User & Request Data**
```js
const userId = req.user._id;
const { shippingAddress, paymentMethod, shippingMethod, promotionCode } = req.body;
````

* Uses `req.user._id` from the authenticated session.
* Extracts required fields from the request body for processing.

---

### 2. **Validate Request Body**

```js
const { error } = createOrderSchema.validate(req.body);
```

* Uses Joi schema (`createOrderSchema`) to validate request structure.
* Returns `400 Bad Request` if validation fails, with error details by field.

---

### 3. **Load & Validate Cart**

```js
const cart = await User.getCartItems(userId, { commerce: 1 });
```

* Retrieves the user's cart, populating relevant product data.
* Aborts with a 400 response if cart is empty.

---

### 4. **Process Cart Items**

```js
const { orderItems, subtotal, outOfStockItems } = await Order.processCartItems(cart.items);
```

* Converts cart into a list of order items and calculates subtotal.
* Checks for stock availability.

> **Out-of-stock check:**
> If items are unavailable:

* Logs the attempt using `AuditLog.createLog`.
* Returns a 400 with a list of unavailable items.

---

### 5. **Shipping & Delivery Calculation**

```js
const shippingCost = await calculateShipping(shippingMethod);
const deliveryDate = calculateDeliveryDate(new Date(), shippingMethod);
```

* Calculates cost and estimated delivery date based on selected shipping method.

---

### 6. **Apply Promotion Code**

```js
const promotionResult = await Order.applyPromotionCode(...);
```

* Validates and applies a promo code (if provided).
* May update shipping cost or apply a discount.
* Returns 400 if the promotion is invalid or expired.

---

### 7. **Calculate Final Totals**

```js
const { tax, total } = await Order.calculateFinalTotals(...);
```

* Uses subtotal, discount, shipping cost, and location to compute:

  * Tax
  * Grand total

---

### 8. **Create and Process the Order**

```js
const { order, paymentResult } = await Order.createAndProcessOrder({...}, paymentMethod);
```

* Creates the order in DB and attempts payment.
* `paymentMethod` is used to decide payment processor.

---

### 9. **Finalize Order**

```js
await Order.finalizeOrder(...);
```

* Updates inventory, user data, and any post-payment tasks.
* Associates promotions or campaigns with the order.

---

### 10. **Audit Logging**

```js
await AuditLog.createLog({
    event: 'ORDER_CREATE',
    status: 'success',
    ...
});
```

* Records a full audit trail of the transaction:

  * IP address
  * Device info
  * Item list
  * Discounts
  * Transaction ID

> If the order fails (e.g., unexpected error), a `status: 'failure'` log is written with error details.

---

### 11. **Return Response**

```js
res.status(201).json({
    message: 'Order created successfully',
    order: { ... }
});
```

* Sends essential order details back to the client, including:

  * Order ID, status, total
  * Delivery estimate
  * Payment status
  * Applied discounts

---

## 🛑 Error Handling

All errors in the process are:

* Logged using the centralized `logger`
* Recorded via `AuditLog.createLog`
* Returned to the client as:

  * `400 Bad Request`: for client-side issues (invalid data, out-of-stock, promo errors)
  * `500 Internal Server Error`: for unexpected server-side failures

---

## ✅ Summary

The `createOrder` function:

* Ensures input validation and business rule enforcement.
* Integrates cart, inventory, promotions, shipping, taxes, and payments.
* Maintains full observability via audit logs and structured errors.
* Returns precise client feedback for better user experience.

## 📥 Request Body Example (JSON)

```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "phone": "+1-555-123-4567"
  },
  "paymentMethod": "credit_card",
  "shippingMethod": "express",
  "promotionCode": "WELCOME10"
}
