import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  studentLogin,
  getStudentDashboard,
  getStudentMarksForSubject,
  getStudentAttendance
} from '../controllers/studentController';

const router = Router();

// Public
router.post('/login', studentLogin);

// Protected (Student only)
router.get('/dashboard', authMiddleware, requireRole(['STUDENT']), getStudentDashboard);
router.get('/marks/:teachingAssignmentId', authMiddleware, requireRole(['STUDENT']), getStudentMarksForSubject);
router.get('/attendance/:teachingAssignmentId', authMiddleware, requireRole(['STUDENT']), getStudentAttendance);

export default router;
