# getDiscountedProducts.md

This function handles the HTTP request to **fetch a list of discounted products** from the database and respond with the results in JSON format.

---

## Function: `getDiscountedProducts(req, res)`

### Purpose
- Retrieve discounted products with an optional limit on the number of items returned.
- Provide logging for both successful requests and errors.

### Inputs
- **Request (`req`)**
  - Query parameter `limit` (optional): Number of discounted products to return. Defaults to 10 if not provided.
- **Response (`res`)**
  - Sends back the retrieved product list or an error message.

### Process
1. **Logging the request:**
   - Logs the requester's IP address for monitoring and debugging.
2. **Reading the limit:**
   - Extracts `limit` from query parameters, converting it to a number.
3. **Fetching discounted products:**
   - Calls `Product.getDiscountedProducts` method, passing the `limit`.
   - Assumes this method returns an array of discounted products.
4. **Responding to the client:**
   - On success, responds with HTTP 200 status and JSON array of products.
5. **Error handling:**
   - If any error occurs during fetching or processing:
     - Logs the error message and stack trace.
     - Responds with HTTP 500 status and JSON error message.

---

### Summary
This function is a clean, asynchronous Express.js route handler that efficiently retrieves discounted products based on client request parameters, logs key events, and gracefully handles errors to ensure stable API behavior.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body. It accepts an optional query parameter `limit` to specify the maximum number of discounted products to return.

Example request URL with query parameter:

```http
GET /discounted-products?limit=10
```

* `limit` (optional): Number — maximum number of products to return (default is 10).

No JSON body is sent in the request.
