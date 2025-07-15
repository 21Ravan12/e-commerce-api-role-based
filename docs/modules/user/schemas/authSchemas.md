# authSchemas.md

This module defines **authentication-related input validation schemas** using [Joi](https://joi.dev/), a powerful schema description and data validation library for JavaScript. It ensures that all incoming data for authentication and user registration flows is well-formed, secure, and human-readable in error output.

---

## 📦 Reusable Field Schemas

### `emailSchema`
- Validates a standard email format.
- Required.
- Custom error messages for invalid or missing email.

### `nameSchema`
- Validates a user's name (`firstName` and `lastName`).
- Between 2 and 30 characters.
- Required.
- Labeled dynamically in composite schemas (e.g., "First name").

### `phoneSchema`
- Accepts only digits (no symbols or spaces).
- 10 to 15 digits.
- Required.
- Useful for SMS verification flows or MFA.

### `optionalAddressSchema`
- Optional field for street or postal address.
- Minimum 5 characters, max 100.
- No `required()` — allows users to leave it blank.

### `locationSchema`
- Generic schema for fields like `city` and `country`.
- 2–50 characters allowed.

### `passwordSchema`
- Imported from a custom utility `passwordValidator`.
- Centralized to enforce strong password rules consistently across the app.

---

## ✅ Main Validation Schemas

### `registerSchema`
Used when creating a new user account.

**Fields:**
- `email`: Required, validated via `emailSchema`.
- `password`: Required, validated via shared `passwordSchema`.
- `firstName`, `lastName`: Required, validated via `nameSchema`.
- `phone`: Required, validated via `phoneSchema`.
- `address`: Optional, validated if present.
- `dateOfBirth`: Required, must be a valid ISO date.
- `city`, `country`: Optional, validated via `locationSchema`.

`options({ abortEarly: false })` ensures **all validation errors** are reported at once, rather than failing on the first error.

---

### `loginSchema`
Used during user sign-in.

**Fields:**
- `email`: Required, validated via `emailSchema`.
- `password`: Required; must be a string (looser than registration).

---

### `completeRegistrationSchema`
Used when a user finishes registration with a **verification code**.

**Fields:**
- `code`: Required, validated via `codeSchema`.

---

### `resetPasswordSchema`
Initiates password reset by requesting a code via email.

**Fields:**
- `email`: Required, validated.

---

### `verifyCodeSchema`
Verifies the reset or signup code.

**Fields:**
- `code`: Required.

---

### `resendCodeSchema`
Used to resend verification/reset codes.

**Fields:**
- `challenge`: Required code-like string (e.g., temporary user ID or email).

---

### `newPasswordSchema`
Used to submit a new password after a reset.

**Fields:**
- `newPassword`: Required, validated via strong password rules.
- `resetToken`: Required verification code/token.

---

## 🔄 MODEL_MAPPING
A dictionary mapping logical user roles or account types to their corresponding Mongoose models. Used elsewhere in the app to dynamically select schemas.

```js
const MODEL_MAPPING = {
  'admin': "Admin",
  'customer': "CustomerProfile",
  'seller': "SellerProfile",
};
````

---

## 📤 Exports

This module exports the following:

```js
module.exports = {
  MODEL_MAPPING,
  registerSchema,
  loginSchema,
  completeRegistrationSchema,
  resendCodeSchema,
  resetPasswordSchema,
  verifyCodeSchema,
  newPasswordSchema
};
```