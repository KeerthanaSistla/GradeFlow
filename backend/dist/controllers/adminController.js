"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = adminLogin;
exports.getDepartments = getDepartments;
exports.createDepartment = createDepartment;
exports.updateDepartment = updateDepartment;
exports.deleteDepartment = deleteDepartment;
const Admin_1 = __importDefault(require("../models/Admin"));
const Department_1 = __importDefault(require("../models/Department"));
const auth_1 = require("../utils/auth");
/**
 * Admin login
 */
async function adminLogin(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const admin = await Admin_1.default.findOne({ username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const passwordMatch = await (0, auth_1.verifyPassword)(password, admin.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(admin._id.toString(), 'ADMIN');
        res.json({
            token,
            admin: {
                _id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Get all departments
 */
async function getDepartments(req, res) {
    try {
        const departments = await Department_1.default.find()
            .populate({
            path: 'faculty',
            model: 'Faculty'
        })
            .populate({
            path: 'subjects',
            model: 'Subject'
        })
            .populate({
            path: 'classes',
            model: 'Class'
        });
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Create a new department
 */
async function createDepartment(req, res) {
    try {
        const { name, abbreviation, password } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Department name required' });
        }
        const dept = new Department_1.default({
            name,
            abbreviation,
            passwordHash: password ? await (0, auth_1.hashPassword)(password) : undefined
        });
        await dept.save();
        res.status(201).json({
            message: 'Department created',
            department: dept
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Update department
 */
async function updateDepartment(req, res) {
    try {
        const { departmentId } = req.params;
        const { name, abbreviation } = req.body;
        const dept = await Department_1.default.findByIdAndUpdate(departmentId, { name, abbreviation }, { new: true });
        if (!dept) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ message: 'Department updated', department: dept });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Delete department
 */
async function deleteDepartment(req, res) {
    try {
        const { departmentId } = req.params;
        const dept = await Department_1.default.findByIdAndDelete(departmentId);
        if (!dept) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ message: 'Department deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
