# 📜 AuditLog Module

This module handles creation, querying, and maintenance of audit and admin logs using Mongoose models. It registers the necessary models and exports pre-bound functions to interact with the logs.


## 📂 File Location

/models/auditlog/index.js


## 📌 Registered Models

### `AuditLog`
- Schema: `./schemas/auditLogSchema`
- Stores general user/system actions with fields like `user`, `event`, `timestamp`, `correlationId`, etc.

### `AdminLog`
- Schema: `./schemas/adminLogSchema`
- Dedicated to administrative actions that may require tracking additional metadata or timing.

## 🛠️ Operations

### Audit Logs
- `createLog`: Create a new audit log entry.
- `getLogs`: Retrieve logs based on filters.
- `purgeOldLogs`: Delete logs older than a specified age (e.g., 90 days).

### Admin Logs
- `createAdminLog`: Create a new admin log entry.
- `getAdminLogById`: Retrieve a single admin log by ID.
- `getAdminLogs`: Retrieve multiple admin logs.
- `updateAdminLog`: Update an existing admin log entry.
- `createTimedAdminLog`: Utility to log timed operations (combines `createAdminLog` and `updateAdminLog` for duration tracking).


## 🔍 Query Helpers

These query helpers extend the `AuditLog` model:

```js
AuditLog.find().byUser(userId)
AuditLog.find().byEmail(email)
AuditLog.find().byEvent(event)
AuditLog.find().recent(days) // default: 7
AuditLog.find().byCorrelationId(correlationId)
````

## 📦 Exports

```js
{
  AuditLog,
  AdminLog,
  createLog,
  getLogs,
  purgeOldLogs,
  createAdminLog,
  getAdminLogById,
  getAdminLogs,
  updateAdminLog,
  createTimedAdminLog
}
```

Each operation is pre-bound with its respective model to allow easy reuse across services or controllers.


## 🧩 Dependencies

* `mongoose`: ODM for MongoDB
* Custom schemas: `auditLogSchema`, `adminLogSchema`
* Modular operation files: stored in `/operations/auditLog/` and `/operations/adminLog/`


## ✅ Usage Example

```js
const { createLog, getLogs } = require('./models/auditlog');

await createLog({
  user: userId,
  event: 'LOGIN_SUCCESS',
  metadata: { ip: '127.0.0.1' }
});

const recentLogs = await getLogs({ days: 3 });
```