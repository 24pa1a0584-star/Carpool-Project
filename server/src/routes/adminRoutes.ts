import { Router } from 'express';
import {
  getStats,
  getUsers,
  updateUserStatus,
  getRides,
  cancelRideByAdmin,
  getReports,
  resolveReport,
  getSettings,
  updateSettings,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:userId', updateUserStatus);
router.get('/rides', getRides);
router.post('/rides/:rideId/cancel', cancelRideByAdmin);
router.get('/reports', getReports);
router.patch('/reports/:reportId', resolveReport);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
