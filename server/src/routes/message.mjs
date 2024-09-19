import { Router } from 'express';
import MessageController from '../controller/messageController.mjs';
import { authenticateToken } from '../utils/authMiddleware.mjs';

const router = Router();

router.get('/api/message', authenticateToken, MessageController.getUsersChat);
router.get('/api/message/:id', authenticateToken, MessageController.getMessages);
router.post('/api/message/:id', authenticateToken, MessageController.sendMessages);
router.get('/api/activity/:id', MessageController.getUserActivity);

export default router;
