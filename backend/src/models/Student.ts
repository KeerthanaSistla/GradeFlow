import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudent extends Document {
  rollNumber: string;
  name: string;
  email?: string;
  mobile?: string;
  departmentId: Types.ObjectId;
  section?: string;
  joiningYear?: number;
  passingYear?: number;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    section: { type: String },
    joiningYear: { type: Number },
    passingYear: { type: Number }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
