# getComments.md

This file explains the logic of the `getComments` controller method, which retrieves comments for a specific ticket. It includes **access control**, **validation**, **logging**, and **audit trail recording** to ensure secure and traceable comment retrieval operations.

---

## 📥 Function: `async getComments(req, res)`

### 🔍 Step-by-Step Breakdown:

---

### 1. **Initial Logging**
```js
logger.info(`Get comments for ticket ID: ${req.params.id} from IP: ${req.ip}`);
````

Logs the request to fetch comments for a specific ticket ID, along with the client IP address. This helps in tracing and debugging request origin.

---

### 2. **Ticket ID Validation**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid ticket ID');
}
```

Ensures the provided ticket ID is a valid MongoDB ObjectId. If it's malformed, throws an error to prevent unnecessary DB queries.

---

### 3. **Query Parameters & Role-Based Access**

```js
const { includeInternal = false } = req.query;
const showInternal = req.user.role === 'admin' && includeInternal === 'true';
```

Determines whether **internal comments** should be included:

* Controlled via `?includeInternal=true` query param.
* Only users with the `admin` role can see internal comments.
* `showInternal` becomes `true` only if both conditions are met.

---

### 4. **Comment Retrieval**

```js
const comments = await getComments(req.params.id, showInternal);
```

Fetches comments from the database using the ticket ID and the `showInternal` flag. The underlying `getComments` method is assumed to handle the actual database logic.

---

### 5. **Audit Logging**

```js
await AuditLog.createLog({
  action: 'ticket_get_comments',
  event: 'comments_get_ticket',
  source: 'web',
  targetModel: 'Ticket',
  targetId: req.params.id,
  performedBy: req.user._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    commentsCount: comments.length,
    includeInternal: showInternal
  }
});
```

Creates an audit log to track:

* **Who** accessed the comments (`performedBy`)
* **What** was accessed (`ticket ID`)
* **Where** it came from (IP, User-Agent)
* **Additional details** like the number of comments and whether internal ones were included.

This is essential for compliance and traceability, especially in sensitive or regulated systems.

---

### 6. **Success Response**

```js
res.status(200).json({
  ticketId: req.params.id,
  comments,
  timestamp: new Date().toISOString()
});
```

Returns:

* The ticket ID
* The retrieved comments
* A timestamp of the response

Ensures the frontend receives a structured, informative payload.

---

### 7. **Error Handling**

```js
this.handleError(res, error);
```

Delegates error response formatting to a centralized handler method, improving consistency across routes.

---

## ✅ Summary

This method is a secure and auditable way to fetch ticket-related comments. It enforces:

* Proper input validation
* Role-based visibility
* Transparent request tracing
* Centralized error management

It’s ideal for systems that require detailed operational accountability and user permission controls.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body, as it fetches comments for a given ticket ID via URL parameter and optional query parameters.

- **Path Parameter:**
  - `id` (string, required): The MongoDB ObjectId of the ticket whose comments are to be retrieved.

- **Query Parameters:**
  - `includeInternal` (boolean, optional): Set to `"true"` (string) to include internal/admin-only comments if the requesting user is an admin. Defaults to `false`.

---

### Example Request URL

```

GET /tickets/60d5f4832f8fb814c89a1234/comments?includeInternal=true

```

_No JSON body is needed for this GET request._
