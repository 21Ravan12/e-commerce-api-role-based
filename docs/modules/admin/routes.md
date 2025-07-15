# routes.md

This file defines the **main entry point for admin-related API routes** in the application using Express.js. It organizes the routing logic into modular components for scalability, clarity, and maintainability. Each feature set (e.g. commerce, content, users) is encapsulated in its own route module.

---

## 🧩 Route Overview

The file imports and mounts sub-routes for different administrative domains under their respective base paths:

### ✅ `router.use('/commerce-manager', commerceManagerRoutes)`
Mounts all commerce-related admin endpoints under the `/commerce-manager` path.

- Located in: `./components/commerce-manager/routes.js`
- Common functionality: product catalog management, pricing, inventory control, order processing, etc.

---

### ✅ `router.use('/content-manager', contentManagerRoutes)`
Mounts content-related administrative tools under `/content-manager`.

- Located in: `./components/content-manager/routes.js`
- Common functionality: blog posts, articles, CMS blocks, homepage sections, banners, etc.

---

### ✅ `router.use('/user-manager', userManagerRoutes)`
Mounts user management endpoints under `/user-manager`.

- Located in: `./components/user-manager/routes.js`
- Common functionality: user CRUD, permissions, roles, ban/suspend logic, analytics on users.

---

## 🔄 Modular Structure

Each feature (commerce, content, user) is **modularized** within the `components` directory. This design:
- Keeps each domain decoupled and easy to test.
- Makes scaling new admin domains (e.g., `/analytics`, `/settings`) easier.
- Supports middleware customization per domain if needed (e.g., specific auth roles).

---

## 🚀 Export

The file exports the fully configured `router` object:

```js