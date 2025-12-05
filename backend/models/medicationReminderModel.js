import mongoose from 'mongoose';

const medicationReminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
        required: true,
    },
    medication: {
        type: String,
        required: true,
    },
    schedule: [{
        time: {
            type: String, // Format: "HH:MM" (24-hour)
            required: true,
        },
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        }],
    }],
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    reminderMethod: {
        type: String,
        enum: ['push', 'sms', 'email'],
        default: 'push',
    },
}, {
    timestamps: true,
});

// Index for efficient querying of active reminders
medicationReminderSchema.index({ userId: 1, isActive: 1 });
medicationReminderSchema.index({ endDate: 1 }); // For cleanup of expired reminders

const medicationReminderModel = mongoose.model('MedicationReminder', medicationReminderSchema);

export default medicationReminderModel;
