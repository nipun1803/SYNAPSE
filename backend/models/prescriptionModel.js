import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    prescriptionNumber: {
        type: String,
        unique: true,
    },
    medications: [{
        drugName: {
            type: String,
            required: true,
        },
        dosage: {
            type: String,
            required: true,
        },
        frequency: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        instructions: {
            type: String,
            default: '',
        },
        drugId: {
            type: String, // From external drug database
            default: null,
        },
    }],
    diagnosis: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'cancelled'],
        default: 'active',
    },
    validUntil: {
        type: Date,
        required: true,
    },
    pharmacyOrders: [{
        pharmacyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pharmacy',
        },
        orderDate: Date,
        status: {
            type: String,
            enum: ['pending', 'processing', 'delivered'],
            default: 'pending',
        },
    }],
}, {
    timestamps: true,
});

// Generate unique prescription number before saving
prescriptionSchema.pre('save', async function (next) {
    if (!this.prescriptionNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await mongoose.model('Prescription').countDocuments();
        this.prescriptionNumber = `RX${year}${month}${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

const prescriptionModel = mongoose.model('Prescription', prescriptionSchema);

export default prescriptionModel;
