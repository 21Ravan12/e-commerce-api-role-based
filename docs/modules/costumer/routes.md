# routes.md

This file defines and documents **e-commerce-related API routes** using Express.js. These routes cover order management, return requests, and commerce features such as wishlist and cart operations. All routes are protected using the `authenticate` middleware, ensuring only authorized users can access them.

---

## 🛒 ORDER ROUTES (`orderController`)

### `POST /add`
- **Description**: Creates a new order based on the user's cart or direct purchase.
- **Auth Required**: ✅
- **Payload**: Expected order details (items, payment info, etc.)

### `GET /get`
- **Description**: Fetches a list of orders made by the authenticated user.
- **Auth Required**: ✅

### `GET /get/:orderId`
- **Description**: Retrieves detailed information about a specific order by ID.
- **Auth Required**: ✅

### `PUT /cancel/:id`
- **Description**: Cancels an active order by its ID (if eligible).
- **Auth Required**: ✅

---

## 🔁 RETURN REQUEST ROUTES (`returnRequestController`)

### `POST /add`
- **Description**: Creates a new return request for an item in an order.
- **Auth Required**: ✅

### `GET /get`
- **Description**: Lists all return requests associated with the authenticated user.
- **Auth Required**: ✅

### `GET /get/:id`
- **Description**: Fetches a specific return request by its ID.
- **Auth Required**: ✅

### `PUT /update/:id`
- **Description**: Allows the user to update their own return request (e.g., change reason).
- **Auth Required**: ✅

### `PUT /update-admin/:id`
- **Description**: Allows an admin or reviewer to review and update the return request status.
- **Auth Required**: ✅

### `PUT /archive/:id`
- **Description**: Archives the return request (soft-delete for future auditing).
- **Auth Required**: ✅

---

## 🛍️ COMMERCE ROUTES (`CommerceController`)

### 📌 Wishlist CRUD

#### `POST /commerce/wishlist/add`
- **Description**: Adds a product to the user's wishlist.
- **Auth Required**: ✅

#### `DELETE /commerce/wishlist/remove/:productId`
- **Description**: Removes a specific product from the wishlist using its ID.
- **Auth Required**: ✅

#### `GET /commerce/wishlist/get`
- **Description**: Retrieves the current contents of the user's wishlist.
- **Auth Required**: ✅

---

### 🛒 Cart CRUD

#### `POST /commerce/cart/add`
- **Description**: Adds a product to the shopping cart (with quantity and variant info).
- **Auth Required**: ✅

#### `PATCH /commerce/cart/update/:itemId`
- **Description**: Updates a specific cart item's quantity or options.
- **Auth Required**: ✅

#### `DELETE /commerce/cart/remove/:itemId`
- **Description**: Removes a specific item from the cart.
- **Auth Required**: ✅

#### `DELETE /commerce/cart/clear`
- **Description**: Clears all items from the cart.
- **Auth Required**: ✅

#### `GET /commerce/cart/get`
- **Description**: Retrieves the current state of the user's cart.
- **Auth Required**: ✅

---

## 🛡️ Middleware

### `authenticate`
This middleware ensures the request is made by a valid, logged-in user. It checks the presence and validity of a JWT token and attaches user context to the request.

---

## 📤 Module Export

The router is exported as a module to be used inside the main application (e.g., `app.use('/api/orders', router)`):
```js
module.exports = router;
