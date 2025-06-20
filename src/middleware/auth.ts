import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role?: string;
    email?: string;
    username?: string;
    hotelId?: number | null;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    req.user = {
      userId: decoded.userId || decoded.id,
      roleId: Number(decoded.roleId || decoded.role_id),
      role: decoded.role,
      email: decoded.email,
      username: decoded.username,
      hotelId: decoded.hotelId || null
    };
    
    next();
  });
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const ROLE_MAPPING: { [key: number]: string } = {
      1: 'Hotel Manager',
      2: 'Traveler',
      3: 'Administrator',
      4: 'Data Operator'
    };

    let userRole = user.role;
    
    if (!userRole && user.roleId) {
      userRole = ROLE_MAPPING[user.roleId];
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};
