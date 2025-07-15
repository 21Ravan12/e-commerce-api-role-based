# deleteUser.md

This file explains the logic behind the `deleteUser` controller method, which handles the **soft deletion** of a user account in an administrative context. It also includes a **timed audit log** to track the operation's execution lifecycle for traceability and compliance.

---

## 🔧 Function Overview

### `async deleteUser(req, res)`
Performs a **soft delete** on a user and logs the action using `AdminLog.createTimedAdminLog`.

---

## 🕵️‍♂️ Timed Admin Log Initialization

```js
const { logEntry, complete } = await AdminLog.createTimedAdminLog({...});
````

* Initializes a log entry at the beginning of the operation.
* Fields logged:

  * `action`: `"delete_user"`
  * `targetModel`: `"User"`
  * `targetId`: `req.params.id`
  * `performedBy`: The admin user’s ID and email.
  * `ipAddress`, `userAgent`, `source`: Captures request metadata.
  * `details`: Includes `reason` and explicitly marks it as a **soft delete**.

The returned `complete()` function is called at the end to mark the log as either `"success"` or `"failed"`.

---

## ✅ Validation

```js
if (!mongoose.Types.ObjectId.isValid(id)) { ... }
```

* Ensures the provided user ID is a valid MongoDB ObjectId.
* If invalid, logs failure in `AdminLog` and returns a `400 Bad Request`.

---

## 🗑️ Soft Deletion

```js
const deletedUser = await User.deleteAccount(id, reason);
```

* Calls a model method `User.deleteAccount()` to perform a **soft delete** (likely sets a `deletedAt`, `status = deleted`, and logs reason).
* Assumes this method returns the updated user object.

---

## 📝 Log Completion (Success)

```js
await complete({
  status: 'success',
  details: { ... }
});
```

* Marks the audit log as successful and stores:

  * User ID and email
  * New status (e.g., `deleted`)
  * `deletedAt` timestamp
  * Reason for deletion

---

## ✅ Client Response (Success)

```js
res.json({ success: true, message: 'User marked as deleted', data: {...} });
```

* Returns a 200 OK response with basic user metadata:

  * `_id`, `email`, `status`, `deletedAt`

---

## ❌ Error Handling

```js
catch (error) { ... }
```

* Any exception triggers:

  * Logging the error in the `AdminLog` with detailed info and stack trace (in development).
  * Logging to server logs via `logger.error()`.
  * Returning a `500 Internal Server Error` response.

---

## 🛡️ Security & Traceability Features

* All actions are **attributed** to the performing admin (`req.user`).
* Captures request metadata (IP address, user-agent).
* Tracks both **successful** and **failed** attempts in an auditable way.
* Separates **validation failures** from **internal errors**.

---

## 📦 Dependencies

* `AdminLog`: Custom service for tracking admin actions with support for timed lifecycle tracking.
* `User`: Mongoose model for users, expected to implement a `deleteAccount(id, reason)` method.
* `logger`: A logging utility used for capturing server-side errors.
* `mongoose.Types.ObjectId`: Used to validate the format of the MongoDB ID.

---

## ✅ Expected Behavior

| Case                  | Response                  | Log Status |
| --------------------- | ------------------------- | ---------- |
| Valid ID, deletion OK | 200 OK, `success: true`   | `success`  |
| Invalid ID            | 400 Bad Request           | `failed`   |
| Internal error        | 500 Internal Server Error | `failed`   |


## 📥 Request Body Example (JSON)

This endpoint does not require a JSON body; all necessary data is passed via URL parameters.

However, the relevant parameters are:

```json
{
  "id": "60c72b2f9b1d4c3a4f123456",   // User ID to delete (as a URL param)
  "reason": "User requested account closure" // Reason for deletion (as a URL param)
}
````

**Example HTTP DELETE request:**

```
DELETE /users/delete/60c72b2f9b1d4c3a4f123456/User requested account closure
```

* `id` — MongoDB ObjectId string identifying the user.
* `reason` — A brief explanation for the deletion action.

No JSON payload is expected in the body for this request.
