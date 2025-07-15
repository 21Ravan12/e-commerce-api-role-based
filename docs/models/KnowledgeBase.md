# 📚 KnowledgeBase Module

The KnowledgeBase module provides a full-featured system for managing help articles, categories, feedback, ratings, version history, and advanced analytics. It also includes tools for admins to manage content at scale.


## 📂 File Location

/models/knowledgebase/index.js


## 📌 Registered Models

- **`Article`** (`KnowledgeBase.Article`): Main content unit with fields like title, body, tags, attachments, and metadata.
- **`Category`** (`KnowledgeBase.Category`): Used to group related articles.
- **`Feedback`** (`KnowledgeBase.Feedback`): Tracks user suggestions, reactions, and comments.
- **`Rating`** (`KnowledgeBase.Rating`): Stores 1–5 star feedback with analytics metadata.


## 👥 Public & Authenticated Operations

### 📄 Articles
- `listArticles`
- `searchArticles`

### 🗂️ Categories
- `listCategories`

### 📎 Attachments
- `getAttachments`

### 💬 Feedback
- `getFeedback`
- `addFeedback`

### ⭐ Ratings
- `addRating`
- `getAverageRating`

### 🕓 Versioning (Read-Only)
- `getArticleHistory`
- `getVersion`

### 🔎 Advanced
- `getFeaturedArticles`
- `getFrequentlyViewed`
- `getMostHelpful`
- `getPopularArticles`
- `getRecentUpdates`


## 🛠️ Moderator & Admin Operations

### 📄 Articles
- `createArticle`
- `getArticle`
- `updateArticle`
- `deleteArticle`

### 🗂️ Categories
- `createCategory`
- `getCategory`
- `updateCategory`
- `deleteCategory`

### 📎 Attachments
- `addAttachment`
- `deleteAttachment`

### 💬 Feedback
- `updateFeedback`

### ⭐ Ratings
- `updateRating`

### 🕓 Versioning (Write)
- `restoreVersion`


## 🛡️ Admin-Only Operations

- `bulkDeleteArticles`
- `bulkUpdateArticles`
- `exportAllData`
- `purgeOldVersions`
- `rebuildSearchIndex`
- `restoreDeletedArticle`
- `updateSystemSettings`


## 🧩 Dependencies

- `mongoose`: ODM
- Audit logging dependency: `AdminLog` from `../AuditLog`
- Schema files: located in `./schemas/`
- Modular operations: in `./operations/` categorized by entity


## ✅ Usage Example

```js
const { createArticle, listArticles } = require('./models/knowledgebase');

await createArticle({
  title: 'How to Reset Your Password',
  content: 'Step-by-step guide...',
  tags: ['account', 'password']
});

const results = await listArticles({ keyword: 'password' });
````