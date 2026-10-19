import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/user/:userId', getUserReviews);
router.post('/', authenticate, createReview);

export default router;
