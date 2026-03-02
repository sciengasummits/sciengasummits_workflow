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
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, mongoOptions).then((mongoose) => {
      console.log('✅ MongoDB Atlas connected');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connect failed:', e.message);
    throw e;
  }

  return cached.conn;
}
