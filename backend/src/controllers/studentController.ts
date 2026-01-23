import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Student from '../models/Student';
import UserAuth from '../models/UserAuth';
import TeachingAssignment from '../models/TeachingAssignment';
import StudentAssessment from '../models/StudentAssessment';
import { calculateStudentCIE } from '../utils/cieCalculator';
import { generateToken, verifyPassword } from '../utils/auth';

/**
 * Student login
 */
export async function studentLogin(req: AuthRequest, res: Response) {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ error: 'Roll number and password required' });
    }

    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userAuth = await UserAuth.findOne({
      role: 'STUDENT',
      referenceId: student._id
    });

    if (!userAuth) {
      return res.status(401).json({ error: 'Auth record not found' });
    }

    const passwordMatch = await verifyPassword(password, userAuth.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(student._id.toString(), 'STUDENT');

    res.json({
      token,
      user: {
        _id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        section: student.section,
        departmentId: student.departmentId,
        role: 'student'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get student dashboard (enrolled subjects + CIE)
 */
export async function getStudentDashboard(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.user!;

    const student = await Student.findById(userId).populate('departmentId');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all teaching assignments for this student
    const assignments = await TeachingAssignment.find({
      studentIds: userId
    })
      .populate('subjectId')
      .populate('departmentId');

    // Fetch CIE for each assignment
    const assignmentsWithCIE = await Promise.all(
      assignments.map(async (assignment) => {
        const cie = await calculateStudentCIE(userId, assignment._id.toString());
        return {
          ...assignment.toObject(),
          cie
        };
      })
    );

    res.json({
      student,
      assignments: assignmentsWithCIE
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get student marks for a subject
 */
export async function getStudentMarksForSubject(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.user!;
    const { teachingAssignmentId } = req.params;

    // Verify student is in this assignment
    const assignment = await TeachingAssignment.findById(teachingAssignmentId);

    if (!assignment || !assignment.studentIds.map(id => id.toString()).includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const marks = await StudentAssessment.find({
      studentId: userId,
      teachingAssignmentId
    })
      .populate('componentId');

    const cie = await calculateStudentCIE(userId, teachingAssignmentId);

    res.json({
      marks,
      cie
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get student attendance
 */
export async function getStudentAttendance(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.user!;
    const { teachingAssignmentId } = req.params;

    // Verify student is in this assignment
    const assignment = await TeachingAssignment.findById(teachingAssignmentId);

    if (!assignment || !assignment.studentIds.map(id => id.toString()).includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get attendance sessions and count
    // This would use AttendanceSession model in full implementation
    res.json({
      attendance: 0,
      percentage: 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
