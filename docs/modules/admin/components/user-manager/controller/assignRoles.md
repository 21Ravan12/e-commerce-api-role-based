# assignRoles.md

This file documents the `assignRoles` controller method, which is responsible for securely assigning roles to a user within an administrative context. The function incorporates **authorization checks**, **input validation**, **auditable logging**, and **robust error handling**.

---

## 🔧 Function: `assignRoles(req, res)`

### 📌 Purpose:
Assign new roles to a user identified by `req.params.id`. This operation is protected and logged for security, accountability, and traceability.

---

## 🧾 Step-by-Step Breakdown:

### 1. **Audit Log Initialization**
```js
const { logEntry, complete } = await AdminLog.createTimedAdminLog({...});
````

* Creates a **timed admin log** that records the start of the role assignment action.
* Captures metadata:

  * Target user ID and model (`User`)
  * Initiating user’s ID, email, roles, IP, and user agent
  * Requested roles

---

### 2. **User ID Validation**

```js
if (!mongoose.Types.ObjectId.isValid(id)) { ... }
```

* Verifies the format of the user ID.
* If invalid, the admin log is marked as **`failed`**, and a `400 Bad Request` response is returned.

---

### 3. **Roles Payload Validation**

```js
if (!roles || !Array.isArray(roles) || roles.length === 0) { ... }
```

* Ensures roles are provided as a non-empty array.
* Logs failure with details if validation fails.

---

### 4. **Authorization Check**

```js
const forbiddenRoles = roles.filter(role => ...);
```

* Prevents users without the `super-admin` role from assigning privileged roles like `admin` or `super-admin`.
* If unauthorized roles are attempted:

  * Logs the incident as `failed` with `unauthorized: true`
  * Returns a `403 Forbidden` error with specific blocked roles.

---

### 5. **Role Assignment Execution**

```js
const result = await assignRoles(id, roles);
```

* Calls a service method `assignRoles` which likely updates the database.
* The result should include:

  * `previousRoles`: User's roles before update
  * `roles`: New set of roles
  * `changes`: Specific additions/removals

---

### 6. **Audit Log Completion (Success)**

```js
await complete({ status: 'success', details: {...} });
```

* Marks the action as successful in the admin log.
* Stores detailed info about the role changes.

---

### 7. **Response to Client**

```js
res.json({ success: true, message: 'Roles updated successfully', data: result });
```

* Returns the updated role data to the requester.

---

### 8. **Error Handling**

Catches and handles all exceptions with appropriate logging and responses.

#### 🧨 Admin Log Failure:

```js
await complete({ status: 'failed', details: { error: error.message, ... } });
```

#### 🪵 Logging:

```js
logger.error(`Role assignment error: ${error.message}`, {...});
```

#### 🧾 Specific Errors:

* `UserNotFoundError`: Returns `404 Not Found`
* `InvalidRoleError`: Returns `400 Bad Request`
* Generic failure: Returns `500 Internal Server Error`

---

## 🔐 Security Notes:

* Only `super-admin` can assign critical roles.
* Input is sanitized and validated.
* Actions are logged with metadata for audit trails.

---

## 📤 Returns:

* On success: `{ success: true, message, data }`
* On error: `{ success: false, error, [optional systemError] }`

---

## 📥 Request Body Example (JSON)

```json
{
  "roles": ["admin", "editor"]
}
