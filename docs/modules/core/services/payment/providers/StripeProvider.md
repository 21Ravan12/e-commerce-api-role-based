# StripeProvider.md

This module implements a **Stripe payment provider** class to handle payment processing and refunds using the Stripe API. It supports real transactions as well as fake (mock) operations for testing purposes.

---

## Dependencies
- Uses the official Stripe Node.js SDK, initialized with the secret key from environment variables (`STRIPE_SECRET_KEY`).

---

## Class: `StripeProvider`

### Methods

#### `async process(order)`
- Creates and confirms a Stripe **PaymentIntent** to charge the customer.
- Parameters:
  - `order`: An object representing the order, expected to have at least `total`, `_id`, and `orderNumber`.
- Implementation details:
  - Converts the order total to cents (Stripe expects amounts in the smallest currency unit).
  - Sets currency as USD.
  - Adds `orderId` as metadata for traceability.
  - Uses `capture_method: 'automatic'` for immediate capture of payment.
  - Confirms the PaymentIntent right after creation.
- Error handling:
  - Throws an error if the payment is not successful, including any Stripe error message.
- Returns:
  - An object containing `transactionId` (Stripe PaymentIntent ID) and the full raw Stripe response.

#### `async refund(order)`
- Creates a refund for a previously processed payment.
- Parameters:
  - `order`: Must include `transactionId` (Stripe PaymentIntent ID) and `total`.
- Calls Stripe’s `refunds.create` API with the amount equal to the order total in cents.
- Returns Stripe’s refund response object.

#### `async fakeProcess(order)`
- Simulates a successful payment without contacting Stripe.
- Useful for development or testing without real transactions.
- Returns a mock transaction object with a fake ID and basic payment info.

#### `async fakeRefund(order)`
- Simulates a successful refund without Stripe interaction.
- Returns a mock refund response with a fake refund ID and status `'succeeded'`.

---

## Usage Notes
- The class abstracts Stripe integration, allowing the rest of the application to interact with a unified payment interface.
- The `fakeProcess` and `fakeRefund` methods enable safe testing environments or fallback logic without making live API calls.
- Error handling during real processing ensures payment failures are caught and can be managed upstream.

---

## Export
- The module exports the `StripeProvider` class for instantiation and use in payment workflows.

```js
const StripeProvider = require('./services/payment/providers/StripeProvider');
const stripeProvider = new StripeProvider();
