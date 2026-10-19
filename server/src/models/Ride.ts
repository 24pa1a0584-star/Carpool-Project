import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILocationPoint {
  name: string;
  city: string;
  address: string;
  coordinates?: [number, number]; // [lng, lat]
}

export interface IRidePreferences {
  ac: boolean;
  luggage: 'small' | 'medium' | 'large';
  music: boolean;
  smoking: boolean;
  ladiesOnly: boolean;
}

export interface IRide extends Document {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  vehicleId?: Types.ObjectId;
  origin: ILocationPoint;
  destination: ILocationPoint;
  intermediateStops: Array<{
    name: string;
    city: string;
    coordinates?: [number, number];
    order: number;
  }>;
  departureAt: Date;
  estimatedArrivalAt?: Date;
  totalPassengerSeats: number;
  availableSeats: number;
  contributionPerSeat: number; // in INR
  bookingMode: 'instant' | 'approval_required';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  preferences: IRidePreferences;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationPointSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    address: { type: String, default: '' },
    coordinates: {
      type: [Number], // [lng, lat]
      default: undefined,
    },
  },
  { _id: false }
);

const rideSchema = new Schema<IRide>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    origin: {
      type: locationPointSchema,
      required: true,
    },
    destination: {
      type: locationPointSchema,
      required: true,
    },
    intermediateStops: [
      {
        name: { type: String, required: true },
        city: { type: String, required: true },
        coordinates: [Number],
        order: { type: Number, required: true },
      },
    ],
    departureAt: {
      type: Date,
      required: true,
      index: true,
    },
    estimatedArrivalAt: {
      type: Date,
    },
    totalPassengerSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    contributionPerSeat: {
      type: Number,
      required: true,
      min: 0,
    },
    bookingMode: {
      type: String,
      enum: ['instant', 'approval_required'],
      default: 'approval_required',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    preferences: {
      ac: { type: Boolean, default: true },
      luggage: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      music: { type: Boolean, default: true },
      smoking: { type: Boolean, default: false },
      ladiesOnly: { type: Boolean, default: false },
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast search queries
rideSchema.index({ 'origin.city': 1, 'destination.city': 1, departureAt: 1, status: 1 });
rideSchema.index({ driverId: 1, departureAt: -1 });

export const Ride = mongoose.model<IRide>('Ride', rideSchema);
