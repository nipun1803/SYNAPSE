# Synapse – Doctor Appointment System

A simple and modern platform for booking doctor appointments online.

## 🔗 Live URLs
- **Frontend:** http://synapse-seven-theta.vercel.app/
- **Backend:** https://synapse-backend-tz3v.onrender.com


**Stack:**
- **Frontend:** React.js with React Router for navigation, Axios for API requests, TailwindCSS for UI styling
- **Backend:** Node.js + Express.js to build RESTful APIs and manage logic
- **Database:** MongoDB (NoSQL) managed via MongoDB Atlas
- **Authentication:** JWT-based login/signup for all user roles (Admin, Doctor, Patient)

**Hosting:**
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## 3. Key Features

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
| **Hosting** | Fully deployed frontend, backend, and database integration |

## 4. Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js, React Router, Axios, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (JSON Web Tokens) |
| **File Upload** | Multer, Cloudinary |
| **Hosting** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

## 5. API Overview

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
| `/api/users/appointments/:id/reschedule` | PATCH | Reschedule appointment | Authenticated (User) |

### 👨‍⚕️ Doctor Routes (`/api/doctors`)

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/doctors` | GET | Get list of all doctors | Public |
| `/api/doctors/:id` | GET | Get specific doctor details | Public |
| `/api/doctors/:id/available` | GET | Get available time slots for doctor | Public |
| `/api/doctors/me/profile` | GET | Get logged-in doctor's profile | Authenticated (Doctor) |
| `/api/doctors/me/profile` | PUT | Update doctor profile (with image) | Authenticated (Doctor) |
| `/api/doctors/me/appointments` | GET | Get doctor's appointments | Authenticated (Doctor) |
| `/api/doctors/me/dashboard` | GET | Get doctor dashboard statistics | Authenticated (Doctor) |
| `/api/doctors/me/availability` | PATCH | Toggle doctor availability | Authenticated (Doctor) |
| `/api/doctors/me/appointments/:id/complete` | PATCH | Mark appointment as complete | Authenticated (Doctor) |
| `/api/doctors/me/appointments/:id/cancel` | PATCH | Cancel appointment | Authenticated (Doctor) |
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
| `/api/admin/appointment/:id` | DELETE | Hard delete appointment | Public |
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

## 6. Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### Backend Setup
```bash
cd backend
npm install

## 🛠️ Setup Instructions

### Backend Setup
```sh
cd backend
npm install
npm start
### Frontend Setup
```sh
cd frontend
npm install
npm run dev
