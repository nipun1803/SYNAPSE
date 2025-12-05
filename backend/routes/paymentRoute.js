import express from 'express';
import { createOrder, verifyPayment, initiateRefund, getPaymentHistory } from '../controllers/paymentController.js';
import authUser from '../middleware/authUser.js';
import authAdmin from '../middleware/authAdmin.js';

const paymentRouter = express.Router();

// User routes
paymentRouter.post('/create-order', authUser, createOrder);
paymentRouter.post('/verify', authUser, verifyPayment);
paymentRouter.get('/history', authUser, getPaymentHistory);

// Admin route for refunds
paymentRouter.post('/refund/:appointmentId', authAdmin, initiateRefund);

export default paymentRouter;
