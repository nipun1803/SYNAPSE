import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectDB from './config/mongodb.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import doctorRouter from './routes/doctors.js';
import userRouter from './routes/users.js';
import paymentRouter from './routes/paymentRoute.js';
import prescriptionRouter from './routes/prescriptionRoute.js';
import reviewRouter from './routes/reviewRoute.js';

import chatRouter from './routes/chatRoute.js';
import { createSocketServer } from './realtime/socket.js';

const app = express();
const port = process.env.PORT || 4000;


app.set('trust proxy', 1);
connectDB();
connectCloudinary();


app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'https://synapse-seven-theta.vercel.app',
    'https://synapse-cma3.vercel.app'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'token', 'aToken', 'dToken'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/doctors', doctorRouter);
app.use('/api/users', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/reviews', reviewRouter);


app.get('/', (req, res) => {
  res.json({ message: 'API Working' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});



app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: err.message });
});

const server = app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
});

  res.status(500).json({ success: false, message: err.message });

export default app;