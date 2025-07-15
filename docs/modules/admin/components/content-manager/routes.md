# router.md

This file defines routes for **admin-level operations** in a support/ticketing system. The routes are grouped into three main sections: **Category Management**, **Knowledge Base Administration**, and **Ticket Management**. Each section maps HTTP endpoints to specific controller methods, enabling backend functionality for managing categories, articles, and support tickets.

---

## 📁 Category Routes (`categoryController`)

These endpoints allow for managing help center or support categories, which likely group tickets or knowledge base articles.

### `POST /category/add`
- Adds a new category.
- Expected input: category name, description, or other metadata in the request body.

### `PUT /category/update/:id`
- Updates an existing category based on the `:id` parameter.
- Request body should include updated fields.

### `DELETE /category/delete/:id`
- Deletes the specified category by its ID.
- Used for administrative clean-up or restructuring.

---

## 📚 Knowledge Base Admin Routes (`knowledgeBaseAdminController`)

This section provides powerful tools for maintaining and cleaning up the knowledge base system used in customer support.

### `DELETE /knowledge-base/bulk-delete`
- Deletes multiple knowledge base articles in one request.
- Input: list of article IDs or filter criteria.

### `PUT /knowledge-base/bulk-update`
- Updates several articles in bulk (e.g., mass status change, tagging).
- Input: filter + update data.

### `GET /knowledge-base/export`
- Exports the entire knowledge base as a downloadable dataset.
- Useful for backups, migration, or offline viewing.

### `POST /knowledge-base/purge-versions`
- Deletes older versions of articles to clean up storage.
- Keeps only the most recent or active versions.

### `POST /knowledge-base/rebuild-index`
- Rebuilds the search index used for querying articles.
- Typically used after large changes to improve search performance or fix inconsistencies.

### `PUT /knowledge-base/restore-article/:id`
- Restores a previously deleted article identified by its ID.

### `PUT /knowledge-base/system-settings`
- Updates global settings/configuration for the knowledge base system (e.g., autosave, search parameters, categories display behavior).

---

## 🎫 Ticket Routes (`ticketController`)

These routes return subsets of support tickets based on their status or user association. Useful for building dashboards or filtering views for agents/admins.

### `GET /tickets/assigned`
- Returns all tickets assigned to the currently authenticated admin/support agent.

### `GET /tickets/closed`
- Returns all tickets marked as closed.

### `GET /tickets/escalated`
- Lists tickets that have been escalated to higher-tier support.

### `GET /tickets/high-priority`
- Retrieves all tickets marked as urgent or high-priority.

### `GET /tickets/open`
- Lists tickets that are open and awaiting action.

### `GET /tickets/pending`
- Shows tickets awaiting customer reply or in a holding state.

### `GET /tickets/resolved`
- Fetches tickets that have been resolved but not yet closed.

### `GET /tickets/user/:userId`
- Retrieves all tickets submitted by a specific user (`:userId`).

---

## 📤 Export

```js
module.exports = router;
