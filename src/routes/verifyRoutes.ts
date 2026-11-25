import { Router } from 'express';
import { verifyDelivery, getDiscrepancies } from '../controllers/verifyController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { uploadProof } from '../middleware/upload.js';

const router = Router();

router.use(authenticateToken);

router.get('/discrepancies', getDiscrepancies);
router.post(
  '/visits/:visitId',
  requireRole(['marshal', 'manager', 'director', 'ordering']),
  uploadProof.single('proofPhoto'),
  verifyDelivery
);

export default router;

