# 💳 Payment Module

This module manages all operations related to payments, including creation, retrieval, refund processing, and revenue calculations. It uses a Mongoose model to interact with the database and exposes a set of pre-bound utility functions.


## 📂 File Location

```

/models/payment/index.js

````


## 🧱 Registered Model

### `Payment`
- Schema: `./schemas/paymentSchema`
- Handles transaction-related data such as:
  - `userId`
  - `orderId`
  - `amount`
  - `currency`
  - `status`
  - `method`
  - `timestamp`


## 🛠️ Available Operations

### `createPayment`
Creates a new payment document.

### `getPayment`
Fetches a specific payment by ID.

### `getPayments`
Returns a filtered or paginated list of payments.

### `processRefund`
Marks a payment as refunded and potentially triggers integration with payment processors.

### `findByOrder`
Finds a payment entry by associated order ID.

### `getTotalRevenue`
Calculates the total revenue based on successful payments (optionally filtered by time or other criteria).


## 📦 Exports

```js
{
  Payment,
  createPayment,
  getPayment,
  getPayments,
  processRefund,
  findByOrder,
  getTotalRevenue
}
````

Each function is pre-bound with the `Payment` model to simplify usage in services or route handlers.


## ✅ Usage Example

```js
const { createPayment, getTotalRevenue } = require('./models/payment');

await createPayment({
  userId: 'user123',
  orderId: 'order456',
  amount: 49.99,
  currency: 'USD',
  method: 'credit_card'
});

const revenue = await getTotalRevenue({ currency: 'USD' });
```


## 🧩 Dependencies

* `mongoose`: MongoDB ODM
* Local operation files in `/operations/` directory
* `paymentSchema`: Mongoose schema definition for payment documents