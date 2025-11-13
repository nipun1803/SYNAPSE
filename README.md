Synapse – Doctor Appointment System

A simple and modern platform for booking doctor appointments online.

🔗 Live URLs
	•	Frontend: http://synapse-seven-theta.vercel.app/
	•	Backend: https://synapse-backend-tz3v.onrender.com

🚀 Tech Stack
	•	Frontend: React, React Router, Axios, TailwindCSS
	•	Backend: Node.js, Express.js
	•	Database: MongoDB Atlas
	•	Auth: JWT
	•	Hosting: Vercel + Render

⭐ Features
	•	User signup/login/logout (Patient/Doctor)
	•	Browse doctors with search, filter & sort
	•	Book & cancel appointments
	•	View appointment history
	•	Profile management
	•	Toast notifications

📡 API Routes

Method	Route	Purpose
POST	/api/auth/register	Register user
POST	/api/auth/login	Login
POST	/api/auth/logout	Logout
GET	/api/doctors	Get doctors
POST	/api/appointments	Book appointment
DELETE	/api/appointments/:id	Cancel appointment
GET	/api/appointments/user/:id	User appointments

🛠️ Setup

Backend

cd backend
npm install
npm start


Frontend

cd frontend
npm install
npm run dev


