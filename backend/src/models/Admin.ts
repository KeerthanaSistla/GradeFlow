import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  role: 'SUPER_ADMIN';
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: 'SUPER_ADMIN' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAdmin>('Admin', AdminSchema);
