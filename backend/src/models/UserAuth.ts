import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface IUserAuth extends Document {
  role: UserRole;
  referenceId: Types.ObjectId; // points to Admin/Faculty/Student
  passwordHash: string;
  createdAt: Date;
}

const UserAuthSchema = new Schema<IUserAuth>(
  {
    role: { type: String, enum: ['ADMIN', 'FACULTY', 'STUDENT'], required: true },
    referenceId: { type: Schema.Types.ObjectId, required: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserAuthSchema.index({ role: 1, referenceId: 1 }, { unique: true });

export default mongoose.model<IUserAuth>('UserAuth', UserAuthSchema);
