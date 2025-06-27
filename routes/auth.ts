import express from 'express';
import { register, login, logout, getCurrentUser, updateProfile, refreshToken, changePassword, getAccount } from '../controllers/authController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.get('/account', authMiddleware, getAccount);
router.post('/logout', authMiddleware, logout);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/refresh-token', refreshToken);

export default router;