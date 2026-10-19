import { Router } from 'express';
import {
  createRide,
  searchRides,
  getRideById,
  updateRide,
  cancelRide,
  getMyOfferedRides,
} from '../controllers/rideController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', searchRides);
router.get('/my-rides', authenticate, getMyOfferedRides);
router.get('/:id', getRideById);
router.post('/', authenticate, createRide);
router.put('/:id', authenticate, updateRide);
router.post('/:id/cancel', authenticate, cancelRide);

export default router;
