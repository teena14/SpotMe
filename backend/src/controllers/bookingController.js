import Booking from '../models/Booking.js';
import Seat from '../models/Seat.js';
import Layout from '../models/Layout.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

// Create booking
export const createBooking = async (req, res, next) => {
  try {
    const { seatId, date } = req.body;
    const userId = req.user.userId;
    
    // Validate date is in the future
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      throw new AppError('Cannot book past dates', 400, 'PAST_DATE_BOOKING');
    }
    
    // Check if seat exists
    const seat = await Seat.findById(seatId);
    if (!seat || !seat.isActive) {
      throw new AppError('Seat not found or inactive', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user already has a booking for this date
    const existingUserBooking = await Booking.findOne({
      userId,
      date: bookingDate,
      status: 'active'
    });
    
    if (existingUserBooking) {
      throw new AppError('You already have a booking for this date', 409, 'USER_ALREADY_BOOKED');
    }
    
    // Check if seat is already booked for this date
    const existingSeatBooking = await Booking.findOne({
      seatId,
      date: bookingDate,
      status: 'active'
    });
    
    if (existingSeatBooking) {
      throw new AppError('This seat is already booked for the selected date', 409, 'BOOKING_CONFLICT');
    }
    
    // Create booking
    const booking = new Booking({
      userId,
      seatId,
      layoutId: seat.layoutId,
      date: bookingDate,
      status: 'active'
    });
    
    await booking.save();
    
    // Populate seat and layout info
    await booking.populate('seatId layoutId');
    
    // Create notification
    await Notification.create({
      userId,
      title: 'Booking Confirmed',
      message: `Your booking for seat ${seat.seatNumber} on ${bookingDate.toDateString()} has been confirmed.`,
      type: 'booking-confirmed'
    });
    
    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get bookings (user's own or all for admin)
export const getBookings = async (req, res, next) => {
  try {
    let query = {};
    
    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      query.userId = req.user.userId;
    }
    
    const bookings = await Booking.find(query)
      .populate('seatId layoutId userId')
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

// Get booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('seatId layoutId userId');
    
    if (!booking) {
      throw new AppError('Booking not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user owns this booking or is admin
    if (booking.userId._id.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      throw new AppError('Unauthorized to view this booking', 403, 'INSUFFICIENT_PERMISSIONS');
    }
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new AppError('Booking not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Check if user owns this booking or is admin
    if (booking.userId.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      throw new AppError('Unauthorized to cancel this booking', 403, 'INSUFFICIENT_PERMISSIONS');
    }
    
    // Check if booking date is in the future
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      throw new AppError('Cannot cancel past bookings', 400, 'PAST_DATE_BOOKING');
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    
    // Create notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking for ${bookingDate.toDateString()} has been cancelled.`,
      type: 'booking-cancelled'
    });
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Override booking (admin only)
export const overrideBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { seatId, date, status } = req.body;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new AppError('Booking not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Update fields
    if (seatId) booking.seatId = seatId;
    if (date) booking.date = new Date(date);
    if (status) booking.status = status;
    
    await booking.save();
    
    // Create notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Modified',
      message: 'Your booking has been modified by an administrator.',
      type: 'system-alert'
    });
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking overridden successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete booking (admin only)
export const deleteBooking = async (req, res, next) => {
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

// Get bookings by user
export const getBookingsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    let query = { userId };
    
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }
    
    const bookings = await Booking.find(query)
      .populate('seatId layoutId')
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

// Get bookings by date
export const getBookingsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    
    const bookings = await Booking.find({
      date: queryDate,
      status: 'active'
    }).populate('seatId layoutId userId');
    
    res.json({
      success: true,
      data: bookings,
      message: 'Bookings retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get bookings by seat
export const getBookingsBySeat = async (req, res, next) => {
  try {
    const { seatId } = req.params;
    const { date } = req.query;
    
    let query = { seatId, status: 'active' };
    
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }
    
    const bookings = await Booking.find(query)
      .populate('userId')
      .sort({ date: 1 });
    
    res.json({
      success: true,
      data: bookings,
      message: 'Bookings retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};
