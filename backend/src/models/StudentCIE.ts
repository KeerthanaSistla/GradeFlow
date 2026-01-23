import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudentCIE extends Document {
  studentId: Types.ObjectId;
  teachingAssignmentId: Types.ObjectId;
  cieScore: number;
  lastCalculatedAt: Date;
}

const StudentCIESchema = new Schema<IStudentCIE>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teachingAssignmentId: { type: Schema.Types.ObjectId, ref: 'TeachingAssignment', required: true },
    cieScore: { type: Number, required: true },
    lastCalculatedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

StudentCIESchema.index({ studentId: 1, teachingAssignmentId: 1 }, { unique: true });

export default mongoose.model<IStudentCIE>('StudentCIE', StudentCIESchema);
