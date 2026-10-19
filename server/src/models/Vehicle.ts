import mongoose, { Schema, Types } from 'mongoose';

export interface IVehicle {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  make: string;
  model: string;
  year: number;
  colour: string;
  plateNumber: string;
  vehicleType: 'sedan' | 'hatchback' | 'suv' | 'ev' | 'motorcycle';
  seatingCapacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required (e.g., Hyundai, Tata)'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required (e.g., i20, Nexon)'],
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2005,
      max: new Date().getFullYear() + 1,
    },
    colour: {
      type: String,
      required: true,
      trim: true,
    },
    plateNumber: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['sedan', 'hatchback', 'suv', 'ev', 'motorcycle'],
      default: 'sedan',
    },
    seatingCapacity: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
