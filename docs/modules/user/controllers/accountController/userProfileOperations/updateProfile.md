# updateProfile.md

This document explains the logic of the `updateProfile` controller method, responsible for updating a user's **public-facing profile information** (e.g., `username`, `avatar`). It ensures input validation, clean updates, and robust audit logging for both successful and failed operations.

---

## 🔧 Method Signature
```js
async updateProfile(req, res)
````

* Triggered via a `PATCH /profile/update` request.
* Requires user to be authenticated (`req.user` is available).
* Expects a request body with optional fields:

  * `username`: string
  * `avatar`: string (e.g., image URL or path)

---

## 🧪 Input Validation

### `username` Rules:

* Minimum 3 characters, maximum 30 characters.
* Must match regex: `/^[a-zA-Z0-9_]+$/`

  * Only letters, numbers, and underscores allowed.
* If invalid:

  * Responds with HTTP `400` and specific error message.

### `avatar`:

* No validation shown (assumes client or another layer handles this).

---

## 🛠️ Update Process

1. **Build `updateData` object**:

   * Adds `username` and/or `avatar` if present.

2. **Calls `User.updateUser(userId, updateData)`**:

   * Abstracts actual DB update to a reusable model method.
   * Returns the updated user document.

3. **Sanitize Output**:

   * Constructs a `userResponse` object with **non-sensitive fields**:

     * `_id`, `username`, `avatar`, `status`, `roles`, `createdAt`, `updatedAt`

---

## 🧾 Audit Logging (Success)

### Logs the update with:

* `event`: `'PROFILE_UPDATED'`
* `action`: `'update'`
* `entityType`: `'user'`
* `entityId`: user’s ID
* `metadata`: details of the update:

  * `updatedFields`: keys from `updateData`
  * `oldUsername`: from `req.user`
  * `newUsername`: from `req.body` (or fallback to old if unchanged)
* Other request context:

  * `source`, `ip`, `userAgent`, `transactionId`

---

## ✅ Response on Success

```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "...",
    "username": "...",
    "avatar": "...",
    "status": "...",
    "roles": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## ❌ Error Handling

* Logs the error via `logger.error(...)`

* Tries to create an **audit log for the failure**:

  * `event`: `'PROFILE_UPDATE_FAILED'`
  * `metadata`: includes error message and attempted update fields

* If audit logging also fails, logs a **second-level failure**.

### Response on Failure:

```json
{
  "error": "Failed to update profile",
  "details": "..." // (included only in development mode)
}
```

---

## ✅ Security & Best Practices

* ✅ **Field whitelisting**: Only `username` and `avatar` can be changed.
* ✅ **Validation & sanitization**: Prevents malformed usernames.
* ✅ **Audit logging**: Tracks all changes and errors for compliance/debugging.
* ✅ **User context binding**: Uses `req.user._id` to ensure scoped updates.

---

## 📤 Summary

This method allows authenticated users to **safely update** their profile while maintaining **strong validation, logging, and auditability**. It separates internal logic from response handling, making it robust, maintainable, and production-ready.

## 📥 Request Body Example (JSON)

```json
{
  "username": "new_username123",
  "avatar": "https://example.com/images/avatar.png"
}
