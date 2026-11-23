import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string;
  supplierId?: string;
  driverId?: string;
  siteId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function generateToken(payload: AuthUserPayload): string {
  const secret = process.env.JWT_SECRET || 'siteflow_jwt_secret_dj_civil_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication token required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'siteflow_jwt_secret_dj_civil_2026';
    const decoded = jwt.verify(token, secret) as AuthUserPayload;
    
    // Check if user still exists in DB
    const userDoc = await User.findById(decoded.id).select('active');
    if (!userDoc || !userDoc.active) {
      res.status(403).json({ success: false, message: 'User account is deactivated or invalid' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

