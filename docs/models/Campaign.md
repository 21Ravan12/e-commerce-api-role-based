# 📢 Campaign Module

This module manages marketing or promotional campaigns using a Mongoose model and provides operations for creation, retrieval, updating, and deletion.


## 📂 File Location

/models/campaign/index.js


## 📌 Registered Model

### `Campaign`
- Schema: `./schemas/campaignSchema`
- Fields may include: `title`, `campaignType`, `status`, `startDate`, `endDate`, `createdBy`, etc.
- Supports various campaign types (e.g., `discount`, `referral`, etc.) and statuses (`active`, `draft`, `expired`, etc.)


## 🛠️ Operations

- `createCampaign`: Create a new campaign.
- `getCampaignById`: Retrieve a single campaign by ID.
- `getCampaignsList`: List campaigns (optionally with filters or pagination).
- `updateCampaign`: Update existing campaign fields.
- `getActiveCampaigns`: Fetch currently active campaigns (based on date and status).
- `deleteCampaign`: Soft-delete or fully remove a campaign.


## 🔍 Query Helpers

Extend the `Campaign` model to filter campaigns easily:

```js
Campaign.find().byStatus('active')
Campaign.find().byType('referral')
Campaign.find().activeBetween(new Date('2025-06-01'), new Date('2025-06-30'))
````

These helpers allow for chaining and dynamic querying, e.g., listing all active "discount" campaigns for a specific period.


## 📦 Exports

```js
{
  Campaign,
  createCampaign,
  getCampaignById,
  getCampaignsList,
  updateCampaign,
  getActiveCampaigns,
  deleteCampaign
}
```

Each exported function is pre-bound with the `Campaign` model to ensure modularity and testability.


## 🧩 Dependencies

* `mongoose`: MongoDB ODM
* Schema: `campaignSchema`
* Operations: Stored in `/operations/` directory alongside campaign business logic


## ✅ Usage Example

```js
const { createCampaign, getActiveCampaigns } = require('./models/campaign');

await createCampaign({
  title: 'Summer Sale',
  campaignType: 'discount',
  status: 'active',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

const liveCampaigns = await getActiveCampaigns();
```