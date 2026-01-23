import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAttendanceSession extends Document {
  teachingAssignmentId: Types.ObjectId;
  date: Date;
  presentStudentIds: Types.ObjectId[];
  createdAt: Date;
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    teachingAssignmentId: { type: Schema.Types.ObjectId, ref: 'TeachingAssignment', required: true },
    date: { type: Date, required: true },
    presentStudentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);
