# deleteCampaign.md

This function handles the secure deletion of a campaign by an authenticated admin. It includes **audit logging**, **safe deletion logic**, **conflict resolution**, and **clear client feedback**. It’s structured to ensure **traceability**, **compliance**, and **robust error handling**.

---

## 🧩 Function: `deleteCampaign(req, res)`

### 🔍 Purpose:
Deletes a campaign based on the campaign ID passed via `req.params.id`. It ensures the deletion is tracked, errors are clearly handled, and the admin log reflects the full lifecycle of the operation.

---

## ✅ Step-by-Step Breakdown

### 1. **Create Audit Log Entry**
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({ ... });
````

* Creates a *timed* log entry marking the beginning of an admin operation.
* Captures metadata:

  * Action type: `'delete_campaign'`
  * Target model and ID
  * Admin's ID and email
  * IP address and user-agent
  * Request source and context (role)

---

### 2. **Log the Operation**

```js
logger.info(`Delete campaign request for ID: ${req.params.id} from IP: ${req.ip}`);
```

* For operational visibility in server logs.

---

### 3. **Delete the Campaign**

```js
const deletedCampaign = await Campaign.deleteCampaign(req.params.id);
```

* Invokes a static method on the `Campaign` model.
* This method should internally validate existence, permissions, and constraints.

---

### 4. **Complete Audit Log (Success)**

```js
await complete({ status: 'success', details: { ... } });
```

* Logs success metadata:

  * Deleted campaign ID, name, type, status, start/end dates.
  * Optionally, count of associated promo codes (if any).

---

### 5. **Send HTTP Response**

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .status(200)
  .json({ message: 'Campaign deleted successfully', ... });
```

* Responds with:

  * Success message
  * Campaign summary
  * ISO timestamp
  * Links to relevant actions (e.g., `/campaigns` list or create)

* Sets headers for added security:

  * Prevent MIME-type sniffing (`nosniff`)
  * Deny framing (`DENY`)

---

## ❌ Error Handling

### 6. **Categorize Errors**

```js
const statusCode = error.message.includes(...) ? ... : 500;
```

* Returns appropriate status codes:

  * `400`: Malformed or invalid campaign ID
  * `404`: Campaign not found
  * `409`: Conflict — likely due to associated promo codes
  * `500`: Unexpected/unhandled error

---

### 7. **Collect Error Details**

```js
const errorDetails = {
  error: error.message,
  statusCode,
  ...
};
```

* In dev environments, includes stack trace.
* Adds campaign ID for traceability.

#### If `409 Conflict`:

* Counts associated promo codes to guide admin resolution.
* Adds `"solution"` message explaining how to proceed.

---

### 8. **Complete Audit Log (Failure)**

```js
await complete({ status: 'failed', details: errorDetails });
```

* Stores complete error context in admin logs.

---

### 9. **Log and Respond**

```js
logger.error(`Delete campaign error: ${error.message}`, { ... });
res.status(statusCode).json({ error, details });
```

* Logs full error for devops.
* Sends structured error response to the client with optional conflict resolution info.

---

## 🧾 Summary

This function ensures:

* Full traceability via admin audit logs.
* Safe, validated deletion of campaigns.
* Informative success and error responses.
* Protection from common attack vectors via security headers.
* Developer visibility through contextual logging.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it deletes a campaign by its ID passed via URL parameters.

Example URL:
```

DELETE /campaigns/\:id

```

- `:id` — The unique identifier of the campaign to delete (string, required).

No JSON payload is expected or accepted in the request body for this operation.
