import mongoose, { Document, Schema, Types } from 'mongoose';

export type AssessmentType = 'SLIP' | 'ASSIGNMENT' | 'MIDSEM';

export interface IAssessmentComponent extends Document {
  name: string;
  type: AssessmentType;
  maxMarks: number;
  sequence?: number;
  weightGroup?: string;
  departmentId: Types.ObjectId;
  createdAt: Date;
}

const AssessmentComponentSchema = new Schema<IAssessmentComponent>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['SLIP', 'ASSIGNMENT', 'MIDSEM'], required: true },
    maxMarks: { type: Number, required: true },
    sequence: { type: Number },
    weightGroup: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAssessmentComponent>('AssessmentComponent', AssessmentComponentSchema);
