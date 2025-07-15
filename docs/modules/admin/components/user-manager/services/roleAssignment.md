# roleAssignment.md

This module provides utilities for managing **user roles** in the system. It includes validation logic for assigning roles, enforces role integrity, and checks if a user meets specific role requirements. It also integrates structured logging for auditability.

---

## 🎭 VALID_ROLES

```js
const VALID_ROLES = ['customer', 'seller', 'vendor', 'moderator', 'admin'];
````

* Defines all acceptable roles within the platform.
* This constant ensures that only known, system-approved roles can be assigned to users.

---

## 🔧 `assignRoles(userId, roles)`

### Description

Assigns a set of roles to a user based on the provided user ID.

### Parameters

* `userId` (`String`): ID of the user to update.
* `roles` (`Array`): Array of role names to assign.

### Behavior

1. **Input Validation**:

   * Ensures `userId` is provided.
   * Checks that `roles` is a non-empty array.
2. **Role Validation**:

   * Ensures all roles in the array exist in `VALID_ROLES`.
   * Throws an error if any invalid roles are found.
3. **Minimum Requirement**:

   * Ensures at least one role is assigned to a user.
4. **User Update**:

   * Calls a static method `User.assignRoles(userId, roles)` to persist the changes.
   * If the user is not found, throws an error.
5. **Logging**:

   * Logs a success message using the custom `logger` service on successful update.
   * Logs and throws any errors encountered.

### Returns

* The updated user object with new roles.

---

## ✅ `hasRequiredRoles(user, requiredRoles)`

### Description

Checks whether a user possesses **all** of the required roles.

### Parameters

* `user` (`Object`): User object that includes a `roles` array.
* `requiredRoles` (`Array`): List of required role names.

### Returns

* `true` if the user has all required roles.
* `false` if any required role is missing or input is invalid.

### Use Case

Useful for protecting routes or actions that require a user to have elevated permissions (e.g., `admin`, `moderator`).

---

## 📤 Exported Members

```js
module.exports = {
  assignRoles,
  hasRequiredRoles,
  VALID_ROLES
};
```

* **`assignRoles`**: Safely assigns validated roles to a user.
* **`hasRequiredRoles`**: Utility to verify user authorization based on role possession.
* **`VALID_ROLES`**: Exported to allow reuse and validation elsewhere in the app.

---

## 🛡️ Design Considerations

* Ensures **role integrity** by filtering out unsupported values.
* Encourages **secure role management** through centralized validation.
* Designed to work cleanly with Mongoose static methods (e.g., `User.assignRoles`).
* Logging is built-in to support **traceability** and **audit logs**.
