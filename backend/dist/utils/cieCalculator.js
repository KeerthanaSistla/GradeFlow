"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStudentCIE = calculateStudentCIE;
exports.getCIEConfiguration = getCIEConfiguration;
exports.createDefaultCIEConfiguration = createDefaultCIEConfiguration;
exports.attendancePercentageToMarks = attendancePercentageToMarks;
exports.recalculateTeachingAssignmentCIE = recalculateTeachingAssignmentCIE;
const StudentAssessment_1 = __importDefault(require("../models/StudentAssessment"));
const CIEConfiguration_1 = __importDefault(require("../models/CIEConfiguration"));
async function calculateStudentCIE(studentId, teachingAssignmentId) {
    try {
        // Fetch all student assessments for this teaching assignment
        const assessments = await StudentAssessment_1.default.find({
            studentId,
            teachingAssignmentId
        }).populate('componentId');
        if (!assessments.length) {
            return null; // No assessments yet
        }
        // Group by component type
        const slipMarks = [];
        const assignmentMarks = [];
        const midsemMarks = [];
        let attendanceMarks = 0;
        for (const assessment of assessments) {
            const component = assessment.componentId;
            if (!component)
                continue;
            const mark = assessment.marks;
            if (component.type === 'SLIP') {
                slipMarks.push(mark);
            }
            else if (component.type === 'ASSIGNMENT') {
                assignmentMarks.push(mark);
            }
            else if (component.type === 'MIDSEM') {
                midsemMarks.push(mark);
            }
        }
        // Find attendance mark (if stored as a component type, or check StudentAssessment with special handling)
        // For now, assume attendance is a separate entry
        const attendanceAssessment = assessments.find(a => a.componentId?.type === 'ATTENDANCE');
        if (attendanceAssessment) {
            attendanceMarks = attendanceAssessment.marks;
        }
        // Calculate scores
        // Slip Tests: best 2 of 3
        let slipScore = 0;
        if (slipMarks.length > 0) {
            const bestTwoSlips = slipMarks.sort((a, b) => b - a).slice(0, 2);
            slipScore = bestTwoSlips.reduce((a, b) => a + b, 0) / 2;
        }
        // Assignments: average
        let assignmentScore = 0;
        if (assignmentMarks.length > 0) {
            assignmentScore = assignmentMarks.reduce((a, b) => a + b, 0) / assignmentMarks.length;
        }
        // Midsems: average
        let midsemScore = 0;
        if (midsemMarks.length > 0) {
            midsemScore = midsemMarks.reduce((a, b) => a + b, 0) / midsemMarks.length;
        }
        // Total CIE
        const totalCIE = slipScore + assignmentScore + midsemScore + attendanceMarks;
        return {
            slipScore,
            assignmentScore,
            midsemScore,
            attendanceMarks,
            totalCIE
        };
    }
    catch (error) {
        console.error('CIE calculation error:', error);
        return null;
    }
}
/**
 * Get active CIE configuration for a department
 */
async function getCIEConfiguration(departmentId) {
    try {
        return await CIEConfiguration_1.default.findOne({
            departmentId,
            isActive: true
        });
    }
    catch (error) {
        console.error('Get CIE config error:', error);
        return null;
    }
}
/**
 * Create default CIE configuration for a department
 */
async function createDefaultCIEConfiguration(departmentId) {
    const config = new CIEConfiguration_1.default({
        departmentId,
        label: 'Default CIE Configuration',
        maxCIEMarks: 50,
        slipTestsCount: 3,
        slipTestsConsider: 2,
        attendanceMaxMarks: 5,
        attendanceThresholds: {
            marks5: 85,
            marks4: 75,
            marks3: 65
        },
        isActive: true
    });
    return await config.save();
}
/**
 * Convert attendance percentage to attendance marks
 */
function attendancePercentageToMarks(percentage, thresholds) {
    if (percentage >= thresholds.marks5)
        return 5;
    if (percentage >= thresholds.marks4)
        return 4;
    if (percentage >= thresholds.marks3)
        return 3;
    return 0;
}
/**
 * Bulk recalculate CIE for all students in a teaching assignment
 */
async function recalculateTeachingAssignmentCIE(teachingAssignmentId) {
    try {
        const assessments = await StudentAssessment_1.default.find({
            teachingAssignmentId
        }).select('studentId');
        const studentIds = [...new Set(assessments.map(a => a.studentId.toString()))];
        for (const studentId of studentIds) {
            await calculateStudentCIE(studentId, teachingAssignmentId);
        }
        console.log(`Recalculated CIE for ${studentIds.length} students in assignment ${teachingAssignmentId}`);
    }
    catch (error) {
        console.error('Bulk recalculate error:', error);
    }
}
