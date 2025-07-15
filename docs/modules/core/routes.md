# routes.md

This file defines the **support and content-related API routes** for campaigns, categories, products, knowledge base articles, and support tickets. It uses `Express Router` and integrates middleware such as `authenticate` (JWT auth) and `multer` (for file uploads). The routes are grouped by their domain responsibilities and controller usage.

---

## 📣 Campaign Routes (`campaignController`)

- `GET /campaign/get`:  
  Fetches a list of all public campaigns (no auth required).

- `GET /campaign/get/:id`:  
  Returns detailed information for a specific campaign. Requires authentication.

---

## 🗂️ Category Routes (`categoryController`)

- `GET /category/fetch/:id`:  
  Fetches details of a specific category by ID.

- `GET /category/fetch`:  
  Lists all available product categories.

---

## 🛍️ Product Routes (`productController`)

### Product Listings & Filtering

- `GET /product`:  
  Returns a list of all products (paginated, optionally filtered).

- `GET /product/search`:  
  Full-text product search by name, description, or tags.

- `GET /product/category/:categoryId`:  
  Lists products belonging to a specific category.

### Related & Recommendation Groups

- `GET /product/related/:productId`:  
  Fetches related products based on purchase patterns or tags.

- `GET /product/similar/:productId`:  
  Returns visually or descriptively similar products.

- `GET /product/frequently-bought/:productId`:  
  Lists products that are frequently bought with this one.

### Featured Collections

- `GET /product/featured`: Top curated products.
- `GET /product/new-arrivals`: Recently added products.
- `GET /product/best-sellers`: High-selling products.
- `GET /product/discounted`: Currently discounted items.
- `GET /product/trending`: Currently popular products.

### Product Reviews & Comments

- `POST /product/:id/reviews`:  
  Adds a review to the product (requires auth).

- `GET /product/:id/reviews`:  
  Fetches all reviews for a product.

- `GET /product/:id/reviews/:reviewId`:  
  Gets a specific review by its ID.

- `PUT /product/:id/reviews/:reviewId`:  
  Updates a review (requires auth).

- `DELETE /product/:id/reviews/:reviewId`:  
  Deletes a review (requires auth).

---

## 📚 Knowledge Base Routes (`knowledgeBaseController`)

### Feedback

- `POST /knowledge-base/:id/feedback`:  
  Adds feedback to a knowledge base article (authenticated).

- `GET /knowledge-base/feedback/:id`:  
  Retrieves all feedback for a specific article (authenticated).

### Attachments

- `GET /knowledge-base/article/attachments/:id`:  
  Lists file attachments for a given article.

### Article Retrieval

- `GET /knowledge-base/list`:  
  Returns a list of available articles (authenticated).

- `GET /knowledge-base/search`:  
  Performs full-text search across articles.

- `GET /knowledge-base/category`:  
  Lists article categories.

### Ratings

- `POST /knowledge-base/rating/:id/add`:  
  Adds a star rating to an article.

- `GET /knowledge-base/rating/average/:id`:  
  Fetches the average rating for an article.

### Highlights & Popular Articles

- `GET /knowledge-base/featured`:  
  Curated, highlighted articles.

- `GET /knowledge-base/frequently-viewed`:  
  Most accessed articles.

- `GET /knowledge-base/most-helpful`:  
  Based on positive feedback or helpfulness votes.

- `GET /knowledge-base/popular`:  
  Most liked or interacted-with content.

- `GET /knowledge-base/recent-updates`:  
  Recently modified or newly published articles.

### Article Versioning

- `GET /knowledge-base/article/history/:id`:  
  Retrieves the full version history of an article.

- `GET /knowledge-base/version/:id/:version`:  
  Retrieves a specific version snapshot of an article.

---

## 🎫 Ticket System Routes (`ticketController`)

### Ticket Lifecycle

- `POST /ticket`:  
  Creates a new support ticket.

- `PUT /ticket/:id`:  
  Updates ticket status (e.g., open, closed, in-progress).

- `GET /ticket/:id`:  
  Retrieves details of a specific ticket.

- `GET /ticket`:  
  Lists all tickets for the authenticated user.

- `PUT /ticket/update/:id`:  
  Updates the content/details of a ticket.

- `DELETE /ticket/delete/:id`:  
  Deletes a ticket entirely.

### Ticket Attachments

- `POST /ticket/attachment/add/:id`:  
  Uploads one or more file attachments to a ticket. Uses `multer`.

- `DELETE /ticket/attachment/:articleId/:attachmentId`:  
  Deletes a specific attachment.

### Ticket Comments

- `POST /ticket/comment/:id`:  
  Adds a comment to a ticket.

- `PUT /ticket/comment/:id/:commentId`:  
  Updates a ticket comment.

- `DELETE /ticket/comment/:id/:commentId`:  
  Deletes a comment.

- `GET /ticket/comment/:id`:  
  Lists all comments for a ticket.

---

## 🛡️ Middleware

- `authenticate`:  
  JWT-based middleware ensuring that only authenticated users can access protected routes.

- `upload.array('files')`:  
  Uses `multer` to handle multiple file uploads for ticket attachments.

---

## 📦 Module Export

The router is exported as a module for use in the main Express app:
```js
module.exports = router;
