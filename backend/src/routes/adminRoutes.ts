import { Router, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

// Combined middleware for admin routes
const adminMiddleware = [authMiddleware, requireRole(['ADMIN'])];
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
  updateSubjectDetails,
  deleteSubjectFromDepartment,
  bulkAddSubjectsToDepartment,
  bulkAddFacultyToDepartment,
  createBatchForDepartment,
  getBatchesForDepartment,
  deleteBatchFromDepartment,
  createStudentAndAddToClass,
  bulkAddStudentsToClass,
  deleteStudentFromClass
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
// @ts-ignore - Type conflicts due to multiple express type definitions
router.get('/departments', ...adminMiddleware, getDepartments);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.get('/departments/:departmentId', ...adminMiddleware, getDepartmentById);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments', ...adminMiddleware, createDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.put('/departments/:departmentId', ...adminMiddleware, updateDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.delete('/departments/:departmentId', ...adminMiddleware, deleteDepartment);

// Faculty management
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/faculty', ...adminMiddleware, addFacultyToDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/faculty/bulk', ...adminMiddleware, upload.single('excelFile'), bulkAddFacultyToDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.delete('/departments/:departmentId/faculty/:facultyId', ...adminMiddleware, deleteFacultyFromDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.put('/departments/:departmentId/faculty/:facultyId', ...adminMiddleware, updateFacultyDetails);

// Class management
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/classes', ...adminMiddleware, addClassToDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.delete('/departments/:departmentId/classes/:classId', ...adminMiddleware, deleteClassFromDepartment);

// Subject management
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/subjects', ...adminMiddleware, addSubjectToDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.put('/departments/:departmentId/subjects/:subjectId', ...adminMiddleware, updateSubjectDetails);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/subjects/bulk', ...adminMiddleware, upload.single('excelFile'), bulkAddSubjectsToDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.delete('/departments/:departmentId/subjects/:subjectId', ...adminMiddleware, deleteSubjectFromDepartment);

// Batch management
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/batches', ...adminMiddleware, createBatchForDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.get('/departments/:departmentId/batches', ...adminMiddleware, getBatchesForDepartment);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.delete('/departments/:departmentId/batches/:batchId', ...adminMiddleware, deleteBatchFromDepartment);

// Student management
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/classes/:classId/create-student', ...adminMiddleware, createStudentAndAddToClass);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.post('/departments/:departmentId/classes/:classId/students/bulk', ...adminMiddleware, upload.single('excelFile'), bulkAddStudentsToClass);
// @ts-ignore - Type conflicts due to multiple express type definitions
router.delete('/departments/:departmentId/classes/:classId/students/:studentId', ...adminMiddleware, deleteStudentFromClass);

export default router;
