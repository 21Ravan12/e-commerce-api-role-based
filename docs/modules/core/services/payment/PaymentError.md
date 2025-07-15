# PaymentError.md

This module defines a custom `PaymentError` class to standardize how **payment-related errors** are handled, logged, and serialized across the system. It extends the built-in `Error` class and provides useful metadata about failed payment attempts (e.g., method, amount, and original error). This is especially useful for debugging, API responses, and structured logging in payment flows.

---

## 📦 Module: `PaymentError`

### ✅ Constructor
```js
new PaymentError(message, paymentMethod, amount, originalError)
````

* `message` (string): Error description.
* `paymentMethod` (string): Name of the payment method used (e.g., 'stripe', 'paypal').
* `amount` (number): The amount attempted in the transaction.
* `originalError` (Error | any): The original error that caused this failure (useful for chaining).

#### Properties

* `name`: Always set to `'PaymentError'` for error type discrimination.
* `paymentMethod`: Defaults to `'unknown'` if not provided.
* `amount`: Defaults to `0` if not provided.
* `originalError`: Stores the actual root cause error, if any.
* `isOperational`: Marks it as a known/expected error for custom error handlers.
* `success`: Always set to `false` to indicate failure in a standardized way.
* `stack`: Captures and preserves the stack trace.

---

## 🔄 Method: `toJSON()`

Returns a **structured JSON representation** of the error, which is helpful for sending error responses over APIs.

Example output:

```json
{
  "error": "Card declined",
  "paymentMethod": "stripe",
  "amount": 4999,
  "success": false,
  "originalError": "StripeCardError: Your card was declined"
}
```

---

## 🧾 Method: `toString()`

Provides a clean, readable string format for logging or debugging:

```js
"[PaymentError] Card declined (Method: stripe, Amount: 4999)"
```

---

## 🔁 Static Method: `PaymentError.fromError(error, paymentMethod, amount)`

This helper wraps any generic error into a `PaymentError`, unless it’s already one. Ensures **consistent error typing** throughout your payment service.

Usage:

```js
try {
  await processStripePayment();
} catch (err) {
  throw PaymentError.fromError(err, 'stripe', 4999);
}
```

---

## ✅ Use Cases

* Replace raw payment gateway errors (e.g., Stripe, PayPal) with structured, app-specific errors.
* Send detailed and secure JSON responses to clients.
* Log clear and consistent payment failure info in monitoring tools.
* Easily distinguish between operational (known) and programmer (unknown) errors.

---

## 📤 Export

The module exports the `PaymentError` class for use across payment service logic:

```js
module.exports = PaymentError;
```