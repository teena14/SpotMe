import express from 'express';
import {
  getAllLayouts,
  createLayout,
  getLayoutById,
  updateLayout,
  deleteLayout,
  getLayoutSeats,
  getSeatById,
  createSeat,
  updateSeat,
  deleteSeat
} from '../controllers/layoutController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes (require authentication)
router.use(authenticateToken);

// Layout routes
router.get('/', getAllLayouts);
router.post('/', requireRole(['admin']), createLayout);
router.get('/:layoutId', getLayoutById);
router.put('/:layoutId', requireRole(['admin']), updateLayout);
router.delete('/:layoutId', requireRole(['admin']), deleteLayout);

// Seat routes
router.get('/:layoutId/seats', getLayoutSeats);
router.get('/:layoutId/seats/:seatId', getSeatById);
router.post('/:layoutId/seats', requireRole(['admin']), createSeat);
router.put('/:layoutId/seats/:seatId', requireRole(['admin']), updateSeat);
router.delete('/:layoutId/seats/:seatId', requireRole(['admin']), deleteSeat);

export default router;
