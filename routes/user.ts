import express from 'express';
import { getAllUsers, deleteUser, updateUser, getAdminStats } from '../controllers/userController';
import authMiddleware, { adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Admin-only routes
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);
router.put('/:id', authMiddleware, adminMiddleware, updateUser);
router.get('/stats', authMiddleware, adminMiddleware, getAdminStats);

export default router; 