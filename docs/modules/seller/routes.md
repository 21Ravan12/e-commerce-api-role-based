# routes.md

This file defines the **seller-related API routes** for managing promotions, campaigns, products, inventory, and product media. It uses Express.js router and integrates file upload middleware (`multer`) for handling media files.

---

## 👥 Seller Routes Overview

All routes provide **CRUD operations** and inventory management for seller-owned resources. Authentication middleware is assumed to be handled elsewhere or internally in controllers.

---

## 🔖 Promotion Code Routes (`promotionCodeController`)
- **POST `/promotion/add`**  
  Create a new promotion code.

- **GET `/promotion/get/:id`**  
  Retrieve a promotion code by its unique ID.

- **PUT `/promotion/update/:id`**  
  Update an existing promotion code by ID.

- **DELETE `/promotion/delete/:id`**  
  Delete a promotion code by ID.

---

## 📢 Campaign Routes (`campaignController`)
- **POST `/campaign/add`**  
  Create a new marketing campaign.

- **PUT `/campaign/update/:id`**  
  Update campaign details by ID.

- **DELETE `/campaign/delete/:id`**  
  Remove a campaign by ID.

---

## 🛒 Product Routes (`productsController`)
- **POST `/product`**  
  Create a new product listing.

- **GET `/product/get/:id`**  
  Retrieve product details by ID.

- **PUT `/product/:id`**  
  Update product information.

- **DELETE `/product/:id`**  
  Delete a product listing.

---

## 📦 Inventory Management
- **GET `/product/low-stock`**  
  List products with stock below a defined threshold.

- **GET `/product/out-of-stock`**  
  List products that are currently out of stock.

- **PATCH `/product/bulk/stock`**  
  Bulk update stock quantities for multiple products.

- **PATCH `/product/bulk/prices`**  
  Bulk update pricing for multiple products.

---

## 🖼️ Product Media Management
- **POST `/product/:id/media`**  
  Upload one or more media files (images, videos) for a product.  
  Uses `multer` middleware with `upload.array('files')` to handle multipart uploads, storing files temporarily in `uploads/`.

- **DELETE `/product/:id/media/:mediaId`**  
  Delete a specific media file by its ID from a product.

- **PATCH `/product/:id/media/reorder`**  
  Change the display order of media files for a product.

---

## 🚪 Export
The router object is exported for use in the main Express app.

```js
module.exports = router;
