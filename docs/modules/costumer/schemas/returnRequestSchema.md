# returnRequestSchema.md

This module defines **Joi validation schemas** for handling return requests in an e-commerce system, ensuring data correctness and role-based update restrictions.

---

## 📦 Main Return Request Schema (`returnRequestSchema`)

Validates the structure and constraints for creating a new return request:

- **`orderId`**:  
  - Must be a valid MongoDB ObjectId string (custom validation).  
  - Required field with specific error messages if missing or invalid.

- **`reason`**:  
  - Required string explaining why the return is requested.  
  - Max length: 255 characters.

- **`description`**:  
  - Optional string giving additional details.  
  - Max length: 500 characters, allows empty string, defaults to empty.

- **`returnType`**:  
  - Required string, must be one of: `'refund'`, `'exchange'`, `'store_credit'`.  
  - Controls other conditional validations below.

- **`returnShippingMethod`**:  
  - Optional string indicating who handles return shipping.  
  - Valid values: `'customer'`, `'merchant'`, `'pickup'`.  
  - Defaults to `'customer'`.

- **`returnLabelProvided`**:  
  - Boolean indicating if a shipping label is provided.  
  - Defaults to `false`.

- **`exchangeProductId`**:  
  - Required **only if** `returnType` is `'exchange'`.  
  - Must be a valid ObjectId.  
  - Forbidden otherwise.

- **`refundAmount`**:  
  - If `returnType` is `'refund'` or `'store_credit'`, this is an optional positive number with up to 2 decimals.  
  - For exchanges, must be exactly `0`.

- **Schema options**:  
  - `abortEarly: false` — reports all validation errors at once.  
  - `allowUnknown: false` — forbids unknown keys.

---

## ✍️ Customer Update Schema (`returnRequestCustomerUpdateSchema`)

Validates fields customers can update after creating a return request:

- Allowed fields to update:  
  - `description`: Optional string, max 500 chars. Cannot be empty.  
  - `returnShippingMethod`: Must be one of `'customer'`, `'merchant'`, `'pickup'`.

- Forbidden fields (customers cannot update these):  
  - `status`, `refundAmount`, `adminNotes`, `exchangeProductId` — all explicitly forbidden with clear error messages.

- Requires at least one updatable field (`min(1)`).

---

## 🔧 Admin Update Schema (`returnRequestAdminUpdateSchema`)

Validates fields that administrators can update on a return request:

- **`status`**:  
  - Optional string restricted to one of: `'pending'`, `'approved'`, `'rejected'`, `'processing'`, `'completed'`, `'refunded'`.

- **`adminNotes`**:  
  - Optional string for internal admin remarks.  
  - Max length: 1000 chars. Allows empty string.

- **`returnShippingMethod`**:  
  - Optional, same valid values as above.

- **`exchangeProductId`**:  
  - Can be set **only if** status is `'approved'`.  
  - Must be a 24-character hex string (MongoDB ObjectId format).  
  - Forbidden otherwise.

- **Additional admin-only fields**:  
  - `refundMethod`: Must be one of `'original_payment'`, `'store_credit'`, `'bank_transfer'`.  
  - `restockingFee`: Number between 0 and 100, up to 2 decimals.

- Requires at least one field to update (`min(1)`).

---

## 🔍 Custom Validators and Utilities

- **`objectIdValidator`**:  
  - Custom Joi validator function to confirm string is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.

- **`joiObjectId`**:  
  - Joi string type extended with the custom ObjectId validator and clear error messages.

---

## 📦 Module Exports

- `returnRequestSchema`: Schema for creating a new return request.  
- `returnRequestCustomerUpdateSchema`: Schema restricting customer-side updates.  
- `returnRequestAdminUpdateSchema`: Schema restricting admin-side updates.

---

This setup ensures robust validation of return requests with clear role-based access control on which fields can be modified by customers vs. administrators, while enforcing correct data formats and constraints.
