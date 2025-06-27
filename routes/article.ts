import express from 'express';
import { 
  createArticle, 
  getArticles, 
  getArticleById, 
  updateArticle, 
  deleteArticle,
  likeArticle,
  addComment,
  deleteComment
} from '../controllers/articleController';
import authMiddleware, { adminMiddleware } from '../middleware/auth';
import upload, { checkFileSize } from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Protected routes
router.post('/', authMiddleware, upload.single('media'), checkFileSize, createArticle);
router.put('/:id', authMiddleware, upload.single('media'), checkFileSize, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

// Like routes
router.post('/:id/like', authMiddleware, likeArticle);

// Comment routes
router.post('/:id/comments', authMiddleware, addComment);
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

// Admin routes
router.get('/admin/articles', authMiddleware, adminMiddleware, getArticles);
router.get('/admin/articles/:id', authMiddleware, adminMiddleware, getArticleById);
router.put('/admin/articles/:id', authMiddleware, adminMiddleware, upload.single('media'), checkFileSize, updateArticle);
router.delete('/admin/articles/:id', authMiddleware, adminMiddleware, deleteArticle);

export default router; 