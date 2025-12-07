import express from 'express';
import { addReview, getDoctorReviews } from '../controllers/reviewController.js';
import authUser from '../middleware/authUser.js';

const reviewRouter = express.Router();

// POST /api/reviews/add
reviewRouter.post('/add', authUser, addReview);

// GET /api/reviews/:docId
reviewRouter.get('/:docId', getDoctorReviews);

export default reviewRouter;
