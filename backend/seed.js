// Seed script - creates sample layouts and seats in the DB
// Run with: node seed.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// ── Models inline (copy from src) ─────────────────────────────────────────────

const layoutSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, default: null },
  floor: { type: String, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const seatSchema = new mongoose.Schema({
  layoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Layout', required: true },
  seatNumber: { type: String, required: true, trim: true },
  xCoordinate: { type: Number, required: true },
  yCoordinate: { type: Number, required: true },
  type: { type: String, enum: ['desk', 'meeting-room', 'phone-booth'], default: 'desk' },
  amenities: [{ type: String, enum: ['monitor', 'standing-desk', 'window-view', 'quiet-zone'] }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Layout = mongoose.model('Layout', layoutSchema);
const Seat = mongoose.model('Seat', seatSchema);

// ── Seed data ─────────────────────────────────────────────────────────────────

const layouts = [
  {
    name: 'Open Plan',
    description: 'Main open workspace with standing desks and window views',
    floor: '1',
    capacity: 20,
    isActive: true,
  },
  {
    name: 'Collaboration Hub',
    description: 'Meeting rooms and phone booths for focused work',
    floor: '2',
    capacity: 12,
    isActive: true,
  },
  {
    name: 'Executive Suite',
    description: 'Premium desks with monitor setups',
    floor: '3',
    capacity: 8,
    isActive: true,
  },
];

// Seats for Floor 1 — Open Plan (4 rows x 5 cols grid pattern)
const floor1Seats = [
  // Row 0
  { seatNumber: 'A1', xCoordinate: 0, yCoordinate: 0, type: 'desk', amenities: ['monitor', 'window-view'] },
  { seatNumber: 'A2', xCoordinate: 1, yCoordinate: 0, type: 'desk', amenities: ['monitor'] },
  { seatNumber: 'A3', xCoordinate: 2, yCoordinate: 0, type: 'desk', amenities: ['standing-desk', 'window-view'] },
  { seatNumber: 'A4', xCoordinate: 3, yCoordinate: 0, type: 'desk', amenities: [] },
  { seatNumber: 'A5', xCoordinate: 4, yCoordinate: 0, type: 'desk', amenities: ['monitor'] },
  // Row 1
  { seatNumber: 'B1', xCoordinate: 0, yCoordinate: 1, type: 'desk', amenities: ['quiet-zone'] },
  { seatNumber: 'B2', xCoordinate: 1, yCoordinate: 1, type: 'desk', amenities: ['monitor', 'quiet-zone'] },
  { seatNumber: 'B3', xCoordinate: 2, yCoordinate: 1, type: 'phone-booth', amenities: ['quiet-zone'] },
  { seatNumber: 'B4', xCoordinate: 3, yCoordinate: 1, type: 'desk', amenities: ['standing-desk'] },
  { seatNumber: 'B5', xCoordinate: 4, yCoordinate: 1, type: 'desk', amenities: [] },
  // Row 2
  { seatNumber: 'C1', xCoordinate: 0, yCoordinate: 2, type: 'desk', amenities: ['window-view'] },
  { seatNumber: 'C2', xCoordinate: 1, yCoordinate: 2, type: 'desk', amenities: ['monitor', 'window-view'] },
  { seatNumber: 'C3', xCoordinate: 2, yCoordinate: 2, type: 'meeting-room', amenities: [] },
  { seatNumber: 'C4', xCoordinate: 3, yCoordinate: 2, type: 'desk', amenities: ['monitor'] },
  { seatNumber: 'C5', xCoordinate: 4, yCoordinate: 2, type: 'desk', amenities: ['standing-desk', 'monitor'] },
  // Row 3
  { seatNumber: 'D1', xCoordinate: 0, yCoordinate: 3, type: 'desk', amenities: [] },
  { seatNumber: 'D2', xCoordinate: 1, yCoordinate: 3, type: 'desk', amenities: ['monitor'] },
  { seatNumber: 'D3', xCoordinate: 2, yCoordinate: 3, type: 'desk', amenities: ['window-view'] },
  { seatNumber: 'D4', xCoordinate: 3, yCoordinate: 3, type: 'phone-booth', amenities: ['quiet-zone'] },
  { seatNumber: 'D5', xCoordinate: 4, yCoordinate: 3, type: 'desk', amenities: ['monitor', 'standing-desk'] },
];

// Seats for Floor 2 — Collaboration Hub
const floor2Seats = [
  { seatNumber: 'M1', xCoordinate: 0, yCoordinate: 0, type: 'meeting-room', amenities: [] },
  { seatNumber: 'M2', xCoordinate: 2, yCoordinate: 0, type: 'meeting-room', amenities: [] },
  { seatNumber: 'P1', xCoordinate: 4, yCoordinate: 0, type: 'phone-booth', amenities: ['quiet-zone'] },
  { seatNumber: 'D1', xCoordinate: 0, yCoordinate: 2, type: 'desk', amenities: ['monitor'] },
  { seatNumber: 'D2', xCoordinate: 1, yCoordinate: 2, type: 'desk', amenities: ['monitor', 'window-view'] },
  { seatNumber: 'D3', xCoordinate: 2, yCoordinate: 2, type: 'desk', amenities: ['standing-desk'] },
  { seatNumber: 'D4', xCoordinate: 3, yCoordinate: 2, type: 'desk', amenities: [] },
  { seatNumber: 'P2', xCoordinate: 4, yCoordinate: 2, type: 'phone-booth', amenities: ['quiet-zone'] },
];

// Seats for Floor 3 — Executive Suite
const floor3Seats = [
  { seatNumber: 'E1', xCoordinate: 0, yCoordinate: 0, type: 'desk', amenities: ['monitor', 'window-view', 'standing-desk'] },
  { seatNumber: 'E2', xCoordinate: 1, yCoordinate: 0, type: 'desk', amenities: ['monitor', 'window-view'] },
  { seatNumber: 'E3', xCoordinate: 2, yCoordinate: 0, type: 'desk', amenities: ['monitor', 'window-view', 'quiet-zone'] },
  { seatNumber: 'E4', xCoordinate: 0, yCoordinate: 1, type: 'meeting-room', amenities: [] },
  { seatNumber: 'E5', xCoordinate: 2, yCoordinate: 1, type: 'desk', amenities: ['monitor', 'standing-desk'] },
];

const seatsByFloor = [floor1Seats, floor2Seats, floor3Seats];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.host} / DB: ${mongoose.connection.name}`);

    // Check existing layouts
    const existing = await Layout.countDocuments();
    if (existing > 0) {
      console.log(`\nFound ${existing} existing layout(s) - skipping seed to avoid duplicates.`);
      console.log('Delete existing layouts first if you want to re-seed.');
      await mongoose.disconnect();
      return;
    }

    console.log('\nSeeding layouts and seats...');

    for (let i = 0; i < layouts.length; i++) {
      const layout = await Layout.create(layouts[i]);
      console.log(`  Created layout: "${layout.name}" (Floor ${layout.floor}) → ${layout._id}`);

      const seats = seatsByFloor[i].map((s) => ({ ...s, layoutId: layout._id }));
      await Seat.insertMany(seats);
      console.log(`    -> Inserted ${seats.length} seats`);
    }

    console.log('\nSeed complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
