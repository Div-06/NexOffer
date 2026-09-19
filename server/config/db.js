const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexoffer';

  // Attempt standard connection (MongoDB Atlas or local daemon)
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}).`);
  }

  // Attempt in-memory MongoDB fallback for instant zero-config evaluation
  try {
    console.log(`🔄 Attempting to initialize in-memory MongoDB instance...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    
    const conn = await mongoose.connect(memUri);
    console.log(`✅ In-Memory MongoDB Connected successfully at: ${memUri}`);
    return true;
  } catch (memError) {
    console.warn(`⚠️ In-memory MongoDB could not be started (${memError.message}).`);
    return false;
  }
};

module.exports = connectDB;
