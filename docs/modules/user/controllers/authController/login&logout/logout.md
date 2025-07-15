# logout.md

This file explains the logic behind the `logout` method used to terminate a user session securely. The function clears authentication tokens, logs the event, and provides a structured response. It handles both expected and edge-case logout scenarios with strong logging and auditing mechanisms.

---

## 🔁 Method: `logout(req, res)`

### 🧾 Step-by-step Breakdown:

---

### 1. **Request Metadata Logging**
```js
logger.info(`Logout request from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')?.slice(0, 50)}...`);
````

* Logs basic request context such as IP and User-Agent (first 50 characters) for traceability.

---

### 2. **Token Extraction**

```js
const accessToken = req.body.accessToken || req.cookies.accessToken;
const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
```

* Supports tokens in both the request body and cookies (for compatibility with login method).
* If both tokens are missing:

  ```js
  return res.status(200).json({ message: 'No active session found', status: 'success' });
  ```

---

### 3. **Cookie Clearing**

```js
res.clearCookie('accessToken', cookieOptions)
   .clearCookie('refreshToken', cookieOptions);
```

* Clears tokens from the browser using matching cookie options:

  * `httpOnly`, `secure`, `sameSite`, and `domain` controlled by environment variables.

---

### 4. **Token Decoding (Optional)**

```js
const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
```

* If access token is valid, extracts:

  * `userId`, `userRole` (used for audit logging).
* Fails silently if the token is expired or invalid.

---

### 5. **Audit Logging (If User Identified)**

```js
const user = await User.findUser({ id: userId }, { ... });
await AuditLog.createLog({ ... });
```

* Retrieves user from database to:

  * Include hashed email (truncated) in logs.
  * Add metadata like `username`, `role`, and `deviceInfo` from headers.
* Logs a `LOGOUT_SUCCESS` event to the audit log for compliance and monitoring.
* Gracefully handles any errors during DB access.

---

### 6. **Final Response**

```js
res.status(200).json({
  message: 'Logout successful',
  status: 'success',
  timestamp: new Date().toISOString(),
  ...(userId && { user: { id: userId } })
});
```

* Returns a consistent success response.
* Includes user ID in the payload if available (e.g., for frontend state clearing).

---

### 7. **Error Handling**

```js
res.status(500).json({ 
  error: 'Logout processing failed',
  status: 'error',
  ...(process.env.NODE_ENV === 'development' && { details: error.message })
});
```

* Catches and logs unexpected server errors.
* Shows detailed error messages only in development mode.

---

## ✅ Summary

| Feature                | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| 🔒 Token Handling      | Supports both cookie and body-based tokens                         |
| 🧼 Session Termination | Securely clears access and refresh tokens                          |
| 🕵️ Audit Logging      | Records logout events with IP, device, and partial email           |
| 🛡️ Security Controls  | Enforces strict cookie policies and silent token failure           |
| 🧠 Developer-Friendly  | Includes informative logs, graceful fallbacks, and dev-only errors |

## 📥 Request Body Example (JSON)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
