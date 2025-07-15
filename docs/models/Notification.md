# 🔔 Notification Module

This module defines the `Notification` model and provides reusable operations for creating, reading, and updating notification entries in MongoDB using Mongoose.


## 📂 File Location

/models/notification/index.js


## 📌 Registered Model

### `Notification`
- Schema: `./schemas/notificationSchema`
- Stores individual notifications linked to users.
- Supports metadata like `type`, `status`, `priority`, and timestamps.


## 🛠️ Operations

### `createNotification`
- Creates a new notification entry.
- Typically used for system messages, alerts, user actions (e.g., new message, new follower).

### `markAsRead`
- Updates a notification's status to "read".
- Can be used for individual or bulk read updates.

### `getUserNotifications`
- Retrieves all notifications for a specific user.
- Can be filtered by status or sorted by creation time.


## 🧾 Constants

### `NOTIFICATION_TYPES`
A helpful categorization system:
```js
{
  SYSTEM: 'system',
  MESSAGE: 'message',
  ORDER: 'order',
  PROMOTION: 'promotion',
  REVIEW: 'review',
  FOLLOW: 'follow',
  LIKE: 'like',
  COMMENT: 'comment',
  MENTION: 'mention',
  SUPPORT: 'support'
}
````

### `NOTIFICATION_STATUS`

Represents the state of a notification:

```js
{
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived'
}
```

### `PRIORITY_LEVELS`

Severity of the notification:

```js
{
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}
```


## 📦 Exports

```js
{
  Notification,
  createNotification,
  markAsRead,
  getUserNotifications,
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUS,
  PRIORITY_LEVELS
}
```


## ✅ Usage Example

```js
const { createNotification, NOTIFICATION_TYPES } = require('./models/notification');

await createNotification({
  user: userId,
  type: NOTIFICATION_TYPES.MESSAGE,
  content: 'You have a new message!',
  priority: 'medium'
});
```