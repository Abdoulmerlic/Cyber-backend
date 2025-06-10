import express from 'express';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked
} from '../controllers/bookmarkController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all bookmarks for the current user
router.get('/', getBookmarks);

// Check if an article is bookmarked
router.get('/:articleId', isBookmarked);

// Add a bookmark
router.post('/:articleId', addBookmark);

// Remove a bookmark
router.delete('/:articleId', removeBookmark);

export default router; 