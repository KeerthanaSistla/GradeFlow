"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const facultyController_1 = require("../controllers/facultyController");
const router = (0, express_1.Router)();
// Public
router.post('/login', facultyController_1.facultyLogin);
// Protected (Faculty only)
router.get('/dashboard', auth_1.authMiddleware, (0, auth_1.requireRole)(['FACULTY']), facultyController_1.getFacultyDashboard);
router.get('/marks/:teachingAssignmentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['FACULTY']), facultyController_1.getStudentMarks);
router.post('/marks', auth_1.authMiddleware, (0, auth_1.requireRole)(['FACULTY']), facultyController_1.addStudentMarks);
router.post('/attendance', auth_1.authMiddleware, (0, auth_1.requireRole)(['FACULTY']), facultyController_1.markAttendance);
exports.default = router;
