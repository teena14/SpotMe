import Layout from '../models/Layout.js';
import Seat from '../models/Seat.js';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all layouts
export const getAllLayouts = async (req, res, next) => {
  try {
    const layouts = await Layout.find({ isActive: true });
    
    res.json({
      success: true,
      data: layouts,
      message: 'Layouts retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create layout (admin only)
export const createLayout = async (req, res, next) => {
  try {
    const { name, description, floor, capacity, imageUrl } = req.body;
    
    const layout = new Layout({
      name,
      description,
      floor,
      capacity,
      imageUrl
    });
    
    await layout.save();
    
    res.status(201).json({
      success: true,
      data: layout,
      message: 'Layout created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get layout by ID
export const getLayoutById = async (req, res, next) => {
  try {
    const { layoutId } = req.params;
    
    const layout = await Layout.findById(layoutId).populate('seats');
    
    if (!layout) {
      throw new AppError('Layout not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: layout,
      message: 'Layout retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update layout (admin only)
export const updateLayout = async (req, res, next) => {
  try {
    const { layoutId } = req.params;
    const { name, description, floor, capacity, imageUrl, isActive } = req.body;
    
    const layout = await Layout.findById(layoutId);
    
    if (!layout) {
      throw new AppError('Layout not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Update fields
    if (name !== undefined) layout.name = name;
    if (description !== undefined) layout.description = description;
    if (floor !== undefined) layout.floor = floor;
    if (capacity !== undefined) layout.capacity = capacity;
    if (imageUrl !== undefined) layout.imageUrl = imageUrl;
    if (isActive !== undefined) layout.isActive = isActive;
    
    await layout.save();
    
    res.json({
      success: true,
      data: layout,
      message: 'Layout updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete layout (admin only) - cascade delete seats and bookings
export const deleteLayout = async (req, res, next) => {
  try {
    const { layoutId } = req.params;
    
    const layout = await Layout.findById(layoutId);
    
    if (!layout) {
      throw new AppError('Layout not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Delete associated seats
    await Seat.deleteMany({ layoutId });
    
    // Delete associated bookings
    await Booking.deleteMany({ layoutId });
    
    // Delete layout
    await Layout.findByIdAndDelete(layoutId);
    
    res.json({
      success: true,
      message: 'Layout and associated seats/bookings deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all seats in a layout
export const getLayoutSeats = async (req, res, next) => {
  try {
    const { layoutId } = req.params;
    
    const seats = await Seat.find({ layoutId, isActive: true });
    
    res.json({
      success: true,
      data: seats,
      message: 'Seats retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get seat by ID
export const getSeatById = async (req, res, next) => {
  try {
    const { layoutId, seatId } = req.params;
    
    const seat = await Seat.findOne({ _id: seatId, layoutId });
    
    if (!seat) {
      throw new AppError('Seat not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    res.json({
      success: true,
      data: seat,
      message: 'Seat retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create seat (admin only)
export const createSeat = async (req, res, next) => {
  try {
    const { layoutId } = req.params;
    const { seatNumber, xCoordinate, yCoordinate, type, amenities } = req.body;
    
    // Verify layout exists
    const layout = await Layout.findById(layoutId);
    if (!layout) {
      throw new AppError('Layout not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    const seat = new Seat({
      layoutId,
      seatNumber,
      xCoordinate,
      yCoordinate,
      type,
      amenities
    });
    
    await seat.save();
    
    res.status(201).json({
      success: true,
      data: seat,
      message: 'Seat created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update seat (admin only)
export const updateSeat = async (req, res, next) => {
  try {
    const { layoutId, seatId } = req.params;
    const { seatNumber, xCoordinate, yCoordinate, type, amenities, isActive } = req.body;
    
    const seat = await Seat.findOne({ _id: seatId, layoutId });
    
    if (!seat) {
      throw new AppError('Seat not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Update fields
    if (seatNumber !== undefined) seat.seatNumber = seatNumber;
    if (xCoordinate !== undefined) seat.xCoordinate = xCoordinate;
    if (yCoordinate !== undefined) seat.yCoordinate = yCoordinate;
    if (type !== undefined) seat.type = type;
    if (amenities !== undefined) seat.amenities = amenities;
    if (isActive !== undefined) seat.isActive = isActive;
    
    await seat.save();
    
    res.json({
      success: true,
      data: seat,
      message: 'Seat updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete seat (admin only)
export const deleteSeat = async (req, res, next) => {
  try {
    const { layoutId, seatId } = req.params;
    
    const seat = await Seat.findOne({ _id: seatId, layoutId });
    
    if (!seat) {
      throw new AppError('Seat not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Delete associated bookings
    await Booking.deleteMany({ seatId });
    
    // Delete seat
    await Seat.findByIdAndDelete(seatId);
    
    res.json({
      success: true,
      message: 'Seat and associated bookings deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
