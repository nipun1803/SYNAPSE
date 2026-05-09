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
import { startVideoCall, endVideoCall, getVideoCallStatus } from '../controllers/videoCallController.js';
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

// Video call routes (patient)
router.post('/appointments/:id/video/start', authUser, startVideoCall);
router.post('/appointments/:id/video/end', authUser, endVideoCall);
router.get('/appointments/:id/video/status', authUser, getVideoCallStatus);

export default router;