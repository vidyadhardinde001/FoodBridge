// lib/db.ts

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: 'provider' | 'charity';
  organizationName?: string;
}

const UserSchema = new mongoose.Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, enum: ['provider', 'charity'], required: true },
  organizationName: { type: String }
});

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

// Add to existing User schema
interface FoodDocument extends mongoose.Document {
  foodName: string;
  quantity: string;
  status: 'available' | 'pending' | 'picked_up';
  pickupLocation: string;
  description: string;
  provider: mongoose.Types.ObjectId;
  charity?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FoodSchema = new mongoose.Schema<FoodDocument>({
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  status: { type: String, enum: ['available', 'pending', 'picked_up'], default: 'available' },
  pickupLocation: { type: String, required: true },
  description: { type: String, required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  charity: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export const Food = mongoose.models.Food || mongoose.model<FoodDocument>('Food', FoodSchema);

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};