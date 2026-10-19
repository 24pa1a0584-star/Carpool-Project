import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Ride } from '../models/Ride';
import { Booking } from '../models/Booking';
import { Report } from '../models/Report';
import { PlatformSettings } from '../models/PlatformSettings';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

export const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalUsers,
      activeDrivers,
      totalRides,
      scheduledRides,
      totalBookings,
      confirmedBookings,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isDriver: true }),
      Ride.countDocuments(),
      Ride.countDocuments({ status: 'SCHEDULED' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['CONFIRMED', 'COMPLETED'] } }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // Calculate approximate passenger savings in INR (₹)
    const bookingsData = await Booking.aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
      { $group: { _id: null, totalRupees: { $sum: '$totalContribution' } } },
    ]);
    const totalCommunityVolume = bookingsData[0]?.totalRupees || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeDrivers,
        totalRides,
        scheduledRides,
        totalBookings,
        confirmedBookings,
        pendingReports,
        totalCommunityVolume,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (status && ['active', 'suspended'].includes(status)) {
      user.status = status;
    }
    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} successfully updated.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getRides = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as string;

    const filter: Record<string, any> = {};
    if (status) {
      filter.status = status;
    }

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate('driverId', 'name email city')
        .populate('vehicleId')
        .sort({ departureAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Ride.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      rides,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRideByAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found.' });
      return;
    }

    ride.status = 'CANCELLED';
    await ride.save();

    // Notify driver
    await Notification.create({
      recipientId: ride.driverId,
      type: 'SYSTEM_ALERT',
      title: 'Ride Moderation Notice',
      body: `Your ride from ${ride.origin.city} to ${ride.destination.city} was cancelled by administrator moderation. Reason: ${reason || 'Community guidelines violation'}.`,
    });

    // Notify booked passengers
    const bookings = await Booking.find({
      rideId: ride._id,
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    });
    for (const b of bookings) {
      b.status = 'CANCELLED';
      await b.save();

      await Notification.create({
        recipientId: b.passengerId,
        type: 'RIDE_CANCELLED',
        title: 'Ride Cancelled by Moderation',
        body: `The ride from ${ride.origin.city} to ${ride.destination.city} has been cancelled by the platform.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ride cancelled and affected users notified.',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('reportedUserId', 'name email')
      .populate('reportedRideId', 'origin destination departureAt status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    if (['resolved', 'dismissed'].includes(status)) {
      report.status = status;
    }
    if (adminNotes !== undefined) {
      report.adminNotes = adminNotes;
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report status updated.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    const { maintenanceMode, allowInstantBooking, contactEmail } = req.body;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowInstantBooking !== undefined) settings.allowInstantBooking = allowInstantBooking;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
