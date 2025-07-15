# CODProvider.md

This file defines the **Cash On Delivery (COD) payment provider class**, used as part of the payment service architecture. It simulates a simplified interface for handling COD transactions, designed to be interchangeable with other payment providers (e.g., Stripe, PayPal) through a unified API.

---

## 📦 File Location
`services/payment/providers/CODProvider.js`

---

## 🔧 Class: `CODProvider`

### Purpose
Implements a mock interface for Cash on Delivery (COD) payments, typically used when the actual payment is made upon delivery rather than online. This provider is useful in systems where:

- COD is an available option for customers.
- Transactions must still be tracked (e.g., generate a transaction ID).
- A refund flow is required for API consistency (even if not supported).

---

### ✅ Method: `async fakeProcess()`
Simulates a successful COD transaction.

- **Returns**:
  - `transactionId`: A unique identifier with a `COD-` prefix and timestamp.
  - `rawResponse`: A mock response indicating success (`{ status: 'success' }`).

> This method allows the application to handle COD "orders" as if they had gone through an online payment gateway, enabling unified handling of order status, logs, and tracking.

---

### ⚠️ Method: `async fakeRefund()`
Simulates a refund attempt for COD.

- **Returns**:
  - `{ status: 'not_supported' }`

> Since COD involves no electronic transfer at purchase time, refunding via system APIs is not supported. This method exists to comply with a consistent interface expected from all payment providers.

---

## ✅ Export
The class is exported using `module.exports` for use in payment orchestration logic:
```js
module.exports = CODProvider;
````

---

## 🔄 Use Case

This provider can be registered alongside other payment providers in a factory or strategy pattern. Even though COD doesn't involve real-time financial processing, this stub allows your backend to:

* Log transactions
* Mark orders as "awaiting payment"
* Bypass refund logic cleanly

---

## 🧩 Integration Context

In a modular e-commerce system, this class would likely be used like so:

```js
const cod = new CODProvider();
const result = await cod.fakeProcess();
```

---

## 🛠️ Summary

| Method        | Purpose                           | Returns                          |
| ------------- | --------------------------------- | -------------------------------- |
| `fakeProcess` | Simulate successful COD order     | `{ transactionId, rawResponse }` |
| `fakeRefund`  | Simulate unsupported refund logic | `{ status: 'not_supported' }`    |

This file allows the system to treat COD as a first-class payment method within the unified payment flow, while acknowledging its limitations.
