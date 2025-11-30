import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://localhost:27017/spotme') {
      console.log('⚠️  No MongoDB connection string provided.');
      console.log('📝 Please update MONGODB_URI in .env file');
      console.log('💡 You can use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
      console.log('🔄 Server will continue without database (API will return errors)');
      return null;
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('');
      console.log('🔍 Possible issues:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the MongoDB Atlas cluster is running');
      console.log('   3. Check if your IP address is whitelisted in MongoDB Atlas');
      console.log('      → Go to Network Access in Atlas and add your IP (or use 0.0.0.0/0 for testing)');
      console.log('   4. Verify your username and password are correct');
    }
    
    console.log('🔄 Server will continue without database (API will return errors)');
    return null;
  }
};

export default connectDB;
