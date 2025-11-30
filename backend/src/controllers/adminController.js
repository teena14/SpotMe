import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all users with filters
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { role, isBlocked } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';
    
    const users = await User.find(query).select('-password');
    
    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user details with booking history
export const getUserDetailsAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Get user's bookings
    const bookings = await Booking.find({ userId: id })
      .populate('seatId layoutId')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: {
        user,
        bookings
      },
      message: 'User details retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Block user
export const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    user.isBlocked = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Unblock user
export const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    user.isBlocked = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings with filters
export const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }
    
    const bookings = await Booking.find(query)
      .populate('userId seatId layoutId')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: bookings,
      message: 'Bookings retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete booking
export const deleteBookingAdmin = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new AppError('Booking not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    await Booking.findByIdAndDelete(bookingId);
    
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
