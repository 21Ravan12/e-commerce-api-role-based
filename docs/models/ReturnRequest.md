# 📦 ReturnRequest Module

This module manages product return requests using Mongoose models. It registers the `ReturnRequest` model and exports functions to create, read, update, and delete return requests with helpful query helpers.


## 📂 File Location

/models/returnRequest/index.js


## 📋 Registered Model

### `ReturnRequest`
- Schema: `./schemas/returnRequestSchema`
- Represents customer return requests with fields such as `customerId`, `status`, `createdAt`, and other relevant details.


## ⚙️ Operations

- `createReturnRequest`: Create a new return request entry.
- `getReturnRequest`: Retrieve a single return request by ID or filter.
- `getReturnRequests`: Retrieve multiple return requests with filtering options.
- `updateCustomerReturnRequest`: Update a return request from the customer's perspective.
- `updateAdminReturnRequest`: Update a return request with admin privileges.
- `deleteReturnRequest`: Delete a return request entry.


## 🔍 Query Helpers

The following query helpers extend the `ReturnRequest` model:

```js
ReturnRequest.find().byCustomer(customerId)
ReturnRequest.find().byStatus(status)
ReturnRequest.find().recent(days) // default is 30 days
````

These helpers allow filtering return requests by customer, status, or creation date range.


## 📦 Exports

```js
{
  ReturnRequest,
  createReturnRequest,
  getReturnRequest,
  getReturnRequests,
  updateCustomerReturnRequest,
  updateAdminReturnRequest,
  deleteReturnRequest
}
```

All operations are pre-bound to the `ReturnRequest` model for easy integration.


## 🧩 Dependencies

* `mongoose`: MongoDB ODM
* Custom schema: `returnRequestSchema`
* Operations defined in `/operations/`


## ✅ Usage Example

```js
const { createReturnRequest, getReturnRequests } = require('./models/returnRequest');

await createReturnRequest({
  customerId: '12345',
  status: 'pending',
  items: [...],
  reason: 'Defective product'
});

const recentReturns = await getReturnRequests().recent(15).byStatus('pending');
```