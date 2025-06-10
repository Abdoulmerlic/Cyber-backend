import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Disconnect first to clear any existing connections
    await mongoose.disconnect();
    
    // Connect with explicit database name
    await mongoose.connect(mongoURI, {
      dbName: 'cyber-savvy-corner-v2'
    });
    
    console.log('MongoDB connected successfully to database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;