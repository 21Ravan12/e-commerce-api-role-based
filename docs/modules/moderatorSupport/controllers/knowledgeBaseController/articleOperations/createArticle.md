# createArticle.md

This function `createArticle` handles the creation of a new article via an HTTP POST request. It performs validation, calls the service to create the article, logs the action for auditing, and sends an appropriate JSON response.

---

## Function Breakdown

### 1. Logging Request Origin
- Logs the incoming request IP using a custom `logger` for monitoring and troubleshooting:
  ```js
  logger.info(`Create article request from IP: ${req.ip}`);

### 2. Content-Type Validation

* Ensures the request content type is `application/json`. If not, it throws an error to enforce proper API usage:

  ```js
  if (!req.is('application/json')) {
    throw new Error('Content-Type must be application/json');
  }
  ```

### 3. Extracting Article Data

* Reads the article data payload from `req.body`.
* Adds `lastModifiedBy` field with the current user's ID (`req.user._id`), indicating who last modified the article.

### 4. Creating the Article

* Calls an asynchronous `createArticle` service method passing the article data and the user ID.
* Waits for the result which includes the newly created article's details (like `_id`, `title`, and `status`).

### 5. Audit Logging

* After creation, it creates an audit log entry capturing:

  * Action name and event type.
  * Source of the action (here, `"moderator"`).
  * Target model and its ID (the newly created article).
  * Who performed the action (current user ID).
  * IP address and User-Agent string from the request.
  * Additional details like article title and status.

  This helps maintain accountability and traceability of changes.

### 6. Response to Client

* Returns HTTP 201 Created status.
* Sends a JSON object containing:

  * A success message or an error message based on the result.
  * The newly created article's ID.
  * A timestamp marking when the article was created.

### 7. Error Handling

* Catches any errors during the process and delegates error handling to `this.handleError(res, error)`, which likely formats and sends error responses.

---

## Summary

`createArticle` ensures that:

* The request is valid and authorized.
* The article is created with proper attribution.
* All actions are auditable.
* The client receives clear feedback on the creation status.

## 📥 Request Body Example (JSON)

```json
{
  "title": "How to Reset Your Password",
  "content": "To reset your password, go to the login page and click 'Forgot Password'. Follow the instructions sent to your email.",
  "category": "Account Management",
  "tags": ["password", "account", "security"],
  "status": "published" // or "draft"
}
