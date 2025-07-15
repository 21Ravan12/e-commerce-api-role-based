# routes.md

This file defines and documents the **support system routes** for handling Knowledge Base content and Ticket Management. The routes are organized into two main sections: `KnowledgeBaseController` and `TicketController`. These routes are built using Express.js and some of them utilize middleware like `multer` (for file uploads) and `authenticate` (for route protection if added later).

---

## 📚 Knowledge Base Routes (`knowledgeBaseController`)

These routes manage articles, categories, attachments, feedback, ratings, and version control within the knowledge base system.

### ➕ Article Operations
- `POST /knowledge-base/add`  
  Creates a new knowledge base article.

- `GET /knowledge-base/article/:id`  
  Retrieves an article by its unique ID.

- `PUT /knowledge-base/update/:id`  
  Updates the content or metadata of an existing article.

- `DELETE /knowledge-base/delete/:id`  
  Deletes an article by its ID.

### 📁 Category Operations
- `GET /knowledge-base/category/:id`  
  Retrieves a specific category and possibly its associated articles.

- `POST /knowledge-base/category/add`  
  Adds a new article category to organize content.

- `PUT /knowledge-base/category/update/:id`  
  Updates the name or description of a category.

- `DELETE /knowledge-base/category/delete/:id`  
  Removes a category permanently.

### 📎 Attachment Operations
- `POST /knowledge-base/attachment/add/:id`  
  Adds file attachments to a specific article.  
  Uses `multer` middleware to handle file uploads: `upload.array('files')`.

- `DELETE /knowledge-base/attachment/delete/:articleId/:attachmentId`  
  Deletes a specific attachment from an article.

### ⭐ User Feedback & Rating
- `PUT /knowledge-base/feedback/update/:id`  
  Updates user feedback (e.g., helpfulness, comments) for an article.

- `PUT /knowledge-base/rating/update/:id`  
  Updates the rating (e.g., stars or numeric value) of an article.

### ♻️ Version Control
- `POST /knowledge-base/version/restore/:id`  
  Restores a previous version of the article (like undoing changes).

---

## 🎫 Ticket Routes (`ticketController`)

These routes are responsible for managing support tickets in various states and levels of urgency.

### 🛠️ Ticket Modification
- `PUT /ticket/update/:id`  
  Updates ticket details such as description, subject, or tags.

- `DELETE /ticket/delete/:id`  
  Deletes a ticket permanently.

### 🚦 Status Management
- `POST /ticket/close/:id`  
  Closes the ticket and marks it as resolved.

- `POST /ticket/reopen/:id`  
  Reopens a previously closed ticket.

- `POST /ticket/resolve/:id`  
  Marks a ticket as resolved (distinct from close in some workflows).

### 👥 Assignment Operations
- `POST /ticket/assign/:id`  
  Assigns the ticket to a support agent or team.

- `POST /ticket/reassign/:id`  
  Reassigns the ticket to another agent.

- `POST /ticket/unassign/:id`  
  Removes any current assignment on the ticket.

### 🔥 Priority Operations
- `POST /ticket/escalate/:id`  
  Escalates the ticket for high-priority attention.

- `POST /ticket/deescalate/:id`  
  Lowers the priority level of a previously escalated ticket.

---

## 🧩 Middleware

- **`upload.array('files')`**: Used in the `/attachment/add` route to process multiple uploaded files.
- **`authenticate`**: Although not used directly in this file, it is imported and can be added to secure sensitive routes later.

---

## 📤 Module Export

At the end, the router object is exported so it can be mounted into the main Express application:

```js
module.exports = router;
