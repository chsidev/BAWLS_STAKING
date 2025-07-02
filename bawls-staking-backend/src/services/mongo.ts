import mongoose from 'mongoose';

let isConnected = false;

export async function connectToMongo() {
  if (isConnected) return;
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI not set in environment');

  console.log('Connecting to MongoDB URI:', MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}
