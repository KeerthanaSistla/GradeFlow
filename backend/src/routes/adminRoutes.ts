import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  adminLogin,
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addFacultyToDepartment,
  addClassToDepartment
} from '../controllers/adminController';

const router = Router();

// Public
router.post('/login', adminLogin);

// Protected (Admin only)
router.get('/departments', authMiddleware, requireRole(['ADMIN']), getDepartments);
router.get('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), getDepartmentById);
router.post('/departments', authMiddleware, requireRole(['ADMIN']), createDepartment);
router.put('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), updateDepartment);
router.delete('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), deleteDepartment);
router.post('/departments/:departmentId/faculty', authMiddleware, requireRole(['ADMIN']), addFacultyToDepartment);
router.post('/departments/:departmentId/classes', authMiddleware, requireRole(['ADMIN']), addClassToDepartment);

export default router;
