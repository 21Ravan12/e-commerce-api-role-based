# getComments.md

This function handles fetching paginated comments for a specific product, supporting sorting and robust error handling.

---

## Function: `getComments(req, res)`

### Purpose
Processes HTTP GET requests to retrieve comments related to a product identified by `productId`. It supports pagination and sorting via query parameters.

---

### Workflow

1. **Logging the Request**
   - Logs an info message with the product ID and requester IP for traceability.

2. **Extract Parameters**
   - `productId`: Extracted from URL path parameter `req.params.id`.
   - Query parameters:
     - `page` (default: 1) — current pagination page number.
     - `limit` (default: 10) — maximum comments to return per page.
     - `sort` (default: `-createdAt`) — sort order, e.g., newest first.

3. **Fetch Comments**
   - Calls `Product.getComments` with the `productId` and pagination options (page, limit, sort).
   - Converts `page` and `limit` to integers to ensure correct types.

4. **Response**
   - On success, sends a JSON response with status 200 containing the comments array:
     ```json
     { "comments": [...] }
     ```

5. **Error Handling**
   - Catches exceptions during the fetch process.
   - Logs the error with stack trace for debugging.
   - Determines HTTP status code:
     - `404` if error message contains 'not found' (e.g., product or comments not found).
     - Otherwise `500` for internal server errors.
   - Sends JSON error response with appropriate status and error message.

---

### Summary

This method provides a clean, paginated, and sorted access point to product comments, with thorough logging and error management to facilitate both client usability and server diagnostics.


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body as it retrieves comments via query parameters and URL path.

Example URL parameters and query string:

```http
GET /products/:id/comments?page=1&limit=10&sort=-createdAt
````

Where:

* `:id` (path parameter): The ID of the product to get comments for.
* `page` (query parameter, optional): Page number for pagination (default: 1).
* `limit` (query parameter, optional): Number of comments per page (default: 10).
* `sort` (query parameter, optional): Sorting order, e.g., `-createdAt` for descending by creation date.

No JSON body is sent with the request.
