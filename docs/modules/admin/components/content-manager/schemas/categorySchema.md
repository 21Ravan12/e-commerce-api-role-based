# categorySchema.md

This file defines **input validation schemas** for category creation and update operations using the `Joi` library. These schemas ensure that all incoming data is correctly structured, secure, and conforms to business rules before being processed or stored.

---

## 📥 `categorySchema` – Create Category Schema

This schema validates the input when **creating a new category**.

### Fields:

- **`name`**:  
  - Type: `string`  
  - Required: ✅  
  - Constraints: Minimum 2, Maximum 50 characters  
  - Purpose: The display name of the category.

- **`description`**:  
  - Type: `string`  
  - Required: ✅  
  - Constraints: Minimum 8, Maximum 500 characters  
  - Purpose: A more detailed explanation of the category.

- **`parentCategory`**:  
  - Type: `string` (MongoDB ObjectId in hex format)  
  - Required: ❌  
  - Constraints: Must be a 24-character hex string or `null`  
  - Purpose: Used for hierarchical category structures (e.g., subcategories).

- **`image`**:  
  - Type: `string`  
  - Constraints: Must end in `.jpg`, `.jpeg`, `.png`, `.webp`, or `.svg` (case-insensitive)  
  - Purpose: Optional image filename or path for the category.

- **`isActive`**:  
  - Type: `boolean`  
  - Default: `true`  
  - Purpose: Flags whether the category is currently active/visible.

- **`displayOrder`**:  
  - Type: `number`  
  - Constraints: Minimum 0  
  - Default: `0`  
  - Purpose: Used to order categories in listings (lower numbers appear first).

- **`seo`** (optional):  
  - Type: `object`  
  - Contains SEO-related metadata:
    - `metaTitle` – Max 60 characters
    - `metaDescription` – Max 160 characters
    - `keywords` – An array of strings
  - Purpose: Optimizes category pages for search engines.

---

## ♻️ `updateSchema` – Update Category Schema

This schema is used when **updating an existing category**. All fields are optional, but at least **one field must be provided** (`.min(1)`).

### Fields:

- **All fields from `categorySchema`** are reused but made optional.

- Differences include:
  - **`image`**:
    - Must be a **valid URI** and end in an image extension.
    - Ensures remote or CDN image links are valid and safe.
  
  - **`attributes`** (new field):
    - Type: `array` of MongoDB ObjectIds (`hex().length(24)`)
    - Optional
    - Purpose: Allows dynamic linking of attribute sets (e.g., filters, specifications).

---

## 🔒 Validation Purpose

Using these schemas ensures:

- Data integrity and structure before reaching the database.
- Consistent API behavior across clients.
- Protection against injection, malformed payloads, and human errors.

---

## 📤 Export

Both schemas are exported via:
```js
module.exports = { categorySchema, updateSchema };
