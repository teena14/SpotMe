import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
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
  checkInTime: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['qr', 'manual'],
    required: [true, 'Check-in method is required']
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

const CheckIn = mongoose.model('CheckIn', checkInSchema);

export default CheckIn;
