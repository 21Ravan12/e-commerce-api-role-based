# routes.md

This file defines API routes related to **campaign management**, **order processing**, **payment tracking**, and **promotion code retrieval** for an admin or internal backend system. All routes are registered using an Express router and connect to their respective controller modules.

---

## 📢 Campaign Routes (`campaignController`)
These routes are used for managing marketing or sales campaigns.

### `POST /campaign/add`
- Adds a new campaign.
- Request body should contain campaign details like name, duration, discount rate, etc.

### `PUT /campaign/update/:id`
- Updates an existing campaign by its ID.
- Campaign ID is passed as a URL parameter (`:id`).

### `DELETE /campaign/delete/:id`
- Deletes a campaign identified by its ID.
- Useful for administrative cleanup or campaign expiration.

---

## 📦 Order Routes (`orderController`)
These routes manage and update customer orders.

### `GET /order/get`
- Retrieves a list of orders (likely paginated or filtered).
- Intended for admin dashboard or analytics.

### `PUT /order/update/:id`
- Updates the status of a specific order (e.g., from “Pending” to “Shipped”).
- Order ID is passed in the URL.

---

## 💳 Payment Routes (`paymentController`)
Used to track and manage payment records for orders.

### `GET /payment/get/:id`
- Retrieves a single payment record by its unique ID.

### `GET /payment/get`
- Retrieves all payment records.
- Can be used for overviews, dashboards, or reports.

### `GET /payment/find/:orderId`
- Finds the payment details linked to a specific order.
- Useful for tracing payment history for a transaction.

### `GET /payment/get/totalRevenue`
- Returns total revenue from payments.
- Likely aggregates all payments for reporting or analytics.

> ⚠️ Note: This path overlaps with `GET /payment/get`, so make sure the routing order or logic handles potential conflicts (e.g., using exact matching or reordering routes).

---

## 🎟️ Promotion Code Routes (`promotionCodeController`)
Handles discount and coupon code queries.

### `GET /promotion/get`
- Retrieves a list of all promotion codes.
- Useful for managing available discount codes.

### `GET /promotion/get/:id`
- Retrieves a specific promotion code by ID for viewing or editing.

---

## 📤 Module Export
Exports the configured router so it can be used in the main application (e.g., `app.use('/api/admin', router)`):
```js
module.exports = router;
