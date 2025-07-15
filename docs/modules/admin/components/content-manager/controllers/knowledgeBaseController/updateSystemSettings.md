# updateSystemSettings.md

This function `updateSystemSettings` handles **updating system-wide configuration settings** via an authenticated HTTP request. It includes detailed auditing, validation, error handling, and response formatting.

---

## Workflow Breakdown

### 1. Audit Logging Initialization
- Uses an `AuditLog.createTimedAdminLog` method to start a timed audit log entry for this admin action.
- Logs key metadata:
  - Action name: `'update_system_settings'`
  - Target model: `'SystemSettings'`
  - Acting user ID and email (`req.user._id`, `req.user.email`)
  - Client IP and User-Agent (`req.ip`, `req.headers['user-agent']`)
  - Source of request (e.g., `'web'`)
  - The incoming settings payload (`req.body.settings`) for traceability.

The returned object contains:
- `logEntry`: the initial audit log document
- `complete`: a function to finalize the audit log with status and details.

---

### 2. Content-Type Validation
- Ensures the request has `Content-Type: application/json`.
- If invalid, completes the audit log with:
  - Status: `'failed'`
  - Error details including actual content type received.
- Responds immediately with HTTP 400 and error message.

---

### 3. Update System Settings Execution
- Calls the core `updateSystemSettings` function passing:
  - The settings object from the request body.
  - The ID of the user performing the update.
- This function presumably applies the changes and returns:
  - `updatedSettings`: an array or object reflecting the updated config entries.

---

### 4. Audit Log Completion (Success)
- Marks the audit log entry as `'success'`.
- Logs details including the updated settings and how many settings were changed.

---

### 5. Successful Response
- Returns HTTP 200 with JSON including:
  - `success: true`
  - The result from the update function (e.g., updated settings).

---

### 6. Error Handling
- If any error occurs during processing:
  - Completes the audit log with:
    - Status: `'failed'`
    - Error message and optionally stack trace (only in development)
    - Additional error codes/status if present.
  - Logs the error via `logger.error`.
  - Calls `this.handleError` to send a formatted error response including a reference to the audit log ID (`adminLogId`) for traceability.

---

## Summary

This method ensures **robust, traceable, and secure** updates to system settings by:

- Logging all relevant metadata and timing for audits.
- Validating input formats strictly.
- Returning clear, structured responses on success or failure.
- Associating any errors with an audit log ID for admin follow-up.
- Using async/await for clean asynchronous flow.


## 📥 Request Body Example (JSON)

This endpoint expects a JSON object with a `settings` field, which contains key-value pairs representing the system settings to update.

### Example:
```json
{
  "settings": {
    "siteTitle": "My Awesome App",
    "maintenanceMode": true,
    "maxUploadSizeMB": 50,
    "supportEmail": "support@example.com"
  }
}
