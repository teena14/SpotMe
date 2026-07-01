import Booking from '../models/Booking.js';
import CheckIn from '../models/CheckIn.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

// ─── POST /api/checkin/qr ─────────────────────────────────────────────────────
// Called by the standalone kiosk app (app.py) when a QR is scanned.
// No authentication required — the QR content itself identifies the user.
export const checkInByQR = async (req, res, next) => {
  try {
    const { userId, name, roll, position, appId } = req.body;

    // Validate this is a SpotMe QR code
    if (appId !== 'SpotMe') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid QR code — not a SpotMe QR'
      });
    }

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing userId in QR data'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        status: 'error',
        message: 'User account is blocked'
      });
    }

    // Find today's active booking for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await Booking.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['active', 'checked-in'] }
    }).populate('seatId layoutId').sort({ startTime: 1 });

    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'no_booking',
        message: `No active booking found for ${name || user.firstName} today`
      });
    }

    // Pick the earliest 'active' booking that needs check-in
    let booking = bookings.find(b => b.status === 'active');
    
    // If none are active, they are all checked-in. Pick the latest one.
    if (!booking) {
      booking = bookings[bookings.length - 1];
    }

    // If already checked in, return success (idempotent)
    if (booking.status === 'checked-in') {
      return res.json({
        status: 'already_checked_in',
        message: `${user.firstName} ${user.lastName} is already checked in`,
        data: {
          userName: `${user.firstName} ${user.lastName}`,
          seatNumber: booking.seatId?.seatNumber,
          layout: booking.layoutId?.name,
          checkedInAt: booking.checkedInAt
        }
      });
    }

    // Mark booking as checked-in
    booking.status = 'checked-in';
    booking.checkedInAt = new Date();
    await booking.save();

    // Create CheckIn record
    await CheckIn.create({
      bookingId: booking._id,
      userId: user._id,
      seatId: booking.seatId._id,
      method: 'qr',
      checkInTime: new Date()
    });

    // Send notification to user
    await Notification.create({
      userId: user._id,
      title: 'Checked In Successfully',
      message: `You have been checked in to seat ${booking.seatId?.seatNumber} at ${new Date().toLocaleTimeString()}.`,
      type: 'system-alert'
    });

    return res.json({
      status: 'success',
      message: `Welcome, ${user.firstName}! Seat ${booking.seatId?.seatNumber} is now marked as occupied.`,
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId,
        seatNumber: booking.seatId?.seatNumber,
        layout: booking.layoutId?.name,
        floor: booking.layoutId?.floor,
        checkedInAt: booking.checkedInAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/checkin/status ──────────────────────────────────────────────────
// Returns the logged-in user's check-in status for today.
export const getMyCheckInStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await Booking.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['active', 'checked-in'] }
    }).populate('seatId layoutId').sort({ startTime: 1 });

    if (bookings.length === 0) {
      return res.json({
        success: true,
        data: {
          hasBookingToday: false,
          isCheckedIn: false,
          checkedInAt: null,
          booking: null
        }
      });
    }

    let booking = bookings.find(b => b.status === 'active');
    if (!booking) booking = bookings[bookings.length - 1];

    const checkIn = await CheckIn.findOne({
      bookingId: booking._id,
      userId
    });

    return res.json({
      success: true,
      data: {
        hasBookingToday: true,
        isCheckedIn: booking.status === 'checked-in',
        checkedInAt: booking.checkedInAt || null,
        booking: {
          id: booking._id,
          seatNumber: booking.seatId?.seatNumber,
          layout: booking.layoutId?.name,
          floor: booking.layoutId?.floor,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/checkin/today ───────────────────────────────────────────────────
// Admin: returns all check-ins for today.
export const getTodayCheckIns = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIns = await CheckIn.find({
      checkInTime: { $gte: today, $lt: tomorrow }
    })
      .populate('userId', 'firstName lastName email employeeId role')
      .populate('seatId', 'seatNumber')
      .populate('bookingId')
      .sort({ checkInTime: -1 });

    return res.json({
      success: true,
      data: checkIns,
      count: checkIns.length
    });
  } catch (error) {
    next(error);
  }
};
