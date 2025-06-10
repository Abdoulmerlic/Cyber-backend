import express from 'express';
import { register, login, logout, getCurrentUser, updateProfile, refreshToken } from '../controllers/authController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);
router.put('/profile', authMiddleware, updateProfile);
router.post('/refresh-token', refreshToken);

export default router;