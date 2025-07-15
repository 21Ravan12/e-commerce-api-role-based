# bulkUpdateStock.md

This file documents the `bulkUpdateStock` controller method, which handles **bulk inventory updates** for multiple products in a single request. This is typically used by admins or systems needing to increase or decrease stock quantities efficiently.

---

## 📥 Request Structure

### `req.body` should include:
- **`updates`**: An array of stock update instructions. Each object typically contains:
  - `productId` – ID of the product to update
  - `quantity` – Number to increment or decrement

- **`increment`** (optional, default: `true`):  
  - If `true`, adds the quantity to existing stock.
  - If `false`, subtracts the quantity instead.

### Example Payload:
```json
{
  "updates": [
    { "productId": "abc123", "quantity": 10 },
    { "productId": "def456", "quantity": -5 }
  ],
  "increment": true
}
````

---

## 🔄 Core Logic

### `bulkUpdateStock(req, res)`

Handles the incoming HTTP request to update product stock in bulk.

#### ✅ Steps:

1. **Logs the request IP** for traceability using `logger.info`.
2. **Validates input**:

   * Checks if `updates` is present and is an array.
   * Throws a `400` error if invalid.
3. **Calls the model method**:

   * `Product.bulkUpdateStock(updates, increment)` handles the actual database updates.
4. **Returns a `200 OK` response** with the result (e.g., summary or updated records).

#### ❌ Error Handling:

* Logs the error message and stack trace with `logger.error`.
* Determines the appropriate HTTP status code based on the error:

  * `403` if the error includes “Not authorized”
  * `400` if it's a validation issue (`"Updates array"`)
  * `500` for all other internal errors

### Response:

```json
{
  "updated": 2,
  "skipped": 1,
  "errors": []
}
```

---

## 🔐 Security Notes

* Assumes authentication/authorization (e.g., admin check) is handled by middleware before this function.
* Logs all incoming IPs for auditing and traceability.

---

## 📦 Dependencies

* `Product.bulkUpdateStock`: The main model method that performs the update logic in the database.
* `logger`: Custom logging service for info and error reporting.

---

## 📥 Request Body Example (JSON)

```json
{
  "updates": [
    {
      "productId": "60f6b0d7c2f3e034d8e3b6b1",
      "quantity": 5
    },
    {
      "productId": "60f6b0d7c2f3e034d8e3b6b2",
      "quantity": -2
    }
  ],
  "increment": true
}
