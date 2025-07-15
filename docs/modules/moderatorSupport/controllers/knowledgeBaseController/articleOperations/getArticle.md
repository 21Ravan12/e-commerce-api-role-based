# getArticle.md

This method `getArticle` handles HTTP requests to fetch a specific article by its ID. It includes validation, logging, auditing, and error handling to ensure secure and traceable data retrieval.

---

## Function: `async getArticle(req, res)`

### Purpose:
To retrieve an article from the database using the article ID provided in the request parameters and return it as a JSON response.

---

### Step-by-step Explanation:

1. **Logging the Request:**
   - Logs an informational message with the article ID and client IP for monitoring and debugging.
   ```js
   logger.info(`Get article request for ID: ${req.params.id} from IP: ${req.ip}`);

2. **Validating Article ID:**

   * Uses `mongoose.Types.ObjectId.isValid` to verify if the supplied `id` is a valid MongoDB ObjectId.
   * Throws an error immediately if invalid to prevent malformed queries.

   ```js
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
     throw new Error('Invalid article ID');
   }
   ```

3. **Fetching the Article:**

   * Calls an external asynchronous function `getArticle` (assumed imported or defined elsewhere) passing the article ID.
   * Waits for the article data to be retrieved from the database or other data source.

   ```js
   const article = await getArticle(req.params.id);
   ```

4. **Audit Logging:**

   * Records an audit log entry for this action, capturing:

     * Action name (`knowledge_base_get_article`)
     * Event type (`get_article`)
     * The user role or source (`moderator`)
     * Target model (`Article`) and target ID (article ID)
     * The user performing the action (`req.user?._id`, if authenticated)
     * IP address and user-agent string for traceability

   ```js
   await AuditLog.createLog({
     action: 'knowledge_base_get_article',
     event: 'get_article',
     source: 'moderator',
     targetModel: 'Article',
     targetId: req.params.id,
     performedBy: req.user?._id,
     ip: req.ip,
     userAgent: req.get('User-Agent')
   });
   ```

5. **Sending the Response:**

   * Returns HTTP 200 status with a JSON body containing:

     * The article data in a `data` field
     * A current timestamp in ISO format

   ```js
   res.status(200).json({
     data: article,
     timestamp: new Date().toISOString()
   });
   ```

6. **Error Handling:**

   * Any errors thrown during validation, fetching, or logging are caught in the `catch` block.
   * Delegates error response formatting to `this.handleError(res, error)` method, assumed to send appropriate HTTP error codes and messages.

   ```js
   } catch (error) {
     this.handleError(res, error);
   }
   ```

---

## Summary

`getArticle` is a robust controller method that:

* Validates the request parameter to avoid invalid database queries.
* Retrieves the requested article asynchronously.
* Creates an audit log to track who accessed what and when.
* Returns the article with a timestamp on success.
* Handles any errors gracefully through a centralized handler.

## 📥 Request Body Example (JSON)

This endpoint does **not require a request body**. The article is retrieved using the `id` provided as a **URL parameter**.

```json
// No body required for this GET request
{}
