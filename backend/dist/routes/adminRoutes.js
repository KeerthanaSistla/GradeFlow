"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Public
router.post('/login', adminController_1.adminLogin);
// Protected (Admin only)
router.get('/departments', auth_1.authMiddleware, (0, auth_1.requireRole)(['ADMIN']), adminController_1.getDepartments);
router.post('/departments', auth_1.authMiddleware, (0, auth_1.requireRole)(['ADMIN']), adminController_1.createDepartment);
router.put('/departments/:departmentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['ADMIN']), adminController_1.updateDepartment);
router.delete('/departments/:departmentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['ADMIN']), adminController_1.deleteDepartment);
exports.default = router;
