import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/auth';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'DEPARTMENT';
  };
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  (req as AuthRequest).user = decoded;
  next();
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Allow DEPARTMENT role to access admin routes for their own department
    if (authReq.user.role === 'DEPARTMENT' && roles.includes('ADMIN')) {
      const departmentId = req.params.departmentId;
      if (departmentId && departmentId === authReq.user.userId) {
        return next();
      }
    }

    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
