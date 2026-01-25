import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  startYear: number;
  endYear: number;
  departmentId: Types.ObjectId;
  createdAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

BatchSchema.index({ name: 1, departmentId: 1 }, { unique: true });

export default mongoose.model<IBatch>('Batch', BatchSchema);
