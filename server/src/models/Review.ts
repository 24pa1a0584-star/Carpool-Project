import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  recipientId: Types.ObjectId;
  rideId: Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  role: 'driver' | 'passenger';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rideId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    role: {
      type: String,
      enum: ['driver', 'passenger'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per author per ride for recipient
reviewSchema.index({ authorId: 1, recipientId: 1, rideId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
