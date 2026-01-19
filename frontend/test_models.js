import mongoose from 'mongoose';

// Import all models
import { User } from './backend/models/user.model.js';
import { Student } from './backend/models/student.model.js';
import { Faculty } from './backend/models/faculty.model.js';
import { Subject } from './backend/models/subject.model.js';
import { Enrollment } from './backend/models/enrollments.model.js';
import { FacultyAssignment } from './backend/models/faculty_assignments.model.js';
import { Test } from './backend/models/tests.model.js';
import { Mark } from './backend/models/marks.model.js';
import { AuditLog } from './backend/models/audit_logs.model.js';

console.log('All models imported successfully without syntax errors.');

// Test schema instantiation (without connecting to DB)
try {
  const userSchema = new User();
  const studentSchema = new Student();
  const facultySchema = new Faculty();
  const subjectSchema = new Subject();
  const enrollmentSchema = new Enrollment();
  const facultyAssignmentSchema = new FacultyAssignment();
  const testSchema = new Test();
  const markSchema = new Mark();
  const auditLogSchema = new AuditLog();
  console.log('All schemas instantiated successfully.');
} catch (error) {
  console.error('Error instantiating schemas:', error);
}
