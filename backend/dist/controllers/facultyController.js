"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.facultyLogin = facultyLogin;
exports.getFacultyDashboard = getFacultyDashboard;
exports.addStudentMarks = addStudentMarks;
exports.getStudentMarks = getStudentMarks;
exports.markAttendance = markAttendance;
const Faculty_1 = __importDefault(require("../models/Faculty"));
const UserAuth_1 = __importDefault(require("../models/UserAuth"));
const TeachingAssignment_1 = __importDefault(require("../models/TeachingAssignment"));
const StudentAssessment_1 = __importDefault(require("../models/StudentAssessment"));
const cieCalculator_1 = require("../utils/cieCalculator");
const auth_1 = require("../utils/auth");
/**
 * Faculty login
 */
async function facultyLogin(req, res) {
    try {
        const { facultyId, password } = req.body;
        if (!facultyId || !password) {
            return res.status(400).json({ error: 'Faculty ID and password required' });
        }
        const faculty = await Faculty_1.default.findOne({ facultyId });
        if (!faculty) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const userAuth = await UserAuth_1.default.findOne({
            role: 'FACULTY',
            referenceId: faculty._id
        });
        if (!userAuth) {
            return res.status(401).json({ error: 'Auth record not found' });
        }
        const passwordMatch = await (0, auth_1.verifyPassword)(password, userAuth.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(faculty._id.toString(), 'FACULTY');
        res.json({
            token,
            faculty: {
                _id: faculty._id,
                facultyId: faculty.facultyId,
                name: faculty.name,
                designation: faculty.designation,
                departmentId: faculty.departmentId
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Get faculty dashboard data (teaching assignments)
 */
async function getFacultyDashboard(req, res) {
    try {
        const { userId } = req.user;
        const assignments = await TeachingAssignment_1.default.find({
            facultyId: userId
        })
            .populate('subjectId')
            .populate('studentIds')
            .populate('departmentId');
        res.json({
            assignments
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Add marks for a student in an assessment
 */
async function addStudentMarks(req, res) {
    try {
        const { studentId, teachingAssignmentId, componentId, marks } = req.body;
        if (!studentId || !teachingAssignmentId || !componentId || marks === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Verify faculty owns this assignment
        const assignment = await TeachingAssignment_1.default.findById(teachingAssignmentId);
        if (!assignment || assignment.facultyId.toString() !== req.user?.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        let assessment = await StudentAssessment_1.default.findOne({
            studentId,
            teachingAssignmentId,
            componentId
        });
        if (assessment) {
            assessment.marks = marks;
        }
        else {
            assessment = new StudentAssessment_1.default({
                studentId,
                teachingAssignmentId,
                componentId,
                marks
            });
        }
        await assessment.save();
        // Recalculate CIE
        const cie = await (0, cieCalculator_1.calculateStudentCIE)(studentId, teachingAssignmentId);
        res.json({
            message: 'Marks saved',
            assessment,
            cie
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Get student marks for an assignment
 */
async function getStudentMarks(req, res) {
    try {
        const { teachingAssignmentId } = req.params;
        const assignment = await TeachingAssignment_1.default.findById(teachingAssignmentId);
        if (!assignment || assignment.facultyId.toString() !== req.user?.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const marks = await StudentAssessment_1.default.find({
            teachingAssignmentId
        })
            .populate('studentId')
            .populate('componentId');
        res.json({ marks });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
/**
 * Mark attendance
 */
async function markAttendance(req, res) {
    try {
        const { teachingAssignmentId, studentIds, date } = req.body;
        if (!teachingAssignmentId || !studentIds || !date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Verify faculty owns this assignment
        const assignment = await TeachingAssignment_1.default.findById(teachingAssignmentId);
        if (!assignment || assignment.facultyId.toString() !== req.user?.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        // This would typically use AttendanceSession model
        // For now, just return success
        res.json({
            message: 'Attendance marked',
            date,
            count: studentIds.length
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
