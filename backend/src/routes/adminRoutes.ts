import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import {
  adminLogin,
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addFacultyToDepartment,
  deleteFacultyFromDepartment,
  updateFacultyDetails,
  addClassToDepartment,
  deleteClassFromDepartment,
  addSubjectToDepartment,
  deleteSubjectFromDepartment,
  bulkAddSubjectsToDepartment,
  bulkAddFacultyToDepartment
} from '../controllers/adminController';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public
router.post('/login', adminLogin);

// Protected (Admin only)
router.get('/departments', authMiddleware, requireRole(['ADMIN']), getDepartments);
router.get('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), getDepartmentById);
router.post('/departments', authMiddleware, requireRole(['ADMIN']), createDepartment);
router.put('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), updateDepartment);
router.delete('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), deleteDepartment);

// Faculty management
router.post('/departments/:departmentId/faculty', authMiddleware, requireRole(['ADMIN']), addFacultyToDepartment);
router.post('/departments/:departmentId/faculty/bulk', authMiddleware, requireRole(['ADMIN']), upload.single('excelFile'), (req, res) => bulkAddFacultyToDepartment(req as AuthRequest & { file?: Express.Multer.File }, res));
router.delete('/departments/:departmentId/faculty/:facultyId', authMiddleware, requireRole(['ADMIN']), deleteFacultyFromDepartment);
router.put('/departments/:departmentId/faculty/:facultyId', authMiddleware, requireRole(['ADMIN']), updateFacultyDetails);

// Class management
router.post('/departments/:departmentId/classes', authMiddleware, requireRole(['ADMIN']), addClassToDepartment);
router.delete('/departments/:departmentId/classes/:classId', authMiddleware, requireRole(['ADMIN']), deleteClassFromDepartment);

// Subject management
router.post('/departments/:departmentId/subjects', authMiddleware, requireRole(['ADMIN']), addSubjectToDepartment);
router.post('/departments/:departmentId/subjects/bulk', authMiddleware, requireRole(['ADMIN']), upload.single('excelFile'), (req, res) => bulkAddSubjectsToDepartment(req as AuthRequest & { file?: Express.Multer.File }, res));
router.delete('/departments/:departmentId/subjects/:subjectId', authMiddleware, requireRole(['ADMIN']), deleteSubjectFromDepartment);

export default router;
