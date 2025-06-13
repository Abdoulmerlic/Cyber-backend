import { Request, Response } from 'express';
import User from '../models/User';
import { Article } from '../models/Article';

// GET /users - List all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -twoFactorSecret');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// DELETE /users/:id - Delete any user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// PUT /users/:id - Update user info (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, isAdmin, bio, profilePicture } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// GET /admin/stats - Admin stats (total users, total articles)
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArticles = await Article.countDocuments();
    res.json({ totalUsers, totalArticles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
}; 