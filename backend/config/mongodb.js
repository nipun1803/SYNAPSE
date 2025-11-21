import mongoose from 'mongoose';

const connectDB = async () => {
  try {

    mongoose.set('bufferCommands', false);

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/synapse';

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on('connected', () => {
      console.log('Database Connected Successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Database Disconnected');
    });
  } catch (err) {
    console.error('Could not connect to Database:', err.message);
  }
};

export default connectDB; 