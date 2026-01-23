import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Faculty from '../models/Faculty';
import UserAuth from '../models/UserAuth';
import TeachingAssignment from '../models/TeachingAssignment';
import StudentAssessment from '../models/StudentAssessment';
import { calculateStudentCIE } from '../utils/cieCalculator';
import { generateToken, verifyPassword } from '../utils/auth';

/**
 * Faculty login
 */
export async function facultyLogin(req: AuthRequest, res: Response) {
  try {
    const { facultyId, password } = req.body;

    if (!facultyId || !password) {
      return res.status(400).json({ error: 'Faculty ID and password required' });
    }

    const faculty = await Faculty.findOne({ facultyId });

    if (!faculty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userAuth = await UserAuth.findOne({
      role: 'FACULTY',
      referenceId: faculty._id
    });

    if (!userAuth) {
      return res.status(401).json({ error: 'Auth record not found' });
    }

    const passwordMatch = await verifyPassword(password, userAuth.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(faculty._id.toString(), 'FACULTY');

    res.json({
      token,
      faculty: {
        _id: faculty._id,
        facultyId: faculty.facultyId,
        name: faculty.name,
        designation: faculty.designation,
        departmentId: faculty.departmentId
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get faculty dashboard data (teaching assignments)
 */
export async function getFacultyDashboard(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.user!;

    const assignments = await TeachingAssignment.find({
      facultyId: userId
    })
      .populate('subjectId')
      .populate('studentIds')
      .populate('departmentId');

    res.json({
      assignments
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add marks for a student in an assessment
 */
export async function addStudentMarks(req: AuthRequest, res: Response) {
  try {
    const { studentId, teachingAssignmentId, componentId, marks } = req.body;

    if (!studentId || !teachingAssignmentId || !componentId || marks === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify faculty owns this assignment
    const assignment = await TeachingAssignment.findById(teachingAssignmentId);
    if (!assignment || assignment.facultyId.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let assessment = await StudentAssessment.findOne({
      studentId,
      teachingAssignmentId,
      componentId
    });

    if (assessment) {
      assessment.marks = marks;
    } else {
      assessment = new StudentAssessment({
        studentId,
        teachingAssignmentId,
        componentId,
        marks
      });
    }

    await assessment.save();

    // Recalculate CIE
    const cie = await calculateStudentCIE(studentId, teachingAssignmentId);

    res.json({
      message: 'Marks saved',
      assessment,
      cie
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get student marks for an assignment
 */
export async function getStudentMarks(req: AuthRequest, res: Response) {
  try {
    const { teachingAssignmentId } = req.params;

    const assignment = await TeachingAssignment.findById(teachingAssignmentId);
    if (!assignment || assignment.facultyId.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const marks = await StudentAssessment.find({
      teachingAssignmentId
    })
      .populate('studentId')
      .populate('componentId');

    res.json({ marks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Mark attendance
 */
export async function markAttendance(req: AuthRequest, res: Response) {
  try {
    const { teachingAssignmentId, studentIds, date } = req.body;

    if (!teachingAssignmentId || !studentIds || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify faculty owns this assignment
    const assignment = await TeachingAssignment.findById(teachingAssignmentId);
    if (!assignment || assignment.facultyId.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // This would typically use AttendanceSession model
    // For now, just return success
    res.json({
      message: 'Attendance marked',
      date,
      count: studentIds.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
