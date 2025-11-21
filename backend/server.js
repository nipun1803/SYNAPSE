import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/admin.js';
import doctorRouter from './routes/doctors.js';
import userRouter from './routes/users.js';
import authRouter from './routes/auth.js';

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.CORS_ORIGINS?.split(',') || ''],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.json({ message: 'API Working' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);

});

export default app;