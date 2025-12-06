import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    purpose: { type: String, default: '' },
    // Razorpay payment fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: {
        type: String,
        default: null
    },
    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'prescription',
        default: null
    },
    rescheduleCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel