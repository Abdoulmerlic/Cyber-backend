import express from 'express';
import {
  getSecurityTips,
  getSecurityTipById,
  createSecurityTip,
  updateSecurityTip,
  deleteSecurityTip,
  getRandomTip
} from '../controllers/securityTipController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getSecurityTips);
router.get('/random', getRandomTip);
router.get('/:id', getSecurityTipById);

// Protected routes
router.post('/', authMiddleware, createSecurityTip);
router.put('/:id', authMiddleware, updateSecurityTip);
router.delete('/:id', authMiddleware, deleteSecurityTip);

export default router; 