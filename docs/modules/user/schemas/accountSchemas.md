# accountSchemas.md

This file defines **validation schemas** using [`Joi`](https://joi.dev) for personal data update flows in a user account system. It ensures that only a fixed set of fields can be updated, and includes both syntactic and semantic validation rules.

---

## 📌 Overview

The schema is specifically built for managing **personal data updates** in two stages:

1. **Initiation (`updatePersonalDataSchema`)** – where the user submits changes to personal fields.
2. **Completion (`completeUpdateSchema`)** – where the user confirms those changes using a verification code and challenge.

There are also two constants exported for reuse:

- `SUPPORTED_FIELDS`: Only these 5 fields are allowed to be updated.
- `SENSITIVE_FIELDS`: A subset of supported fields that are considered sensitive (`email`, `phone`).

---

## 🔁 `updatePersonalDataSchema`

Used for validating the first step of updating personal data (`PATCH /personalData/update/attempt`).

### Structure:

```js
{
  data: {
    email?: string,
    phone?: string,
    firstName?: string,
    lastName?: string,
    dateOfBirth?: string (date)
  }
}
````

### Key Rules:

* `data` must be a non-empty object with **at least one** of the supported fields.
* Keys in `data` are **strictly limited** to: `email`, `phone`, `firstName`, `lastName`, `dateOfBirth`.
* Custom validation logic enforces:

  * **Email**: Must be valid format.
  * **Phone**: Accepts digits, `+`, spaces, hyphens, or parentheses; length 10–20.
  * **First/Last Name**: Max length 100 characters.
  * **Date of Birth**: Must be a valid date **in the past**.

### Error Handling:

Custom error messages help frontends/localization by returning meaningful strings like:

* `Invalid email format`
* `First name too long`
* `Birth date must be in past`

---

## ✅ `completeUpdateSchema`

Used during the second step of the update (`PATCH /personalData/update/complete`), where the user confirms the change.

### Structure:

```js
{
  challenge: string (64-char hex),
  code: string
}
```

### Key Rules:

* `challenge`:

  * Required
  * Exactly 64 characters
  * Must be hexadecimal
* `code`:

  * Required
  * Intended to be a 6-character verification code (alphanumeric)

> While length and pattern are hinted in messages, only base validation is enforced for `code` in this schema version.

---

## 🔑 Constants

### `SUPPORTED_FIELDS`

```js
['email', 'phone', 'firstName', 'lastName', 'dateOfBirth']
```

Defines exactly which keys are allowed in the `data` object.

### `SENSITIVE_FIELDS`

```js
['email', 'phone']
```

Subset of `SUPPORTED_FIELDS` that typically trigger additional security (e.g., 2FA or code confirmation).

---

## 🧾 Exported Members

```js
module.exports = {
  updatePersonalDataSchema,
  completeUpdateSchema,
  SUPPORTED_FIELDS,
  SENSITIVE_FIELDS
};
```

These can be imported wherever input validation is required (e.g., controller or middleware level).

---

## 📌 Summary

This schema module ensures secure and well-validated updates to user profile data. It strictly limits editable fields, enforces logical consistency (e.g., past dates), and supports two-step verification flows for sensitive changes.