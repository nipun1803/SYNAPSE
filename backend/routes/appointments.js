import express from 'express';
import { appointmentCancel as adminCancel, appointmentsAdmin } from '../controllers/adminController.js';
import { appointmentComplete, appointmentCancel as doctorCancel } from '../controllers/doctorController.js';
import { bookAppointment, cancelAppointment } from '../controllers/userController.js';
import authAdmin from '../middleware/authAdmin.js';
import authDoctor from '../middleware/authDoctor.js';
import authUser from '../middleware/authUser.js';

const router = express.Router();

// Admin: GET /api/appointments (all)
router.get('/', authAdmin, appointmentsAdmin);

// User: POST /api/appointments (create)
router.post('/', authUser, bookAppointment);

// PATCH /api/appointments/:id/cancel (user)
router.patch('/:id/cancel', authUser, cancelAppointment);

// PATCH /api/appointments/:id/admin-cancel (admin)
router.patch('/:id/admin-cancel', authAdmin, adminCancel);

// PATCH /api/appointments/:id/doctor-cancel (doctor)
router.patch('/:id/doctor-cancel', authDoctor, doctorCancel);

// PATCH /api/appointments/:id/complete (doctor)
router.patch('/:id/complete', authDoctor, appointmentComplete);

export default router;