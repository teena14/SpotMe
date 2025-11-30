import express from 'express';
import {
  getNotifications,
  getNotificationById,
  sendNotification,
  deleteNotification
} from '../controllers/notificationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getNotifications);
router.get('/:id', getNotificationById);
router.post('/send', requireRole(['admin']), sendNotification);
router.delete('/:id', deleteNotification);

export default router;
