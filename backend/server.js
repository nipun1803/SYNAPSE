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

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5174'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], 
  exposedHeaders: ['Set-Cookie']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/doctors', doctorRouter); 
app.use('/api/users', userRouter);


app.get('/', (req, res) => {
  res.json({ message: 'API Working' });
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);

});

export default app;