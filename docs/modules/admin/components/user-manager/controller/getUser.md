# getUser.md

This file explains the logic behind the `getUser` controller method, which handles retrieving a user's information in a secure, audited, and permission-aware manner. It includes structured logging for administrative actions and robust error handling.

---

## 📥 Request Input
- **`req.params.id`**: The user ID being requested.
- **`req.user`**: The authenticated user making the request (must be available through middleware).
- **`req.ip`**, **`req.headers['user-agent']`**: Collected for audit logging.

---

## 🔐 Authorization & Logging

### `AdminLog.createTimedAdminLog({...})`
Creates a **timed administrative log** for tracing sensitive operations:
- Action: `"get_user"`
- Tracks who performed the action (`performedBy`, `performedByEmail`)
- Source of the request (`ipAddress`, `userAgent`, `source`)
- `complete(...)`: Used to finalize the log with status/result info later.

---

## ✅ Validation

### `mongoose.Types.ObjectId.isValid(id)`
- Ensures that the provided `id` is a valid MongoDB ObjectId format.
- If invalid:
  - Responds with `400 Bad Request`.
  - Logs failure with `validationError: true`.

---

## 📦 User Fetching

### `User.getUser(id)`
- Fetches the user from the database using the custom static method `getUser` on the User model.
- If no user is found:
  - Responds with `404 Not Found`.
  - Logs failure with `notFound: true`.

---

## 🛡️ Access Control

- Allows access **only if**:
  - The authenticated user is requesting **their own** data, or
  - The authenticated user has the `'admin'` role.
- If unauthorized:
  - Responds with `403 Forbidden`.
  - Logs the access attempt with `unauthorized: true` and includes `requesterId` and `requesterRoles`.

---

## 🟢 Success Handling

If the user exists and authorization passes:
- The response returns:  
  ```json
  {
    "success": true,
    "data": { ...userObject }
  }


* The log is completed with:

  * Status: `'success'`
  * Key user data: `id`, `email`, `roles`, and `status`.

---

## 🔴 Error Handling

If an unexpected error occurs:

* Responds with `500 Internal Server Error`.
* Error details are:

  * Included in response only in `development` mode.
  * Logged via a custom `logger`.
* Log entry is completed with:

  * Status: `'failed'`
  * `error` message
  * Stack trace (in development mode)

---

## 📤 Final Behavior Summary

| Step                        | Action Taken                                                  |
| --------------------------- | ------------------------------------------------------------- |
| ID is invalid               | Respond 400, log validation failure                           |
| User not found              | Respond 404, log not found                                    |
| Unauthorized access attempt | Respond 403, log unauthorized details                         |
| Successful fetch            | Respond 200 with user data, log success details               |
| Internal error              | Respond 500 with optional stack trace, log full error context |

---

## 📘 Notes

* Requires a `User.getUser` method on the model (not shown here).
* Assumes middleware already authenticated the user and attached `req.user`.
* `AdminLog.createTimedAdminLog()` is a helper for structured action logging with timing and metadata.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body since it retrieves user data by ID from the URL parameters. However, authentication credentials (such as JWT tokens) should be provided in the request headers for authorization.

### Example URL Parameter:
```json
{
  "id": "507f1f77bcf86cd799439011"
}
````

### Example Headers:

```json
{
  "Authorization": "Bearer your_jwt_token_here",
  "Content-Type": "application/json"
}
```
