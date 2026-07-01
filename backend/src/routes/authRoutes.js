import express from 'express';
import { register, login, logout, refresh, changePassword, googleAuth, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleAuth);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// PUT /api/auth/password
router.put('/password', authenticateToken, changePassword);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', resetPassword);

export default router;
