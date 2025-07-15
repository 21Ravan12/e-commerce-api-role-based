# getNewArrivals.md

This function handles HTTP requests to fetch **new arrival products** from the database, applying optional query parameters for pagination and recency.

---

## Function: `getNewArrivals(req, res)`

### Purpose
- To retrieve a list of newly arrived products within a specified recent timeframe.
- To respond with JSON containing product data or an error message.

### Workflow

1. **Logging Request**
   - Logs an informational message including the client's IP address (`req.ip`) for monitoring and analytics.

2. **Reading Query Parameters**
   - `limit`: Maximum number of products to return.
     - Defaults to 10 if not specified or invalid.
   - `days`: Defines how recent products should be (e.g., products added in the last `days` days).
     - Defaults to 30 days if not specified.

3. **Fetching Data**
   - Calls a static method `Product.getNewArrivals`, passing:
     - The `Product` model reference.
     - The options object `{ limit, days }`.
   - This method is expected to query the database for products added within the last `days` and limit results to `limit`.

4. **Sending Response**
   - On success, responds with HTTP 200 and a JSON array of product objects.

5. **Error Handling**
   - Logs detailed error information including message and stack trace.
   - Responds with HTTP 500 and JSON containing the error message.

---

## Summary
- This controller action is a clean, robust endpoint for delivering new product listings.
- It uses query parameters to allow clients to customize results.
- Includes logging for both usage tracking and error diagnosis.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it fetches data based on query parameters.

Example query parameters:

```json
{
  "limit": 10,
  "days": 30
}
````

* `limit` (optional): Number of new arrival products to return. Defaults to 10 if omitted.
* `days` (optional): Number of past days to consider when filtering new arrivals. Defaults to 30 if omitted.

Example usage in URL:

```
GET /new-arrivals?limit=5&days=15
```
