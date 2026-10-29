# 🏨 AI-Powered Hotel & Tourism Booking Platform (Final-PBL)

> A modern, AI-augmented accommodation booking and travel discovery platform designed to solve two core problems: **slow, irrelevant search results** for travelers and **costly double-booking conflicts** for property operators.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-Flask%20AI-blue.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![React](https://img.shields.io/badge/React-18%20%2B%20Vite-61dafb.svg)](https://react.dev/)

---

## 💡 The "Why" Behind This Project

Most traditional hotel and booking directories rely on rigid keyword and filter queries (e.g., matching exact hotel names or static city strings). When travelers search using natural intent (e.g., *"quiet workspace near the beach with fast Wi-Fi"*), traditional SQL `LIKE` queries fail, resulting in abandoned search funnels.

At the same time, when multiple users attempt to reserve the last available room simultaneously during peak traffic, weak concurrency handling leads to **overbooking / double-booking disaster** for operators.

**Our Goal:** Build an end-to-end, high-performance booking engine that combines:
1. **AI Semantic Search (Vector Search)** to convert natural travel intent into relevant room recommendations in `< 200ms`.
2. **Robust Concurrency Control** in the booking engine to guarantee zero double-bookings.
3. **Frictionless Storefront & Management UI** for guests and property operators.

---

## 🏛️ System Architecture

The application is structured into decoupled micro-services and modern web surfaces:

```
[ Guest / Operator Browser ]
             │
             ▼
   [ ReactJS + Vite Storefront ]
             │
             ├── (RESTful API / Stateless JWT)
             ▼
   [ Spring Boot 3 Core Backend ] ──(REST / JSON)──► [ Python Flask AI Service ]
             │                                                │
             │                                         (Generates vector
             │                                          embeddings)
             ▼                                                │
   [ PostgreSQL + pgvector ] ◄────────────────────────────────┘
    - Relational data (users, rooms, bookings)
    - Vector index (cosine similarity for recommendations)
```

---

## 🚀 Key Engineering & Product Highlights

### 1. AI-Driven Semantic Recommendation Engine
- **Embedding Pipeline:** Utilizes Python Flask to transform room/destination attributes and natural user prompts into dense vector representations.
- **pgvector Integration:** Stores high-dimensional embeddings directly in PostgreSQL using `pgvector`. Search queries leverage cosine similarity distance (`<=>`) backed by IVFFlat indexing, returning top-k matching properties in **under 200ms**.
- **Impact:** Eliminates zero-result searches when users do not know exact property titles.

### 2. Reliable Booking Engine & Double-Booking Prevention
- **The Challenge:** High-concurrency race conditions where two simultaneous requests see "1 room left" and both proceed to checkout.
- **The Solution:** 
  - Strict **Database Transactions (`@Transactional`)** coupled with **Optimistic Locking (`@Version`)** at the entity level.
  - When concurrent transactions attempt to commit against the same inventory slot, the conflict is intercepted immediately (`OptimisticLockException`), rolling back cleanly and responding with a standard `409 Conflict` error rather than corrupting inventory.
  - Idempotent booking creation APIs prevent accidental duplicate submissions on double-clicks.

### 3. Production-Ready Media & Auth Pipeline
- **Media Delivery:** Integrated **Cloudinary API** for fast, CDN-cached image uploads and transformations without overloading server disk space.
- **Security:** Stateless **JWT (JSON Web Token)** authentication with role-based access control (Guests vs. Admins/Operators).

---

## 🗂️ Repository Branch Structure

To maintain modularity across different teams and tech stacks, the codebase is partitioned across dedicated branches:

| Branch | Surface / Service | Stack |
| :--- | :--- | :--- |
| **[`backend`](https://github.com/anchinh1908/Final-PBL/tree/backend)** | Core Booking Engine & REST APIs | Java 21, Spring Boot 3.4.4, Hibernate, PostgreSQL, JWT |
| **[`website`](https://github.com/anchinh1908/Final-PBL/tree/website)** | Web Storefront & Management UI | ReactJS, Vite, TailwindCSS |
| **[`FlaskAPI`](https://github.com/anchinh1908/Final-PBL/tree/FlaskAPI)** | AI Recommendation & Embedding Microservice | Python, Flask, Sentence Transformers |
| **[`mobile`](https://github.com/anchinh1908/Final-PBL/tree/mobile)** | Mobile Application | React Native / Flutter Client |

---

## 🛠️ Tech Stack & Tools

- **Backend:** Java 21, Spring Boot 3.4.4, Spring Data JPA, Maven
- **Database:** PostgreSQL 16+ with `pgvector` extension
- **AI / Embeddings:** Python 3.10+, Flask
- **Frontend:** React 18, Vite, TailwindCSS, Axios
- **Integrations & Cloud:** Cloudinary (Media CDN), Leaflet/Mapbox (Geo mapping), Postman (API verification)
- **Workflow & AI Leverage:** Developed using **Claude & Cursor** for rapid prototyping, spec drafting, and test generation.

---

## ⚡ Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Java 21 LTS** & **Maven 3.9+**
- **Node.js v20+** & **npm**
- **Python 3.10+**
- **PostgreSQL** instance with `pgvector` enabled (e.g., local or via [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com))

---

### 2. Running Backend (Spring Boot)
Switch to the `backend` branch:
```bash
git checkout backend
cd backend/AI-Hotel
```
Configure your database in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://<HOST>:<PORT>/<DB_NAME>
spring.datasource.username=<USERNAME>
spring.datasource.password=<PASSWORD>
spring.jpa.hibernate.ddl-auto=update
```
Run the application:
```bash
mvn clean spring-boot:run
```
*API server runs on `http://localhost:8080`.*

---

### 3. Running Frontend (React)
Switch to the `website` branch:
```bash
git checkout website
cd frontend
npm install
npm run dev
```
*Web storefront runs on `http://localhost:5173`.*

---

### 4. Running AI Embedding Service (Python)
Switch to the `FlaskAPI` branch:
```bash
git checkout FlaskAPI
pip install -r requirements.txt
python app.py
```
*AI Microservice runs on `http://localhost:5000`.*

---

## 👤 Author

**Bui Nguyen An Chinh**  
- **Role:** Lead Backend & AI Integration Engineer  
- **Email:** [anchinhktvn123@gmail.com](mailto:anchinhktvn123@gmail.com)  
- **LinkedIn:** [linkedin.com/in/chinh-buinguyen](https://linkedin.com/in/chinh-buinguyen)  
- **GitHub:** [github.com/anchinh1908](https://github.com/anchinh1908)
