import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGO_URL is required. Add it to server/.env.');
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error: ' + error.message);
  });

  await mongoose.connect(mongoUri);
  console.info('MongoDB connected: ' + mongoose.connection.host);
};