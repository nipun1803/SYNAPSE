import mongoose from 'mongoose';
import dotenv from 'dotenv';
import prescriptionModel from './models/prescriptionModel.js';

dotenv.config({ path: './.env' });

const verifyPrescription = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await prescriptionModel.countDocuments();
        console.log(`Total Prescriptions: ${count}`);

        if (count > 0) {
            const latest = await prescriptionModel.findOne().sort({ createdAt: -1 });
            console.log('Latest Prescription:', JSON.stringify(latest, null, 2));
        } else {
            console.log('No prescriptions found.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

verifyPrescription();
