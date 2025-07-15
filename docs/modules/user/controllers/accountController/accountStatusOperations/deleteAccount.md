# deleteAccount.md

This function handles **secure user account deletion** through an authenticated API endpoint. It performs several critical tasks including invoking deletion logic, recording an audit log, and providing a consistent response structure to the client.

---

## 🔧 Method: `deleteAccount(req, res)`

### ✅ Step-by-Step Execution:

1. **Extract User Context**
   ```js
   const userId = req.user._id;
   const { reason } = req.body;
````

* Retrieves the authenticated user's ID from the request (`req.user`) using middleware.
* Accepts an optional `reason` for deletion from the client, useful for analytics or feedback.

2. **Invoke Deletion Logic**

   ```js
   const deletionResult = await User.deleteAccount(userId, reason, { ... });
   ```

   * Calls a **static model method** `User.deleteAccount()` to encapsulate the actual deletion logic.
   * Additional metadata is passed to track context:

     * `ip`: IP address of the request
     * `userAgent`: Partial browser/device signature
     * `deviceFingerprint`: Custom fingerprint header (e.g., from frontend JS)
     * `geoLocation`: Optional location header (e.g., from frontend geolocation API)

3. **Log the Deletion**

   ```js
   await AuditLog.createLog({ ... });
   ```

   * Creates an **audit log** entry for traceability.
   * Fields include:

     * `event`: `'ACCOUNT_DELETION'`
     * `user`: The affected user ID
     * `action`: `'delete'`
     * `source`: `'api'`
     * `status`: `'success'`
     * `metadata`: Any additional data from the deletion process

4. **Send Success Response**

   ```js
   res.status(200).json({ message: 'Account deleted successfully' });
   ```

   * Responds with HTTP 200 on success.

---

## ❌ Error Handling

If an error occurs:

1. **Log the Error Internally**

   ```js
   logger.error(`Error deleting account: ${error.message}`);
   ```

2. **Audit the Failure**

   ```js
   await AuditLog.createLog({ ...status: 'failure'... });
   ```

   * A second audit log is written with:

     * `status`: `'failure'`
     * `metadata`: Contains the error message and stack trace (only in development)

3. **Return Error Response**

   ```js
   res.status(500).json({ error: 'Failed to delete account' });
   ```

---

## 🧠 Notes

* **Audit Logs** are written for both success and failure, ensuring end-to-end traceability.
* **Custom Headers** (`x-device-fingerprint`, `x-geo-location`) help correlate events across devices.
* **Security-Oriented**: All actions are scoped to the authenticated user and logged with context.
* **Environment Awareness**: Stack trace is only exposed in development for security.

---

## 📤 Dependencies

* `User.deleteAccount()` – Static method responsible for removing or anonymizing user data.
* `AuditLog.createLog()` – Centralized logging mechanism for system actions.
* `logger` – Custom logging service used across the backend.

## 📥 Request Body Example (JSON)

```json
{
  "reason": "I no longer need the service"
}
