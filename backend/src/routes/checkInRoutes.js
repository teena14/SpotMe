import express from 'express';
import {
  checkInByQR,
  getMyCheckInStatus,
  getTodayCheckIns
} from '../controllers/checkInController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint — called by the standalone kiosk app (app.py)
// No auth required; QR content identifies the user
router.post('/qr', checkInByQR);

// Authenticated user: get own check-in status for today
router.get('/status', authenticateToken, getMyCheckInStatus);

// Admin only: list all check-ins for today
router.get('/today', authenticateToken, requireRole(['admin']), getTodayCheckIns);

export default router;
