import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICIEConfiguration extends Document {
  departmentId: Types.ObjectId;
  label?: string; // e.g., "Default CIE 2025-26"
  maxCIEMarks: number; // typically 50
  slipTestsCount: number; // e.g., 3
  slipTestsConsider: number; // e.g., best 2
  attendanceMaxMarks: number; // e.g., 5
  attendanceThresholds: {
    marks5: number; // >= 85% → 5 marks
    marks4: number; // >= 75% → 4 marks
    marks3: number; // >= 65% → 3 marks
  };
  isActive: boolean;
  createdAt: Date;
}

const CIEConfigurationSchema = new Schema<ICIEConfiguration>(
  {
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    label: { type: String },
    maxCIEMarks: { type: Number, default: 50 },
    slipTestsCount: { type: Number, default: 3 },
    slipTestsConsider: { type: Number, default: 2 },
    attendanceMaxMarks: { type: Number, default: 5 },
    attendanceThresholds: {
      marks5: { type: Number, default: 85 },
      marks4: { type: Number, default: 75 },
      marks3: { type: Number, default: 65 }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CIEConfigurationSchema.index({ departmentId: 1, isActive: 1 });

export default mongoose.model<ICIEConfiguration>('CIEConfiguration', CIEConfigurationSchema);
