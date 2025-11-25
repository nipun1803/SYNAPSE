import express from "express";
import {
  addDoctor,
  adminDashboard,
  allDoctors,
  appointmentCancel,
  appointmentsAdmin,
} from "../controllers/adminController.js";
import { changeAvailability } from "../controllers/doctorController.js";
import authAdmin from "../middleware/authAdmin.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// /api/admin/dashboard
router.get("/dashboard", authAdmin, adminDashboard);

// /api/admin/appointments
router.get("/appointments", authAdmin, appointmentsAdmin);

// /api/admin/appointments/:id/cancel
router.patch("/appointments/:id/cancel", authAdmin, appointmentCancel);

// /api/admin/doctors
router.get("/doctors", authAdmin, allDoctors);

// /api/admin/doctors
router.post("/doctors", authAdmin, upload.single("image"), addDoctor);

// /api/admin/doctors/:id/availability
router.patch("/doctors/:id/availability", authAdmin, changeAvailability);

export default router;
