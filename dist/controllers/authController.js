import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
    }
    const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        supplierId: user.supplierId,
        driverId: user.driverId,
        siteId: user.siteId,
    });
    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization,
            supplierId: user.supplierId,
            driverId: user.driverId,
            siteId: user.siteId,
        },
    });
}
export async function getCurrentUser(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, user });
}
// Convenient Demo Switcher: allows manual testing to jump between seeded roles instantly with fresh JWT
export async function switchDemoRole(req, res) {
    const { role } = req.body;
    if (!role) {
        res.status(400).json({ success: false, message: 'Target role is required' });
        return;
    }
    const user = await User.findOne({ role, active: true });
    if (!user) {
        res.status(404).json({ success: false, message: `No active seeded user found for role ${role}` });
        return;
    }
    const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        supplierId: user.supplierId,
        driverId: user.driverId,
        siteId: user.siteId,
    });
    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization,
            supplierId: user.supplierId,
            driverId: user.driverId,
            siteId: user.siteId,
        },
    });
}
export async function listSeedPersonas(req, res) {
    const users = await User.find({ active: true }).select('-passwordHash');
    res.json({ success: true, personas: users });
}
