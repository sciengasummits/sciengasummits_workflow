import mongoose from 'mongoose';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const mongoOptions = {
  serverSelectionTimeoutMS: 45000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  maxPoolSize: 5,
  minPoolSize: 1,
  family: 4,
  lookup: dns.lookup,
};

export default async function dbConnect() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔌 Connecting to MongoDB Atlas (Next.js)...');
    console.log('📍 URI:', MONGODB_URI.substring(0, 20) + '...');
    
    cached.promise = mongoose.connect(MONGODB_URI, mongoOptions).then((mongooseInstance) => {
      console.log('✅ MongoDB Atlas connected (readyState: ' + mongooseInstance.connection.readyState + ')');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Ensure the connection is actually open
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB connection established but readyState is not 1 (it is ' + mongoose.connection.readyState + ')');
      // Wait up to 5 seconds for it to become 1
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (mongoose.connection.readyState === 1) break;
      }
    }
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connect failed:', e.message);
    throw e;
  }

  return cached.conn;
}
