# archiveReturnRequest.md

This function handles the **archiving (soft deletion) of a return request** in the system, ensuring audit logging, security headers, and detailed logging for traceability.

---

## Function: `archiveReturnRequest(req, res)`

### Purpose
- To mark a return request as archived instead of permanently deleting it.
- Log the action for audit purposes.
- Respond with appropriate success or error messages.
- Maintain strong security and traceability practices.

---

### Step-by-step Explanation

1. **Transaction ID and Timing:**
   - Generates a unique `transactionId` for tracking the request, either from the `x-request-id` header or by creating a new 16-byte hex string.
   - Captures the start time to measure total processing duration.

2. **Logging Request Initiation:**
   - Logs the beginning of the archive operation, including the transaction ID and the user's IP address.

3. **Soft Delete Operation:**
   - Calls the static method `ReturnRequest.deleteReturnRequest` with:
     - The return request ID from URL parameters (`req.params.id`).
     - The authenticated user object (`req.user`).
   - This method performs a *soft delete* (archiving), returning:
     - `archivedRequest`: the raw archived record.
     - `data`: sanitized data for response.

4. **Audit Logging:**
   - Creates an audit log entry with details:
     - Event name (`RETURN_REQUEST_ARCHIVED`)
     - Action type (`archive`)
     - Entity info (`return_request`, its ID)
     - User ID performing the action
     - Source (`web`)
     - Client IP and user agent string
     - Metadata including `transactionId`, `returnType`, and new status of the request

5. **Response Preparation:**
   - Constructs a JSON response confirming success, including:
     - The ID of the archived request
     - The updated status
     - Timestamp of archiving (`archivedAt`)

6. **Security Headers:**
   - Sets HTTP headers to improve security:
     - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
     - `X-Frame-Options: DENY` (prevents clickjacking)
     - `Content-Security-Policy: default-src 'self'` (restricts resource loading)
     - Custom header `X-Request-ID` with the transaction ID for tracing

7. **Send Success Response:**
   - Sends HTTP status 200 with the JSON response.

8. **Performance Logging:**
   - Calculates and logs elapsed time for the operation.
   - Logs include transaction ID, request ID, processing time in milliseconds, and user ID.

---

### Error Handling

- Catches any error during the process.
- Logs detailed error information including stack trace, user ID, and return request ID for troubleshooting.
- Sends a standardized error response with:
  - Success flag `false`
  - Error message and optional error details
  - Transaction ID for correlation
  - HATEOAS link to API documentation for the delete return request endpoint
- Uses `error.statusCode` or defaults to HTTP 500.

---

### Summary

This method is designed for robustness, security, and traceability:

- Uses **transaction IDs** to track requests end-to-end.
- Maintains **audit logs** for compliance and debugging.
- Enforces **security best practices** via HTTP headers.
- Provides **clear success and error responses** with actionable links.
- Measures and logs **performance metrics** to monitor system health.

It ensures that archiving return requests is reliable, observable, and safe.

---

## 📥 Request Body Example (JSON)

This endpoint **does not require a request body** as it archives a return request identified by the `id` URL parameter. The necessary inputs are provided via headers and URL parameters.

---

### URL Parameters
- `id` (string): The unique identifier of the return request to archive.

### Headers
- `Authorization` (string): Bearer token for authentication (required).
- `X-Request-ID` (string, optional): A client-generated transaction ID for tracing. If not provided, the server generates one.
- `User-Agent` (string): Automatically included by clients for logging.

---

### Example

```http
DELETE /return-requests/60d21b4667d0d8992e610c85 HTTP/1.1
Host: api.example.com
Authorization: Bearer your_jwt_token_here
User-Agent: PostmanRuntime/7.29.2
