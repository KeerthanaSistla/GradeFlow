import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAcademicYear extends Document {
  label: string; // e.g., "2025-26"
  facultyId: Types.ObjectId;
  departmentId: Types.ObjectId;
  createdAt: Date;
}

const AcademicYearSchema = new Schema<IAcademicYear>(
  {
    label: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AcademicYearSchema.index({ label: 1, facultyId: 1, departmentId: 1 });

export default mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema);
