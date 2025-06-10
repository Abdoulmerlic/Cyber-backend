import { Request, Response } from 'express';
import { Bookmark } from '../models/Bookmark';
import { Article } from '../models/Article';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    console.log('getBookmarks user:', req.user);
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const bookmarks = await Bookmark.find({ user: userId })
      .populate({
        path: 'article',
        select: 'title content author category tags readTime imageUrl createdAt'
      })
      .sort({ createdAt: -1 });

    res.json(bookmarks.map(bookmark => bookmark.article));
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching bookmarks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    console.log('addBookmark user:', req.user, 'articleId:', req.params.articleId);
    const { articleId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const articleObjectId = new mongoose.Types.ObjectId(articleId);

    // Check if article exists
    const article = await Article.findById(articleObjectId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: userId,
      article: articleObjectId
    });

    if (existingBookmark) {
      return res.status(400).json({ message: 'Article already bookmarked' });
    }

    // Create new bookmark
    const bookmark = new Bookmark({
      user: userId,
      article: articleObjectId
    });

    await bookmark.save();

    res.status(201).json({ message: 'Article bookmarked successfully' });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ 
      message: 'Server error while adding bookmark',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    console.log('removeBookmark user:', req.user, 'articleId:', req.params.articleId);
    const { articleId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const articleObjectId = new mongoose.Types.ObjectId(articleId);
    await Bookmark.findOneAndDelete({
      user: userId,
      article: articleObjectId
    });
    // Always return success, even if not found
    res.json({ message: 'Bookmark removed (if it existed).' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ 
      message: 'Server error while removing bookmark',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const isBookmarked = async (req: AuthRequest, res: Response) => {
  try {
    console.log('isBookmarked user:', req.user, 'articleId:', req.params.articleId);
    const { articleId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const articleObjectId = new mongoose.Types.ObjectId(articleId);
    const bookmark = await Bookmark.findOne({
      user: userId,
      article: articleObjectId
    });

    res.json(!!bookmark);
  } catch (error) {
    console.error('Check bookmark status error:', error);
    res.status(500).json({ 
      message: 'Server error while checking bookmark status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 