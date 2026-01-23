/**
 * Centralized model exports
 * Import from here instead of individual files
 */

export { default as Admin, type IAdmin } from './Admin';
export { default as Department, type IDepartment } from './Department';
export { default as Faculty, type IFaculty } from './Faculty';
export { default as Student, type IStudent } from './Student';
export { default as Section, type ISection } from './Section';
export { default as Subject, type ISubject } from './Subject';
export { default as AcademicYear, type IAcademicYear } from './AcademicYear';
export { default as TeachingAssignment, type ITeachingAssignment } from './TeachingAssignment';
export { default as AttendanceSession, type IAttendanceSession } from './AttendanceSession';
export { default as AssessmentComponent, type IAssessmentComponent, type AssessmentType } from './AssessmentComponent';
export { default as StudentAssessment, type IStudentAssessment } from './StudentAssessment';
export { default as UserAuth, type IUserAuth, type UserRole } from './UserAuth';
export { default as StudentCIE, type IStudentCIE } from './StudentCIE';
export { default as CIEConfiguration, type ICIEConfiguration } from './CIEConfiguration';
export { default as CIERuleComponent, type ICIERuleComponent, type CIEComponentRole } from './CIERuleComponent';
