import express from 'express';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
import {
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  allDoctors,
  adminDashboard
} from '../controllers/adminController.js';
import { changeAvailability } from '../controllers/doctorController.js';

const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', authAdmin, adminDashboard);

// GET /api/admin/appointments
router.get('/appointments', authAdmin, appointmentsAdmin);

// PATCH /api/admin/appointments/:id/cancel
router.patch('/appointments/:id/cancel', authAdmin, appointmentCancel);

// GET /api/admin/doctors
router.get('/doctors', authAdmin, allDoctors);

// POST /api/admin/doctors
router.post('/doctors', authAdmin, upload.single('image'), addDoctor);

// PATCH /api/admin/doctors/:id/availability
router.patch('/doctors/:id/availability', authAdmin, changeAvailability);

export default router;