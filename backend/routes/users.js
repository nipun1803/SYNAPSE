import express from 'express';
import {
  bookAppointment,
  cancelAppointment,
  getProfile,
  listAppointment,
  updateProfile,
  getAppointmentById,
  rescheduleAppointment
} from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// /api/users/profile
router.get('/profile', authUser, getProfile);

// /api/users/profile
router.put('/profile', authUser, upload.single('image'), updateProfile);

// /api/users/appointments
router.get('/appointments', authUser, listAppointment);

// /api/users/appointments
router.post('/appointments', authUser, bookAppointment);

// /api/users/appointments/:id/cancel
router.patch('/appointments/:id/cancel', authUser, cancelAppointment);

// /api/users/appointments/:id/reschedule
router.patch('/appointments/:id/reschedule', authUser, rescheduleAppointment);

// /api/users/appointments/:id
router.get('/appointments/:id', authUser, getAppointmentById);

export default router;