# login.md

This document explains the `login` function, which handles **secure user authentication** using password-based login. It performs **input validation, user lookup, password verification, token generation**, and logs the activity with audit trails.

---

## 🔐 Overview
The `login` method is an `async` Express controller that processes login requests. It ensures:

- Content and input validation.
- Secure password comparison with bcrypt.
- Token-based authentication (JWT).
- User metadata updates.
- Secure cookie handling.
- Detailed audit logging.

---

## 🧾 Step-by-Step Breakdown

### 1. **Log Initial Attempt**
```js
logger.info(`Login attempt from IP: ${req.ip}`);
````

Logs the origin IP for tracking suspicious activity.

---

### 2. **Validate Content-Type**

```js
if (!req.is('application/json')) {
    throw new Error('Content-Type must be application/json');
}
```

Ensures the request is properly formatted as JSON.

---

### 3. **Validate Request Body (Joi)**

```js
const { error, value } = loginSchema.validate(req.body, {...});
```

Uses a Joi schema to validate and sanitize the request body. If errors exist, it throws a formatted validation error.

---

### 4. **Normalize and Hash Email**

```js
const normalizedEmail = email.toLowerCase().trim();
const emailHash = await createSecureHash(normalizedEmail);
```

* Ensures the email is in a predictable format.
* Email is hashed for secure lookup (not stored in plain-text).

---

### 5. **User Lookup**

```js
const user = await User.findUser({ emailHash }, {...});
```

Retrieves user data required for authentication. If no user or no password is found, it fails.

---

### 6. **Password Format Check**

```js
if (!user.password.match(/^\$2[aby]\$\d+\$/)) {...}
```

Ensures the password in the DB is a valid bcrypt hash. If not, it could indicate corruption or legacy formats.

---

### 7. **Compare Passwords**

```js
const isMatch = await bcrypt.compare(trimmedPassword, user.password);
```

Uses bcrypt to securely compare hashed passwords. Logs and throws on mismatch.

---

### 8. **Check User Role & Account Status**

```js
if (!userRoles) {...}
if (user.status !== 'active') {...}
```

Confirms that the user has roles and an active status before issuing tokens.

---

### 9. **Generate JWT Tokens**

```js
const accessToken = createAccessToken({ _id, role });
const refreshToken = createRefreshToken({ _id });
```

* Access token includes user ID and roles.
* Refresh token is for re-authentication.

---

### 10. **Update User Metadata**

```js
await User.updateUser(user._id, { meta: {...}, auth: {...} });
```

Tracks login time, IP, user agent, and login count.

---

### 11. **Prepare Response Object**

```js
const response = {
  message: "Login successful",
  user: {...},
  tokens: {...}
};
```

Contains minimal user info + token expiry durations pulled from environment variables.

---

### 12. **Set Secure Cookies**

```js
res.cookie('accessToken', accessToken, { ...cookieOptions });
res.cookie('refreshToken', refreshToken, { ...cookieOptions });
```

Tokens are stored in `httpOnly`, `secure`, `sameSite=strict` cookies for protection against XSS/CSRF.

---

### 13. **Audit Log**

```js
await AuditLog.createLog({ ... });
```

Tracks the login event with details like role, device fingerprint, and authentication method.

---

### 14. **Success & Error Responses**

* **On success**: Returns 200 status with user and token data.
* **On failure**:

  * `401` for invalid credentials.
  * `403` for unverified/inactive accounts.
  * `400` for validation or content-type errors.
* In `development`, also includes error detail in response for debugging.

---

## 📦 External Dependencies

* `Joi` – For schema validation.
* `bcrypt` – For secure password comparison.
* `logger` – Custom logging service.
* `User.findUser`, `User.updateUser` – Custom DB methods.
* `createAccessToken`, `createRefreshToken` – JWT utilities.
* `AuditLog.createLog` – Logs user events.

---

## ✅ Security Highlights

* Email hashing for DB lookup.
* Bcrypt for password protection.
* Strict cookie options (`httpOnly`, `secure`, `sameSite`).
* IP, user-agent, and fingerprint logging.
* Robust error handling and audit trails.

## 📥 Request Body Example (JSON)

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
