import { Router } from 'express';
import { login, getCurrentUser, switchDemoRole, listSeedPersonas } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.post('/login', login);
router.post('/demo-switch', switchDemoRole);
router.get('/personas', listSeedPersonas);
router.get('/me', authenticateToken, getCurrentUser);
export default router;
