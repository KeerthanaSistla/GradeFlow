import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudentAssessment extends Document {
  studentId: Types.ObjectId;
  teachingAssignmentId: Types.ObjectId;
  componentId: Types.ObjectId;
  marks: number;
  createdAt: Date;
}

const StudentAssessmentSchema = new Schema<IStudentAssessment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teachingAssignmentId: { type: Schema.Types.ObjectId, ref: 'TeachingAssignment', required: true },
    componentId: { type: Schema.Types.ObjectId, ref: 'AssessmentComponent', required: true },
    marks: { type: Number, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

StudentAssessmentSchema.index({ studentId: 1, teachingAssignmentId: 1, componentId: 1 }, { unique: false });

export default mongoose.model<IStudentAssessment>('StudentAssessment', StudentAssessmentSchema);
