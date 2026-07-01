import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

/**
 * No-Show Job
 * Runs every 15 minutes.
 * Finds any 'active' booking for today where the current time is > 1 hour
 * past its `startTime`. Marks it as 'no-show' to free the seat.
 */
export const startNoShowJob = () => {
  // Cron expression: every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[NoShowJob] Running check for expired 1-hour check-in deadlines...');

    try {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find all active bookings for today
      const activeBookings = await Booking.find({
        date: { $gte: today, $lt: tomorrow },
        status: 'active'
      }).populate('userId', 'firstName lastName email');

      if (activeBookings.length === 0) return;

      const noShowBookings = [];
      const notifications = [];

      for (const booking of activeBookings) {
        if (!booking.startTime) continue; // safety check for old data

        const [hours, minutes] = booking.startTime.split(':').map(Number);
        const bookingStart = new Date(booking.date);
        bookingStart.setHours(hours, minutes, 0, 0);

        // Deadline is 1 hour after start time
        const deadline = new Date(bookingStart.getTime() + 60 * 60 * 1000);

        if (now > deadline) {
          noShowBookings.push(booking._id);
          notifications.push({
            userId: booking.userId._id,
            title: 'Seat Released — No Check-In',
            message: `Your booked seat from ${booking.startTime} was released because you did not check in within 1 hour. It is now available for others.`,
            type: 'system-alert'
          });
        }
      }

      if (noShowBookings.length === 0) return;

      // Bulk update to 'no-show'
      await Booking.updateMany(
        { _id: { $in: noShowBookings } },
        { $set: { status: 'no-show' } }
      );

      // Send notifications
      await Notification.insertMany(notifications);

      console.log(
        `[NoShowJob] Marked ${noShowBookings.length} booking(s) as no-show and freed their seats.`
      );
    } catch (error) {
      console.error('[NoShowJob] Error running no-show job:', error.message);
    }
  });

  console.log('[NoShowJob] Scheduled — will run every 15 minutes.');
};
