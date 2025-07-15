# addCampaign.md

This file documents the `addCampaign` controller method, which handles **secure campaign creation** via a POST API call. It ensures that only authorized administrators can create new campaigns and that all data is validated, logged, and returned in a structured response format.

---

## 🔐 Access Control

```js
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Not authorized' });
}
````

Only users with the role `"admin"` can create a campaign. Unauthorized users receive a `403 Forbidden` response.

---

## 📦 Content-Type Enforcement

```js
if (!req.is('application/json')) {
  return res.status(415).json({ error: 'Content-Type must be application/json' });
}
```

Ensures that the request's `Content-Type` is `application/json`. If not, the server responds with `415 Unsupported Media Type`.

---

## 📋 Input Validation

```js
const { error, value } = campaignSchema.validate(req.body, {
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: false
});
```

Uses a `Joi` validation schema (`campaignSchema`) to validate the input:

* `abortEarly: false`: Collect all validation errors.
* `stripUnknown: true`: Remove unexpected fields.
* `allowUnknown: false`: Disallow any unknown keys.

If validation fails, a `400 Bad Request` is returned with detailed error messages.

---

## 🏗️ Campaign Creation

```js
const newCampaign = await Campaign.createCampaign(value, req.user._id);
```

Calls a static model method (`createCampaign`) to store the campaign in the database. It passes the validated input and the creator's user ID.

---

## 🧾 Audit Logging

```js
await AuditLog.createLog({
  event: 'CAMPAIGN_CREATED',
  action: 'create',
  entityType: 'campaign',
  entityId: newCampaign._id,
  user: req.user._id,
  ...
});
```

Creates a detailed audit log entry for tracking and compliance purposes. Captures:

* Campaign ID
* Admin user ID
* Request source (e.g., web)
* IP address and user-agent
* Key metadata (campaign name, type, status)

---

## 📤 Response Format

If the campaign is created successfully, a structured `201 Created` response is returned:

```json
{
  "message": "Campaign created successfully",
  "campaign": {
    "id": "...",
    "name": "...",
    "type": "...",
    "status": "...",
    ...
  },
  "links": {
    "view": "/campaigns/:id",
    "edit": "/admin/campaigns/:id/edit"
  }
}
```

Also sets security headers:

* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`

---

## 🧨 Error Handling

All runtime errors are caught and logged. Depending on the content of the error message, a `400` or `500` status code is returned:

```js
const statusCode = error.message.includes('categories are invalid') ? 400 :
                   error.message.includes('products are invalid') ? 400 :
                   ...
                   500;
```

If a `400` is returned, the stack trace is included in the `details` field to aid debugging during development.

---

## 🧠 Summary

This method provides:

* Strict role-based access
* Input validation via schema
* Secure, traceable campaign creation
* Detailed audit logs
* Clean and secure response headers

## 📥 Request Body Example (JSON)

```json
{
  "campaignName": "Summer Sale 2025",
  "campaignType": "percentage_discount",
  "status": "active",
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-07-31T23:59:59.999Z",
  "remainingUses": 1000,
  "minPurchaseAmount": 50.00,
  "maxDiscountAmount": 100.00,
  "customerSegments": ["vip_customers", "newsletter_subscribers"],
  "applicableCategories": ["64a8f2e97c8b9c0012345678"],
  "excludedProducts": ["64a8f2e97c8b9c0098765432"]
}
