# cancelOrder.md

This method handles the **cancellation of a user’s order**, along with validation, ownership checks, optional refund logic, and detailed audit logging. It ensures that only valid, authorized cancellation requests are processed and that all key events (success or failure) are recorded for monitoring and compliance.

---

## 🔧 Function Signature

```js
async cancelOrder(req, res)
````

---

## 📝 Step-by-Step Breakdown

### 1. **Extract User & Order Info**

```js
const userId = req.user._id;
const orderId = req.params.id;
```

* `userId`: Retrieved from the authenticated session (`req.user._id`).
* `orderId`: Pulled from the URL route parameter.

---

### 2. **Order ID Validation**

```js
if (!mongoose.Types.ObjectId.isValid(orderId)) { ... }
```

* Ensures `orderId` is a valid MongoDB ObjectId.
* Returns `400 Bad Request` if invalid.

---

### 3. **Request Body Validation**

```js
const { error } = cancelOrderSchema.validate(req.body);
```

* Uses `cancelOrderSchema` (likely Joi or Yup) to validate required fields (like `cancellationReason`).
* Returns structured validation error messages for each failed field.

---

### 4. **Cancel the Order**

```js
order = await Order.cancelOrder(orderId, userId, req.body.cancellationReason);
```

* Delegates cancellation logic to the `Order` model (`cancelOrder` static method).
* This method should verify that:

  * The order exists.
  * The order belongs to the current user.
  * The order is eligible for cancellation.

#### ❗ Error Handling

If cancellation fails (e.g., not found, not allowed):

* An audit log is created: `USER_ORDER_UPDATE` with `status: failure`.
* Responds with `404 Not Found`.

---

### 5. **Attempt Refund (If Paid)**

```js
refundResult = await PaymentProcessor.refund(order);
```

* If the order was already paid, it attempts a refund using a `PaymentProcessor` service.
* Handles both success and failure:

  * Logs success: `PAYMENT_REFUND` with `status: success`.
  * Logs failure: `PAYMENT_REFUND` with `status: failure`.

---

### 6. **Create Audit Log for Cancellation**

```js
await AuditLog.createLog({ event: 'USER_ORDER_CANCELED', ... });
```

* Logs full metadata including:

  * `orderId`, cancellation reason, time
  * Whether a refund was processed
  * Device/user context (`IP`, `User-Agent`, etc.)

---

### 7. **Send Success Response**

```js
res.status(200).json({
    message: 'Order cancelled successfully',
    refundProcessed: !!refundResult,
    order: { ... }
});
```

* Includes:

  * Confirmation message
  * Refund status (`true`/`false`)
  * Updated order fields: status, reason, timestamps

---

### 8. **Final Error Handling (Catch-All)**

```js
catch (error) { ... }
```

* Logs unexpected failures to `AuditLog` with full request and error context.
* Responds with `500 Internal Server Error`, hiding error details in production.

---

## 📊 Audit Logging Summary

Every path (success or failure) creates a log via `AuditLog.createLog()`:

* Events: `USER_ORDER_UPDATE`, `USER_ORDER_CANCELED`, `PAYMENT_REFUND`
* Metadata includes:

  * Order IDs, reasons, refund outcomes
  * IP address and browser info
  * Error messages (if any)

---

## ✅ Key Benefits

* **Secure**: Validates IDs and user ownership.
* **Robust**: Refund is optional and fails gracefully.
* **Auditable**: Every action is logged with context.
* **User-Friendly**: Returns clear errors and success messages.

---

## 🧩 Dependencies Used

* `mongoose`: For ObjectId validation.
* `cancelOrderSchema`: Schema validator (e.g., Joi).
* `Order`: Mongoose model with static `cancelOrder`.
* `PaymentProcessor`: Refund handler.
* `AuditLog`: Logger for user actions and system events.

---

## 📥 Request Body Example (JSON)

```json
{
  "cancellationReason": "Changed my mind"
}
