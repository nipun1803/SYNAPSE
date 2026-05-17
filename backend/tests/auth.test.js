import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRouter from '../routes/auth.js';

// Simple app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Integration Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should have a working health check or login attempt', async () => {
    // This is a placeholder test to verify the setup
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    // We expect a 401 or 404 since the user doesn't exist, but it proves the route is reachable
    expect([401, 404, 400]).toContain(res.status);
  });
});
