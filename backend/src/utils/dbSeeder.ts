import Admin from '../models/Admin';
import Department from '../models/Department';
import Faculty from '../models/Faculty';
import Student from '../models/Student';
import UserAuth from '../models/UserAuth';
import { hashPassword } from '../utils/auth';
import { seedDefaultCIEConfiguration, seedDefaultAssessmentComponents } from './seeders';

export interface AdminCredentials {
  username: string;
  password: string;
}

let adminCredentials: AdminCredentials | null = null;

/**
 * Seed initial admin user (runs only if no admin exists)
 */
export async function seedDefaultAdmin(): Promise<AdminCredentials | null> {
  try {
    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      // For existing admin, generate a temporary password for testing
      // In production, password reset should be used instead
      const tempPassword = 'admin123';
      const passwordHash = await hashPassword(tempPassword);
      await Admin.updateOne({ _id: existingAdmin._id }, { passwordHash });
      adminCredentials = { username: existingAdmin.username, password: tempPassword };
      return adminCredentials;
    }

    // Generate random credentials
    const username = 'admin';
    const password = generateRandomPassword();
    const passwordHash = await hashPassword(password);

    const admin = new Admin({
      username,
      passwordHash,
      role: 'SUPER_ADMIN'
    });

    await admin.save();

    adminCredentials = { username, password };

    console.log('✓ Default admin created');
    return adminCredentials;
  } catch (error) {
    console.error('Error seeding admin:', error);
    return null;
  }
}

/**
 * Seed default department with faculty and students
 */
export async function seedDefaultDepartment(): Promise<void> {
  try {
    const existingDept = await Department.findOne({ name: 'Information Technology' });

    if (existingDept) {
      console.log('✓ Default department already exists');
      return;
    }

    // Create department
    const dept = new Department({
      name: 'Information Technology',
      abbreviation: 'IT',
      passwordHash: await hashPassword('dept123')
    });

    await dept.save();
    console.log('✓ Default department created');

    // Seed CIE configuration
    await seedDefaultCIEConfiguration(dept._id.toString());
    await seedDefaultAssessmentComponents(dept._id.toString());

    // Create sample faculty
    const faculty1 = new Faculty({
      facultyId: 'IT001',
      name: 'Dr. John Doe',
      designation: 'Professor',
      departmentId: dept._id
    });

    await faculty1.save();

    const facultyAuth = new UserAuth({
      role: 'FACULTY',
      referenceId: faculty1._id,
      passwordHash: await hashPassword('faculty123')
    });

    await facultyAuth.save();

    console.log('✓ Sample faculty created');

    // Create sample students
    const student1 = new Student({
      rollNumber: '160123737001',
      name: 'Sistla Keerthana',
      departmentId: dept._id,
      section: 'IT1',
      joiningYear: 2021,
      passingYear: 2025
    });

    await student1.save();

    const studentAuth = new UserAuth({
      role: 'STUDENT',
      referenceId: student1._id,
      passwordHash: await hashPassword('student123')
    });

    await studentAuth.save();

    console.log('✓ Sample students created');
  } catch (error) {
    console.error('Error seeding department:', error);
  }
}

/**
 * Print credentials to console with formatted output
 */
export function printAdminCredentials(): void {
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
function generateRandomPassword(): string {
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}
