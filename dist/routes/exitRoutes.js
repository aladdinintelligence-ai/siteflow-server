import { Router } from 'express';
import { scanOut } from '../controllers/exitController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.use(authenticateToken);
router.post('/scan-out', scanOut);
export default router;
