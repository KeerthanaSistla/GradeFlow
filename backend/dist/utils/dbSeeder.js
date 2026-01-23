"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultAdmin = seedDefaultAdmin;
exports.seedDefaultDepartment = seedDefaultDepartment;
exports.printAdminCredentials = printAdminCredentials;
const Admin_1 = __importDefault(require("../models/Admin"));
const Department_1 = __importDefault(require("../models/Department"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
const Student_1 = __importDefault(require("../models/Student"));
const UserAuth_1 = __importDefault(require("../models/UserAuth"));
const auth_1 = require("../utils/auth");
const seeders_1 = require("./seeders");
let adminCredentials = null;
/**
 * Seed initial admin user (runs only if no admin exists)
 */
async function seedDefaultAdmin() {
    try {
        const existingAdmin = await Admin_1.default.findOne();
        if (existingAdmin) {
            console.log('✓ Admin user already exists');
            return null;
        }
        // Generate random credentials
        const username = 'admin';
        const password = generateRandomPassword();
        const passwordHash = await (0, auth_1.hashPassword)(password);
        const admin = new Admin_1.default({
            username,
            passwordHash,
            role: 'SUPER_ADMIN'
        });
        await admin.save();
        adminCredentials = { username, password };
        console.log('✓ Default admin created');
        return adminCredentials;
    }
    catch (error) {
        console.error('Error seeding admin:', error);
        return null;
    }
}
/**
 * Seed default department with faculty and students
 */
async function seedDefaultDepartment() {
    try {
        const existingDept = await Department_1.default.findOne({ name: 'Information Technology' });
        if (existingDept) {
            console.log('✓ Default department already exists');
            return;
        }
        // Create department
        const dept = new Department_1.default({
            name: 'Information Technology',
            abbreviation: 'IT',
            passwordHash: await (0, auth_1.hashPassword)('dept123')
        });
        await dept.save();
        console.log('✓ Default department created');
        // Seed CIE configuration
        await (0, seeders_1.seedDefaultCIEConfiguration)(dept._id.toString());
        await (0, seeders_1.seedDefaultAssessmentComponents)(dept._id.toString());
        // Create sample faculty
        const faculty1 = new Faculty_1.default({
            facultyId: 'IT001',
            name: 'Dr. John Doe',
            designation: 'Professor',
            departmentId: dept._id
        });
        await faculty1.save();
        const facultyAuth = new UserAuth_1.default({
            role: 'FACULTY',
            referenceId: faculty1._id,
            passwordHash: await (0, auth_1.hashPassword)('faculty123')
        });
        await facultyAuth.save();
        console.log('✓ Sample faculty created');
        // Create sample students
        const student1 = new Student_1.default({
            rollNumber: '160123737001',
            name: 'Sistla Keerthana',
            departmentId: dept._id,
            section: 'IT1',
            joiningYear: 2021,
            passingYear: 2025
        });
        await student1.save();
        const studentAuth = new UserAuth_1.default({
            role: 'STUDENT',
            referenceId: student1._id,
            passwordHash: await (0, auth_1.hashPassword)('student123')
        });
        await studentAuth.save();
        console.log('✓ Sample students created');
    }
    catch (error) {
        console.error('Error seeding department:', error);
    }
}
/**
 * Print credentials to console with formatted output
 */
function printAdminCredentials() {
    if (!adminCredentials) {
        console.log('\n📝 No new admin credentials were generated.\n');
        return;
    }
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    🔐 ADMIN CREDENTIALS                     ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`  Username: ${adminCredentials.username}`);
    console.log(`  Password: ${adminCredentials.password}`);
    console.log('');
    console.log('  ⚠️  KEEP THESE CREDENTIALS SAFE AND SECURE!');
    console.log('  ⚠️  Change the password after first login!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n  Sample Login Credentials:');
    console.log('  ─────────────────────────────────────────────────────────');
    console.log('  Faculty: IT001 / faculty123');
    console.log('  Student: 160123737001 / student123');
    console.log('  ─────────────────────────────────────────────────────────\n');
}
/**
 * Generate a random secure password
 */
function generateRandomPassword() {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}
