# updateUserStatus.md

This function `updateUserStatus(req, res)` is an **admin-only API controller** that updates a user's status (`active`, `suspended`, or `banned`) and logs the operation with rich metadata for auditing purposes.

---

## 🧩 Purpose

- **Restrict** access to users with the `admin` role.
- **Validate** input parameters (`userId` and `status`).
- **Update** the user's account status in the database.
- **Log** all actions with a structured admin log.
- **Respond** with appropriate status codes and messages for success or failure.

---

## 🪪 Step-by-Step Breakdown

### 1. **Admin Audit Log Initialization**
```js
const { logEntry, complete } = await AdminLog.createTimedAdminLog({ ... });
````

* Creates a **timed log entry** to track the admin action in detail.
* Captures:

  * The admin's ID and email
  * IP address, user agent
  * Target user ID
  * Requested new status
  * Source of action (e.g., web)

> `complete()` is later called with `status` and additional `details` to close the log.

---

### 2. **Parameter Extraction & Basic Validation**

```js
const { id } = req.params;
const { status } = req.body;
```

* Checks if `id` is a valid MongoDB ObjectId.
* Checks if `status` is one of the allowed values (`active`, `suspended`, `banned`).
* Returns `400 Bad Request` with error logging if invalid.

---

### 3. **Authorization Check**

```js
if (!req.user.roles.includes('admin'))
```

* Only users with the `admin` role are permitted.
* Returns `403 Forbidden` if the requester is not an admin.
* Logs failure in the audit log with reason.

---

### 4. **Status Update Operation**

```js
const updatedUser = await User.updateUserStatus(id, status);
```

* Calls a model-level static or instance method to apply the status update.
* If the user does not exist, returns `404 Not Found`.

---

### 5. **Success Response**

```js
await complete({
  status: 'success',
  details: { newStatus: updatedUser.status }
});
```

* Marks the audit log as successful.
* Sends back `200 OK` with confirmation of the new status.

---

### 6. **Error Handling**

```js
catch (error) {
  await complete({
    status: 'failed',
    details: { error: error.message }
  });
```

* Catches unexpected errors (DB failure, logic bugs, etc.).
* Marks audit log as failed and responds with `500 Internal Server Error`.

---

## 🔐 Security Notes

* Input is strictly validated.
* Role-based access control (RBAC) enforced.
* All activity is fully logged with detailed metadata.
* Prevents misuse by logging failure reasons for every rejected request.

---

## 📤 Sample Success Response

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": { "status": "suspended" }
}
```

---

## 🔁 Integration Points

* Depends on:

  * `AdminLog.createTimedAdminLog` for logging.
  * `User.updateUserStatus` for applying DB changes.
  * `mongoose.Types.ObjectId` for ID validation.

---

## 📥 Request Body Example (JSON)

```json
{
  "status": "active"
}
````

**Notes:**

* `status` must be one of the following strings: `"active"`, `"suspended"`, or `"banned"`.
* This field is required to update the user's status.
