# 📦 Order Module

This module handles the creation, retrieval, status management, and processing of orders in an e-commerce system. It also manages inventory adjustments and user updates during order placement.


## 📂 File Location

/models/order/index.js


## 📌 Registered Model

### `Order`
- Schema: `./schemas/orderSchema`
- Central model to represent each placed order, containing product details, user references, payment status, delivery data, and more.


## 🛠️ Order Operations

### General Order Management
- `cancelOrder`: Cancel an existing order and roll back associated effects.
- `fetchAdminOrders`: Admin-level retrieval of all orders (with filtering/sorting).
- `getCustomerOrders`: Retrieve orders placed by a specific user.
- `getOrder`: Fetch a single order by ID.
- `updateOrderStatus`: Update the order status (e.g., from `pending` to `shipped`).


## 🧾 Order Creation & Processing

These operations manage the full lifecycle of an order, from cart to completion:

- `applyPromotionCode`: Apply discount codes and validate them.
- `getCartProductsById`: Fetch product details from the cart using product IDs.
- `calculateFinalTotals`: Compute the final payable amount (price, tax, discounts).
- `createAndProcessOrder`: Main orchestrator to create and process an order.
- `createCompleteOrder`: Builds a fully validated order object.
- `finalizeOrder`: Final step to update user and stock after order is completed.
- `processCartItems`: Parse cart data to usable product list.
- `updateProductStock`: Decrease stock quantities post-purchase.
- `updateUserWithNewOrder`: Add order reference to the user's profile.
- `verifyStockAvailability`: Check product availability before processing order.


## 📦 Exported API

```js
{
  Order,
  cancelOrder,
  fetchAdminOrders,
  getCustomerOrders,
  getOrder,
  updateOrderStatus,
  applyPromotionCode,
  getCartProductsById,
  calculateFinalTotals,
  createAndProcessOrder,
  createCompleteOrder,
  finalizeOrder,
  processCartItems,
  updateProductStock,
  updateUserWithNewOrder,
  verifyStockAvailability
}
````

All exported functions are pre-bound with their required dependencies for direct use in services or controllers.


## ✅ Usage Example

```js
const { createAndProcessOrder } = require('./models/order');

const result = await createAndProcessOrder({
  userId,
  cart,
  paymentMethod,
  promoCode
});

if (result.success) {
  console.log('Order placed successfully!');
}
```


## 🧩 Dependencies

* `mongoose`
* Modular operation files under:

  * `/operations/createOrder/`
  * `/operations/`

This structure promotes separation of concerns and makes testing and maintenance easier.
