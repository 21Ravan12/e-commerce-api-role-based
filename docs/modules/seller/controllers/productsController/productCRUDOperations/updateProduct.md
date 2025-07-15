# updateProduct.md

This function `updateProduct` handles HTTP requests to update a product’s details securely and reliably. It performs validation, updates the product data, logs the operation for auditing, clears relevant cache, and responds with the update status.

---

## Function Overview

### 1. **Logging Request**
- Logs the incoming update request with the product ID and client IP for traceability.

### 2. **Content-Type Validation**
- Ensures the request's `Content-Type` is `application/json`.
- If not, responds with HTTP 415 (Unsupported Media Type) and an error message.

### 3. **Request Body Extraction**
- Extracts the update data from `req.body` for processing.

### 4. **Update Logic Invocation**
- Calls a domain-level function `Product.updateProduct` with:
  - The product ID from URL params (`req.params.id`).
  - The update data payload (`value`).
  - The authenticated user making the request (`req.user`).
- This function returns:
  - `updatedProduct`: the updated product document.
  - `changes`: a summary of the changes applied.

### 5. **Audit Logging**
- Creates an audit log entry recording:
  - The action type (`update`), entity (`product`), and the product's ID.
  - The user who performed the update.
  - Event type (`product_updated`), source (`web`), IP address, and User-Agent header.
  - Metadata containing the detailed changes and updated product name.
- This supports accountability and traceability of changes.

### 6. **Cache Invalidation**
- Removes the product cache entry in Redis (`product:<id>`) to ensure subsequent reads fetch fresh data.

### 7. **Response**
- Sends back HTTP 200 OK with a success message and partial updated product data (id, name, status).

### 8. **Error Handling**
- Catches any error during the process.
- Logs error details with stack trace.
- Responds with appropriate HTTP status code (defaults to 500).
- Includes error message and, if validation errors (status 400), additional error details.

---

## Summary

`updateProduct` is a robust Express route handler that:

- Validates input and content type.
- Delegates update logic to a service/model layer.
- Maintains audit logs for transparency.
- Handles cache invalidation.
- Sends clear success or error responses.

## 📥 Request Body Example (JSON)

The request body must be in `application/json` format. It should contain one or more fields to update the product. Below is an example of a typical request body:

```json
{
  "name": "Ultra HD Smart TV",
  "description": "Updated model with better sound and HDR support.",
  "price": 799.99,
  "status": "active",
  "category": "electronics",
  "stock": 45,
  "tags": ["tv", "smart", "hdr", "4k"],
  "discount": {
    "type": "percentage",
    "value": 10
  }
}
