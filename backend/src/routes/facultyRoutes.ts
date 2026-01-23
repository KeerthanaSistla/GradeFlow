import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  facultyLogin,
  getFacultyDashboard,
  addStudentMarks,
  getStudentMarks,
  markAttendance
} from '../controllers/facultyController';

const router = Router();

// Public
router.post('/login', facultyLogin);

// Protected (Faculty only)
router.get('/dashboard', authMiddleware, requireRole(['FACULTY']), getFacultyDashboard);
router.get('/marks/:teachingAssignmentId', authMiddleware, requireRole(['FACULTY']), getStudentMarks);
router.post('/marks', authMiddleware, requireRole(['FACULTY']), addStudentMarks);
router.post('/attendance', authMiddleware, requireRole(['FACULTY']), markAttendance);

export default router;
