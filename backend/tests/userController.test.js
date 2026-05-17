import { jest } from '@jest/globals';
import { bookAppointment } from '../controllers/userController.js';
import mongoose from 'mongoose';

// Mock the models
jest.unstable_mockModule('../models/usermodel.js', () => ({
  default: {
    findById: jest.fn()
  }
}));

jest.unstable_mockModule('../models/doctormodel.js', () => ({
  default: {
    findById: jest.fn()
  }
}));

// We need to re-import these AFTER mocking
const userModel = (await import('../models/usermodel.js')).default;
const doctorModel = (await import('../models/doctormodel.js')).default;

describe('User Controller Unit Tests (Mocked)', () => {
  it('should prevent booking an appointment in the past', async () => {
    const docId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId().toString();

    // Mock doctor details
    doctorModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: docId,
        available: true,
        fees: 500
      })
    });

    const req = {
      body: { 
        docId, 
        slotDate: '10_10_2000', 
        slotTime: '10:00 AM',
        paymentMode: 'cash'
      },
      user: { id: userId }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Cannot book a past time'
    }));
  });
});
