import { Router } from 'express';
import { createReport, getMyReports } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createReport);
router.get('/my-reports', getMyReports);

export default router;
