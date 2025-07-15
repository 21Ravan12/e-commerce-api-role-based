# getComment.md

This function `getComment` is an asynchronous Express route handler designed to retrieve a product comment by its ID.

---

## Function Explanation

- **Purpose:**  
  Fetch a single comment using the `reviewId` parameter provided in the request URL.

- **Parameters:**  
  - `req`: Express request object, expects `req.params.reviewId` to hold the comment ID.  
  - `res`: Express response object, used to send the response back to the client.

- **Workflow:**  
  1. Logs an informational message indicating the requested comment ID and the client's IP address for traceability.  
  2. Extracts the `reviewId` from the request parameters and assigns it to `commentId`.  
  3. Calls `Product.getComment(commentId)` asynchronously to fetch the comment data from the database or service.  
  4. On success, sends back the retrieved comment as a JSON response with HTTP status `200 OK`.  
  5. If an error occurs (e.g., comment not found, database error), it logs the error with its stack trace.  
  6. Determines the HTTP status code based on the error message:  
     - Returns `404 Not Found` if the error message contains "not found".  
     - Returns `500 Internal Server Error` for all other errors.  
  7. Sends a JSON response with the error message and the determined status code.

---

## Logging

- Uses a `logger` service to record both informational events and error details, aiding in debugging and monitoring.

---

## Summary

`getComment` provides a clear, robust, and error-aware way to fetch a specific product comment by ID, ensuring proper HTTP status codes and detailed logging for client requests.


## 📥 Request Body Example (JSON)

This endpoint **does not require a request body** since it retrieves a comment by its ID via URL parameters. The comment ID should be provided in the URL path as `reviewId`.

Example request URL:

```
GET /comments/{reviewId}
```

Replace `{reviewId}` with the actual comment ID. No JSON body is sent with this request.

