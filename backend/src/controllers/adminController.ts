import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Admin from '../models/Admin';
import UserAuth from '../models/UserAuth';
import Department from '../models/Department';
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
      admin: {
        _id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all departments
 */
export async function getDepartments(req: AuthRequest, res: Response) {
  try {
    const departments = await Department.find()
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
