import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  seatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: [true, 'Seat ID is required']
  },
  layoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Layout',
    required: [true, 'Layout ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed', 'no-show'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date,
    default: null
  }
});

// Compound indexes for conflict detection
bookingSchema.index({ userId: 1, date: 1 }, { unique: true });
bookingSchema.index({ seatId: 1, date: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ createdAt: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
