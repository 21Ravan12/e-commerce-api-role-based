# initiateUpdatePersonalData.md

This function `initiateUpdatePersonalData` is part of a secure **two-step process** for updating sensitive user information (like email or phone). It performs **input validation, rate limiting, encryption, challenge creation**, and **2FA code delivery** before any changes are finalized.

---

## ✅ Purpose

To handle *initiation* of personal data updates—especially for **sensitive fields** (email/phone)—by:
- Validating input
- Throttling excessive attempts
- Encrypting and hashing new values
- Sending a **2FA verification code** via email
- Temporarily storing pending updates in Redis
- Auditing the attempt

---

## 🧩 Step-by-Step Breakdown

### 1. **Logging the Request**
Logs the update attempt and the user’s IP address:
```js
logger.info(...);
````

### 2. **Input Validation**

Validates `req.body` against `updatePersonalDataSchema`:

```js
const { error, value } = updatePersonalDataSchema.validate(...);
```

* Aborts early if validation fails
* Responds with `400 Bad Request` on error

### 3. **Check Data Format**

Ensures `data` exists and is a non-empty object. Returns:

* `400 Invalid Data Format` if invalid

### 4. **Rate Limiting with Redis**

Throttles updates using Redis keys:

```js
const attemptCount = await RedisClient.incr(updateAttemptKey);
```

* If attempts exceed 10 in 5 minutes, blocks for 1 hour (`429 Too Many Requests`)

### 5. **Sensitive vs Non-Sensitive Updates**

Checks if the update includes `email` or `phone`:

* **If not**: applies update immediately with `User.updateSensitiveUser(...)`
* Responds with `200 OK` and updated user object

### 6. **Prepare for Sensitive Updates**

If `email` or `phone` is being updated:

* Encrypts the new values using `encrypt(...)`
* Generates hashes with `createSecureHash(...)`
* Builds a Redis-safe update payload

### 7. **Generate Verification Code and Challenge**

Creates:

* A `verificationCode` (sent to email)
* A `challenge` token (returned to client and used in step 2)

```js
const verificationCode = createChallenge({ size: 16 });
const challenge = createChallenge(); // 32 bytes hex
```

### 8. **Load Current User**

Finds current user to:

* Retrieve their current encrypted email
* Decrypt it for use in email delivery
  Returns `404` if user not found

### 9. **Store Verification Payload in Redis**

Stores update request using the challenge token:

* TTL: 15 minutes
* Includes encrypted fields, verification code, metadata

### 10. **Send Verification Email**

Sends the 2FA code to the user's email:

```js
await sendVerificationEmail(currentEmail, verificationCode);
```

* Deletes Redis key and returns `500` if email fails

### 11. **Create Audit Log**

Saves a `PERSONAL_DATA_UPDATE_INITIATED` log entry for traceability:

```js
await AuditLog.createLog({ ... });
```

### 12. **Return 202 Accepted**

If all goes well, returns:

```json
{
  message: 'Two-factor authentication required',
  challenge: "<challenge>",
  required: true,
  method: 'email',
  expiresIn: 900,
  code: '2FA_REQUIRED'
}
```

---

## ⚠️ Error Handling

Catches and logs all errors. Responds with appropriate HTTP status:

* `400` for validation issues
* `404` if user is not found
* `429` if rate limit exceeded
* `500` for internal/server errors

In development mode, includes the stack trace.

---

## 🔐 Security Highlights

* Validates input structure and type strictly
* Encrypts and hashes sensitive data before persistence
* Uses Redis with TTL for temporary update storage
* Sends verification codes via secure email channels
* Protects against brute-force via rate limiting

---

## 📥 Request Body Example (JSON)

```json
{
  "data": {
    "email": "new.email@example.com",
    "phone": "+1234567890",
    "address": "123 New Street, City, Country"
  }
}

## 🔁 What Happens Next?

This is **step 1** of a two-phase update. The client must:

1. Save the `challenge` token
2. Submit it with the received `verificationCode` to `/personalData/update/complete` to finalize the update

