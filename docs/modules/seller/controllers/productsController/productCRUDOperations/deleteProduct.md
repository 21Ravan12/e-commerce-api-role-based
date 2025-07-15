# deleteProduct.md

This function `deleteProduct` handles the deletion (archiving) of a product in the system, including validation, logging, cache invalidation, and error handling.

---

## Function: `async deleteProduct(req, res)`

### Purpose:
Process a request to delete a product by its ID, ensuring proper validation, audit logging, cache management, and responding with appropriate status and messages.

---

### Step-by-step Explanation:

1. **Logging Request**
   - Logs the incoming deletion request with product ID and the requester's IP for traceability.
   ```js
   logger.info(`Product deletion request for ID: ${req.params.id} from IP: ${req.ip}`);

2. **Validate Product ID**

   * Uses Mongoose's `ObjectId.isValid` to check if the provided product ID in `req.params.id` is a valid MongoDB ObjectId.
   * Throws an error with message `"Invalid product ID"` if validation fails.

   ```js
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
     throw new Error('Invalid product ID');
   }
   ```

3. **Delete Product**

   * Calls the model method `Product.deleteProduct` passing the product ID and the authenticated user (`req.user`) to perform the deletion or archiving.
   * This method likely includes authorization and business logic checks internally.
   * Stores the result which includes the product ID and deletion timestamp.

   ```js
   const result = await Product.deleteProduct(req.params.id, req.user);
   ```

4. **Audit Logging**

   * Records the deletion action in an audit log for accountability.
   * The log includes:

     * Action type (`delete`)
     * Entity (`product`)
     * ID of the deleted product
     * User who performed the deletion
     * Event name (`product_deleted`)
     * Source of the event (`web`)
     * IP address and user agent from the request
     * Additional metadata with the deletion timestamp

   ```js
   await AuditLog.createLog({
     action: 'delete',
     entity: 'product',
     entityId: result.id,
     userId: req.user._id,
     event: 'product_deleted',
     source: 'web',
     ip: req.ip,
     userAgent: req.get('User-Agent'),
     metadata: {
       deletedAt: result.deletedAt
     }
   });
   ```

5. **Cache Invalidation**

   * Deletes any cached data for this product from Redis to prevent stale data from being served.
   * Uses a cache key pattern like `products:<productId>`.

   ```js
   await RedisClient.del(`products:${result.id}`);
   ```

6. **Success Response**

   * Sends a JSON response with status code `200` indicating successful archival.
   * Returns a message, the deleted product's ID, and the timestamp of deletion.

   ```js
   res.status(200).json({
     message: 'Product archived successfully',
     productId: result.id,
     timestamp: result.deletedAt
   });
   ```

7. **Error Handling**

   * Catches any errors thrown during the process.
   * Logs the error with stack trace for debugging.
   * Determines HTTP status code based on error message content:

     * `400` for invalid ID errors
     * `404` if product not found
     * `403` if authorization fails
     * `500` for general server errors
   * Sends a JSON response with the error message.

   ```js
   catch (error) {
     logger.error(`Product deletion error: ${error.message || 'Unknown error'}`, { stack: error.stack });

     const statusCode = error.statusCode || 
                        (error.message?.includes('Invalid') ? 400 :
                         error.message?.includes('not found') ? 404 :
                         error.message?.includes('Not authorized') ? 403 : 500);

     res.status(statusCode).json({ error: error.message || 'Internal server error' });
   }
   ```

---

### Summary:

`deleteProduct` securely deletes (archives) a product, ensuring:

* Input validation
* Authorization and business logic via model
* Audit trail for compliance
* Cache consistency
* Clear success/error feedback to the client
* Detailed logging for maintainability and debugging

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body.

All necessary data is passed via:
- **URL parameter**: `:id` (Product ID)
- **Authentication token**: via headers (e.g., `Authorization: Bearer <token>`)

✅ Ensure the request is a `DELETE` method to the following URL:
