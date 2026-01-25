import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Admin from '../models/Admin';
import UserAuth from '../models/UserAuth';
import Department from '../models/Department';
import Faculty from '../models/Faculty';
import Section from '../models/Section';
import Batch from '../models/Batch';
import AcademicYear from '../models/AcademicYear';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';

/**
 * Admin login
 */
export async function adminLogin(req: AuthRequest, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await verifyPassword(password, admin.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin._id.toString(), 'ADMIN');

    res.json({
      token,
      user: {
        _id: admin._id,
        username: admin.username,
        name: admin.username,
        role: 'admin'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a batch for department
 */
export async function createBatchForDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;
    const { startYear, endYear } = req.body;

    if (!startYear || !endYear) {
      return res.status(400).json({ error: 'Start year and end year required' });
    }

    // Check if department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const batchName = `${startYear}-${endYear}`;

    // Check if batch already exists
    const existingBatch = await Batch.findOne({
      name: batchName,
      departmentId
    });

    if (existingBatch) {
      return res.status(400).json({ error: 'Batch already exists' });
    }

    // Create batch
    const batch = new Batch({
      name: batchName,
      startYear: parseInt(startYear),
      endYear: parseInt(endYear),
      departmentId
    });

    await batch.save();

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get batches for department
 */
export async function getBatchesForDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;

    // Check if department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const batches = await Batch.find({ departmentId }).select('-createdAt -updatedAt');

    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all departments
 */
export async function getDepartments(req: AuthRequest, res: Response) {
  try {
    const departments = await Department.find().select('-passwordHash');

    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single department with all relations
 */
export async function getDepartmentById(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId).select('-passwordHash');
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Fetch related data
    const faculty = await Faculty.find({ departmentId }).select('-createdAt -updatedAt');
    const rawSubjects = await (await import('../models/Subject')).default.find({ departmentId }).select('-createdAt -updatedAt');
    const subjects = rawSubjects.map(s => ({
      _id: s._id,
      code: s.subjectCode,
      name: s.name,
      abbreviation: s.abbreviation,
      semester: s.semester
    }));
    const classes = await Section.find({ departmentId }).select('-createdAt -updatedAt');

    // Populate the department object with relations
    const deptWithRelations = {
      ...department.toObject(),
      faculty,
      subjects,
      classes
    };

    res.json(deptWithRelations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new department
 */
export async function createDepartment(req: AuthRequest, res: Response) {
  try {
    const { name, abbreviation, password } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Department name required' });
    }

    const dept = new Department({
      name,
      abbreviation,
      passwordHash: password ? await hashPassword(password) : undefined
    });

    await dept.save();

    res.status(201).json({
      message: 'Department created',
      department: dept
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update department
 */
export async function updateDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;
    const { name, abbreviation } = req.body;

    const dept = await Department.findByIdAndUpdate(
      departmentId,
      { name, abbreviation },
      { new: true }
    );

    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department updated', department: dept });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete department
 */
export async function deleteDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;

    const dept = await Department.findByIdAndDelete(departmentId);

    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add faculty to department
 */
export async function addFacultyToDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;
    const { facultyId, name, email, mobile, role } = req.body;

    if (!facultyId || !name || !email) {
      return res.status(400).json({ error: 'Faculty ID, name, and email required' });
    }

    // Check if department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Create faculty
    const faculty = new Faculty({
      facultyId,
      name,
      email,
      mobile,
      departmentId,
      designation: role || 'Assistant Professor'
    });

    await faculty.save();

    // Create auth record for faculty
    const userAuth = new UserAuth({
      role: 'FACULTY',
      referenceId: faculty._id,
      passwordHash: await hashPassword('password123') // Default password
    });

    await userAuth.save();

    res.status(201).json({
      message: 'Faculty added successfully',
      faculty
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add class/section to department
 */
export async function addClassToDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;
    const { section, year, semester, batchId } = req.body;

    if (!section || !year || semester === undefined || !batchId) {
      return res.status(400).json({ error: 'Section, year, semester, and batchId required' });
    }

    // Check if department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Create section/class
    const sectionObj = new Section({
      name: section,
      departmentId,
      batchId,
      year: parseInt(year),
      semester: parseInt(semester)
    });

    await sectionObj.save();

    res.status(201).json({
      message: 'Class added successfully',
      class: sectionObj
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete faculty from department
 */
export async function deleteFacultyFromDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId, facultyId } = req.params;

    // Check if faculty exists
    const faculty = await Faculty.findOne({
      _id: facultyId,
      departmentId
    });

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Delete faculty
    await Faculty.findByIdAndDelete(facultyId);

    // Delete associated auth record
    await UserAuth.deleteOne({
      role: 'FACULTY',
      referenceId: facultyId
    });

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update faculty details
 */
export async function updateFacultyDetails(req: AuthRequest, res: Response) {
  try {
    const { departmentId, facultyId } = req.params;
    const { name, email, mobile, designation } = req.body;

    // Check if faculty exists
    const faculty = await Faculty.findOne({
      _id: facultyId,
      departmentId
    });

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Update faculty
    if (name) faculty.name = name;
    if (email) faculty.email = email;
    if (mobile) faculty.mobile = mobile;
    if (designation) faculty.designation = designation;

    await faculty.save();

    res.json({
      message: 'Faculty updated successfully',
      faculty
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete class from department
 */
export async function deleteClassFromDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId, classId } = req.params;

    // Check if class exists
    const classObj = await Section.findOne({
      _id: classId,
      departmentId
    });

    if (!classObj) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Delete class
    await Section.findByIdAndDelete(classId);

    res.json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add subject to department
 */
export async function addSubjectToDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;
    const { subjectCode, name, abbreviation, semester } = req.body;

    if (!subjectCode || !name || !semester) {
      return res.status(400).json({ error: 'Subject code, name, and semester required' });
    }

    // Check if department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Import Subject model
    const Subject = (await import('../models/Subject')).default;

    // Check if subject code already exists in department
    const existingSubject = await Subject.findOne({
      subjectCode: subjectCode,
      departmentId
    });

    if (existingSubject) {
      return res.status(400).json({ error: 'Subject code already exists in this department' });
    }

    // Create subject
    const subject = new Subject({
      subjectCode: subjectCode,
      name,
      abbreviation,
      semester: parseInt(semester),
      departmentId
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject added successfully',
      subject
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete subject from department
 */
export async function deleteSubjectFromDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId, subjectId } = req.params;

    // Import Subject model
    const Subject = (await import('../models/Subject')).default;

    // Check if subject exists
    const subject = await Subject.findOne({
      _id: subjectId,
      departmentId
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Delete subject
    await Subject.findByIdAndDelete(subjectId);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Bulk add subjects to department from Excel file
 */
export async function bulkAddSubjectsToDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;
    const { semester } = req.body;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'Excel file required' });
    }

    if (!semester) {
      return res.status(400).json({ error: 'Semester required' });
    }

    // Check if department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Import Subject model
    const Subject = (await import('../models/Subject')).default;

    // Parse Excel file
    const XLSX = require('xlsx');
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const subjectsAdded = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;

      try {
        // Extract data with flexible column names
        const subjectCode = row['Subject Code'] || row['subject code'] || row['SubjectCode'] || row['subjectCode'] || row['Code'] || row['code'];
        const subjectName = row['Subject Name'] || row['subject name'] || row['SubjectName'] || row['subjectName'] || row['Name'] || row['name'];
        const abbreviation = row['Abbreviation'] || row['abbreviation'] || row['Abbr'] || row['abbr'] || '';

        // Validate required fields
        if (!subjectCode || !subjectName) {
          errors.push(`Row ${i + 2}: Missing required fields (Subject Code, Subject Name)`);
          continue;
        }

        // Check if subject already exists
        const existingSubject = await Subject.findOne({
          subjectCode: subjectCode,
          departmentId
        });

        if (existingSubject) {
          errors.push(`Row ${i + 2}: Subject with code ${subjectCode} already exists`);
          continue;
        }

        // Create subject
        const subject = new Subject({
          subjectCode: subjectCode,
          name: subjectName,
          abbreviation: abbreviation,
          semester: parseInt(semester),
          departmentId
        });

        await subject.save();

        subjectsAdded.push({
          subjectCode: subject.subjectCode,
          name: subject.name,
          abbreviation: subject.abbreviation
        });

      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.status(201).json({
      message: `Successfully added ${subjectsAdded.length} subjects`,
      added: subjectsAdded,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Bulk add faculty to department from Excel file
 */
export async function bulkAddFacultyToDepartment(req: AuthRequest, res: Response) {
  try {
    const { departmentId } = req.params;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: 'Excel file required' });
    }

    // Check if department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Parse Excel file
    const XLSX = require('xlsx');
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const facultyAdded = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;

      try {
        // Validate required fields
        if (!row.Name || !row.Email || !row['Faculty ID']) {
          errors.push(`Row ${i + 2}: Missing required fields (Name, Email, Faculty ID)`);
          continue;
        }

        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({
          $or: [
            { facultyId: row['Faculty ID'] },
            { email: row.Email }
          ]
        });

        if (existingFaculty) {
          errors.push(`Row ${i + 2}: Faculty with ID ${row['Faculty ID']} or email ${row.Email} already exists`);
          continue;
        }

        // Create faculty
        const faculty = new Faculty({
          facultyId: row['Faculty ID'],
          name: row.Name,
          email: row.Email,
          mobile: row.Mobile || '',
          departmentId,
          designation: row.Role || 'Assistant Professor'
        });

        await faculty.save();

        // Create auth record for faculty
        const userAuth = new UserAuth({
          role: 'FACULTY',
          referenceId: faculty._id,
          passwordHash: await hashPassword('password123') // Default password
        });

        await userAuth.save();

        facultyAdded.push({
          facultyId: faculty.facultyId,
          name: faculty.name,
          email: faculty.email
        });

      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.status(201).json({
      message: `Successfully added ${facultyAdded.length} faculty members`,
      added: facultyAdded,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
