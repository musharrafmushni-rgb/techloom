import mongoose from 'mongoose';

/**
 * Connect to MongoDB database.
 * Connects to MONGODB_URI (e.g., local MongoDB on 127.0.0.1:27017 or MongoDB Atlas).
 * If external instance fails, falls back gracefully to MongoMemoryServer.
 */
let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_payment_db';

  try {
    console.log(`[DB] Connecting to MongoDB at: ${uri.replace(/\/\/.*@/, '//***:***@')}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`[DB] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB (${err.message}). Attempting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[DB] In-Memory MongoDB running at: ${memUri}`);
      return conn;
    } catch (fallbackErr) {
      console.error(`[DB] Fatal: Could not establish MongoDB connection:`, fallbackErr);
      throw fallbackErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
