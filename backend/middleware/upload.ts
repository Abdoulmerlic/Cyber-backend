import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import fs from 'fs';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB for videos
  files: 1
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Custom middleware to check file size based on type
export const checkFileSize = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const file = req.file;
  const maxSize = file.mimetype.startsWith('image/') ? 1024 * 1024 : 10 * 1024 * 1024; // 1MB for images, 10MB for videos

  if (file.size > maxSize) {
    return res.status(400).json({
      message: `File size exceeds the limit. Maximum size for ${file.mimetype.startsWith('image/') ? 'images' : 'videos'} is ${maxSize / (1024 * 1024)}MB`
    });
  }

  next();
};

export default upload; 