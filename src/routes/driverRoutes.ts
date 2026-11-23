import { Router } from 'express';
import { getDriverJobs, toggleDriverConsent, updateDriverLocation } from '../controllers/driverController.js';
import { authenticateToken } from '../middleware/auth.js';
import { driverPrivacyFirewall } from '../middleware/driverSanitizer.js';

const router = Router();

router.use(authenticateToken);
router.use(driverPrivacyFirewall);

router.get('/jobs', getDriverJobs);
router.post('/consent', toggleDriverConsent);
router.post('/location', updateDriverLocation);

export default router;

