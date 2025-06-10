const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const articleRoutes = require('../routes/article').default;

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 