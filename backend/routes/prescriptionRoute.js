import express from 'express';
import {
    createPrescription,
    getPrescriptionById,
    getPrescriptionByAppointment,
    getPatientPrescriptionHistory,
    updatePrescription,
    cancelPrescription,
    getTemplates,
    createTemplate,
    deleteTemplate,
} from '../controllers/prescriptionController.js';
import authDoctor from '../middleware/authDoctor.js';
import authUser from '../middleware/authUser.js';
import authCombined from '../middleware/authCombined.js';

const prescriptionRouter = express.Router();

// Doctor routes (require doctor authentication)
prescriptionRouter.post('/create', authDoctor, createPrescription);
prescriptionRouter.patch('/:id/update', authDoctor, updatePrescription);
prescriptionRouter.delete('/:id/cancel', authDoctor, cancelPrescription);

// Template routes (doctor only)
prescriptionRouter.get('/templates', authDoctor, getTemplates);
prescriptionRouter.post('/templates', authDoctor, createTemplate);
prescriptionRouter.delete('/templates/:id', authDoctor, deleteTemplate);

// Shared routes (accessible by both doctor and patient)
// Note: Authorization check happens inside controller
// Shared routes (accessible by both doctor and patient)
// Note: Authorization check happens inside controller
prescriptionRouter.get('/:id', authCombined, getPrescriptionById);

prescriptionRouter.get('/appointment/:appointmentId', authCombined, getPrescriptionByAppointment);

// Patient routes (require user authentication)
prescriptionRouter.get('/patient/:patientId', authUser, getPatientPrescriptionHistory);

export default prescriptionRouter;
