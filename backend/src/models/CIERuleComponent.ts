import mongoose, { Document, Schema, Types } from 'mongoose';
import { AssessmentType } from './AssessmentComponent';

export type CIEComponentRole = 'SLIP' | 'ASSIGNMENT' | 'MIDSEM' | 'ATTENDANCE';

export interface ICIERuleComponent extends Document {
  cieConfigurationId: Types.ObjectId;
  componentType: CIEComponentRole;
  weight?: number; // percentage for direct sum, or max marks for this component
  sequence?: number; // order in calculation
  createdAt: Date;
}

const CIERuleComponentSchema = new Schema<ICIERuleComponent>(
  {
    cieConfigurationId: { type: Schema.Types.ObjectId, ref: 'CIEConfiguration', required: true },
    componentType: { type: String, enum: ['SLIP', 'ASSIGNMENT', 'MIDSEM', 'ATTENDANCE'], required: true },
    weight: { type: Number }, // e.g., 10 for slip tests, 10 for assignments, 25 for midsem, 5 for attendance
    sequence: { type: Number }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CIERuleComponentSchema.index({ cieConfigurationId: 1, componentType: 1 });

export default mongoose.model<ICIERuleComponent>('CIERuleComponent', CIERuleComponentSchema);
