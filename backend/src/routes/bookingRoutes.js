import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  overrideBooking,
  deleteBooking,
  getBookingsByUser,
  getBookingsByDate,
  getBookingsBySeat
} from '../controllers/bookingController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Apply rate limiting to booking creation
router.post('/', bookingLimiter, createBooking);

// Booking CRUD
router.get('/', getBookings);
router.get('/:bookingId', getBookingById);
router.put('/:bookingId/cancel', cancelBooking);
router.put('/:bookingId/override', requireRole(['admin']), overrideBooking);
router.delete('/:bookingId', requireRole(['admin']), deleteBooking);

// Query endpoints
router.get('/user/:userId', getBookingsByUser);
router.get('/date/:date', getBookingsByDate);
router.get('/seat/:seatId', getBookingsBySeat);

export default router;
