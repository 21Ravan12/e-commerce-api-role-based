# accessControl.md

This module implements **role-based access control (RBAC)** to manage user permissions for different resource types in the system. It supports multiple roles (e.g., customer, seller, admin) and allows fine-grained control over actions like viewing, editing, deleting, and managing data.

---

## 🛡️ Permission Constants

### `PERMISSIONS`
Defines the levels of actions a user might be allowed to perform:
- `VIEW`: Read-only access
- `EDIT`: Modify content
- `DELETE`: Remove content
- `MANAGE`: Full control (includes create/update/delete/configure)

### `RESOURCES`
Lists the resource types in the system that permissions can apply to:
- `USER`
- `PRODUCT`
- `ORDER`
- `SETTINGS`

These serve as keys for permission checks across roles.

---

## 🧩 Role-to-Permissions Mapping

### `ROLE_PERMISSIONS`
Defines what each user role can do with each resource:

- **Customer**:
  - Can view and edit their own `user` data
  - Can view `product`s
  - Can view and edit `order`s

- **Seller**:
  - Same as customer for `user`
  - Can manage `product`s and `order`s (including creating and deleting)

- **Admin**:
  - Full access (`VIEW`, `EDIT`, `DELETE`, `MANAGE`) to all resources including `settings`

> This mapping enables flexible, declarative control over what users can access based on their role(s).

---

## ✅ Permission Check Logic

### `checkPermission(user, resource, permission)`
- **Input**: A `user` object, target `resource` name, and desired `permission`.
- **Output**: Returns `true` if the user has *any* role that allows the requested action on the resource.
- **Mechanism**:
  - Iterates over `user.roles`
  - Checks whether the mapped permissions for that role include the given permission for the resource

```js
checkPermission(user, 'order', 'manage');
````

---

## 🔒 Middleware: `validateAccess`

### `validateAccess(resource, permission)`

Returns an Express middleware function that ensures the authenticated user has the required access.

* **Behavior**:

  1. Retrieves the full user data via `User.findUser`.
  2. Uses `checkPermission` to validate the permission.
  3. If valid → calls `next()` to continue request.
  4. If not authorized → logs the incident and returns `403 Forbidden`.
  5. If any internal error occurs → returns `500 Server Error`.

### Usage Example:

```js
router.get('/admin/data', validateAccess(RESOURCES.SETTINGS, PERMISSIONS.MANAGE), adminHandler);
```

---

## 🧪 Exported Elements

* `PERMISSIONS`: Permission constants for use in routes and services
* `RESOURCES`: Resource identifiers to match against roles
* `checkPermission(user, resource, permission)`: Utility for inline access checks
* `validateAccess(resource, permission)`: Middleware for securing routes

---

## ✅ Best Practices

* Always use `validateAccess` in routes where specific access levels are needed.
* Maintain role mappings in `ROLE_PERMISSIONS` to keep control centralized and auditable.
* Expand `RESOURCES` and `PERMISSIONS` as the system grows to support more granular access policies.

This RBAC system ensures security, flexibility, and clarity in handling user access across your application.
