import mongoose from 'mongoose';

const layoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Layout name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  floor: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for seats
layoutSchema.virtual('seats', {
  ref: 'Seat',
  localField: '_id',
  foreignField: 'layoutId'
});

// Update updatedAt on save
layoutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Enable virtuals in JSON
layoutSchema.set('toJSON', { virtuals: true });
layoutSchema.set('toObject', { virtuals: true });

const Layout = mongoose.model('Layout', layoutSchema);

export default Layout;
