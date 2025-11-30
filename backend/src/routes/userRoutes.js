import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserAvatar
} from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users (admin only)
router.get('/', requireRole(['admin']), getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user profile
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireRole(['admin']), deleteUser);

// PUT /api/users/:id/role - Update user role (admin only)
router.put('/:id/role', requireRole(['admin']), updateUserRole);

// PUT /api/users/:id/avatar - Update user avatar
router.put('/:id/avatar', upload.single('avatar'), updateUserAvatar);

export default router;
