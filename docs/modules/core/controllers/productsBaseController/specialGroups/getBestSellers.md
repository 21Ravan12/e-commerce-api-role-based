# getBestSellers.md

This function `getBestSellers` is an **Express.js controller method** that handles HTTP requests to retrieve a list of best-selling products, optionally filtered by a time range.

---

## Function Overview

### `async getBestSellers(req, res)`

- **Purpose**: Fetches the top-selling products based on query parameters and returns them as JSON.

---

## Detailed Explanation

1. **Logging Request**
   - Logs an informational message with the requester's IP address (`req.ip`) to track usage or for debugging.

2. **Query Parameters**
   - `limit`: Specifies how many products to return.
     - Extracted from `req.query.limit`.
     - Parsed as an integer.
     - Defaults to `10` if not provided or invalid.
   - `days`: Optional filter to limit best sellers to those sold in the last N days.
     - Extracted from `req.query.days`.
     - Parsed as an integer if provided.
     - If omitted, no time filtering is applied.

3. **Fetching Data**
   - Calls a model method `Product.getBestSellers` with the parameters:
     - The `Product` model itself (likely for context or static method usage).
     - An options object `{ limit, days }`.
   - Assumes this method returns an array of product objects sorted by sales volume or revenue.

4. **Successful Response**
   - Sends HTTP status `200 OK`.
   - Returns the retrieved products in JSON format.

5. **Error Handling**
   - Catches any errors thrown during processing.
   - Logs the error message and stack trace with `logger.error` for diagnostics.
   - Responds with HTTP status `500 Internal Server Error`.
   - Sends a JSON error object containing the error message.

---

## Summary

This controller method provides a clean, robust endpoint for retrieving best-selling products with optional filtering and limit parameters, complete with structured logging and error handling to ensure maintainability and observability.


## 📥 Request Body Example (JSON)

This endpoint **does not require a request body**. It uses query parameters to customize the response.

---

### Query Parameters

| Parameter | Type   | Description                                                            | Default |
| --------- | ------ | ---------------------------------------------------------------------- | ------- |
| `limit`   | Number | Number of best-selling products to return                              | 10      |
| `days`    | Number | Optional. Filter best sellers within the last specified number of days | None    |

---

### Example Request (GET)

```
GET /best-sellers?limit=5&days=30
```

No JSON body is sent for this request.
