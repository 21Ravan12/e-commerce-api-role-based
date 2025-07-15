# updateCampaign.md

This file documents the logic for the `updateCampaign` controller method, which handles the secure update of campaign records by administrators via an API endpoint.

---

## 🔄 Function: `async updateCampaign(req, res)`

Handles a `PATCH` or `PUT` request to update a campaign. The function follows a strict validation, authorization, and auditing process to ensure safe modifications.

---

## 🔐 Step 1: Logging the Request
```js
logger.info(`Update campaign request for ID: ${req.params.id} from IP: ${req.ip}`);
````

* Logs the incoming update request along with the campaign ID and requester's IP.

---

## 🛡️ Step 2: Role-Based Access Control

```js
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Not authorized' });
}
```

* Only users with an `'admin'` role are authorized to perform campaign updates.
* Returns HTTP `403 Forbidden` for unauthorized users.

---

## 📦 Step 3: Content-Type Validation

```js
if (!req.is('application/json')) {
  return res.status(415).json({ error: 'Content-Type must be application/json' });
}
```

* Ensures request payload is in JSON format.
* Responds with `415 Unsupported Media Type` if content type is invalid.

---

## 🧪 Step 4: Payload Validation with Joi

```js
const { error, value } = campaignUpdateSchema.validate(req.body, { ... });
```

* Validates the incoming JSON body using a Joi schema:

  * `abortEarly: false`: Collects all validation errors.
  * `stripUnknown: true`: Removes properties not defined in schema.
  * `allowUnknown: false`: Disallows unknown fields.
* If validation fails, it returns a `400 Bad Request` with detailed error messages.

---

## 🛠️ Step 5: Updating the Campaign

```js
const updatedCampaign = await Campaign.updateCampaign(req.params.id, value, req.user._id);
```

* Calls a static method on the `Campaign` model to apply changes.
* Likely checks permissions, performs field-level updates, and returns the updated document.

---

## 🧾 Step 6: Audit Logging

```js
await AuditLog.createLog({ ... });
```

* Records an audit log for the update:

  * Event type: `CAMPAIGN_UPDATED`
  * Tracks user info, campaign ID, IP address, user-agent, and what fields were changed.
  * Logs both updated field names and new values for accountability.

---

## 📤 Step 7: Response Construction

```js
const response = {
  message: 'Campaign updated successfully',
  campaign: { ... },
  links: {
    view: `/campaigns/${updatedCampaign._id}`,
    edit: `/admin/campaigns/${updatedCampaign._id}/edit`
  }
};
```

* Returns a structured JSON response including:

  * Updated campaign summary
  * Helpful links for front-end navigation (view & edit)

* Also sets headers:

  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`

---

## ❌ Step 8: Error Handling

```js
logger.error(`Campaign update error: ${error.message}`, { stack: error.stack });
```

* Logs error details with stack trace.

* Dynamically determines HTTP status code based on known error message patterns:

  * Examples:

    * `Validation error` → `400`
    * `Content-Type` mismatch → `415`
    * `not found` → `404`
  * Defaults to `500` for unknown/unhandled errors.

* Responds with appropriate status and includes stack trace if it's a client-side `400` error.

---

## ✅ Summary

This method:

* **Authenticates** and **authorizes** only admin users.
* **Validates** request payloads using a strict Joi schema.
* **Updates** campaigns using the `Campaign.updateCampaign()` method.
* **Logs** all critical activity to an audit trail.
* **Responds** with a clean, structured object to support frontend workflows.
* **Handles errors** gracefully with informative feedback and secure headers.

## 📥 Request Body Example (JSON)

```json
{
  "campaignName": "Summer Sale 2025",
  "campaignType": "seasonal",
  "status": "active",
  "campaignAmount": 1500,
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-07-31T23:59:59.999Z"
}
