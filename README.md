# Synapse – Doctor Appointment System

A simple and modern platform for booking doctor appointments online.

## 🔗 Live URLs
- **Frontend:** http://synapse-seven-theta.vercel.app/
- **Backend:** https://synapse-backend-tz3v.onrender.com

## 🚀 Tech Stack
- **Frontend:** React, React Router, Axios, TailwindCSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **Auth:** JWT  
- **Hosting:** Vercel (Frontend), Render (Backend)

## ⭐ Features
- User Signup / Login / Logout  
- Browse doctors with search, filter & sort  
- Book appointments  
- Cancel appointments  
- View user appointment history  
- Profile management  
- Toast notifications for all actions  

## 📡 API Routes
| Method | Route | Purpose |
|--------|--------|---------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET  | /api/doctors | Get all doctors |
| POST | /api/appointments | Book an appointment |
| DELETE | /api/appointments/:id | Cancel appointment |
| GET  | /api/appointments/user/:id | Get user appointments |

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
