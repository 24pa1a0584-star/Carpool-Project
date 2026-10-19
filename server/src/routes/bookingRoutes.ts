import { Router } from 'express';
import {
  createBooking,
  respondToBooking,
  cancelBooking,
  getMyBookings,
  getDriverBookings,
  completeRide,
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/driver-requests', getDriverBookings);
router.patch('/:id/respond', respondToBooking);
router.post('/:id/cancel', cancelBooking);
router.post('/ride/:rideId/complete', completeRide);

export default router;
