import { Router, Request, Response, RequestHandler } from 'express';
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
  bulkAddFacultyToDepartment,
  createBatchForDepartment,
  getBatchesForDepartment,
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
router.get('/departments', authMiddleware, requireRole(['ADMIN']), getDepartments as RequestHandler);
router.get('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), getDepartmentById as RequestHandler);
router.post('/departments', authMiddleware, requireRole(['ADMIN']), createDepartment as RequestHandler);
router.put('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), updateDepartment as RequestHandler);
router.delete('/departments/:departmentId', authMiddleware, requireRole(['ADMIN']), deleteDepartment as RequestHandler);

// Faculty management
router.post('/departments/:departmentId/faculty', authMiddleware, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => addFacultyToDepartment(req, res));
router.post('/departments/:departmentId/faculty/bulk', authMiddleware, requireRole(['ADMIN']), upload.single('excelFile'), (req: any, res: Response) => bulkAddFacultyToDepartment(req, res));
router.delete('/departments/:departmentId/faculty/:facultyId', authMiddleware, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => deleteFacultyFromDepartment(req, res));
router.put('/departments/:departmentId/faculty/:facultyId', authMiddleware, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => updateFacultyDetails(req, res));

// Class management
router.post('/departments/:departmentId/classes', authMiddleware, requireRole(['ADMIN']), addClassToDepartment);
router.delete('/departments/:departmentId/classes/:classId', authMiddleware, requireRole(['ADMIN']), deleteClassFromDepartment);

// Subject management
router.post('/departments/:departmentId/subjects', authMiddleware, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => addSubjectToDepartment(req, res));
router.post('/departments/:departmentId/subjects/bulk', authMiddleware, requireRole(['ADMIN']), upload.single('excelFile'), (req: any, res: Response) => bulkAddSubjectsToDepartment(req, res));
router.delete('/departments/:departmentId/subjects/:subjectId', authMiddleware, requireRole(['ADMIN']), (req: AuthRequest, res: Response) => deleteSubjectFromDepartment(req, res));

// Batch management
router.post('/departments/:departmentId/batches', authMiddleware, requireRole(['ADMIN']), createBatchForDepartment);
router.get('/departments/:departmentId/batches', authMiddleware, requireRole(['ADMIN']), getBatchesForDepartment);

// Student management
router.post('/departments/:departmentId/classes/:classId/create-student', authMiddleware, requireRole(['ADMIN']), createStudentAndAddToClass);
router.post('/departments/:departmentId/classes/:classId/students/bulk', authMiddleware, requireRole(['ADMIN']), upload.single('excelFile'), bulkAddStudentsToClass);
router.delete('/departments/:departmentId/classes/:classId/students/:studentId', authMiddleware, requireRole(['ADMIN']), deleteStudentFromClass);

export default router;
