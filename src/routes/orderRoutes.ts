import { Router } from 'express';
import { createOrder, getOrders, getOrderById, getOrderStats } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { driverPrivacyFirewall } from '../middleware/driverSanitizer.js';

const router = Router();

router.use(authenticateToken);
router.use(driverPrivacyFirewall);

router.get('/stats', getOrderStats);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', requireRole(['manager', 'ordering', 'director']), createOrder);

export default router;

