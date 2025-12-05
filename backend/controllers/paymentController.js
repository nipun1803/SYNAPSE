import dotenv from "dotenv";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import appointmentModel from '../models/appointmentmodel.js';
import userModel from '../models/usermodel.js';
import doctorModel from '../models/doctormodel.js';
import catchAsync from '../utils/catchAsync.js';
dotenv.config();

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for appointment booking

const createOrder = catchAsync(async (req, res) => {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.id;

    // Fetch doctor details to get fees
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.available) {
        return res.status(400).json({ success: false, message: 'Doctor not available' });
    }

    // Check if slot is already booked
    const slotBooked = doctor.slots_booked?.[slotDate]?.includes(slotTime);
    if (slotBooked) {
        return res.status(400).json({ success: false, message: 'Slot already booked' });
    }

    // Create Razorpay order
    const amount = doctor.fees * 100; 
    const options = {
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
            userId,
            docId,
            slotDate,
            slotTime,
        },
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
        success: true,
        order: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        },
        doctorName: doctor.name,
        fees: doctor.fees,
    });
});

// verifying the  payment and creating appointment

const verifyPayment = catchAsync(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        docId,
        slotDate,
        slotTime,
    } = req.body;

    const userId = req.user.id;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

    if (razorpay_signature !== expectedSign) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Fetch user and doctor data
    const userData = await userModel.findById(userId).select('-password');
    const docData = await doctorModel.findById(docId).select('-password');

    if (!userData || !docData) {
        return res.status(404).json({ success: false, message: 'User or Doctor not found' });
    }

    // Create appointment
    const appointmentData = {
        userId,
        docId,
        userData,
        docData,
        amount: docData.fees,
        slotTime,
        slotDate,
        date: Date.now(),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        payment: true,
        paymentStatus: 'completed',
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update doctor's booked slots
    await doctorModel.findByIdAndUpdate(docId, {
        $push: {
            [`slots_booked.${slotDate}`]: slotTime,
        },
    });

    res.json({
        success: true,
        message: 'Appointment booked successfully',
        appointmentId: newAppointment._id,
    });
});

// Initiate refund for cancelled appointment

const initiateRefund = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (!appointment.payment || appointment.paymentStatus === 'refunded') {
        return res.status(400).json({ success: false, message: 'Invalid refund request' });
    }


    const refund = await razorpayInstance.payments.refund(appointment.razorpayPaymentId, {
        amount: appointment.amount * 100,
        speed: 'normal',
    });


    appointment.paymentStatus = 'refunded';
    appointment.refundId = refund.id;
    appointment.refundAmount = appointment.amount;
    appointment.refundStatus = refund.status;
    await appointment.save();

    res.json({
        success: true,
        message: 'Refund initiated successfully',
        refundId: refund.id,
    });
});

// Get payment history for user

const getPaymentHistory = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const payments = await appointmentModel
        .find({ userId, payment: true })
        .select('razorpayPaymentId amount paymentStatus date docData slotDate slotTime')
        .sort({ date: -1 });

    res.json({
        success: true,
        payments,
    });
});

export { createOrder, verifyPayment, initiateRefund, getPaymentHistory };
