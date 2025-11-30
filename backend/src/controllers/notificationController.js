import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

// Get user notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: notifications,
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get notification by ID
export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notification = await Notification.findOne({ _id: id, userId });
    
    if (!notification) {
      throw new AppError('Notification not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Mark as read
    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Send notification (admin only)
export const sendNotification = async (req, res, next) => {
  try {
    const { userIds, title, message, type } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new AppError('User IDs array is required', 400, 'VALIDATION_ERROR');
    }
    
    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type: type || 'system-alert'
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({
      success: true,
      message: `Notifications sent to ${userIds.length} users`
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notification = await Notification.findOne({ _id: id, userId });
    
    if (!notification) {
      throw new AppError('Notification not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    await Notification.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
