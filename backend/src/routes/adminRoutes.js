import express from 'express';
import {
  getAllUsersAdmin,
  getUserDetailsAdmin,
  blockUser,
  unblockUser,
  getAllBookingsAdmin,
  deleteBookingAdmin
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['admin']));
router.use(adminLimiter);

// User management
router.get('/users', getAllUsersAdmin);
router.get('/users/:id', getUserDetailsAdmin);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

// Booking management
router.get('/bookings', getAllBookingsAdmin);
router.delete('/bookings/:bookingId', deleteBookingAdmin);

export default router;
