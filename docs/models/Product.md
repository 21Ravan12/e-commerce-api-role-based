# 🛒 Product Module

This module is responsible for managing products, categories, media, inventory, and user comments within the system. It registers relevant Mongoose models and exports pre-bound operational functions for each entity.


## 📂 File Location

/models/product/index.js


## 🧱 Registered Models

### `Product`
- Schema: `./schemas/productSchema`
- Represents individual products with associated metadata, pricing, stock, media, and categories.

### `Comment`
- Schema: `./schemas/commentSchema`
- Handles user comments or reviews on products.

### `Category`
- Schema: `./schemas/categorySchema`
- Represents hierarchical categorization for products (e.g., Electronics → Phones → Android).


## 🚀 Product Operations

### CRUD
- `createProduct`
- `getProduct`
- `updateProduct`
- `deleteProduct`

### Listing & Search
- `listProducts`
- `searchProducts`

### Media Management
- `uploadProductMedia`
- `deleteProductMedia`
- `reorderProductMedia`


## 🧠 Advanced Search Operations

- `getProductsByCategory`
- `getFeaturedProducts`
- `getRelatedProducts`
- `getSimilarProducts`
- `getFrequentlyBoughtTogether`
- `getTrendingProducts`
- `getNewArrivals`
- `getBestSellers`
- `getDiscountedProducts`


## 📦 Inventory Management

- `bulkUpdateStock`
- `bulkUpdatePrices`
- `getLowStockProducts`
- `getOutOfStockProducts`


## 💬 Comment Operations

- `addComment`
- `getComments`
- `getComment`
- `updateComment`
- `deleteComment`


## 🗂️ Category Operations

- `addCategory`
- `updateCategory`
- `fetchCategory`
- `fetchCategories`
- `deleteCategory`
- `initializeRootCategory`


## ✅ Exported Interface

```js
{
  Product,
  Comment,
  Category,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  searchProducts,
  uploadProductMedia,
  deleteProductMedia,
  reorderProductMedia,
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getTrendingProducts,
  getNewArrivals,
  getBestSellers,
  getDiscountedProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  bulkUpdateStock,
  bulkUpdatePrices,
  addComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  addCategory,
  updateCategory,
  fetchCategory,
  fetchCategories,
  deleteCategory,
  initializeRootCategory
}
````

Each function is pre-bound with its required models to ensure simple and reliable usage across the application.


## 📌 Usage Example

```js
const { createProduct, listProducts } = require('./models/product');

await createProduct({
  name: 'Smartphone',
  price: 699,
  stock: 50,
  category: 'phones'
});

const pageOfProducts = await listProducts({ page: 1, limit: 10 });
```