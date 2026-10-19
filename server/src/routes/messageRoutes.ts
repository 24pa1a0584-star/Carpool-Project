import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);

export default router;
