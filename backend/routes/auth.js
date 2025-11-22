import express from 'express';
import { loginAdmin, logoutAdmin } from '../controllers/adminController.js';
import { loginDoctor, logoutDoctor } from '../controllers/doctorController.js';
import {
  loginUser,
  logoutUser,
  registerUser,
  unifiedLogin
} from '../controllers/userController.js';
import authAdmin from '../middleware/authAdmin.js';
import authDoctor from '../middleware/authDoctor.js';
import authUser from '../middleware/authUser.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login (unified login used by frontend)
router.post('/login', unifiedLogin);

// Optional legacy endpoints (keep during migration)
router.post('/login/user', loginUser);
router.post('/login/doctor', loginDoctor);
router.post('/login/admin', loginAdmin);

// Logout endpoints
router.post('/logout/user', authUser, logoutUser);
router.post('/logout/doctor', authDoctor, logoutDoctor);
router.post('/logout/admin', authAdmin, logoutAdmin);

export default router;