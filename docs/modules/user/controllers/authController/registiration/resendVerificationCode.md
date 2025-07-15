# resendVerificationCode.md

This function handles secure resending of email verification codes. It validates and decrypts session data from Redis, regenerates a new code, stores the updated data, sends the code via email, and logs the event for audit purposes.

---

## 📥 Input & Request Validation

1. **Content-Type Check**
   - Ensures the request header includes `'application/json'`.

2. **Body Format Check**
   - Confirms the request body is a non-array object.

3. **Schema Validation**
   - Validates the input using `resendCodeSchema` (likely with Joi or similar).
   - Aborts early disabled; collects all validation issues.
   - Strips unknown keys to enforce strict input schema.

---

## 🔑 Redis Session Handling

4. **Extract `challenge` Key**
   - This key references a temporary session in Redis.
   - Validated to ensure it is a non-empty string.

5. **Fetch Encrypted Data from Redis**
   - Uses the challenge key to retrieve associated encrypted session data.

6. **Decrypt the Data**
   - Parses Redis-stored JSON, then decrypts the inner payload.
   - The decrypted value must be a valid JSON string.

7. **Parse and Validate Decrypted Session**
   - Handles edge cases like double-stringified JSON (`"{"a":"b"}"`).
   - Ensures required fields (`userData`, `auth`) are present.
   - Logs context slices and precise error position for parsing failures.

---

## 🔁 Generate & Store New Verification Data

8. **Generate a New Code**
   - Creates a secure 16-character challenge code.
   - Generates a new Redis session key (`challenge`).

9. **Update Session Payload**
   - Attaches hashed email verification token.
   - Sets expiration time (24h).
   - Adds metadata (IP, user-agent, timestamp).
   - Resets resend `attempts` count.

10. **Encrypt & Store Updated Payload**
    - Stores new payload in Redis with 15-minute TTL.
    - Deletes the old Redis entry for security.

---

## 📧 Send Email

11. **Send Verification Code via Email**
    - Decrypts the stored email before sending.
    - Logs errors, deletes Redis key if sending fails.

---

## 🕵️‍♂️ Audit Logging

12. **Create Audit Log Entry**
    - Records the event with metadata like IP, headers, user-agent, and calculated `riskScore`.

---

## ✅ Success Response

13. **Return JSON Success**
    - Sends structured security headers.
    - Returns:
      - Status: 200
      - Message: `"New verification code sent to your email"`
      - Cooldown: `180` (seconds)
      - New challenge key
      - Security metadata

---

## ❌ Error Handling

14. **Catch & Log Errors**
    - Logs all caught errors with message and stack trace.
    - Returns appropriate HTTP status:
      - `409 Conflict`: Email already registered
      - `429 Too Many Requests`: Rate limiting triggered
      - `400 Bad Request`: Validation errors
      - `500 Internal Server Error`: Others
    - In development, includes stack trace in response for debugging.

---

## 🧠 Summary

This handler is a **secure and resilient email verification resend endpoint**, with:

- Rigid validation & logging
- Double encryption & decryption stages
- Redis session renewal with TTL
- Email notification
- Structured error reporting
- Security-conscious HTTP headers

## 📥 Request Body Example (JSON)

To resend a verification code, make a `POST` request with the following JSON body:

```json
{
  "challenge": "d97f8c90a2f54cf7a5e0d0cb5f0c72fa"
}
