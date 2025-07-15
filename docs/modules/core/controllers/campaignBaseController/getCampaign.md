# getCampaign.md

This function handles the **GET request** to retrieve a campaign by its ID and respond with detailed campaign information. It includes structured logging, error handling, and security headers.

---

## Function: `getCampaign(req, res)`

### Overview
- Receives a request containing a campaign ID via `req.params.id`.
- Uses a static method `Campaign.getCampaignById` to fetch the campaign data from the database.
- Returns a structured JSON response with the campaign details.
- Implements detailed logging and sets HTTP security headers.
- Handles different error cases gracefully with appropriate HTTP status codes.

---

### Step-by-step explanation:

1. **Logging the request**  
   Logs an info-level message indicating which campaign ID is requested and the client's IP address:
   ```js
   logger.info(`Get campaign request for ID: ${req.params.id} from IP: ${req.ip}`);

2. **Fetching the campaign**
   Uses an asynchronous static method `Campaign.getCampaignById` to get the campaign object by its ID:

   ```js
   const campaign = await Campaign.getCampaignById(req.params.id);
   ```

3. **Preparing the response data**
   Extracts all relevant fields from the retrieved campaign into a clean JSON object:

   * Basic info like `id`, `campaignName`, `campaignType`, `status`, `startDate`, `endDate`.
   * Limits and usage details like `usageLimit`, `usageCount`, `minPurchaseAmount`, `maxDiscountAmount`.
   * Related metadata such as `customerSegments`, `landingPageURL`, `bannerImage`, `createdAt`, `updatedAt`.
   * Lists and references like `validCategories`, `excludedProducts`, `customCustomers`, `promotionCodes`.
   * Audit fields like `createdBy`, `updatedBy`.

4. **Conditional data addition**
   If the campaign type is `"percentage"`, it explicitly ensures `maxDiscountAmount` is included (already part of the base object but reaffirmed here).

5. **Setting security headers & sending response**
   Adds HTTP headers to improve security:

   * `X-Content-Type-Options: nosniff` — prevents MIME type sniffing.
   * `X-Frame-Options: DENY` — prevents clickjacking via iframe embedding.
     Responds with status 200 and the JSON campaign data.

6. **Error Handling**
   Catches errors during processing:

   * Logs an error with the message and optionally stack trace in development mode.
   * Determines the status code based on error message:

     * `400` for invalid campaign ID format.
     * `404` if campaign not found.
     * `500` for other server errors.
   * Sends a JSON error response with an `error` message and debug info if in development.

---

### Summary

This method provides a **robust, secure, and informative endpoint** for retrieving campaign details by ID. It ensures clear logging, comprehensive error reporting, and applies best practices for HTTP security headers.

---

## 📥 Request Body Example (JSON)

This endpoint retrieves a campaign by its ID and does **not require a request body** since the campaign ID is passed as a URL parameter.

Replace `:id` with the campaign's unique identifier (e.g., `"60f5a3d7e13b4c001c8f1234"`).

No JSON body is sent with this request.
