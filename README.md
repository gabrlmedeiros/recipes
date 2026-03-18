# 🍽️ Recipe Manager — Full Stack Application

## 📌 Overview

This project is a full stack application for managing recipes.

Users can:

* Create an account
* Authenticate into the system
* Create, edit, delete, and search recipes
* Print recipes (web only)

The system is composed of three main applications:

* Backend API (Node.js)
* Web application (Vue.js)
* Mobile application (React Native)

All clients consume the same backend API.

---

## 🏗️ Architecture

This project follows a **feature-based architecture** with clear separation of concerns across all layers:

* Backend → Controller → Service → Repository
* Frontend → UI → Hooks/Composables → Services
* Mobile → Screens → Hooks → Services

Consistency across all platforms is a core principle.

---

## ⚙️ Tech Stack

### 🔙 Backend

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* MySQL
* JWT (Authentication)
* RabbitMQ (asynchronous processing)
* Swagger (API documentation)

---

### 🖥️ Frontend (Web)

* Vue 3
* TypeScript
* Pinia
* Vue Router
* Axios

---

### 📱 Mobile

* React Native (Expo)
* TypeScript
* Axios
* AsyncStorage

---

### 🐳 Infrastructure

* Docker
* Docker Compose
* MySQL
* RabbitMQ

---

## 📂 Project Structure

```id="p1h2x8"
/backend
/frontend
/mobile
/docker-compose.yml
/README.md
```

---

## 🔐 Authentication

* JWT-based authentication
* Token required for protected routes
* Shared authentication across web and mobile

---

## 📡 API

* RESTful design
* Consistent response format
* Fully documented with Swagger

---

## 🔄 Asynchronous Processing

RabbitMQ is used for:

* Recipe printing jobs
* Background processing
* Non-blocking operations

---

## 🧪 Testing

* Unit tests (business logic)
* Integration tests (API endpoints)

---

## 🚀 Running the Project

### 1. Clone the repository

```bash id="0m0ncf"
git clone <repo-url>
cd project
```

---

### 2. Start services (Docker)

```bash id="7o2c5s"
docker-compose up
```

---

### 3. Run Backend

```bash id="n0a0i1"
cd backend
npm install
npm run dev
```

---

### 4. Run Frontend

```bash id="k1c8m2"
cd frontend
npm install
npm run dev
```

---

### 5. Run Mobile

```bash id="z9f3a1"
cd mobile
npm install
npx expo start
```

---

## 📄 Documentation

* Swagger available at:

```
http://localhost:3000/docs
```

---

## 🎯 Engineering Decisions

* Feature-based architecture for scalability
* Clear separation of responsibilities
* Shared API across all clients
* Queue-based async processing to improve performance
* Dockerized environment for consistency

---

## 🚀 Future Improvements

* Pagination and filtering
* Offline support (mobile)
* Role-based access control
* Caching layer (Redis)

---

## 🧠 Final Notes

This project was designed with production-grade patterns, focusing on:

* Maintainability
* Scalability
* Clean architecture

The goal is not only to deliver features, but to demonstrate strong engineering practices.
