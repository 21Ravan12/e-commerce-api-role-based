# bulkUpdatePrices.md

This function handles **bulk updating of product prices** via an HTTP request.

---

## Function: `bulkUpdatePrices(req, res)`

### Purpose
Processes a request to update prices of multiple products in a single operation, improving efficiency compared to individual updates.

---

### Workflow

1. **Logging Request**
   - Logs the incoming bulk update request along with the requester's IP address for audit and debugging.

2. **Input Validation**
   - Extracts `updates` array from `req.body`.
   - Checks that `updates` exists and is an array.
   - Throws an error with message `'Updates array is required'` if validation fails.

3. **Bulk Update Operation**
   - Calls the model method `Product.bulkUpdatePrices(updates)` to apply all price changes at once.
   - Assumes `updates` is an array of objects specifying product identifiers and new prices.

4. **Success Response**
   - Sends HTTP status 200 with the result of the bulk update in JSON format.

5. **Error Handling**
   - Catches errors and logs detailed information including the stack trace.
   - Sets HTTP status codes based on error message content:
     - `403` if error includes `'Not authorized'`
     - `400` if error relates to invalid `'Updates array'`
     - Defaults to `500` for all other errors.
   - Returns a JSON object containing the error message.

---

### Notes
- This method assumes that `Product.bulkUpdatePrices` is implemented to efficiently update multiple product prices in the database.
- Input validation prevents malformed or missing data from triggering unnecessary database operations.
- Detailed logging helps with monitoring and troubleshooting bulk update requests.
- Proper HTTP status codes improve client-side error handling.

## 📥 Request Body Example (JSON)

```json
{
  "updates": [
    {
      "productId": "64ad91e8f2a4a6d1c8e1b9a2",
      "newPrice": 49.99
    },
    {
      "productId": "64ad91e8f2a4a6d1c8e1b9a3",
      "newPrice": 74.50
    },
    {
      "productId": "64ad91e8f2a4a6d1c8e1b9a4",
      "newPrice": 19.00
    }
  ]
}
