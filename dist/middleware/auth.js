import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
export function generateToken(payload) {
    const secret = process.env.JWT_SECRET || 'siteflow_jwt_secret_dj_civil_2026';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    return jwt.sign(payload, secret, { expiresIn });
}
export async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        res.status(401).json({ success: false, message: 'Authentication token required' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'siteflow_jwt_secret_dj_civil_2026';
        const decoded = jwt.verify(token, secret);
        // Check if user still exists in DB
        const userDoc = await User.findById(decoded.id).select('active');
        if (!userDoc || !userDoc.active) {
            res.status(403).json({ success: false, message: 'User account is deactivated or invalid' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
    }
}
