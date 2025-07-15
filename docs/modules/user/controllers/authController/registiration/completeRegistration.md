# completeRegistration.md

This file documents the `completeRegistration` controller method, which finalizes a multi-step user registration flow using a secure verification code and encrypted session data. It employs **Redis**, **decryption**, **schema validation**, **IP matching**, **hash comparison**, and **audit logging** to ensure secure and verified user onboarding.

---

## 🔐 Purpose

To safely complete a registration process by:
- Verifying a one-time code
- Decrypting session data stored in Redis
- Validating IP, request structure, and content types
- Checking for duplicate users
- Registering the user and logging the process

---

## ✅ Step-by-Step Breakdown

### 1. **Log Request Origin**
Logs IP of the incoming registration attempt.

---

### 2. **Content-Type Validation**
Ensures the request uses `application/json` as the Content-Type header.

```js
if (!req.headers['content-type']?.includes('application/json'))
````

---

### 3. **Body Format Validation**

Confirms the body is a non-null, non-array object.

```js
if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
```

---

### 4. **Schema Validation (Joi)**

Uses `completeRegistrationSchema` to validate and sanitize incoming request fields (`challenge`, `code`).

* Collects all validation errors instead of stopping at the first.

---

### 5. **Challenge Validation**

Ensures `challenge` (Redis key) is a 64-character hex string. Rejects empty or malformed keys.

---

### 6. **Redis Session Lookup**

Retrieves session data by `challenge` key from Redis. If no data, it's assumed expired or invalid.

---

### 7. **Decryption**

Attempts to decrypt the Redis data using a secure `decrypt` method:

* Handles double-encoded JSON
* Verifies decrypted string format
* Parses and validates the result

```js
decryptedData = await decrypt(JSON.parse(encryptedData));
```

---

### 8. **JSON Parsing and Error Diagnostics**

* Detects and logs JSON parse errors with position context.
* Verifies presence of the expected `userData` field.

---

### 9. **IP Address Matching**

Checks if IP used for registration matches the one stored in session:

```js
if (userData.ip !== req.ip)
```

---

### 10. **Code Verification**

Uses `crypto.timingSafeEqual()` to securely compare the submitted and stored verification codes.

On mismatch:

* Increments retry attempts
* Updates encrypted Redis session
* Logs failed attempt via `AuditLog`

---

### 11. **Email & Phone Validation**

* Decrypts user email and phone number.
* Hashes them using `createSecureHash`.
* Checks if either already exists via `User.findUser`.
* Returns `409 Conflict` on duplication with friendly suggestions.

---

### 12. **User Registration**

Registers the new user using sanitized and validated data:

```js
const newUser = User.register(userData);
```

---

### 13. **Audit Logging**

Records a `REGISTRATION_COMPLETED` event using `AuditLog.createLog` with metadata:

* Device fingerprint
* Risk score
* IP, user agent, etc.

---

### 14. **Response Construction**

Returns a 200 OK response with:

* `user.id` and `username`
* Secure flags (`cookieDomains`, `sameSite`)
* Headers for security (`X-Content-Type-Options`, `CSP`, etc.)

---

### 15. **Error Handling**

Handles errors gracefully and categorizes them to return appropriate HTTP status codes:

* `403`, `400`, `409`, `415`, `503`, `500`, etc.
* Includes `stack` and `receivedBody` in development mode.

---

## 🛡️ Security Highlights

* **Timing-safe code comparison**
* **Encrypted session flow via Redis**
* **Email/phone hashing to detect duplicates**
* **IP address and device validation**
* **Strict input validation with Joi**
* **Detailed logging for all failures and successes**

---

## 📤 Summary

This method is the secure final step in a staged registration system. It ensures:

* User identity is verified via a one-time code
* Session data integrity through encryption
* Prevention of duplicate account creation
* Logging and traceability for all actions

## 📥 Request Body Example (JSON)

```json
{
  "challenge": "d4fbd731f6e8721d16d5f998c6b0c25a7e1f9a8f8a4e3b9d06c1f7e9a1c2b3e4",
  "code": "492163"
}
