# getAssignedTickets.md

This method handles fetching a paginated list of tickets assigned to a user, with audit logging, permission checks, and error handling.

---

## Overview

`getAssignedTickets(req, res)` is an asynchronous controller function designed to:

- Log the start and completion of the request for audit purposes.
- Validate user permissions to prevent unauthorized access to other users' tickets.
- Support pagination with sensible limits.
- Return tickets assigned to the authenticated user or a specified user (if authorized).
- Handle errors gracefully and log them.

---

## Step-by-Step Explanation

### 1. Audit Logging Start

- Calls `AuditLog.createTimedAdminLog()` to create a timed audit log entry for this action.
- Logs details including:
  - Action name: `'get_assigned_tickets'`
  - Target model: `'Ticket'`
  - User performing the action (`req.user._id` and email)
  - Client IP and user-agent
  - Source of the request (hardcoded as `'web'`)
  - Request details such as:
    - Requested user ID (query parameter `userId` or defaults to `'self'`)
    - Pagination parameters (`page` and `limit`)

This function returns a log entry and a `complete` function to finalize the log later.

---

### 2. Extract & Validate Query Parameters

- Extracts `userId`, `page`, and `limit` from `req.query`.
- Ensures:
  - `page` is at least 1.
  - `limit` is between 1 and 100 (to prevent excessively large queries).

---

### 3. Permission Check

- If `userId` is specified and differs from the authenticated user's ID:
  - Checks if the requester has the `'admin'` role.
  - If not admin, completes the audit log with status `'failed'`, logs unauthorized access details, and responds with HTTP 403 Forbidden and an error message.

---

### 4. Fetch Assigned Tickets

- Calls a service function `getAssignedTickets(userId, { page, limit })` to retrieve tickets assigned to the target user.
- The `userId` is either the requested user ID or defaults to the authenticated user’s ID.

---

### 5. Audit Log Completion (Success)

- Upon successful retrieval:
  - Calls `complete()` on the audit log with status `'success'`.
  - Includes details such as:
    - Target user ID
    - Final pagination info (`page`, `limit`, `total tickets`, `totalPages`)
    - Number of tickets returned

---

### 6. Response

- Returns HTTP 200 with JSON including:
  - `success: true`
  - `data`: array of tickets
  - `pagination`: current page, limit, total tickets, total pages
  - `timestamp`: current ISO timestamp

---

### 7. Error Handling

- Catches any errors during processing.
- Completes audit log with status `'failed'` and error details, including stack trace in development mode.
- Logs the error with a logger service.
- Responds with HTTP 500 and a consistent error message.
- In development mode, includes the system error message in the response for debugging.

---

## Summary

This method combines **secure, paginated data retrieval** with **comprehensive audit logging** and **strict authorization checks** to ensure only authorized users can access assigned tickets. It enforces sensible pagination limits and maintains consistent error handling and logging standards.


## 📥 Request Body Example (JSON)

This endpoint uses **query parameters** instead of a JSON body. However, for reference or usage in Postman, here is how to include parameters in the request:

**Method:** `GET`  
**URL Template:** `/tickets/assigned?userId=USER_ID&page=1&limit=10`

### 🔹 Query Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `userId`  | String | No       | ID of the user whose assigned tickets are requested. If omitted, returns tickets for the authenticated user. Requires `admin` role to access other users' tickets. |
| `page`    | Number | No       | Page number for pagination (default: `1`) |
| `limit`   | Number | No       | Number of tickets per page (default: `10`, max: `100`) |

### ✅ Example Request in Postman (as Query Parameters)
```json
{
  "userId": "65fbf0bd6a56e019f8142a3c",
  "page": 2,
  "limit": 20
}
