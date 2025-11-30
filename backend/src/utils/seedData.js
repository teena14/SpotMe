import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Layout from '../models/Layout.js';
import Seat from '../models/Seat.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Layout.deleteMany({});
    await Seat.deleteMany({});
    console.log('🗑️  Cleared existing layouts and seats');

    // Create Floor 1 Layout
    const floor1 = await Layout.create({
      name: 'Main Office',
      description: 'Main office floor with open workspace',
      floor: '1',
      capacity: 40,
      isActive: true,
    });
    console.log('✅ Created Floor 1 layout');

    // Create seats in a grid pattern (8 columns x 5 rows = 40 seats)
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const amenitiesOptions = [
      ['monitor'],
      ['monitor', 'standing-desk'],
      ['monitor', 'window-view'],
      ['monitor', 'standing-desk', 'window-view'],
      [],
    ];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      for (let col = 1; col <= 8; col++) {
        const seatNumber = `${rows[rowIndex]}${col}`;
        const amenities = amenitiesOptions[Math.floor(Math.random() * amenitiesOptions.length)];
        
        seats.push({
          layoutId: floor1._id,
          seatNumber,
          xCoordinate: col * 100,
          yCoordinate: rowIndex * 100,
          type: 'desk',
          amenities,
          isActive: true,
        });
      }
    }

    await Seat.insertMany(seats);
    console.log(`✅ Created ${seats.length} seats`);

    // Create Floor 2 Layout
    const floor2 = await Layout.create({
      name: 'Executive Floor',
      description: 'Executive floor with meeting rooms',
      floor: '2',
      capacity: 24,
      isActive: true,
    });
    console.log('✅ Created Floor 2 layout');

    // Create seats for Floor 2 (6 columns x 4 rows = 24 seats)
    const floor2Seats = [];
    const floor2Rows = ['A', 'B', 'C', 'D'];

    for (let rowIndex = 0; rowIndex < floor2Rows.length; rowIndex++) {
      for (let col = 1; col <= 6; col++) {
        const seatNumber = `${floor2Rows[rowIndex]}${col}`;
        
        floor2Seats.push({
          layoutId: floor2._id,
          seatNumber,
          xCoordinate: col * 100,
          yCoordinate: rowIndex * 100,
          type: rowIndex === 0 ? 'meeting-room' : 'desk',
          amenities: ['monitor', 'standing-desk', 'window-view'],
          isActive: true,
        });
      }
    }

    await Seat.insertMany(floor2Seats);
    console.log(`✅ Created ${floor2Seats.length} seats for Floor 2`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - 2 Layouts created`);
    console.log(`   - ${seats.length + floor2Seats.length} Seats created`);
    console.log('');
    console.log('🚀 You can now use the seat map at http://localhost:3000/seat-map');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
