import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserPreferences {
  smoking: boolean;
  music: boolean;
  pets: boolean;
  ac: boolean;
  ladiesOnly: boolean;
  chatter: 'quiet' | 'moderate' | 'talkative';
}

export interface IUserStats {
  ridesOffered: number;
  ridesTaken: number;
  rating: number;
  reviewCount: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatar: string;
  phone?: string;
  bio?: string;
  city?: string;
  status: 'active' | 'suspended';
  preferences: IUserPreferences;
  stats: IUserStats;
  isDriver: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 300,
      default: 'Happy traveler sharing rides on RouteBloom!',
    },
    city: {
      type: String,
      default: 'Vijayawada',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    preferences: {
      smoking: { type: Boolean, default: false },
      music: { type: Boolean, default: true },
      pets: { type: Boolean, default: false },
      ac: { type: Boolean, default: true },
      ladiesOnly: { type: Boolean, default: false },
      chatter: { type: String, enum: ['quiet', 'moderate', 'talkative'], default: 'moderate' },
    },
    stats: {
      ridesOffered: { type: Number, default: 0 },
      ridesTaken: { type: Number, default: 0 },
      rating: { type: Number, default: 5.0 },
      reviewCount: { type: Number, default: 0 },
    },
    isDriver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
