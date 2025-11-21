import express from 'express';
import authDoctor from '../middleware/authDoctor.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
import {
  doctorList,
  doctorProfile,
  updateDoctorProfile,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  changeAvailability,
  doctorDashboard
} from '../controllers/doctorController.js';
import { addDoctor, allDoctors } from '../controllers/adminController.js';

const router = express.Router();

// Public: GET /api/doctors
router.get('/', doctorList);

// GET /api/doctors/:id (retrieve single doctor)
router.get('/:id', doctorList); // you can implement dedicated controller for single doctor

// Doctor's own profile
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

export default router;