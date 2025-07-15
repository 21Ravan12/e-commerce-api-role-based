# productsSchema.md

This file defines a comprehensive **Joi validation schema** for product data in an e-commerce system, ensuring strict data integrity and consistency before persisting or updating products in the database.

---

## 📚 Core Components

### 1. **Custom ObjectId Validator**
- Validates MongoDB ObjectId strings using `mongoose.Types.ObjectId.isValid`.
- Provides clear error messages for invalid IDs.

### 2. **Common Validation Messages**
- Centralized reusable messages for string, number, array, boolean, date, and object types.
- Improves consistency and user-friendly error reporting.

### 3. **Field-Specific Validators**
- **Name**: 3–100 chars, allows letters, numbers, spaces, hyphens, ampersands, basic punctuation.
- **Descriptions**: Long (20–2000 chars) and short (up to 200 chars).
- **Price**: Positive number with max 2 decimals.
- **Stock**: Integer ≥ 0.
- **URLs**: HTTP/HTTPS URLs, max length 500.
- **Media (Images/Videos/Documents)**: Structured objects with fields like URL, alt text, platform, etc.
- **Dimensions & Weight**: Numbers with units, all validated.
- **Specifications & Attributes**: Key-value pairs and arrays with length limits.
- **Shipping & Warranty**: Nested objects for shipping details and warranty info.

### 4. **Enumerations & Defaults**
- Product statuses: draft, active, published, etc.
- Supported currencies (USD, EUR, etc.).
- Supported languages (en, es, fr, etc.).
- Weight units (g, kg, lb, oz).
- Defaults applied where logical (e.g., currency defaults to USD).

---

## 🛒 **Main `productSchema` Object**

### Core product info:
- Required fields: `name`, `description`, `price`, `stockQuantity`, `categories`.
- Optional but validated fields: `discountedPrice` (must be less than price or null), `costPrice`, `currency`, `taxRate`.

### Inventory & availability:
- SKU, barcode, flags for availability, featured, digital product status.
- Digital downloads supported with URL, max downloads, expiry.

### Media:
- Arrays of validated images (max 10), videos (max 3), and documents (max 5).

### Categorization:
- Requires at least one category.
- Tags (up to 20), collections (ObjectId array).

### Seller & brand info:
- Brand and supplier references by ObjectId.
- Manufacturer name and warranty details.

### Specifications & attributes:
- Arrays of key-value specifications and attributes with limits on count.

### Variants and relations:
- Variant products and parent product references.

### Physical properties:
- Weight with units, dimensions, color, size, material.

### Shipping:
- Shipping info object including free shipping flag, weight, dimensions, handling time, restrictions.

### Related products:
- Arrays for related, cross-sell, upsell, and frequently bought together products.

### Ratings & reviews:
- Average rating (0–5), counts, and distribution per star rating.

### Sales & history:
- Sale count and price history with timestamps and discount flags.

### Metadata & moderation:
- Timestamps (createdAt, updatedAt, publishedAt, expiryDate).
- Status flags (draft, active, banned, etc.), approval info, rejection reasons.

### SEO:
- SEO title, description, keywords, slug, meta robots, canonical URL.

### Analytics:
- View, purchase, wishlist counts, conversion rate, last viewed date.

### Custom fields & localization:
- Arbitrary custom fields and localized product versions with language and ID.

### Audit:
- Last updated by user and schema versioning.

---

## ✍️ **Update Schema (`productUpdateSchema`)**
- Based on `productSchema` but makes required fields optional for partial updates.
- Enforces at least one field to be provided.
- Strips unknown fields, validates with all errors reported.

---

## 🧰 **Exports & Utilities**
- `productSchema` and `productUpdateSchema` for validation.
- `objectIdValidator` reusable custom ObjectId checker.
- Constants for statuses, currencies, languages, and weight units.
- Helper functions `validateProduct(data)` and `validateProductUpdate(data)` that return Joi validation results.

---

## ⚙️ **Options**
- AbortEarly: false (collect all errors before failing).
- StripUnknown: true (remove unrecognized fields).
- Disallow unknown fields except explicitly defined.
- Clean error messages without label wrapping.

---

This schema ensures robust, maintainable, and scalable validation for all product-related data, supporting complex features like media attachments, variants, internationalization, SEO, and analytics tracking while providing clear, descriptive validation feedback.
