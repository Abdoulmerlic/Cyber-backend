import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import articleRoutes from './routes/article';
import securityTipRoutes from './routes/securityTips';
import bookmarkRoutes from './routes/bookmarks';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

config();

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://cyber-frontend-imyf1qv18-abdoulmerlics-projects.vercel.app',  
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(cookieParser() as any);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/security-tips', securityTipRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});