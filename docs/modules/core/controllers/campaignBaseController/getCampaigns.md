# getCampaigns.md

This method handles **fetching a paginated list of campaigns** with various filtering and sorting options, then returns a structured JSON response including metadata and campaign details.

---

## Function: `getCampaigns(req, res)`

### 1. Logging the Request
- Logs the incoming request with user ID (if available), query parameters, and client IP.
- Helps track usage and debug issues related to specific users or requests.

### 2. Retrieving Campaign Data
- Calls a static method `Campaign.getCampaignsList()` with filters and pagination parameters extracted from `req.query`:
  - `page`, `limit`: control pagination.
  - `status`, `type`, `active`, `upcoming`, `expired`: filter campaigns by lifecycle or type.
  - `search`: keyword search within campaigns.
  - `sort`: sorting criteria.
- The method returns an object with:
  - `campaigns`: array of campaign documents matching criteria.
  - `total`: total count of campaigns matching the filters.
  - `page`: current page number.
  - `pages`: total number of pages.

### 3. Preparing the Response
- Builds a structured response object:
  - `meta`: metadata including success flag, counts, pagination info, and applied filters (only if any filters were sent).
  - `data`: maps the campaigns array into a sanitized list with selected fields:
    - Core identifiers (`id`, `name`, `type`, `status`, `isActive`).
    - Campaign active dates (`start`, `end`).
    - Usage statistics (`limit`, `remaining`, `count`).
    - Restrictions (min purchase, max discount, categories, excluded products count).
    - Audience segmentation (segments, custom customers count).
    - Campaign assets (banner image URL, landing page URL).
    - Creator info and timestamps (`createdBy`, `createdAt`, `updatedAt`).

### 4. Sending the Response
- Sets HTTP status `200 OK`.
- Adds an HTTP header `X-Total-Count` for total campaigns count (useful for client-side pagination).
- Sends JSON payload with the response structure.

### 5. Error Handling
- On failure, logs the error with user ID and query context.
- Responds with status `500 Internal Server Error` and a JSON object:
  - `meta.success`: `false`
  - `meta.error`: a short error code `"campaign_fetch_failed"`
  - `meta.message`: a user-friendly message.
  - `details`: detailed error info (message and stack trace) only included in development mode for debugging.

---

## Summary

This method provides a robust, paginated, and filterable API endpoint for retrieving campaign data with full contextual logging and structured error handling, facilitating both client consumption and backend maintenance.

---

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body as it is a `GET` request that retrieves a list of campaigns using query parameters.

---

### Supported Query Parameters (all optional):

```json
{
  "page": "number (integer, e.g. 1)",
  "limit": "number (integer, e.g. 10)",
  "status": "string (e.g. 'active', 'expired')",
  "type": "string (campaign type filter)",
  "active": "boolean (true or false to filter active campaigns)",
  "upcoming": "boolean (true or false to filter upcoming campaigns)",
  "expired": "boolean (true or false to filter expired campaigns)",
  "search": "string (search term to filter campaigns by name or other fields)",
  "sort": "string (sorting criteria, e.g. 'startDate', '-createdAt')"
}
