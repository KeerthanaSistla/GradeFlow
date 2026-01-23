"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const studentController_1 = require("../controllers/studentController");
const router = (0, express_1.Router)();
// Public
router.post('/login', studentController_1.studentLogin);
// Protected (Student only)
router.get('/dashboard', auth_1.authMiddleware, (0, auth_1.requireRole)(['STUDENT']), studentController_1.getStudentDashboard);
router.get('/marks/:teachingAssignmentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['STUDENT']), studentController_1.getStudentMarksForSubject);
router.get('/attendance/:teachingAssignmentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['STUDENT']), studentController_1.getStudentAttendance);
exports.default = router;
