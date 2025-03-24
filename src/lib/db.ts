// lib/db.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
console.log('MONGODB_URI:', process.env.MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// User Schema
interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  role: 'provider' | 'charity';
  organizationName?: string;
}

const UserSchema = new mongoose.Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  role: { type: String, enum: ['provider', 'charity'], required: true },
  organizationName: { type: String },
});

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

// Food Schema
interface FoodDocument extends mongoose.Document {
  foodName: string;
  foodCategory: string;
  quantity: string;
  imageUrl?: string;
  status: 'available' | 'pending' | 'picked_up';
  pickupLocation: string;
  description: string;
  isVeg: boolean;
  condition: 'used' | 'unused';
  provider: mongoose.Types.ObjectId;
  charity?: mongoose.Types.ObjectId;  
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

const FoodSchema = new mongoose.Schema<FoodDocument>({
  foodName: { type: String, required: true },
  foodCategory: { type: String, required: true },
  quantity: { type: String, required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['available', 'pending', 'picked_up'], default: 'available' },
  pickupLocation: { type: String, required: true },
  description: { type: String, required: true },
  isVeg: { type: Boolean, required: true },
  condition: { 
    type: String, 
    enum: ['used', 'unused'],
    required: true 
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export const Food = mongoose.models.Food || mongoose.model<FoodDocument>('Food', FoodSchema);

// Chat Schema
interface ChatDocument extends mongoose.Document {
  foodId: mongoose.Types.ObjectId;
  charityId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  messages: MessageDocument[];
  status: 'pending' | 'confirmed' | 'completed';
}

interface MessageDocument extends mongoose.Document {
  sender: 'charity' | 'provider';
  text: string;
  timestamp: Date;
}

const MessageSchema = new mongoose.Schema<MessageDocument>({
  sender: { type: String, enum: ['charity', 'provider'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema<ChatDocument>({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [MessageSchema],
  status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
});

export const Chat = mongoose.models.Chat || mongoose.model<ChatDocument>('Chat', ChatSchema);

// Connect to MongoDB
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    });
    console.log('MongoDB connected');
    await Chat.collection.createIndex({ providerId: 1, charityId: 1, updatedAt: -1 });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};