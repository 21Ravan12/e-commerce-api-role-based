# completeUpdatePersonalData.md

This function, `completeUpdatePersonalData`, is part of a **two-step secure process** that finalizes a sensitive personal data update (like email, phone, address, or password). It performs rigorous checks including request origin validation, challenge code verification, and security logging.

---

## 🛡️ Purpose

To ensure **only the rightful user** can complete an update to sensitive personal data. This is done by verifying:
- A valid 2FA `challenge` token from Redis.
- The correct verification `code`.
- Request consistency (same IP and User-Agent as the original request).
- Audit logs are created for every step (success or failure).

---

## 🧩 Breakdown of the Flow

### 1. **Logging Initiation**
```js
logger.info(`Complete personal data update from IP: ${req.ip}`, ...)
````

Logs the start of the update attempt with user and IP info.

---

### 2. **Input Validation**

```js
const { error, value } = completeUpdateSchema.validate(req.body, ...);
```

* Uses Joi schema to validate the body (must include `challenge` and `code`).
* Strips unknown fields and collects all errors.
* If validation fails:

  * Creates an **audit log** (`PERSONAL_DATA_UPDATE_FAILED`) with context.
  * Returns `400 Bad Request`.

---

### 3. **Challenge Token Validation**

```js
const redisData = await RedisClient.get(`update_2fa:${challenge}`);
```

* Retrieves update session data from Redis using the challenge token.
* If missing or expired:

  * Logs the error.
  * Returns `400 Invalid or expired challenge`.

---

### 4. **User & Context Validation**

#### a. **User ID Match**

```js
if (userId !== storedUserId)
```

* Ensures the session user matches the one from Redis.
* Deletes Redis session if mismatch and logs `USER_MISMATCH`.

#### b. **Request Context Match**

```js
if (!this.isSimilarRequest(...))
```

* Checks that the IP and User-Agent haven't changed.
* If changed:

  * Deletes Redis challenge.
  * Logs `CONTEXT_CHANGED`.

---

### 5. **Code Verification**

```js
if (verificationCode !== code)
```

* Increments attempt count in Redis.
* If code is wrong:

  * Returns `401` with remaining attempts.
  * On 3 failed attempts, deletes challenge and blocks further access (`403`).

---

### 6. **Successful Verification**

```js
await RedisClient.del(`update_2fa:${challenge}`);
```

* Deletes challenge token after successful code verification.
* Updates sensitive data via:

```js
const updatedUser = await User.updateSensitiveUser(userId, data);
```

* Logs an audit entry: `PERSONAL_DATA_UPDATE_COMPLETED`.

---

### 7. **Success Response**

```js
res.status(200).json({
  success: true,
  message: 'Personal data updated successfully',
  updatedFields,
  timestamp: new Date()
});
```

Returns the fields updated and a success message.

---

### 8. **Error Handling**

```js
catch (error) { ... }
```

* Logs the full error and stack trace (only in dev).
* Sends appropriate status codes based on error context:

  * 429: Too many attempts
  * 400: Validation error
  * 404: Not found
  * 500: Internal error

---

## 🔍 Helper Method: `isSimilarRequest`

```js
isSimilarRequest(originalIp, currentIp, originalUserAgent, currentUserAgent)
```

* Compares the original request's IP/User-Agent with the current one.
* Returns `true` only if both match exactly.

---

## 📘 Summary

| Feature           | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| Validation        | Joi-based input validation                                             |
| Security Layers   | Redis challenge token, 2FA code, IP/User-Agent consistency             |
| Logging           | Detailed audit logs for success and failure via `AuditLog.createLog()` |
| Rate Limiting     | Max 3 verification code attempts                                       |
| Attack Mitigation | Context verification prevents replay/fake requests                     |
| Safe Fallbacks    | All failures are logged and produce safe error messages                |

---

## 📥 Request Body Example (JSON)

```json
{
  "challenge": "abc123challengeToken",
  "code": "987654"
}
