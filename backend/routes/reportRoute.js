import express from 'express';
import { uploadReport, getMyReports, deleteReport } from '../controllers/reportController.js';
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// POST /api/reports — Upload a report
router.post('/', authUser, upload.single('report'), uploadReport);

// GET /api/reports — Get my reports
router.get('/', authUser, getMyReports);

// DELETE /api/reports/:id — Delete a report
router.delete('/:id', authUser, deleteReport);

export default router;
