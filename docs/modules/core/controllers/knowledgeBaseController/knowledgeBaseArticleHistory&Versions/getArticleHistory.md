# getArticleHistory.md

This method `getArticleHistory` is an **Express route handler** used to fetch the full version history of a specific article in a knowledge base system. It includes validation, logging, audit tracking, and structured error handling.

---

## 🔧 Function Signature

```js
async getArticleHistory(req, res)
````

* **req**: Express `Request` object, expected to include:

  * `params.id`: The ID of the article to fetch history for.
  * `user`: The currently authenticated user (optional but used for audit logging).
* **res**: Express `Response` object used to return a JSON response or an error.

---

## 📋 Step-by-Step Explanation

### 1. **Logging Request Start**

```js
logger.info(`Get article history request for ID: ${req.params.id} from IP: ${req.ip}`);
```

* Logs the incoming request including article ID and client's IP for observability and debugging.

---

### 2. **Validate Article ID**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid article ID');
}
```

* Ensures the provided article ID is a valid MongoDB ObjectId.
* If not, throws an error which will be caught and handled later.

---

### 3. **Fetch Article History**

```js
const history = await getArticleHistory(req.params.id);
```

* Calls a separate utility or service function `getArticleHistory` (imported elsewhere).
* Returns a list of version objects associated with the article.

---

### 4. **Audit Logging**

```js
await AuditLog.createLog({
  action: 'knowledge_base_get_history',
  targetId: req.params.id,
  event: 'get_history',
  source: 'web',
  performedBy: req.user?._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    versionsCount: history.length
  }
});
```

* Creates a detailed audit log entry to track access to article history.
* Captures:

  * **Action type** (`get_history`)
  * **Actor identity** (`performedBy`)
  * **Request metadata** (IP address, user agent)
  * **Outcome details** (e.g. number of versions retrieved)

---

### 5. **Return Response**

```js
res.status(200).json({
  articleId: req.params.id,
  history,
  timestamp: new Date().toISOString()
});
```

* Sends back a success response including:

  * `articleId`: Echo of the requested ID
  * `history`: List of article versions
  * `timestamp`: When the request was handled (for client-side tracking)

---

### 6. **Error Handling**

```js
} catch (error) {
  this.handleError(res, error);
}
```

* Catches all errors and passes them to a custom `handleError` method defined elsewhere in the controller.
* Ensures standardized error response across the API.

---

## 🧩 Dependencies & Assumptions

* `getArticleHistory(id)` is a separate function that performs DB queries.
* `AuditLog.createLog()` tracks actions for compliance and traceability.
* `this.handleError()` provides unified error responses.
* `logger` is a centralized logging utility.

---

## ✅ Example Successful Response

```json
{
  "articleId": "60fead88c9b1f90017ef5a62",
  "history": [ /* array of version objects */ ],
  "timestamp": "2025-06-25T18:43:00.123Z"
}
```

---

## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body as it uses the article ID from the URL path parameter.

Example:  
No JSON body needed for this GET request.

---

Note:  
- Article ID is passed as a URL parameter: `/articles/:id/history`  
- Authentication token or session should be sent in headers if required by your API.
