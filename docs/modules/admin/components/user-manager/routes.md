# routes.md

This file defines the **admin/user management routes** using Express.js. It includes endpoints for managing users and assigning roles. All routes are protected using a custom **access control middleware** (`validateAccess`) that verifies whether the requester has sufficient permission to perform a given action on a specific resource.

---

## 🔐 Access Control Middleware

Every route is guarded by:
```js
validateAccess(RESOURCES.USER, PERMISSIONS.ACTION)
````

* **RESOURCES.USER**: Specifies that the resource being accessed is a user.
* **PERMISSIONS**: Enum-like constants that define what kind of access is required: `VIEW`, `EDIT`, `DELETE`, or `MANAGE`.

---

## 👤 User Management Routes

### `GET /`

* **Purpose**: Lists all users.
* **Access Requirement**: `MANAGE` permission on the `USER` resource.
* **Controller**: `controller.listUsers`

---

### `GET /:id`

* **Purpose**: Retrieves details for a specific user by ID.
* **Access Requirement**: `VIEW` permission.
* **Controller**: `controller.getUser`

---

### `PUT /:id`

* **Purpose**: Updates a user’s status or other editable fields.
* **Access Requirement**: `EDIT` permission.
* **Controller**: `controller.updateUserStatus`

---

### `DELETE /:id`

* **Purpose**: Deletes a user account.
* **Access Requirement**: `DELETE` permission.
* **Controller**: `controller.deleteUser`

---

## 🛡️ Role Management Route (Admin Only)

### `POST /:id/roles`

* **Purpose**: Assigns one or more roles to a user.
* **Access Requirement**: `MANAGE` permission (typically reserved for admins).
* **Controller**: `controller.assignRoles`

---

## 📤 Module Export

The `router` object is exported and meant to be mounted under a parent route (e.g., `/admin/users`) in the main Express app.

```js
module.exports = router;
```

This routing file ensures **secure, permission-based user administration** by combining structured access control with modular controller functions.
