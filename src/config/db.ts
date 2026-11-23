import mongoose from 'mongoose';

export async function connectDB(): Promise<typeof mongoose> {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/siteflow';
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    process.exit(1);
  }
}

