import { Router } from 'express';
import {
  getSupplierIncoming,
  getSupplierActive,
  getSupplierHistory,
  acceptAndAssignDriver,
  declineOrder,
  getSupplierDrivers,
  getSuppliersList,
} from '../controllers/supplierController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/list', getSuppliersList);
router.get('/incoming', requireRole(['supplier', 'director']), getSupplierIncoming);
router.get('/active', requireRole(['supplier', 'director']), getSupplierActive);
router.get('/history', requireRole(['supplier', 'director']), getSupplierHistory);
router.get('/drivers', requireRole(['supplier', 'director', 'ordering']), getSupplierDrivers);
router.post('/orders/:orderId/accept', requireRole(['supplier', 'director']), acceptAndAssignDriver);
router.post('/orders/:orderId/decline', requireRole(['supplier', 'director']), declineOrder);

export default router;

