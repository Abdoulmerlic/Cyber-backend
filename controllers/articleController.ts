import { Request, Response } from 'express';
import { Article } from '../models/Article';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { IArticle, IComment } from '../models/Article';

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const title = req.body.title;
    const content = req.body.content;
    const category = req.body.category;
    const tags = req.body.tags;
    const readTime = req.body.readTime;
    const imageUrl = req.file?.mimetype.startsWith('image/') ? `/uploads/${req.file.filename}` : undefined;
    const videoUrl = req.file?.mimetype.startsWith('video/') ? `/uploads/${req.file.filename}` : undefined;

    // Validate required fields
    if (!title || !content || !category || !readTime) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const article = new Article({
      title,
      content,
      author: {
        id: req.user?.id,
        username: req.user?.username
      },
      category,
      tags: tags ? JSON.parse(tags) : [],
      readTime: Number(readTime),
      imageUrl,
      videoUrl
    });

    await article.save();

    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ 
      message: 'Server error during article creation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper to transform article for frontend
const transformArticle = (article: IArticle) => ({
  ...article,
  author: {
    _id: article.author.id.toString(),
    username: article.author.username,
  },
  likes: article.likes.map((id: mongoose.Types.ObjectId) => id.toString()),
  comments: article.comments.map((c: IComment) => ({
    ...c,
    user: {
      _id: c.user.id.toString(),
      username: c.user.username,
    },
  })),
});

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { category, tag, search, page = 1, limit = 10 } = req.query;
    
    const query: {
      category?: string;
      tags?: string;
      $text?: { $search: string };
    } = {};
    
    if (category) {
      query.category = category as string;
    }
    
    if (tag) {
      query.tags = tag as string;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Article.countDocuments(query)
    ]);
    const transformedArticles = articles.map(a => transformArticle(a.toObject()));
    res.json({
      articles: transformedArticles,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching articles',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    const obj = transformArticle(article.toObject());

    res.json(obj);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching article',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, tags, readTime } = req.body;
    const imageUrl = req.file?.mimetype.startsWith('image/') ? `/uploads/${req.file.filename}` : undefined;
    const videoUrl = req.file?.mimetype.startsWith('video/') ? `/uploads/${req.file.filename}` : undefined;
    
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if the user is the author or admin
    if (article.author.id.toString() !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;
    article.tags = tags ? JSON.parse(tags) : article.tags;
    article.readTime = readTime || article.readTime;
    if (imageUrl) article.imageUrl = imageUrl;
    if (videoUrl) article.videoUrl = videoUrl;

    await article.save();

    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ 
      message: 'Server error while updating article',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if the user is the author or admin
    if (article.author.id.toString() !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    // Delete associated files
    if (article.imageUrl) {
      const imagePath = path.join(__dirname, '..', article.imageUrl);
      fs.unlinkSync(imagePath);
    }
    if (article.videoUrl) {
      const videoPath = path.join(__dirname, '..', article.videoUrl);
      fs.unlinkSync(videoPath);
    }

    await article.deleteOne();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting article',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const likeArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const likeIndex = article.likes.findIndex(id => id.equals(userId));

    if (likeIndex === -1) {
      // Add like
      article.likes.push(userId);
    } else {
      // Remove like
      article.likes.splice(likeIndex, 1);
    }

    await article.save();

    // Return updated likes as string array
    res.json({ likes: article.likes.map(id => id.toString()) });
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ 
      message: 'Server error while updating like',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const comment = {
      user: {
        id: new mongoose.Types.ObjectId(req.user.id),
        username: req.user.username,
      },
      content: req.body.content,
      createdAt: new Date(),
    };
    article.comments.push(comment);
    await article.save();
    const lastComment = article.comments[article.comments.length - 1];
    const transformedComment = {
      ...lastComment,
      user: {
        _id: lastComment.user.id.toString(),
        username: lastComment.user.username,
      },
    };
    res.status(201).json({ comment: transformedComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      message: 'Server error while adding comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const commentIndex = article.comments.findIndex(
      comment => comment.user.id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author
    if (article.comments[commentIndex].user.id.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    article.comments.splice(commentIndex, 1);
    await article.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 