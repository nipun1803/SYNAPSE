import mongoose from 'mongoose';

const prescriptionTemplateSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    templateName: {
        type: String,
        required: true,
    },
    condition: {
        type: String,
        required: true,
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
    }],
    isPublic: {
        type: Boolean,
        default: false, // Private by default, can be shared with other doctors
    },
}, {
    timestamps: true,
});

// Compound index for doctor + template name uniqueness
prescriptionTemplateSchema.index({ doctorId: 1, templateName: 1 }, { unique: true });

const prescriptionTemplateModel = mongoose.model('PrescriptionTemplate', prescriptionTemplateSchema);

export default prescriptionTemplateModel;
