# 🍽️ Recipe Manager — Full Stack Application

## 📌 Overview

This project is a full stack application for managing recipes.

Users can:

* Create an account and authenticate
* Create, edit, delete, and search their own recipes
* Filter recipes by category and tags
* View recipe details with structured ingredients and step-by-step instructions
* Mark recipes as favorites
* Generate a shopping list from selected recipes
* Print recipes via an async print queue (web)
* Share a recipe via a public URL (`/{user_login}/{recipe_id}`) — no login required

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
* Run all tests across the repository (execute from project root):

```bash
npm run test:all
```

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

## 🚀 Roadmap

Everything listed here will be built as part of this project.

* **Recipes CRUD** — create, edit, delete, and list recipes with search by name
* **Recipe categories & tags** — filter and organize by type (already modeled in DB)
* **Public recipe URL** — each recipe is accessible at `/{user_login}/{recipe_id}` without authentication, allowing easy sharing
* **Recipe photo upload** — image storage via S3/Cloudflare R2, displayed in cards and detail view
* **Ingredients + step-by-step instructions** — structured fields with ordered steps
* **Prep & cook time + servings** — displayed as quick-glance info on recipe cards
* **Difficulty rating** — easy / medium / hard badge per recipe
* **Nutritional info** — calories and macros per serving (manual input)
* **Favorites / bookmarks** — star a recipe and filter by favorites
* **Shopping list generation** — auto-generate an ingredients list from one or multiple selected recipes
* **Recipe import from URL** — paste a link, the system scrapes and pre-fills the form
* **Print queue via RabbitMQ** — async job for PDF generation and printing (web only)
* **Pagination and filtering** — server-side pagination with category and tag filters
* **Caching layer (Redis)** — cache recipe listings and public recipe pages
* **Role-based access control** — admin and regular user roles
* **Offline support (mobile)** — cache recipes locally for offline reading
* **Swagger / OpenAPI docs** — auto-generated API docs at `/docs`
* **Unit & integration tests** — business logic and endpoint coverage
* **Dark/light mode toggle** — web, persisted to localStorage (toggle button in the header)

---

## 🧠 Final Notes

This project was designed with production-grade patterns, focusing on:

* Maintainability
* Scalability
* Clean architecture

The goal is not only to deliver features, but to demonstrate strong engineering practices.
