import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISection extends Document {
  name: string;
  departmentId: Types.ObjectId;
  createdAt: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SectionSchema.index({ name: 1, departmentId: 1 }, { unique: true });

export default mongoose.model<ISection>('Section', SectionSchema);
