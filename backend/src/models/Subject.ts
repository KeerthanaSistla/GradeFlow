import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubject extends Document {
  subjectCode: string;
  name: string;
  abbreviation?: string;
  credits: number;
  type: 'theory' | 'practical';
  semester: number;
  departmentId: Types.ObjectId;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    subjectCode: { type: String, required: true },
    name: { type: String, required: true },
    abbreviation: { type: String },
    credits: { type: Number, required: true },
    type: { type: String, enum: ['theory', 'practical'], default: 'theory' },
    semester: { type: Number, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SubjectSchema.index({ subjectCode: 1, departmentId: 1 }, { unique: true });

export default mongoose.model<ISubject>('Subject', SubjectSchema);
