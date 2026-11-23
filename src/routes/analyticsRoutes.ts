import { Router } from 'express';
import { getDirectorDashboard, getAnalystMetrics } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/director', requireRole(['director', 'ordering']), getDirectorDashboard);
router.get('/analyst', requireRole(['analyst', 'director']), getAnalystMetrics);

export default router;

