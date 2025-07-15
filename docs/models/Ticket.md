# 🎫 Ticket Module

This module manages ticket-related operations for support, task management, or issue tracking systems. It includes Mongoose models and a rich set of functions covering ticket lifecycle, assignment, comments, attachments, escalation, and more.


## 📂 File Location

/models/ticket/index.js


## 📌 Registered Models

### `Ticket`
- Schema: `./schemas/ticketSchema`
- Core model for all tickets with fields like `title`, `description`, `status`, `priority`, `assignee`, etc.

### `Comment`
- Schema: `./schemas/commentSchema`
- Represents threaded user or staff comments on a ticket.

### `Attachment`
- Schema: `./schemas/attachmentSchema`
- Handles file uploads and links to documents or images related to the ticket.


## 🧰 Exposed Operations

### 👥 Public/Authenticated Users

#### Basic Ticket Management
- `createTicket`
- `getTicket`
- `listTickets`
- `updateTicket`
- `deleteTicket`

#### Status Management
- `updateStatus`

#### Commenting
- `addComment`
- `getComments`
- `updateComment`
- `deleteComment`

#### File Attachments
- `addAttachment`
- `getAttachments`


### 🛠️ Moderator & Admin Only

#### Elevated Ticket Control
- `moderatorUpdateTicket`
- `moderatorDeleteTicket`

#### Status Control
- `closeTicket`
- `reopenTicket`
- `resolveTicket`

#### Ticket Assignment
- `assignTicket`
- `reassignTicket`
- `unassignTicket`

#### File Removal
- `deleteAttachment`

#### Escalation
- `escalateTicket`
- `deescalateTicket`


### 🛡️ Admin Only

#### Advanced Queries
- `getAssignedTickets`
- `getClosedTickets`
- `getEscalatedTickets`
- `getHighPriorityTickets`
- `getOpenTickets`
- `getPendingTickets`
- `getResolvedTickets`
- `getUserTickets`


## 📦 Exported API

All exported functions are pre-bound with relevant models for direct and clean usage in controllers or services.

```js
const {
  createTicket,
  getTicket,
  listTickets,
  updateTicket,
  deleteTicket,
  addComment,
  ...
} = require('./models/ticket');
````


## ✅ Example Usage

```js
await createTicket({
  user: req.user.id,
  title: 'Cannot access dashboard',
  description: 'Getting 500 error when opening dashboard.',
  priority: 'high'
});

const tickets = await listTickets({ userId: req.user.id });
```