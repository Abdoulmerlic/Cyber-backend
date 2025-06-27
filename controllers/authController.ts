import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from 'dotenv';
import mongoose from 'mongoose';

config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Helper functions for tokens
const createAccessToken = (user: { id: string, isAdmin: boolean }) =>
  jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '15m' });

const createRefreshToken = (user: { id: string, isAdmin: boolean }) =>
  jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '30m' });

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, isAdmin } = req.body;

    // Log the received data
    console.log('Registration attempt:', { username, email, password: password ? '***' : undefined });

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        errors: [{
          field: existingUser.email === email ? 'email' : 'username',
          message: `${existingUser.email === email ? 'Email' : 'Username'} is already taken`
        }]
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      isAdmin: isAdmin === true
    });

    // Log the user object before validation
    console.log('User object before validation:', {
      username: user.username,
      email: user.email,
      hasPassword: !!user.password
    });

    // Validate the user document
    const validationError = user.validateSync();
    if (validationError) {
      console.log('Validation error:', validationError);
      const errors = Object.values(validationError.errors).map(err => ({
        field: err.path,
        message: err.message,
        type: err.kind
      }));
      return res.status(400).json({ 
        message: 'Validation failed',
        errors
      });
    }

    // Save the user
    await user.save();
    console.log('User saved successfully:', { id: user._id, username: user.username, email: user.email });
    if (user.isAdmin) {
      console.log('Admin registered:', { id: user._id, username: user.username, email: user.email });
    }

    // Issue tokens
    const accessToken = createAccessToken({ id: user._id, isAdmin: user.isAdmin || false });
    const refreshToken = createRefreshToken({ id: user._id, isAdmin: user.isAdmin || false });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
    });
    res.status(201).json({
      message: 'User registered successfully',
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error types
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({
        message: 'Duplicate key error',
        errors: [{
          field: 'username',
          message: 'Username or email already exists'
        }]
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Log the received data (excluding password)
    console.log('Login attempt:', { email, password: password ? '***' : undefined });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        errors: [
          !email ? 'Email is required' : null,
          !password ? 'Password is required' : null
        ].filter(Boolean)
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'User not found',
        errors: ['No account found with this email address']
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid password',
        errors: ['The password you entered is incorrect']
      });
    }

    // Generate tokens
    const accessToken = createAccessToken({ id: user._id, isAdmin: user.isAdmin || false });
    const refreshToken = createRefreshToken({ id: user._id, isAdmin: user.isAdmin || false });
    if (user.isAdmin) {
      console.log('Admin logged in:', { id: user._id, username: user.username, email: user.email });
    }
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
    });
    res.json({
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      errors: ['An unexpected error occurred. Please try again later.']
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, bio, profilePicture } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    // Verify refresh token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    // Issue new tokens
    const newAccessToken = createAccessToken({ id: user._id, isAdmin: user.isAdmin || false });
    const newRefreshToken = createRefreshToken({ id: user._id, isAdmin: user.isAdmin || false });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
    });
    res.json({ token: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        errors: ['Current password and new password are required']
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Invalid password',
        errors: ['New password must be at least 6 characters long']
      });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid password',
        errors: ['Current password is incorrect']
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

export const getAccount = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password -twoFactorSecret');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};