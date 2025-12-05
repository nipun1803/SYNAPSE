import prescriptionModel from '../models/prescriptionModel.js';
import prescriptionTemplateModel from '../models/prescriptionTemplateModel.js';
import appointmentModel from '../models/appointmentmodel.js';
import doctorModel from '../models/doctormodel.js';
import userModel from '../models/usermodel.js';
import catchAsync from '../utils/catchAsync.js';

// Create new prescription
const createPrescription = catchAsync(async (req, res) => {
    const doctorId = req.doctor.id;
    const { appointmentId, patientId, medications, diagnosis, notes, validityDays = 30 } = req.body;

    // Validate appointment exists and belongs to this doctor
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.docId.toString() !== doctorId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to create prescription for this appointment' });
    }

    if (!appointment.isCompleted) {
        return res.status(400).json({ success: false, message: 'Cannot create prescription for incomplete appointment' });
    }

    // Check if prescription already exists for this appointment
    if (appointment.prescriptionId) {
        return res.status(409).json({ success: false, message: 'Prescription already exists for this appointment' });
    }

    // Calculate valid until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    // Create prescription
    const prescription = new prescriptionModel({
        appointmentId,
        doctorId,
        patientId,
        medications,
        diagnosis,
        notes,
        validUntil,
    });

    await prescription.save();

    // Update appointment with prescription reference
    await appointmentModel.findByIdAndUpdate(appointmentId, { prescriptionId: prescription._id });

    res.status(201).json({
        success: true,
        message: 'Prescription created successfully',
        prescription,
    });
});

// Get prescription by ID
const getPrescriptionById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const doctorId = req.doctor?.id;

    const prescription = await prescriptionModel
        .findById(id)
        .populate({ path: 'appointmentId', select: 'slotDate slotTime', model: 'appointment' })
        .populate('doctorId', 'name speciality degree image')
        .populate('patientId', 'name email phone');

    if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Check authorization - only patient or doctor can view
    // Check authorization - only patient or doctor can view
    const isAuthorized =
        (userId && prescription.patientId?._id?.toString() === userId) ||
        (doctorId && prescription.doctorId?._id?.toString() === doctorId);

    if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this prescription' });
    }

    res.json({ success: true, prescription });
});

// Get prescription for specific appointment
const getPrescriptionByAppointment = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user?.id;
    const doctorId = req.doctor?.id;

    const prescription = await prescriptionModel
        .findOne({ appointmentId })
        .populate('doctorId', 'name speciality degree image')
        .populate('patientId', 'name email phone');

    if (!prescription) {
        return res.status(404).json({ success: false, message: 'No prescription found for this appointment' });
    }

    // Check authorization
    const isAuthorized =
        (userId && prescription.patientId._id.toString() === userId.toString()) ||
        (doctorId && prescription.doctorId._id.toString() === doctorId.toString());

    if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this prescription' });
    }

    res.json({ success: true, prescription });
});

// Get patient prescription history
const getPatientPrescriptionHistory = catchAsync(async (req, res) => {
    const { patientId } = req.params;
    const userId = req.user?.id;

    // Ensure user can only view their own prescriptions
    if (userId && userId !== patientId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view these prescriptions' });
    }

    const prescriptions = await prescriptionModel
        .find({ patientId })
        .populate('doctorId', 'name speciality')
        .populate({ path: 'appointmentId', select: 'slotDate slotTime', model: 'appointment' })
        .sort({ createdAt: -1 });

    res.json({ success: true, prescriptions, total: prescriptions.length });
});

// Update prescription
const updatePrescription = catchAsync(async (req, res) => {
    const { id } = req.params;
    const doctorId = req.doctor.id;
    const { medications, diagnosis, notes, status } = req.body;

    const prescription = await prescriptionModel.findById(id);

    if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Only the prescribing doctor can update
    if (prescription.doctorId.toString() !== doctorId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update this prescription' });
    }

    // Update fields
    if (medications) prescription.medications = medications;
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (notes !== undefined) prescription.notes = notes;
    if (status) prescription.status = status;

    await prescription.save();

    res.json({ success: true, message: 'Prescription updated successfully', prescription });
});

// Cancel prescription
const cancelPrescription = catchAsync(async (req, res) => {
    const { id } = req.params;
    const doctorId = req.doctor.id;

    const prescription = await prescriptionModel.findById(id);

    if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.doctorId.toString() !== doctorId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this prescription' });
    }

    prescription.status = 'cancelled';
    await prescription.save();

    res.json({ success: true, message: 'Prescription cancelled successfully' });
});

// Get doctor's templates
const getTemplates = catchAsync(async (req, res) => {
    const doctorId = req.doctor.id;

    const templates = await prescriptionTemplateModel
        .find({ $or: [{ doctorId }, { isPublic: true }] })
        .sort({ createdAt: -1 });

    res.json({ success: true, templates, total: templates.length });
});

// Create template
const createTemplate = catchAsync(async (req, res) => {
    const doctorId = req.doctor.id;
    const { templateName, condition, medications, isPublic } = req.body;

    if (!templateName || !condition || !medications || medications.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing required template fields' });
    }

    const template = new prescriptionTemplateModel({
        doctorId,
        templateName,
        condition,
        medications,
        isPublic: isPublic || false,
    });

    await template.save();

    res.status(201).json({ success: true, message: 'Template created successfully', template });
});

// Delete template
const deleteTemplate = catchAsync(async (req, res) => {
    const { id } = req.params;
    const doctorId = req.doctor.id;

    const template = await prescriptionTemplateModel.findById(id);

    if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (template.doctorId.toString() !== doctorId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this template' });
    }

    await prescriptionTemplateModel.findByIdAndDelete(id);

    res.json({ success: true, message: 'Template deleted successfully' });
});

export {
    createPrescription,
    getPrescriptionById,
    getPrescriptionByAppointment,
    getPatientPrescriptionHistory,
    updatePrescription,
    cancelPrescription,
    getTemplates,
    createTemplate,
    deleteTemplate,
};
