import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeachingAssignment extends Document {
  academicYearId: Types.ObjectId;
  facultyId: Types.ObjectId;
  departmentId: Types.ObjectId;
  semester: number;
  subjectId: Types.ObjectId;
  section?: string | null;
  studentIds: Types.ObjectId[];
  createdAt: Date;
}

const TeachingAssignmentSchema = new Schema<ITeachingAssignment>(
  {
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    section: { type: String, default: null },
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ITeachingAssignment>('TeachingAssignment', TeachingAssignmentSchema);
