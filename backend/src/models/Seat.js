import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  layoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Layout',
    required: [true, 'Layout ID is required']
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true
  },
  xCoordinate: {
    type: Number,
    required: [true, 'X coordinate is required']
  },
  yCoordinate: {
    type: Number,
    required: [true, 'Y coordinate is required']
  },
  type: {
    type: String,
    enum: ['desk', 'meeting-room', 'phone-booth'],
    default: 'desk'
  },
  amenities: [{
    type: String,
    enum: ['monitor', 'standing-desk', 'window-view', 'quiet-zone']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for layoutId + seatNumber (unique)
seatSchema.index({ layoutId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ layoutId: 1 });

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;
