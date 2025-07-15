# PaymentProcessor.md

This file defines the **PaymentProcessor** class responsible for handling payment processing and refunds through multiple payment providers in a unified way. It acts as a service layer abstracting provider-specific implementations and managing payment records in the database.

---

## 💳 Payment Providers Setup

- The processor supports multiple providers:
  - `stripe` — StripeProvider instance
  - `paypal` — PayPalProvider instance
  - `cod` — Cash On Delivery (COD) provider instance
- These providers are instantiated in the constructor and stored in a `providers` map keyed by payment method name.

> **Note:** The current code uses placeholder methods (`fakeProcess`, `fakeRefund`) for payment actions. For production, these must be replaced with actual implementations interacting with payment gateways.

---

## ⚙️ Core Methods

### `async process(order, additionalData = {})`

Handles payment processing for a given order.

- **Validations:**
  - Ensures presence of mandatory fields: `order._id`, `order.idCustomer`, `order.paymentMethod`, and positive `order.total`.
- **Provider Selection:**
  - Calls `getProvider(order.paymentMethod)` to retrieve the correct payment provider.
- **Processing:**
  - Calls the provider's `fakeProcess(order)` method (to be replaced with real processing).
- **Payment Record Creation:**
  - After successful processing, creates a payment record in the database via `Payment.createPayment()`.
  - Includes order info, payment status (`approved`), payment method, amount, currency (default `USD`), description, raw response from provider, and optional metadata (billing address, IP, device fingerprint, user agent).
- **Logging:**
  - Logs info on start and success.
- **Error Handling:**
  - On failure, logs error and attempts to create a failed payment record.
  - Throws a wrapped `PaymentError` with context about the failure.

---

### `async refund(order, refundData = {})`

Handles payment refunds for a previously processed order.

- **Validations:**
  - Requires a `paymentId` to identify the original payment.
- **Provider Selection:**
  - Uses the same `getProvider` method to get the payment provider.
- **Refund Processing:**
  - Calls provider’s `fakeRefund(order)` method.
- **Database Update:**
  - Calls `Payment.processRefund` to record refund details including amount, currency, reason, and processor refund ID.
- **Logging:**
  - Logs refund processing start and success.
- **Error Handling:**
  - Logs any errors and throws a `PaymentError` with details.

---

### `getProvider(method)`

- Returns the payment provider instance corresponding to the given method key (e.g., `'stripe'`, `'paypal'`).
- Throws a `PaymentError` if the method is unsupported.

---

## 🔄 Error Handling & Logging

- Uses a centralized `logger` service to log info and error messages.
- When payment or refund operations fail, errors are caught, logged, and translated into domain-specific `PaymentError` objects.
- Failed payment attempts are recorded in the database to allow auditing and troubleshooting.

---

## 📦 Export

The module exports a **singleton instance** of the `PaymentProcessor` class, allowing a single shared payment service throughout the application.

---

## ⚠️ Important Notes

- The current payment and refund calls use `fakeProcess` and `fakeRefund` placeholder methods. These **must be replaced** by real gateway integration methods to handle actual payment flows.
- Payment records are created/updated in the `Payment` model, centralizing transaction history.
- The processor expects an `order` object containing key details such as `_id`, `idCustomer`, `paymentMethod`, `total`, and optionally `currency` and `orderNumber`.

---

This class abstracts payment gateway complexities and provides a consistent interface for processing payments and refunds while maintaining proper audit logging and error management.
