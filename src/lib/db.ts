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
  isOnline: boolean;
  lastSeen: Date;
}

const UserSchema = new mongoose.Schema<UserDocument>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: (v: string) => /\S+@\S+\.\S+/.test(v),
      message: (props: any) => `${props.value} is not a valid email!`
    }
  },
  password: { type: String, required: true },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    validate: {
      validator: (v: string) => /^\d{10}$/.test(v),
      message: (props: any) => `${props.value} is not a valid phone number!`
    }
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'],
    minlength: [10, 'Address should be at least 10 characters']
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  role: { type: String, enum: ['provider', 'charity'], required: true },
  organizationName: { type: String },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
});

UserSchema.virtual('location').get(function() {
  return {
    type: 'Point',
    coordinates: [this.coordinates.lng, this.coordinates.lat]
  };
});

// Enable virtuals in queries
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

// Food Schema
interface FoodDocument extends mongoose.Document {
  foodName: string;
  foodCategory: string;
  quantity: number;
  quantityUnit: string;
  imageUrl?: string;
  status: 'available' | 'pending' | 'picked_up';
  pickupLocation: string;
  pricingType: 'free' | 'paid';
  price?: number;
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
  quantity: { type: Number, required: true },
  quantityUnit: { type: String, required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['available', 'pending', 'picked_up'], default: 'available' },
  pickupLocation: { type: String, required: true },
  pricingType: {
    type: String,
    enum: ['free', 'paid'],
    required: true,
    default: 'free'
  },
  price: {
    type: Number,
    required: function() {
      return this.pricingType === 'paid';
    },
    min: 0
  },
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


// Notification Schema
interface NotificationDocument extends mongoose.Document {
  charity?: mongoose.Types.ObjectId;  // Changed to optional
  provider?: mongoose.Types.ObjectId;
  message: string;
  food: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  type: 'request' | 'general';
  status: 'pending' | 'confirmed' | 'rejected';
  reason?: string;
}

const NotificationSchema = new mongoose.Schema<NotificationDocument>({
  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  provider: {  // Added provider field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: { type: String, required: true },
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  type: { 
    type: String, 
    enum: ['request', 'general'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected'], 
    default: 'pending' 
  },
  reason: { type: String },
});

export const Notification = mongoose.models.Notification || 
  mongoose.model<NotificationDocument>('Notification', NotificationSchema);

  // Add to lib/db.ts
interface ReviewDocument extends mongoose.Document {
  providerId: mongoose.Types.ObjectId;
  charityId: mongoose.Types.ObjectId;
  foodId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new mongoose.Schema<ReviewDocument>({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Review = mongoose.models.Review || 
  mongoose.model<ReviewDocument>('Review', ReviewSchema);

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
    await User.collection.createIndex({ location: "2dsphere" });
    console.log('MongoDB connected');
    await Chat.collection.createIndex({ providerId: 1, charityId: 1, updatedAt: -1 });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};