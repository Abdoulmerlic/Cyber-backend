import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: 'https://cyber-frontend-imyf1qv18-abdoulmerlics-projects.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cyber Savvy Corner API' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 