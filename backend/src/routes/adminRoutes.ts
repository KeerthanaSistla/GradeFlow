import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  adminLogin,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/adminController';

const router = Router();

// Public
router.post('/login', adminLogin);

// Protected (Admin only)
router.get('/departments', authMiddleware, requireRole(['ADMIN']), getDepartments);
router.post('/departments', authMiddleware, requireRole(['ADMIN']), createDepartment);
router.put('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), updateDepartment);
router.delete('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), deleteDepartment);

export default router;
