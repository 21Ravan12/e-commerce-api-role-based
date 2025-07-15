# 👤 User Module

This module defines the main `User` model and includes a full suite of operations for authentication, profile management, shopping cart, wishlist, and administrative tasks.


## 📂 File Location

/models/user/index.js


## 🧱 Registered Model

### `User`
- Schema: `./schemas/userSchema`
- Represents a platform user with identity, credentials, preferences, cart, wishlist, and role data.


## 🛠️ Core Operations

### 🔐 Authentication & Account
- `findUser`: Find user by email, ID, or username.
- `register`: Register a new user.
- `changePassword`: Allow user to change their password.
- `deleteAccount`: Permanently delete user account.
- `updateUser`: Update general profile fields.
- `updateSensitiveUser`: Update sensitive fields like email or username.
- `linkSocialAccount`: Link OAuth/social provider accounts.
- `unlinkSocialAccount`: Disconnect social accounts.


## 🛒 Cart Management

Operations related to user's shopping cart:
- `addToCart`: Add product to cart.
- `updateCartItem`: Change quantity or details of an item.
- `getCartItems`: Get full list of cart items with product details.
- `removeFromCart`: Remove a single product from cart.
- `clearCart`: Empty the cart entirely.

> ⚠️ Uses `Product` model to populate and validate items.


## 💖 Wishlist Management

- `addToWishlist`: Add a product to wishlist.
- `removeFromWishlist`: Remove a product (uses `mongoose` to handle DB operations).
- `getWishlistItems`: Fetch all wishlist items with product data.


## 🛡️ Admin-Specific Operations

- `assignRoles`: Set roles like `admin`, `moderator`, etc.
- `getUser`: Admin fetch user by ID/email/etc.
- `listUsers`: Paginated or filtered list of users.
- `updateUserStatus`: Ban, deactivate, or update user status metadata.


## 📦 Exported API

```js
{
  User,
  findUser,
  register,
  changePassword,
  updateUser,
  updateSensitiveUser,
  deleteAccount,
  linkSocialAccount,
  unlinkSocialAccount,
  addToCart,
  updateCartItem,
  getCartItems,
  removeFromCart,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
  assignRoles,
  getUser,
  listUsers,
  updateUserStatus
}
````

All functions are **pre-bound** to the `User` model (and where applicable, `Product` or `mongoose`), simplifying their integration into services or routes.


## ✅ Usage Example

```js
const { register, addToCart } = require('./models/user');

await register({ email: 'test@example.com', password: '123456' });

await addToCart(userId, productId, 2); // Add 2 quantities
```