# register.md

This document explains the `register` function, which handles user account registration. It ensures security, validation, rate limiting, and temporary registration session management via Redis, while sending a verification code to the user's email.

---

## 🔍 Overview

The `register(req, res)` function is responsible for:
- Validating user input
- Preventing duplicate registrations
- Hashing sensitive data
- Creating a temporary registration session
- Sending a verification code
- Logging the attempt for auditing

---

## 🧪 Input Validation

```js
const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
});
````

* Uses Joi schema (`registerSchema`) for strict validation.
* Strips unknown fields and collects all validation errors.
* Throws an aggregated error message if validation fails.

---

## 📬 Email & Phone Handling

```js
const normalizedEmail = email.toLowerCase().trim();
const emailHash = await createSecureHash(email);
const phoneHash = await createSecureHash(phone);
```

* Email is normalized and hashed for secure lookup.
* Phone is also hashed to detect duplicates without storing plaintext.
* Ensures user uniqueness by checking hashed values against the DB.

---

## ⚠️ Duplicate Check

```js
const emailExists = await User.findUser({ emailHash });
const phoneExists = await User.findUser({ phoneHash });
```

* Prevents registration if the email or phone is already in use.
* Returns specific 409 Conflict responses with suggestions.

---

## ⏱️ Rate Limiting (Anti-spam)

```js
const regAttemptKey = `reg_attempt:${normalizedEmail}`;
const attemptCount = await RedisClient.incr(regAttemptKey);
```

* Tracks registration attempts per email using Redis.
* If attempts exceed `200` in an hour, user is temporarily blocked (429).
* Otherwise, Redis TTL is set to 5 minutes for ongoing control.

---

## 🧩 Challenge & Verification Code

```js
const verificationCode = createChallenge({ size: 16 });
const challenge = createChallenge(); // 32-byte default
```

* Generates two tokens:

  * A **verification code** sent via email
  * A **challenge token** stored in Redis and sent to the frontend for later verification

---

## 🔐 Username and Password

```js
const username = `${firstName.charAt(0)}${lastName}1234`...
const passwordHash = await bcrypt.hash(trimmedPassword, 10);
```

* Creates a safe, pseudo-random username based on name + 4-digit suffix.
* Hashes password with bcrypt using salt rounds = 10.

---

## 🔒 Encrypted User Data

```js
const encryptedData = {
    email: await encrypt(normalizedEmail),
    ...
};
```

* Personally identifiable data (PII) is encrypted before storing.
* Ensures GDPR/CCPA compliance and data security.

---

## 🧾 User Data Object

```js
const userData = {
    username, encryptedData, emailHash, phoneHash, ...
};
```

* Prepares a minimal user document for registration session storage.
* Status is set to `"pending"` until email verification.
* Includes UI preferences and roles.

---

## 💾 Redis Session Store

```js
await RedisClient.set(challenge, encryptedRedisPayload, { EX: 900 });
```

* Combines all registration session data into a Redis entry.
* Uses challenge token as key.
* Payload includes metadata like IP, device, and user agent.
* Expires in 15 minutes (900 seconds).

---

## 📤 Email Delivery

```js
await sendVerificationEmail(normalizedEmail, verificationCode);
```

* Sends a verification code to the user's email address.
* If email fails to send, Redis data is deleted and error returned.

---

## 🛡️ Audit Logging

```js
await AuditLog.createLog({
    event: 'REGISTER_ATTEMPT', ...
});
```

* Logs key metadata like IP, headers, and risk score for analysis.
* Logs truncated tokens (only partial values) for security.

---

## ✅ Success Response

```js
res.status(200).json({
    message: "Verification code sent", challenge, security: {...}
});
```

* Response includes:

  * A cooldown timer (180s)
  * The challenge token
  * Security metadata (rate limiting, CSRF protection, etc.)
* Adds strict HTTP headers for security (CSP, referrer policy, etc.)

---

## ❌ Error Handling

```js
const statusCode = error.message.includes(...) ? ... : 500;
res.status(statusCode).json({ error: error.message });
```

* Responds with:

  * `409` for duplicate registration
  * `429` for rate limiting
  * `400` for validation errors
  * `500` for all other errors
* Development mode includes stack trace in response.

---

## 🔚 Summary

The `register` controller is built for **security-first registration**, featuring:

* Input validation (Joi)
* Rate limiting (Redis)
* Duplicate prevention (hashed lookups)
* Data encryption
* Email verification
* Logging and audit trail

## 📥 Request Body Example (JSON)

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1995-06-15",
  "phone": "+1234567890"
}
