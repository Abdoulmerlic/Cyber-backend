import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
  file?: Express.Multer.File;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false
    };
    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
};

export default authMiddleware;