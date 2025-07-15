# createTicket.md

This method handles **creating a new support ticket** from a client request. It validates input, persists the ticket, logs the action for auditing, and responds with success or error.

---

## Function: `createTicket(req, res)`

### 1. Logging Request Source
- Logs the incoming request IP address for traceability using `logger.info`.

### 2. Content-Type Validation
- Checks if the request content type is `application/json`.
- Throws an error if not, enforcing API contract compliance.

### 3. Extracting and Validating Input
- Destructures `title`, `subject`, `description`, `priority` (default `"medium"`), and `category` from `req.body`.
- Requires `subject` and `description` to be present; otherwise, throws an error.

### 4. Ticket Creation
- Calls a helper function `createTicket` (assumed imported or globally available), passing:
  - Ticket data including `title`, `subject`, `description`, `priority`, `category`.
  - The authenticated user’s ID (`req.user._id`) as `createdBy`.
  - Default ticket status set to `"open"`.
- The user ID is also passed separately for any permission/context purposes.

### 5. Audit Logging
- After ticket creation, logs the event using `AuditLog.createLog` with details:
  - Action: `"ticket_create"`.
  - Event: `"create_ticket"`.
  - Source: `"web"` (indicates request origin).
  - Target Model/ID: references the created ticket.
  - Actor: current user ID.
  - IP address and user agent from the request.
  - Ticket-specific details such as `subject` and `priority`.

### 6. Response
- On success, returns HTTP status `201 Created` with JSON containing:
  - Confirmation message.
  - The new ticket’s ID.
  - Current ticket status.
  - Timestamp of creation in ISO string format.

### 7. Error Handling
- Catches all errors and delegates to `this.handleError(res, error)`, which presumably sends appropriate error responses.

---

## Summary
This method enforces strict input validation, securely creates a support ticket linked to the authenticated user, maintains audit trails for compliance and debugging, and provides clear client feedback on operation success or failure.


## 📥 Request Body Example (JSON)

When sending a `POST` request to create a new support ticket, ensure the `Content-Type` header is set to `application/json`. Below is a sample body:

```json
{
  "title": "Login Issue",
  "subject": "Cannot access my account",
  "description": "I'm receiving a 'User not found' error when I try to log in.",
  "priority": "high",
  "category": "authentication"
}
````

### 📝 Field Descriptions:

* `title` *(optional)*: A short label or name for the ticket.
* `subject` *(required)*: The main subject or summary of the issue.
* `description` *(required)*: A detailed explanation of the problem.
* `priority` *(optional)*: Priority level (`low`, `medium`, or `high`). Defaults to `medium`.
* `category` *(optional)*: Logical grouping for the issue (e.g., `billing`, `technical`, `authentication`).
