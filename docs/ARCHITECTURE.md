# 🏗️ E-Commerce API — Clean Architecture & Dockerized

## 📘 Overview

This is a **modular Node.js API** built with **Express.js**, designed with **clean architecture principles** and full **Docker containerization**.

---

## 🧱 Core Architecture Layers

### 1. **Presentation Layer**
- Routes (organized by module)
- Controllers (handle HTTP requests/responses)
- Middlewares (authentication, validation, error handling)

### 2. **Application Layer**
- Services (business logic)
- Models (data access)
- Utilities (shared helpers)

### 3. **Infrastructure Layer**
- MongoDB container
- Redis cache container
- External APIs (e.g., Payment, Email)
- Docker for orchestration

---

## 🐳 Docker-Based Architecture

### 🔹 Containers:
- **App Service**: Node.js  
  - Custom Dockerfile  
  - Port `3000`  
  - Health checks (`/health`)  
  - Runs as non-root user

- **MongoDB Service**:  
  - Volume-based persistence  
  - Port `27017`

- **Redis Service**:  
  - Port `6379`  
  - In-memory caching

### 🔑 Highlights:
- Isolated environments  
- `docker-compose` driven setup  
- Dev/prod parity  
- Health & logging support  
- Resource-limited services

---

## 🧩 Key Feature Modules

### 🔐 Authentication
- JWT-based
- OAuth & Local strategies
- RBAC (Role-Based Access Control)

### 🛍️ Products
- CRUD, inventory, filtering

### 📦 Orders
- Lifecycle tracking, payments, webhooks

### 💳 Payment
- Stripe, PayPal, COD
- Transaction logs

---

## 🔒 Security

- CSRF & Rate Limiting
- Secure headers (`Helmet`)
- Input validation
- Audit & access logs
- Container isolation
- Network segmentation

---

## 🔄 Data Flow

1. **Client → Middleware → Route → Controller**  
2. **Controller → Service → Model → DB/Cache**  
3. **Response ← Controller ← Client**

---

## ⚙️ Infrastructure

### 🔸 Containers
- Node.js 20 (Alpine)
- MongoDB 6
- Redis 7

### 🔸 App Dependencies
- Express.js
- Mongoose
- Redis Client
- JWT Auth

---

## 🚀 Deployment Strategy

### 🧪 Development
- Single-node Docker Compose
- Hot reload via bind mounts
- Debug ports exposed

### 🏭 Production
- Multi-container orchestration
- Read replicas for MongoDB
- Redis clustering
- App horizontal scaling
- CI/CD pipeline ready

---

## 📁 Directory Summary

```shell
e-commerce-api/
├── .env, Dockerfile, docker-compose.yml
├── docs/ARCHITECTURE.md
├── src/
│   ├── core/ (middlewares, utilities)
│   ├── models/, modules/, services/
│   └── app.js, server.js
└── uploads/, logs/
```

---

## 📊 Project Statistics

- **Total Files:** 663  
- **Total Folders:** 310  
- **Modules Covered:** Admin, Seller, Customer, User, Moderator  
- **Documented Routes & Controllers:** Extensive `.md` coverage  
- **Schema Definitions:** ~50+ JSON/JS/Mongoose schemas  
- **Dockerized Components:** 3 services (Node, MongoDB, Redis)  
- **Security Layers:** 6+ mechanisms implemented  
- **Upload/Media Handling:** Supported with versioning

---
