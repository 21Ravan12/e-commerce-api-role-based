# getPromotionCodes.md

This file documents the logic of the `getPromotionCodes` controller method, which handles **fetching and filtering promotion codes** from the database based on query parameters. It includes logging, validation, filtering, enhancement of result objects, and secure response handling.

---

## 📥 Input: Request

- **Query Parameters** (validated by `promotionCodeGetSchema`):
  - `status`: Filter by code status (`active`, `inactive`, etc.).
  - `type`: Filter by promotion type (e.g., `percentage`, `fixed`).
  - `active`: Boolean to only return codes currently valid (based on `startDate` and `endDate`).
  - `search`: Text search in `promotionCode` or `description`.
  - `page`, `limit`: For pagination.

- **Headers and Metadata**: Logged for admin purposes.
  - IP address (`req.ip`)
  - User agent
  - Referrer/origin
  - Authenticated admin user info (`req.user`)

---

## 📝 Admin Logging

- A **timed admin log** is initiated using `AdminLog.createTimedAdminLog`.
- The log tracks:
  - Action: `'get_promotion_codes'`
  - Source: `'web'`
  - Actor: admin's ID and email
  - Request metadata (headers, query)
- Log is completed using `complete()` with either `'success'` or `'failed'` status and attached context data.

---

## ✅ Validation

- Query parameters are validated against `promotionCodeGetSchema` using Joi or a similar schema library.
- On validation failure:
  - The error is logged.
  - A detailed error response is returned with status `400 Bad Request`.

---

## 🔍 Filter Construction

- Dynamically builds a `filter` object based on validated query inputs:
  - `status`: Filters by `code.status`.
  - `type`: Filters by `code.promotionType`.
  - `active: true`: Applies date-range filtering to return currently valid codes.
  - `search`: Applies a case-insensitive regex match to both `promotionCode` and `description`.

---

## 📦 Data Fetching

- Uses a static method `PromotionCode.findPromotionCodes(filter, page, limit)` to:
  - Fetch filtered codes.
  - Return total count and pagination metadata (`page`, `pages`).

---

## ✨ Enhancement

Each returned code is enriched with virtual fields:
- `isActive`: True if `status === 'active'` and the current date is within `startDate` and `endDate`.
- `remainingUses`: Derived from `usageLimit - usageCount`.
- `links`: Adds URLs for both public and admin-level views of the promotion code.

---

## 📤 Response

- Structured JSON response with:
  - `success`: Boolean
  - `count`: Number of codes returned
  - `total`, `page`, `pages`: Pagination metadata
  - `promotionCodes`: Enhanced code array
  - `links`: Navigational pagination links (`first`, `last`, `prev`, `next`)

- Security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`

- Response status: `200 OK`

---

## ❌ Error Handling

- On any unexpected error:
  - Logs the error and optionally includes the stack trace (in development).
  - Completes the admin log with `'failed'` status and error details.
  - Responds with:
    - Status: `500 Internal Server Error`
    - Message: Developer-friendly if in `development` mode
    - Request ID: `req.id` (for traceability)

---

## ✅ Summary

This method is:
- Secure: Uses structured logging and validation.
- Flexible: Dynamically builds filters based on query input.
- Resilient: Handles failure gracefully.
- Admin-friendly: Fully audit-logged for backend monitoring.


## 📥 Request Body Example (JSON)

```json
{
  "status": "active",
  "type": "percentage",
  "active": true,
  "search": "summer",
  "page": 1,
  "limit": 10
}
```
