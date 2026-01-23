import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFaculty extends Document {
  facultyId: string;
  name: string;
  email?: string;
  mobile?: string;
  designation?: string;
  departmentId: Types.ObjectId;
  passwordHash?: string;
  createdAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    facultyId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: String },
    designation: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    passwordHash: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FacultySchema.index({ facultyId: 1, departmentId: 1 }, { unique: true });

export default mongoose.model<IFaculty>('Faculty', FacultySchema);
