# getTrendingProducts.md

This function `getTrendingProducts` handles HTTP requests to fetch a list of trending products based on recent activity.

---

## Function Overview

### `async getTrendingProducts(req, res)`

- **Purpose:**  
  Retrieves trending products filtered by a configurable time window and result limit, then sends them as a JSON response.

- **Logging:**  
  Logs the incoming request's IP address for monitoring and analytics using a `logger` service.

- **Query Parameters:**  
  - `limit` (optional): Maximum number of products to return. Defaults to `10` if not provided.  
  - `days` (optional): Number of past days to consider for trending calculations. Defaults to `7`.

- **Data Fetching:**  
  Calls a model method `Product.getTrendingProducts` passing an object with `{ limit, days }` to get the filtered products.

- **Response:**  
  - On success: Returns HTTP status `200` with the products array in JSON format.  
  - On failure: Logs the error with message and stack trace, and responds with HTTP status `500` including the error message in JSON.

---

## Error Handling

- All exceptions thrown during the asynchronous operation are caught.  
- Errors are logged with detailed stack information for easier debugging.  
- Clients receive a generic error response with appropriate HTTP status.

---

## Summary

This controller method provides a clean, parameterized endpoint to serve trending products dynamically, incorporating robust logging and error management to ensure reliability and maintainability.


## 📥 Request Body Example (JSON)

```json
{}
```
