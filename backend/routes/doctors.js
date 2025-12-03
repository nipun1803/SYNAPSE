import express from 'express';
import { addDoctor, allDoctors } from '../controllers/adminController.js';
import {
  appointmentCancel,
  appointmentComplete,
  appointmentsDoctor,
  changeAvailability,
  doctorDashboard,
  doctorList,
  getDoctorById,
  doctorProfile,
  updateDoctorProfile,
  getDoctorAvailableSlots
} from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import authDoctor from '../middleware/authDoctor.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Doctor's own profile (must come before /:id routes)
router.get('/me/profile', authDoctor, doctorProfile);
router.put('/me/profile', authDoctor, upload.single('image'), updateDoctorProfile);

// Doctor appointments & dashboard
router.get('/me/appointments', authDoctor, appointmentsDoctor);
router.get('/me/dashboard', authDoctor, doctorDashboard);

// Doctor actions
router.patch('/me/availability', authDoctor, changeAvailability);
router.patch('/me/appointments/:id/complete', authDoctor, appointmentComplete);
router.patch('/me/appointments/:id/cancel', authDoctor, appointmentCancel);

// Admin management
router.post('/', authAdmin, upload.single('image'), addDoctor);
router.get('/all', authAdmin, allDoctors);


//  /api/doctors
router.get('/', doctorList);

// /api/doctors/:id/available
router.get('/:id/available', getDoctorAvailableSlots);

//  /api/doctors/:id 
router.get('/:id', getDoctorById);

export default router;