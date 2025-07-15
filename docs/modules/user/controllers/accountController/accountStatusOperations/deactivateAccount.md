# deactivateAccount.md

This method handles **user account deactivation** in a secure and auditable way. It suspends the user by updating their status and logs both successful and failed attempts using a standardized audit log system.

---

## 🔁 Function: `deactivateAccount(req, res)`

### 📥 Input
- `req.user._id`: The authenticated user's ID (injected via middleware).
- `req.body.reason`: Optional string describing the user's reason for deactivation.
- Request headers may contain:
  - `x-device-fingerprint`: A unique identifier for the user's device.
  - `x-geo-location`: An optional location string (e.g., country, city).
  - `User-Agent`: Used to record the device/browser making the request.

---

## 🔧 Logic

### 1. **User Identification**
```js
const userId = req.user._id;
const { reason } = req.body;
````

* Retrieves the currently logged-in user's ID.
* Extracts the optional reason from the request body.

### 2. **Account Suspension**

```js
const data = { status: 'suspended' };
await User.updateUser(userId, data);
```

* Changes the user's account `status` to `'suspended'` using a centralized `User.updateUser()` method.

### 3. **Audit Logging (Success Case)**

```js
await AuditLog.createLog({
  event: 'ACCOUNT_DEACTIVATION',
  user: userId,
  action: 'update',
  source: 'api',
  status: 'success',
  ip: req.ip,
  userAgent: req.get('User-Agent')?.slice(0, 200) || '',
  metadata: { ... }
});
```

* A comprehensive log entry is recorded to track who deactivated the account, from where, using what device, and why.
* `metadata` includes:

  * `reason`: User’s stated reason for deactivation.
  * `statusChange`: A fixed string (`active → suspended`).
  * `deviceFingerprint` and `location` (optional headers).

### 4. **Response (Success)**

```js
res.status(200).json({ message: 'Account deactivated successfully' });
```

---

## ❌ Error Handling

### 1. **Try-Catch Block**

Catches any unexpected errors during the process (e.g., database issues).

### 2. **Error Logging**

```js
logger.error(`Error deactivating account: ${error.message}`);
```

* Sends error info to a centralized logger.

### 3. **Audit Logging (Failure Case)**

```js
await AuditLog.createLog({
  event: 'ACCOUNT_DEACTIVATION',
  user: req.user?._id,
  action: 'update',
  source: 'api',
  status: 'failed',
  ...
  metadata: {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  }
});
```

* Records the failure in the audit system.
* The `stack` trace is included only in development mode for security.

### 4. **Error Response**

```js
res.status(500).json({ error: 'Failed to deactivate account' });
```

---

## ✅ Summary

This controller method:

* Suspends user accounts securely.
* Records both success and failure via detailed audit logs.
* Supports enhanced observability and accountability by logging device, location, and user reasoning.

## 📥 Request Body Example (JSON)

```json
{
  "reason": "I want to take a break from the platform"
}
