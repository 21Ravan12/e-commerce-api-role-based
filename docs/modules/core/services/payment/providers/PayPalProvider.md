# PayPalProvider.md

This file implements a **PayPal payment provider** class using the official PayPal Checkout SDK to handle payment processing within the application. It abstracts PayPal API interactions including order creation, capture, and also provides fake methods for testing purposes.

---

## 🏗️ Class: `PayPalProvider`

### Constructor
- Initializes the PayPal client in **sandbox mode** using credentials from environment variables:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_SECRET`
- Creates a `PayPalHttpClient` instance that is used to send requests to PayPal.

---

## 💳 Payment Processing

### `async process(order)`
- Main method to process a payment order.
- Steps:
  1. Creates a PayPal order request with `OrdersCreateRequest`.
  2. Sets preference `"return=representation"` to get full response details.
  3. Builds the request body with `createOrderRequestBody(order)` (described below).
  4. Executes the order creation via the PayPal client.
  5. Captures the created order by calling `captureOrder` with the returned order ID.
- Returns an object with:
  - `transactionId`: the PayPal order capture ID.
  - `rawResponse`: full PayPal capture response for detailed info.

---

## 📋 Order Request Body Creation

### `createOrderRequestBody(order)`
- Constructs the JSON payload required by PayPal to create an order.
- Sets intent to `'CAPTURE'`, meaning payment will be captured immediately.
- Defines one purchase unit with:
  - Currency as USD.
  - Total amount and breakdown of subtotal, shipping cost, and tax — all formatted as strings with two decimals.
  - Item list: maps over `order.items` to create line items with product name, unit price, and quantity.

---

## 🔄 Capturing Orders

### `async captureOrder(orderId)`
- Takes a PayPal order ID and executes the capture using `OrdersCaptureRequest`.
- Returns the response from PayPal, which confirms the transaction completion.

---

## 🧪 Fake Methods for Testing

These methods simulate PayPal behavior without real API calls, useful for development or tests.

### `async fakeProcess(order)`
- Returns a mock successful payment response.
- Generates a fake transaction ID using a timestamp.
- Builds a response mimicking PayPal’s capture response including amounts and items.

### `async fakeRefund(order)`
- Returns a mock successful refund response.
- Generates a fake refund ID.
- Includes refund amount details and a dummy link to a refund resource.

---

## 📦 Export

- The class `PayPalProvider` is exported as a module for use elsewhere in the payment system.

---

## Summary
`PayPalProvider` wraps PayPal's SDK calls to **create and capture payment orders**, providing a clean interface for payment processing with support for sandbox/testing environments via fake methods. It handles all monetary formatting and itemization expected by PayPal and logs minimal setup by relying on environment variables.
