import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReport extends Document {
  _id: Types.ObjectId;
  reporterId: Types.ObjectId;
  reportedUserId?: Types.ObjectId;
  reportedRideId?: Types.ObjectId;
  category: 'safety' | 'inappropriate_behaviour' | 'no_show' | 'pricing_fraud' | 'spam' | 'other';
  explanation: string;
  status: 'pending' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reportedRideId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride',
      index: true,
    },
    category: {
      type: String,
      enum: ['safety', 'inappropriate_behaviour', 'no_show', 'pricing_fraud', 'spam', 'other'],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReport>('Report', reportSchema);
