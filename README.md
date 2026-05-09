# Synapse – Healthcare Appointment Management System

## 🎯 Problem Statement

### For Patients
In today's healthcare landscape, patients face significant challenges: 
- Long waiting times at clinics and hospitals
- Difficulty finding specialists based on location, speciality, or availability
- No transparency in doctor availability and consultation fees
- Cumbersome booking process requiring phone calls or in-person visits
- No centralized platform to manage appointments, cancellations, and rescheduling

### For Healthcare Providers
- Manual appointment management is time-consuming
- No real-time visibility into daily schedules
- Difficulty managing cancellations and filling empty slots

## 💡 Solution:  SYNAPSE

**SYNAPSE** is a full-stack web application that digitizes the healthcare appointment booking process, providing: 

- **For Patients:** Search doctors, book appointments, manage bookings online
- **For Admins:** Manage doctors, view all appointments, track system statistics

## 🔗 Live URLs

- **Frontend:** http://synapse-seven-theta.vercel.app/
- **Backend:** https://synapse-backend-tz3v.onrender.com

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SYNAPSE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   👤 Patient    👨‍⚕️ Doctor    🔧 Admin                                          │
│       │             │           │                                           │
│       └─────────────┼───────────┘                                           │
│                     ▼                                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    ⚛️ FRONTEND (React. js)                            │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│   │  │React Router │  │    Axios    │  │ TailwindCSS │  │   Vercel   │  │   │
│   │  │  Navigation │  │HTTP Client  │  │   Styling   │  │  Hosting   │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│   └─────────────────────────────┬───────────────────────────────────────┘   │
│                                 │                                           │
│              ┌─────────────────┴─────────────────┐                         │
│              │  REST API    │    WebSocket       │                         │
│              └─────────────────┬─────────────────┘                         │
│                                ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                   🚀 BACKEND (Node.js + Express)                     │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│   │  │  JWT Auth   │  │  Socket.io  │  │   Multer    │  │   Render   │  │   │
│   │  │Authentication│  │ Real-time   │  │File Upload  │  │  Hosting   │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│   └──────────────────────┬──────────────────────┬───────────────────────┘   │
│                          │                      │                           │
│                          ▼                      ▼                           │
│   ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│   │     🍃 MongoDB Atlas        │  │        ☁️ Cloudinary               │   │
│   │   ┌───────────────────┐     │  │     ┌──────────────────────┐       │   │
│   │   │ • Users Collection│     │  │     │  • Profile Images    │       │   │
│   │   │ • Doctors Records │     │  │     │  • Doctor Photos     │       │   │
│   │   │ • Appointments    │     │  │     │  • CDN Delivery      │       │   │
│   │   │ • Admin Data      │     │  │     │  • Image Processing  │       │   │
│   │   └───────────────────┘     │  │     └──────────────────────┘       │   │
│   └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Frontend-Backend Communication Flow
```
┌──────────────────────────────────────────────────────────────────────────┐
│                          REQUEST-RESPONSE FLOW                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User Action (Click/Submit)                                           │
│     👤 User  ────────────────────────▶  ⚛️ React Component              │
│                                                                          │
│  2. Prepare & Send HTTP Request                                          │
│     ⚛️ React  ───────────────────────▶  📡 Axios HTTP Client            │
│                                                                          │
│  3. API Request with Authentication                                      │
│     📡 Axios  ───────────────────────▶  🚀 Express. js Server            │
│          │                                      │                       │
│          │ Authorization: Bearer <JWT_TOKEN>    │                       │
│          │ Content-Type: application/json       │                       │
│          └──────────────────────────────────────┘                       │
│                                                                          │
│  4. Token Validation & Authorization                                     │
│     🚀 Express  ─────────────────────▶  🔐 JWT Middleware               │
│                                                                          │
│  5. Database Operations                                                  │
│     🔐 Middleware  ──────────────────▶  🍃 MongoDB Atlas                │
│                                                                          │
│  6. Data Processing & Response                                           │
│     🍃 MongoDB  ─────────────────────▶  🚀 Express  ─────▶ 📡 Axios     │
│                                                                          │
│  7. UI Update & Render                                                   │
│     📡 Axios  ───────────────────────▶  ⚛️ React  ──────▶ 👤 User       │
│                                                                          │
│  8. Real-time Notifications (Parallel)                                  │
│     🔔 Socket. io Server  ◄──────────────────────────▶  🔔 Socket Client │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Appointment Booking Process Flow
```
┌────────────────────────────────────────────────────────────────────────────┐
│                        APPOINTMENT BOOKING JOURNEY                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  🔍 Search Doctor  ──▶  📋 View Profile  ──▶  📅 Check Availability       │
│        │                     │                       │                     │
│        │                     │                       ▼                     │
│        │                     │              ❌ No Slots Available?          │
│        │                     │                       │                     │
│        │                     │                    ┌──┘                     │
│        │                     │                    │                        │
│        │                     │                    ▼                        │
│        │                     │            🔄 Check Another Time            │
│        │                     │                    │                        │
│        │                     │                    └──────────────┐         │
│        │                     │                                   │         │
│        ▼                     ▼                       ▼           ▼         │
│  ✅ Select Doctor    ──▶  📅 Select Time Slot  ──▶  ✅ Confirm Booking    │
│                                                           │                 │
│                                                           ▼                 │
│                                              🔔 Real-time Notification     │
│                                                       (Socket.io)          │
│                                                           │                 │
│                                                           ▼                 │
│                                                  📧 Booking Confirmed       │
│                                                           │                 │
│                                                           ▼                 │
│                                                  🏥 Manage Appointment      │
│                                                           │                 │
│                       ┌───────────────────────────────────┼─────────────┐   │
│                       │                                   │             │   │
│                       ▼                                   ▼             ▼   │
│              🔄 Reschedule Appointment        ❌ Cancel Appointment   ✅ Mark Complete │
│                       │                                   │             │   │
│                       │                                   │             │   │
│                       └──────────▶ 📅 Select New Slot    │             │   │
│                                           │               │             │   │
│                                           │               ▼             ▼   │
│                                           └──▶ ✅ Updated    📋 Appointment   │
│                                                              History      │
└────────────────────────────────────────────────────────────────────────────┘
```

### Stack
- **Frontend:** React.js with React Router for navigation, Axios for API requests, TailwindCSS for UI styling
- **Backend:** Node.js + Express. js to build RESTful APIs and manage logic (used Socket.io for real-time monitoring)
- **Database:** MongoDB (NoSQL) managed via MongoDB Atlas
- **Authentication:** JWT-based login/signup for all user roles (Admin, Patient, Doctor)

### Hosting
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## ✨ Key Features

| Category | Features |
|----------|----------|
| **User Authentication** | Patient, Doctor, and Admin registration, login, logout using JWT |
| **Doctor Listing** | View list of available doctors with specialization and contact info |
| **Advanced Search** | Search, Sort, Filter, and Pagination to easily manage and navigate large lists of doctors |
| **Appointment Booking** | Patients can book, cancel, and reschedule appointments with selected doctors |
| **Profile Management** | Simple profile view and edit for users (name, email, phone, image) |
| **Doctor Dashboard** | Doctors can view appointments, update availability, and manage their profile |
| **Admin Panel** | Admin can manage doctors, appointments, and view dashboard statistics |
| **Frontend Routing** | Pages: Home, Login, Signup, Doctor List, Book Appointment, Profile, Dashboard |
| **Notifications/Toasts** | Simple toast messages for success/error actions |
| **Real-time Updates** | Socket.io integration for live appointment monitoring |
| **Hosting** | Fully deployed frontend, backend, and database integration |

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js, React Router, Axios, TailwindCSS |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (JSON Web Tokens) |
| **File Upload** | Multer, Cloudinary |
| **Hosting** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

## 📡 API Overview

### 🔐 Authentication Routes (`/api/auth`)

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/register` | POST | Register new user (patient) | Public |
| `/api/auth/login` | POST | Unified login (auto-detects user type) | Public |
| `/api/auth/login/user` | POST | Login as patient | Public |
| `/api/auth/login/doctor` | POST | Login as doctor | Public |
| `/api/auth/login/admin` | POST | Login as admin | Public |
| `/api/auth/logout/user` | POST | Logout patient | Authenticated (User) |
| `/api/auth/logout/doctor` | POST | Logout doctor | Authenticated (Doctor) |
| `/api/auth/logout/admin` | POST | Logout admin | Authenticated (Admin) |

### 👤 User/Patient Routes (`/api/users`)

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/users/profile` | GET | Get user profile | Authenticated (User) |
| `/api/users/profile` | PUT | Update user profile (with image upload) | Authenticated (User) |
| `/api/users/appointments` | GET | List all user appointments | Authenticated (User) |
| `/api/users/appointments` | POST | Book new appointment | Authenticated (User) |
| `/api/users/appointments/:id` | GET | Get specific appointment details | Authenticated (User) |
| `/api/users/appointments/:id/cancel` | PATCH | Cancel appointment | Authenticated (User) |
| `/api/users/appointments/: id/reschedule` | PATCH | Reschedule appointment | Authenticated (User) |

### 👨‍⚕️ Doctor Routes (`/api/doctors`)

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/doctors` | GET | Get list of all doctors | Public |
| `/api/doctors/: id` | GET | Get specific doctor details | Public |
| `/api/doctors/:id/available` | GET | Get available time slots for doctor | Public |
| `/api/doctors/me/profile` | GET | Get logged-in doctor's profile | Authenticated (Doctor) |
| `/api/doctors/me/profile` | PUT | Update doctor profile (with image) | Authenticated (Doctor) |
| `/api/doctors/me/appointments` | GET | Get doctor's appointments | Authenticated (Doctor) |
| `/api/doctors/me/dashboard` | GET | Get doctor dashboard statistics | Authenticated (Doctor) |
| `/api/doctors/me/availability` | PATCH | Toggle doctor availability | Authenticated (Doctor) |
| `/api/doctors/me/appointments/: id/complete` | PATCH | Mark appointment as complete | Authenticated (Doctor) |
| `/api/doctors/me/appointments/: id/cancel` | PATCH | Cancel appointment | Authenticated (Doctor) |
| `/api/doctors` | POST | Add new doctor | Authenticated (Admin) |
| `/api/doctors/all` | GET | Get all doctors (admin view) | Authenticated (Admin) |

### 🔧 Admin Routes (`/api/admin`)

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/admin/login` | POST | Admin login | Public |
| `/api/admin/dashboard` | GET | Get admin dashboard statistics | Authenticated (Admin) |
| `/api/admin/appointments` | GET | Get all appointments | Authenticated (Admin) |
| `/api/admin/appointments/:id/cancel` | PATCH | Cancel appointment | Authenticated (Admin) |
| `/api/admin/cancel-appointment` | POST | Cancel appointment (alternative) | Authenticated (Admin) |
| `/api/admin/appointment/: id` | DELETE | Hard delete appointment | Public |
| `/api/admin/doctors` | GET | Get all doctors | Authenticated (Admin) |
| `/api/admin/doctors` | POST | Add new doctor (with image) | Authenticated (Admin) |
| `/api/admin/doctors/:id/availability` | PATCH | Change doctor availability | Authenticated (Admin) |
| `/api/admin/doctors/:id` | DELETE | Delete doctor | Authenticated (Admin) |

### 📅 Appointment Routes (`/api/appointments`)

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/appointments` | GET | Get all appointments | Authenticated (Admin) |
| `/api/appointments` | POST | Book appointment | Authenticated (User) |
| `/api/appointments/:id/cancel` | PATCH | Cancel appointment | Authenticated (User) |
| `/api/appointments/:id/admin-cancel` | PATCH | Admin cancel appointment | Authenticated (Admin) |
| `/api/appointments/:id/doctor-cancel` | PATCH | Doctor cancel appointment | Authenticated (Doctor) |
| `/api/appointments/:id/complete` | PATCH | Mark appointment complete | Authenticated (Doctor) |

### 🏥 General Routes

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/` | GET | API status check | Public |
| `/api/health` | GET | Health check endpoint | Public |

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### 🐳 Docker Setup (Recommended)

The easiest way to run the entire Synapse platform (Backend, Frontend, and Admin) is using Docker Compose. This ensures a consistent environment across all services without needing to manage local `node_modules`.

**1. Launch the Platform**
```bash
# Build and start all services in the background
docker-compose up -d --build
```

**2. Access the Services**
- **Frontend (Patient Portal):** [http://localhost:5173](http://localhost:5173)
- **Admin Panel:** [http://localhost:5174](http://localhost:5174)
- **Backend API:** [http://localhost:4000](http://localhost:4000)

**3. Stopping the Services**
```bash
docker-compose down
```

### 🛠️ Manual Setup Instructions

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# PORT=5000

# Start the backend server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with the following variables:
# VITE_API_URL=http://localhost:5000
# (or your deployed backend URL)

# Start the development server
npm run dev
```

## 🌟 Key Highlights

- **Full-Stack Application:** Complete MERN stack implementation with modern technologies
- **Role-Based Authentication:** Secure JWT-based auth system for multiple user types
- **Real-Time Features:** Socket.io integration for live updates and notifications
- **Professional UI/UX:** Clean, responsive design with TailwindCSS
- **Scalable Architecture:** Well-structured codebase with proper separation of concerns
- **Production Ready:** Fully deployed and accessible with live URLs
- **Comprehensive API:** RESTful API design with detailed endpoint documentation

---

**Built with ❤️ using React. js and Node.js**  
**Styled with TailwindCSS • Deployed on Vercel and Render**


