# getVersion.md

This method, `getVersion`, is an Express.js route handler designed to **retrieve a specific version of a knowledge base article**. It ensures request validity, fetches the versioned content, logs the access for auditing, and returns a structured JSON response. It is typically part of a controller class (e.g., `KnowledgeBaseController`).

---

## 🔄 Method Signature

```js
async getVersion(req, res)
````

* **`req`**: Express request object, expected to contain `params.id` (article ID) and `params.version` (version number).
* **`res`**: Express response object, used to return the response or handle errors.

---

## 🔍 Step-by-Step Breakdown

### 1. **Log the Incoming Request**

```js
logger.info(`Get version request for article ID: ${req.params.id}, version: ${req.params.version} from IP: ${req.ip}`);
```

* Logs the article ID, requested version, and requester’s IP for monitoring and traceability.

---

### 2. **Validate the Article ID**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid article ID');
}
```

* Ensures `req.params.id` is a valid MongoDB ObjectId.
* Prevents malformed requests or injection attacks.

---

### 3. **Fetch the Article Version**

```js
const version = await getVersion(req.params.id, Number(req.params.version));
```

* Retrieves the requested article version by calling a helper function `getVersion`.
* `version` is cast to a number in case it's passed as a string.

---

### 4. **Create an Audit Log**

```js
await AuditLog.createLog({
  action: 'knowledge_base_get_version',
  targetId: req.params.id,
  event: 'get_version',
  source: 'web',
  performedBy: req.user?._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: { version: req.params.version }
});
```

* Stores a detailed audit record for compliance and accountability.
* Tracks:

  * Who performed the action (`performedBy`)
  * What was accessed (`targetId`, `version`)
  * Where it came from (`ip`, `userAgent`)
  * Why (`event`, `action`, `source`)

---

### 5. **Send JSON Response**

```js
res.status(200).json({
  articleId: req.params.id,
  version: req.params.version,
  data: version,
  timestamp: new Date().toISOString()
});
```

* Returns the article version along with contextual metadata.
* Uses HTTP 200 status to indicate success.

---

### 6. **Error Handling**

```js
} catch (error) {
  this.handleError(res, error);
}
```

* Captures and handles any thrown errors using the class’s `handleError` method.
* Ensures consistent error responses (e.g., 400/500 with message).

---

## 🧾 Summary

| Feature         | Purpose                                      |
| --------------- | -------------------------------------------- |
| **Validation**  | Ensures only valid article IDs are processed |
| **Logging**     | Tracks the request and user activity         |
| **Audit Trail** | Records access details for accountability    |
| **Modularity**  | Uses `getVersion()` utility for separation   |
| **Security**    | Handles errors gracefully and securely       |

---


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. It fetches a specific version of an article using URL parameters.

- **HTTP Method:** GET  
- **URL Pattern:** `/articles/:id/versions/:version`


### Example URL:
```
GET /articles/60d5ec49f1a4c12a34567890/versions/3
```

No JSON body is sent with this request; all inputs come from the URL path parameters:

| Parameter | Type   | Description                        | Example                   |
|-----------|--------|----------------------------------|---------------------------|
| `id`      | string | MongoDB ObjectId of the article  | `60d5ec49f1a4c12a34567890`|
| `version` | number | Version number of the article    | `3`                       |
```
