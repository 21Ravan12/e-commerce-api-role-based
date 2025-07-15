# createProduct.md

This function handles the **creation of a new product** via an HTTP request in an Express.js environment. It performs validation, database insertion, logging, cache invalidation, and returns a structured JSON response or an error.

---

## Function: `createProduct(req, res)`

### Overview
- Accepts product creation requests from authenticated users.
- Expects request body in JSON format with product details.
- Stores product data in the database, associates it with the seller (current user).
- Logs the creation action in an audit log.
- Clears relevant Redis cache for data consistency.
- Sends a success response with product info and links.
- Handles and responds to errors with appropriate HTTP status codes.

---

### Detailed Steps

1. **Logging Request Origin**
   - Logs the incoming product creation request with the client IP (`req.ip`).

2. **Content-Type Validation**
   - Checks if the request `Content-Type` is `application/json`.
   - If not, throws an error to enforce proper API usage.

3. **Extracting Request Body**
   - Destructures product details from `req.body`.

4. **Database Operation**
   - Calls `Product.createProduct()` passing:
     - All product details from the request.
     - `seller` and `lastUpdatedBy` set as the authenticated user's ID (`req.user._id`).
     - The authenticated user object as context.
   - This method creates and saves the product in the database.

5. **Audit Logging**
   - Creates an audit log entry capturing:
     - Action: `'create'`
     - Entity: `'product'`
     - IDs for product and user
     - IP address and user agent for traceability
     - Event name: `'product_created'`
     - Source: `'web'`
     - Metadata including product name and categories for context.

6. **Cache Invalidation**
   - Removes any cached product data in Redis keyed by `product:{product.id}` to prevent stale reads.

7. **Response Preparation**
   - Constructs a JSON response including:
     - Success message.
     - Product basic info (id, name, slug, price, status).
     - Useful links for viewing and editing the product.

8. **Sending Response**
   - Sets HTTP security headers:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
   - Responds with HTTP 201 Created status and the JSON payload.

---

### Error Handling

- Catches any exceptions during the process.
- Logs the error message and stack trace.
- Determines the appropriate HTTP status code based on error message content:
  - `415` for incorrect Content-Type.
  - `400` for validation or invalid input errors.
  - `409` for conflicts such as duplicate products.
  - `404` if referenced entities not found.
  - `403` for authorization failures.
  - Defaults to `500` for unexpected server errors.
- Sends JSON error response with message and optional validation details (for 400 status).

---

### Summary

This method provides a **secure, validated, and audited endpoint** for product creation that integrates:

- Content validation
- User association
- Audit trail
- Cache management
- Security headers
- Granular error responses

## 📥 Request Body Example (JSON)

```json
{
  "name": "Wireless Bluetooth Headphones",
  "description": "High quality wireless headphones with noise cancellation",
  "price": 99.99,
  "categories": ["electronics", "audio"],
  "status": "active",
  "stock": 150,
  "sku": "WBH-12345",
  "tags": ["wireless", "bluetooth", "headphones"],
  "images": [
    "https://example.com/images/product1.jpg",
    "https://example.com/images/product1-2.jpg"
  ],
  "attributes": {
    "color": "black",
    "batteryLife": "20 hours",
    "weight": "250g"
  }
}
