import express from 'express';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
import {
  getProfile,
  updateProfile,
  listAppointment,
  bookAppointment,
  cancelAppointment
} from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authUser, getProfile);

// PUT /api/users/profile
router.put('/profile', authUser, upload.single('image'), updateProfile);

// GET /api/users/appointments
router.get('/appointments', authUser, listAppointment);

// POST /api/users/appointments
router.post('/appointments', authUser, bookAppointment);

// PATCH /api/users/appointments/:id/cancel
router.patch('/appointments/:id/cancel', authUser, cancelAppointment);

export default router;