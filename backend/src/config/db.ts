import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gradeflow';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // options are optional in mongoose v7
    } as any);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default mongoose;
