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
router.get('/incoming', requireRole(['supplier', 'manager', 'director']), getSupplierIncoming);
router.get('/active', requireRole(['supplier', 'manager', 'director']), getSupplierActive);
router.get('/history', requireRole(['supplier', 'manager', 'director']), getSupplierHistory);
router.get('/drivers', requireRole(['supplier', 'manager', 'director', 'ordering']), getSupplierDrivers);
router.post('/orders/:orderId/accept', requireRole(['supplier', 'manager', 'director']), acceptAndAssignDriver);
router.post('/orders/:orderId/decline', requireRole(['supplier', 'manager', 'director']), declineOrder);

export default router;

