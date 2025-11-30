import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;
    
    // Check if user is updating their own profile or is admin
    if (req.user.userId.toString() !== id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized to update this profile', 403, 'INSUFFICIENT_PERMISSIONS');
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    
    await user.save();
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Delete associated bookings
    await Booking.deleteMany({ userId: id });
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'User and associated bookings deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['employee', 'admin'].includes(role)) {
      throw new AppError('Invalid role', 400, 'VALIDATION_ERROR');
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update user avatar
export const updateUserAvatar = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own avatar or is admin
    if (req.user.userId.toString() !== id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized to update this avatar', 403, 'INSUFFICIENT_PERMISSIONS');
    }
    
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'FILE_MISSING');
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Update avatar URL
    user.avatarUrl = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({
      success: true,
      data: {
        avatarUrl: user.avatarUrl
      },
      message: 'Avatar updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
