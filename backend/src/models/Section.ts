import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISection extends Document {
  name: string;
  departmentId: Types.ObjectId;
  batchId: Types.ObjectId;
  createdAt: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SectionSchema.index({ name: 1, departmentId: 1, batchId: 1 }, { unique: true });

export default mongoose.model<ISection>('Section', SectionSchema);
