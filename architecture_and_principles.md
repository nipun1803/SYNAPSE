# Synapse Platform: Architectural & Design Principles

This document details the software engineering principles, design patterns, and architectural decisions that form the foundation of the Synapse platform. The codebase has been optimized to ensure scalability, maintainability, and robust performance.

---

## 1. System Design & Architecture

The platform utilizes a modern, decoupled architecture designed for scale and resilience.

*   **Service-Oriented Architecture (SOA):** The application is divided into independent tiers—a Patient Frontend, an Admin/Doctor Portal, a Node.js RESTful Backend, and a MongoDB database. These are orchestrated seamlessly using **Docker Compose**, allowing independent scaling and isolated local development.
*   **Real-Time & Telemedicine Systems:** 
    *   **WebRTC Integration:** Telemedicine features are powered by Jitsi SDK, providing decentralized, peer-to-peer video streaming without burdening the primary backend.
    *   **WebSocket Signaling:** Socket.io is used as a signaling server to broadcast live status changes (e.g., when a patient joins a waiting room) and trigger UI updates instantly across connected clients.
*   **Atomic Database Operations:** Critical flows, such as booking or canceling an appointment, utilize **MongoDB Transactions** to ensure that doctor availability slots and patient appointment records are updated atomically, preventing race conditions.
*   **Stateless Security & Protection:** The backend is hardened using `helmet` for HTTP headers, `express-rate-limit` to prevent brute force attacks, and stateless JWTs for scalable authentication.

---

## 2. Object-Oriented Programming (OOP) Concepts

*   **Encapsulation:** Data schemas, validation rules, and pre/post-save hooks are strictly encapsulated within Mongoose Models. Controllers do not interact with raw database queries but instead use these modeled objects.
*   **Abstraction:** The frontend implements an API Service layer (`services.js`). React components do not need to know about headers, base URLs, or token injection; they simply call abstracted methods like `reportService.uploadReport()`.

---

## 3. Software Design Patterns

*   **Model-View-Controller (MVC):** The backend is strictly segregated. **Models** define the data structures (e.g., `appointmentModel.js`), **Controllers** contain the core business logic, and Express **Routes** handle the HTTP transport layer.
*   **Singleton Pattern:** The database connection (`mongodb.js`) and the Socket.io server instance are initialized as Singletons. This ensures that the entire application shares a single, optimized connection pool.
*   **Observer (Pub-Sub) Pattern:** The Socket.io integration heavily relies on this. The backend publishes events (`video:started`), and subscribed frontend components "observe" these events to dynamically update the UI without polling.
*   **Middleware (Chain of Responsibility) Pattern:** Express middleware routes requests through sequential validation phases. A request passes through CORS checks, Rate Limiting, JWT Authentication, and Role Authorization before it ever reaches the controller logic.

---

## 4. SOLID Principles Implementation

*   **Single Responsibility Principle (SRP):** 
    *   Every file has one reason to change. For example, `videoCallController.js` handles *only* telemedicine signaling, while `reportController.js` handles *only* file uploads and retrievals.
*   **Open/Closed Principle (OCP):** 
    *   The Express routing system allows the application to be open for extension but closed for modification. New features (like the newly added reports module) are added by injecting new route files (`app.use('/api/reports', reportRouter)`) without altering the core `server.js` logic.
*   **Liskov Substitution Principle (LSP):** 
    *   Unified login endpoints dynamically handle different user types (Patient, Doctor, Admin). The frontend can substitute these user objects interchangeably in the context state, and the UI adapts predictably.
*   **Interface Segregation Principle (ISP):** 
    *   The backend exposes distinct, role-specific API namespaces (`/api/admin`, `/api/doctors`, `/api/users`). A patient never receives the bloated payload or endpoints intended for an admin, ensuring lean data transfer.
*   **Dependency Inversion Principle (DIP):** 
    *   In the React frontend, high-level components do not depend on low-level data fetching. Instead, they depend on abstractions—specifically the **Context API** (`AppContext`, `AdminContext`). Dependencies (state and functions) are injected into the component tree, making the UI highly testable and decoupled.

---

*This architecture ensures that Synapse remains a professional-grade, enterprise-ready application capable of handling high traffic while maintaining data integrity and security.*
