"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentLogin = studentLogin;
exports.getStudentDashboard = getStudentDashboard;
exports.getStudentMarksForSubject = getStudentMarksForSubject;
exports.getStudentAttendance = getStudentAttendance;
const Student_1 = __importDefault(require("../models/Student"));
const UserAuth_1 = __importDefault(require("../models/UserAuth"));
const TeachingAssignment_1 = __importDefault(require("../models/TeachingAssignment"));
const StudentAssessment_1 = __importDefault(require("../models/StudentAssessment"));
const cieCalculator_1 = require("../utils/cieCalculator");
const auth_1 = require("../utils/auth");
/**
 * Student login
 */
async function studentLogin(req, res) {
    try {
        const { rollNumber, password } = req.body;
        if (!rollNumber || !password) {
            return res.status(400).json({ error: 'Roll number and password required' });
        }
        const student = await Student_1.default.findOne({ rollNumber });
        if (!student) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const userAuth = await UserAuth_1.default.findOne({
            role: 'STUDENT',
            referenceId: student._id
        });
        if (!userAuth) {
            return res.status(401).json({ error: 'Auth record not found' });
        }
        const passwordMatch = await (0, auth_1.verifyPassword)(password, userAuth.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(student._id.toString(), 'STUDENT');
        res.json({
            token,
            student: {
                _id: student._id,
                rollNumber: student.rollNumber,
                name: student.name,
                section: student.section,
                departmentId: student.departmentId
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Get student dashboard (enrolled subjects + CIE)
 */
async function getStudentDashboard(req, res) {
    try {
        const { userId } = req.user;
        const student = await Student_1.default.findById(userId).populate('departmentId');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        // Get all teaching assignments for this student
        const assignments = await TeachingAssignment_1.default.find({
            studentIds: userId
        })
            .populate('subjectId')
            .populate('departmentId');
        // Fetch CIE for each assignment
        const assignmentsWithCIE = await Promise.all(assignments.map(async (assignment) => {
            const cie = await (0, cieCalculator_1.calculateStudentCIE)(userId, assignment._id.toString());
            return {
                ...assignment.toObject(),
                cie
            };
        }));
        res.json({
            student,
            assignments: assignmentsWithCIE
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Get student marks for a subject
 */
async function getStudentMarksForSubject(req, res) {
    try {
        const { userId } = req.user;
        const { teachingAssignmentId } = req.params;
        // Verify student is in this assignment
        const assignment = await TeachingAssignment_1.default.findById(teachingAssignmentId);
        if (!assignment || !assignment.studentIds.map(id => id.toString()).includes(userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const marks = await StudentAssessment_1.default.find({
            studentId: userId,
            teachingAssignmentId
        })
            .populate('componentId');
        const cie = await (0, cieCalculator_1.calculateStudentCIE)(userId, teachingAssignmentId);
        res.json({
            marks,
            cie
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Get student attendance
 */
async function getStudentAttendance(req, res) {
    try {
        const { userId } = req.user;
        const { teachingAssignmentId } = req.params;
        // Verify student is in this assignment
        const assignment = await TeachingAssignment_1.default.findById(teachingAssignmentId);
        if (!assignment || !assignment.studentIds.map(id => id.toString()).includes(userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        // Get attendance sessions and count
        // This would use AttendanceSession model in full implementation
        res.json({
            attendance: 0,
            percentage: 0
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
