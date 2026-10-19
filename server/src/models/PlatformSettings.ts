import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformSettings extends Document {
  appName: string;
  maintenanceMode: boolean;
  allowInstantBooking: boolean;
  platformFeePercentage: number;
  contactEmail: string;
  updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    appName: {
      type: String,
      default: 'RouteBloom',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowInstantBooking: {
      type: Boolean,
      default: true,
    },
    platformFeePercentage: {
      type: Number,
      default: 0, // Free community cost sharing
    },
    contactEmail: {
      type: String,
      default: 'support@routebloom.com',
    },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettings = mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);
