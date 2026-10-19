import mongoose, { Document, Schema, Types } from 'mongoose';

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface IBookingStatusHistory {
  status: BookingStatus;
  changedAt: Date;
  changedBy: Types.ObjectId;
  reason?: string;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  rideId: Types.ObjectId;
  passengerId: Types.ObjectId;
  driverId: Types.ObjectId;
  requestedSeats: number;
  totalContribution: number;
  status: BookingStatus;
  pickupLocation: string;
  dropLocation: string;
  statusHistory: IBookingStatusHistory[];
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    passengerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    totalContribution: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
      default: 'REQUESTED',
      index: true,
    },
    pickupLocation: {
      type: String,
      default: '',
      trim: true,
    },
    dropLocation: {
      type: String,
      default: '',
      trim: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['REQUESTED', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
          required: true,
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, default: '' },
      },
    ],
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent active duplicate bookings for same passenger and same ride
bookingSchema.index(
  { rideId: 1, passengerId: 1 },
  {
    partialFilterExpression: {
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    },
  }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
