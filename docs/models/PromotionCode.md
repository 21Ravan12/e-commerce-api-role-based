# 🏷️ PromotionCode Module

This module provides functionality for managing promotional codes in your application. It sets up a Mongoose model and exports a set of pre-bound CRUD operations.


## 📂 File Location

```

/models/promotionCode/index.js

````


## 🧱 Registered Model

### `PromotionCode`
- Schema File: `./schemas/promotionCodeSchema`
- Fields may include:
  - `code`: Unique identifier (e.g., "SUMMER2025")
  - `discount`: Numeric or percentage value
  - `usageLimit`: Total number of uses allowed
  - `expiresAt`: Expiration date
  - `usedCount`: Tracks how many times it's been used
  - `isActive`: Boolean status flag


## ⚙️ Operations

All operations are imported from `./operations/` and pre-bound to the `PromotionCode` model.

- `createPromotionCode(data)`
  - Creates a new promotion code.
- `findPromotionCodeById(id)`
  - Retrieves a single promotion code by its MongoDB ObjectId.
- `findPromotionCodes(filter)`
  - Finds multiple promotion codes using a query filter.
- `updatePromotionCode(id, updateData)`
  - Updates fields of a specific promotion code.
- `deletePromotionCode(id)`
  - Removes a promotion code from the database.


## 📦 Exports

```js
{
  PromotionCode,
  createPromotionCode,
  findPromotionCodeById,
  findPromotionCodes,
  updatePromotionCode,
  deletePromotionCode
}
````

These methods can be directly imported and used in your business logic or controller layer.


## 🧩 Dependencies

* `mongoose`: For MongoDB object modeling
* Custom schema: `promotionCodeSchema`
* Custom operations: Stored in `/operations/`


## ✅ Example Usage

```js
const { createPromotionCode } = require('./models/promotionCode');

await createPromotionCode({
  code: 'FREESHIP2025',
  discount: 10,
  usageLimit: 100,
  expiresAt: new Date('2025-12-31'),
  isActive: true
});
```