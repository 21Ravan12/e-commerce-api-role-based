# deleteCampaign.md

This document explains the logic and behavior of the `deleteCampaign` controller method. This function handles the **secure deletion of a campaign** by an admin, logs the operation, and returns a detailed response or error.

---

## 🔧 Method: `async deleteCampaign(req, res)`

### 🔹 Step 1: Log the Request
```js
logger.info(`Delete campaign request for ID: ${req.params.id} from IP: ${req.ip}`);
````

* Records the incoming request for auditing and traceability using the campaign ID and IP address.

---

### 🔹 Step 2: Admin Role Check

```js
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Not authorized' });
}
```

* Verifies that the requesting user has an `admin` role.
* Returns **403 Forbidden** if the user lacks sufficient permissions.

---

### 🔹 Step 3: Campaign Deletion

```js
const deletedCampaign = await Campaign.deleteCampaign(req.params.id);
```

* Uses a static model method (`Campaign.deleteCampaign`) to remove the campaign from the database.
* Expects the method to throw if the ID is invalid or the campaign doesn't exist.

---

### 🔹 Step 4: Audit Log Entry

```js
await AuditLog.createLog({ ... });
```

* Records an audit trail of the deletion, with fields including:

  * `event`: Type of action (`CAMPAIGN_DELETED`)
  * `action`, `entityType`, and `entityId`
  * `user`, `ip`, `userAgent`
  * `metadata`: campaign name, type, status, and date range
* Ensures traceability and accountability.

---

### 🔹 Step 5: Response Structure

```js
const response = {
  message: 'Campaign deleted successfully',
  deletedCampaign: { id, name, type },
  timestamp: ...,
  links: {
    list: '/campaigns',
    create: '/campaigns'
  }
};
```

* Responds with a success message and useful metadata about the deleted campaign.
* Includes helpful **hypermedia links** to guide the client (e.g., list or create campaigns).

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .status(200)
  .json(response);
```

* Adds security headers to prevent content sniffing and clickjacking.

---

### 🔹 Step 6: Error Handling

```js
catch (error) { ... }
```

Handles errors gracefully and dynamically determines the HTTP status code:

| Error Message Contains         | HTTP Status | Description                                  |
| ------------------------------ | ----------- | -------------------------------------------- |
| `'Invalid campaign ID'`        | `400`       | Bad request format                           |
| `'not found'`                  | `404`       | Campaign does not exist                      |
| `'associated promotion codes'` | `409`       | Conflict — campaign is linked to promo codes |
| *Other (default)*              | `500`       | Internal server error                        |

```js
details: statusCode === 409 ? {
  associatedPromoCodes: await PromotionCode.countDocuments({ campaign: req.params.id }),
  solution: 'Delete or reassign promotion codes first'
} : undefined
```

* If conflict (`409`) occurs due to **linked promotion codes**, provides:

  * Count of linked promotion codes
  * Suggested resolution to unblock the deletion

---

## ✅ Summary

This method is a **secure, audited, and admin-restricted endpoint** for deleting campaigns. It features:

* Permission checks
* Full audit logging
* Secure response headers
* Granular error differentiation with helpful client feedback

## 📥 Request Body Example (JSON)

This DELETE endpoint does not require a request body. The campaign ID is passed as a URL parameter.

Example URL:

```
DELETE /campaigns/{id}
```
