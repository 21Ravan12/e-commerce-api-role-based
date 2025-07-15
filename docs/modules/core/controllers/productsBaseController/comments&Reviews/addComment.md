# addComment.md

This function `addComment` handles adding a new comment with a rating to a specific product. It includes validation, database interaction, audit logging, and error handling.

---

## Function Overview

### `async addComment(req, res)`

- **Purpose:** Adds a user comment and rating to a product identified by `productId`.
- **HTTP Method:** Typically used as a POST handler on a route like `/products/:id/comments`.

---

## Detailed Breakdown

1. **Logging the Request**
   - Logs an info message with the target product ID and the IP address of the requester for traceability.
   ```js
   logger.info(`Add comment request for Product ID: ${req.params.id} from IP: ${req.ip}`);

2. **Extracting Parameters**

   * Retrieves the `productId` from URL parameters.
   * Extracts `commentText` and `rating` from the request body.
   * Extracts the authenticated user info from `req.user`.

3. **Validation**

   * Ensures `commentText` is provided and not just whitespace.
   * Ensures `rating` is provided (falsy or zero rating is rejected).
   * Throws an error if validation fails.

4. **Adding the Comment**

   * Calls `Product.addComment(productId, user._id, commentData)` to persist the comment.
   * Passes an object containing:

     * `commentText`
     * `rating`
     * `user` ID for author attribution.

5. **Audit Logging**

   * After successfully adding the comment, creates an audit log entry via `AuditLog.createLog`.
   * Logs event details including:

     * Event type (`comment_added`)
     * Action (`create`)
     * Entity (`comment`) and its ID
     * User ID, IP address, and User-Agent header for security tracking
     * Metadata with product ID, comment text, and rating

6. **Response**

   * On success, responds with HTTP 201 Created status.
   * Returns the newly created comment object as JSON.

---

## Error Handling

* Catches all errors during processing.
* Logs error details with stack trace for debugging.
* Determines status code based on error message:

  * `400 Bad Request` if comment text is empty.
  * `404 Not Found` if product or related entity is missing.
  * `500 Internal Server Error` for other unexpected failures.
* Sends a JSON response with an error message accordingly.

---

## Summary

This method ensures **secure, validated, and auditable** addition of comments tied to a product by authenticated users, making it suitable for review or feedback features in a web application.


## 📥 Request Body Example (JSON)
```json
{
  "commentText": "This product exceeded my expectations!",
  "rating": 5
}
