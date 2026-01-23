import mongoose from 'mongoose';
import StudentAssessment, { IStudentAssessment } from '../models/StudentAssessment';
import AssessmentComponent, { IAssessmentComponent } from '../models/AssessmentComponent';
import CIEConfiguration, { ICIEConfiguration } from '../models/CIEConfiguration';
import CIERuleComponent from '../models/CIERuleComponent';

/**
 * CIE Calculation Engine
 * 
 * Formula:
 * CIE = (best 2 of 3 slip tests)/2 + avg(assignments) + avg(midsems) + attendance_marks
 * 
 * Assumptions:
 * - Attendance marks are entered directly (0-5)
 * - Slip tests: best 2 out of 3 considered
 * - Assignments: average of all
 * - Midsems: average of all
 */

export interface CIEBreakdown {
  slipScore: number;
  assignmentScore: number;
  midsemScore: number;
  attendanceMarks: number;
  totalCIE: number;
}

export async function calculateStudentCIE(
  studentId: string,
  teachingAssignmentId: string
): Promise<CIEBreakdown | null> {
  try {
    // Fetch all student assessments for this teaching assignment
    const assessments = await StudentAssessment.find({
      studentId,
      teachingAssignmentId
    }).populate<{ componentId: IAssessmentComponent }>('componentId');

    if (!assessments.length) {
      return null; // No assessments yet
    }

    // Group by component type
    const slipMarks: number[] = [];
    const assignmentMarks: number[] = [];
    const midsemMarks: number[] = [];
    let attendanceMarks = 0;

    for (const assessment of assessments) {
      const component = assessment.componentId as IAssessmentComponent;
      if (!component) continue;

      const mark = assessment.marks;

      if (component.type === 'SLIP') {
        slipMarks.push(mark);
      } else if (component.type === 'ASSIGNMENT') {
        assignmentMarks.push(mark);
      } else if (component.type === 'MIDSEM') {
        midsemMarks.push(mark);
      }
    }

    // Find attendance mark (if stored as a component type, or check StudentAssessment with special handling)
    // For now, assume attendance is a separate entry
    const attendanceAssessment = assessments.find(
      a => (a.componentId as any)?.type === 'ATTENDANCE'
    );
    if (attendanceAssessment) {
      attendanceMarks = attendanceAssessment.marks;
    }

    // Calculate scores

    // Slip Tests: best 2 of 3
    let slipScore = 0;
    if (slipMarks.length > 0) {
      const bestTwoSlips = slipMarks.sort((a, b) => b - a).slice(0, 2);
      slipScore = bestTwoSlips.reduce((a, b) => a + b, 0) / 2;
    }

    // Assignments: average
    let assignmentScore = 0;
    if (assignmentMarks.length > 0) {
      assignmentScore = assignmentMarks.reduce((a, b) => a + b, 0) / assignmentMarks.length;
    }

    // Midsems: average
    let midsemScore = 0;
    if (midsemMarks.length > 0) {
      midsemScore = midsemMarks.reduce((a, b) => a + b, 0) / midsemMarks.length;
    }

    // Total CIE
    const totalCIE = slipScore + assignmentScore + midsemScore + attendanceMarks;

    return {
      slipScore,
      assignmentScore,
      midsemScore,
      attendanceMarks,
      totalCIE
    };
  } catch (error) {
    console.error('CIE calculation error:', error);
    return null;
  }
}

/**
 * Get active CIE configuration for a department
 */
export async function getCIEConfiguration(
  departmentId: string
): Promise<ICIEConfiguration | null> {
  try {
    return await CIEConfiguration.findOne({
      departmentId,
      isActive: true
    });
  } catch (error) {
    console.error('Get CIE config error:', error);
    return null;
  }
}

/**
 * Create default CIE configuration for a department
 */
export async function createDefaultCIEConfiguration(
  departmentId: string
): Promise<ICIEConfiguration> {
  const config = new CIEConfiguration({
    departmentId,
    label: 'Default CIE Configuration',
    maxCIEMarks: 50,
    slipTestsCount: 3,
    slipTestsConsider: 2,
    attendanceMaxMarks: 5,
    attendanceThresholds: {
      marks5: 85,
      marks4: 75,
      marks3: 65
    },
    isActive: true
  });

  return await config.save();
}

/**
 * Convert attendance percentage to attendance marks
 */
export function attendancePercentageToMarks(
  percentage: number,
  thresholds: { marks5: number; marks4: number; marks3: number }
): number {
  if (percentage >= thresholds.marks5) return 5;
  if (percentage >= thresholds.marks4) return 4;
  if (percentage >= thresholds.marks3) return 3;
  return 0;
}

/**
 * Bulk recalculate CIE for all students in a teaching assignment
 */
export async function recalculateTeachingAssignmentCIE(
  teachingAssignmentId: string
): Promise<void> {
  try {
    const assessments = await StudentAssessment.find({
      teachingAssignmentId
    }).select('studentId');

    const studentIds = [...new Set(assessments.map(a => a.studentId.toString()))];

    for (const studentId of studentIds) {
      await calculateStudentCIE(studentId, teachingAssignmentId);
    }

    console.log(`Recalculated CIE for ${studentIds.length} students in assignment ${teachingAssignmentId}`);
  } catch (error) {
    console.error('Bulk recalculate error:', error);
  }
}
