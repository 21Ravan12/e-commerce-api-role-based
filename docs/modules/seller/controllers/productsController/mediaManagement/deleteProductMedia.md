# deleteProductMedia.md

This function `deleteProductMedia` handles the deletion of a specific media item associated with a product. It performs authorization checks, deletes the media, logs the event for auditing, and responds appropriately to the client.

---

## Function: `async deleteProductMedia(req, res)`

### Purpose
- To delete a media asset (e.g., image or video) from a product by its `mediaId`.
- Ensure the user is authorized to perform the deletion.
- Log the deletion event with detailed metadata for auditing.
- Provide appropriate HTTP responses and error handling.

---

### Workflow

1. **Logging the request**  
   Logs the incoming request with product ID, user IP, and request metadata for traceability:
   ```js
   logger.info(`Product media delete request for ID: ${req.params.id} from IP: ${req.ip}`);

2. **Media Deletion**
   Calls the model-layer method `Product.deleteProductMedia` with:

   * `req.params.id` — the product ID
   * `req.params.mediaId` — the media ID to delete
   * `req.user` — the authenticated user object (used for authorization)

   This method is expected to handle validation, authorization, and the actual removal from database/storage.

3. **Audit Logging**
   After successful deletion, an audit log is created via `AuditLog.createLog` with:

   * `event`: Describes the event type (`product_media_deleted`)
   * `user`: User ID who performed the deletion
   * `ip`: Request IP address
   * `userAgent`: Client user-agent string
   * `source`: Request source (`api`)
   * `action`: The performed action (`delete`)
   * `entityType`: Type of entity affected (`product`)
   * `entityId`: Product ID related to the deletion
   * `status`: Outcome status (`success`)
   * `metadata`: Additional details like `mediaId`, `productId`, and a description of the action

4. **Response to Client**
   On success, returns HTTP 200 with a JSON message confirming the deletion and including the result data:

   ```json
   { "message": "Media removed successfully", "result": <result> }
   ```

5. **Error Handling**
   Catches any errors during the process, logs them with stack trace, and sends an appropriate HTTP error code based on the error message:

   * 403 Forbidden if authorization failed (`Not authorized`)
   * 404 Not Found if product or media does not exist (`not found`)
   * 500 Internal Server Error for any other issues

   The response JSON contains the error message:

   ```json
   { "error": "<error message>" }
   ```

---

### Summary

This method ensures **secure, auditable, and reliable** deletion of product media assets, integrating:

* Authorization checks
* Detailed audit logging for compliance and tracking
* Clear client communication with status codes and messages
* Robust error handling with categorized HTTP responses

## 📥 Request Body Example (JSON)

This endpoint **does not require a request body** since it deletes a specific media resource identified by URL parameters.

The required inputs are provided via URL parameters and authentication context:

* **URL parameters:**

  * `id`: Product ID (string) — the product to which the media belongs.
  * `mediaId`: Media ID (string) — the specific media item to delete.

* **Authentication:**

  * The request must include valid user authentication (e.g., JWT token in headers) to authorize deletion.

### Example

```
DELETE /products/{id}/media/{mediaId}
Authorization: Bearer <token>
```