import express from 'express';
import { appointmentCancel as adminCancel, appointmentsAdmin } from '../controllers/adminController.js';
import { appointmentComplete, appointmentCancel as doctorCancel } from '../controllers/doctorController.js';
import { bookAppointment, cancelAppointment } from '../controllers/userController.js';
import authAdmin from '../middleware/authAdmin.js';
import authDoctor from '../middleware/authDoctor.js';
import authUser from '../middleware/authUser.js';

const router = express.Router();

// Admin: /api/appointments (all)
router.get('/', authAdmin, appointmentsAdmin);

// POST /api/appointments (create)
router.post('/', authUser, bookAppointment);

// /api/appointments/:id/cancel (user)
router.patch('/:id/cancel', authUser, cancelAppointment);

// /api/appointments/:id/admin-cancel (admin)
router.patch('/:id/admin-cancel', authAdmin, adminCancel);

// /api/appointments/:id/doctor-cancel (doctor)
router.patch('/:id/doctor-cancel', authDoctor, doctorCancel);

// /api/appointments/:id/complete (doctor)
router.patch('/:id/complete', authDoctor, appointmentComplete);

export default router;