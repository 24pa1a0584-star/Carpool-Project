import { Request, Response, NextFunction } from 'express';
import { Ride } from '../models/Ride';
import { Vehicle } from '../models/Vehicle';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';
import { createRideSchema, searchRidesSchema } from '../validators/rideValidators';

export const createRide = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validated = createRideSchema.parse(req.body);

    // Ensure departure is in the future
    if (new Date(validated.departureAt) <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Departure time must be in the future.',
      });
      return;
    }

    // Handle vehicle creation or linking
    let vehicleId = undefined;
    if (validated.vehicleDetails) {
      const vehicle = await Vehicle.create({
        ownerId: req.user._id,
        make: validated.vehicleDetails.make,
        model: validated.vehicleDetails.model,
        year: validated.vehicleDetails.year,
        colour: validated.vehicleDetails.colour,
        plateNumber: validated.vehicleDetails.plateNumber,
        vehicleType: validated.vehicleDetails.vehicleType,
        seatingCapacity: validated.totalPassengerSeats + 1, // driver + passenger seats
      });
      vehicleId = vehicle._id;
    } else {
      // Find latest vehicle owned by user
      const existingVehicle = await Vehicle.findOne({ ownerId: req.user._id });
      if (existingVehicle) {
        vehicleId = existingVehicle._id;
      }
    }

    const ride = await Ride.create({
      driverId: req.user._id,
      vehicleId,
      origin: validated.origin,
      destination: validated.destination,
      intermediateStops: validated.intermediateStops,
      departureAt: validated.departureAt,
      estimatedArrivalAt: validated.estimatedArrivalAt,
      totalPassengerSeats: validated.totalPassengerSeats,
      availableSeats: validated.totalPassengerSeats,
      contributionPerSeat: validated.contributionPerSeat,
      bookingMode: validated.bookingMode,
      preferences: validated.preferences,
      notes: validated.notes,
      status: 'SCHEDULED',
    });

    // Mark user as driver and increment stats
    await User.findByIdAndUpdate(req.user._id, {
      $set: { isDriver: true },
      $inc: { 'stats.ridesOffered': 1 },
    });

    await ride.populate('driverId', 'name avatar stats city');
    if (vehicleId) {
      await ride.populate('vehicleId');
    }

    res.status(201).json({
      success: true,
      message: 'Your ride has been successfully published on RouteBloom!',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const searchRides = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = searchRidesSchema.parse(req.query);

    const filter: Record<string, any> = {
      status: 'SCHEDULED',
      availableSeats: { $gte: query.seats },
    };

    // Filter by origin city
    if (query.origin) {
      filter['origin.city'] = { $regex: new RegExp(query.origin.trim(), 'i') };
    }

    // Filter by destination city
    if (query.destination) {
      filter['destination.city'] = { $regex: new RegExp(query.destination.trim(), 'i') };
    }

    // Filter by date
    if (query.date) {
      const searchDate = new Date(query.date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.departureAt = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // By default show upcoming rides
      filter.departureAt = { $gte: new Date(Date.now() - 30 * 60 * 1000) }; // up to 30 mins ago
    }

    // Filter by maximum price
    if (query.maxPrice !== undefined) {
      filter.contributionPerSeat = { $lte: query.maxPrice };
    }

    // Preferences filter
    if (query.acOnly) {
      filter['preferences.ac'] = true;
    }
    if (query.ladiesOnly) {
      filter['preferences.ladiesOnly'] = true;
    }
    if (query.instantOnly) {
      filter.bookingMode = 'instant';
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { departureAt: 1 };
    if (query.sortBy === 'price_asc') {
      sortOptions = { contributionPerSeat: 1 };
    } else if (query.sortBy === 'price_desc') {
      sortOptions = { contributionPerSeat: -1 };
    } else if (query.sortBy === 'seats') {
      sortOptions = { availableSeats: -1 };
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate('driverId', 'name avatar stats city')
        .populate('vehicleId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Ride.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: rides,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRideById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id)
      .populate('driverId', 'name avatar stats city bio preferences createdAt')
      .populate('vehicleId');

    if (!ride) {
      res.status(404).json({
        success: false,
        message: 'Ride listing not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRide = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const ride = await Ride.findById(id);

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    if (ride.driverId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You can only update rides that you published.',
      });
      return;
    }

    if (ride.status !== 'SCHEDULED') {
      res.status(400).json({
        success: false,
        message: `Cannot update a ride that is already ${ride.status}.`,
      });
      return;
    }

    // Allow updating notes, preferences, departure time
    const allowedUpdates = ['notes', 'preferences', 'departureAt', 'estimatedArrivalAt', 'bookingMode'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        (ride as any)[key] = req.body[key];
      }
    }

    await ride.save();

    res.status(200).json({
      success: true,
      message: 'Ride details updated successfully.',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRide = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const ride = await Ride.findById(id);

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    if (ride.driverId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this ride.',
      });
      return;
    }

    if (ride.status === 'CANCELLED') {
      res.status(400).json({
        success: false,
        message: 'This ride has already been cancelled.',
      });
      return;
    }

    ride.status = 'CANCELLED';
    await ride.save();

    // Cancel all active bookings and notify passengers
    const activeBookings = await Booking.find({
      rideId: ride._id,
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    });

    for (const booking of activeBookings) {
      booking.status = 'CANCELLED';
      booking.statusHistory.push({
        status: 'CANCELLED',
        changedAt: new Date(),
        changedBy: req.user._id,
        reason: req.body.reason || 'Ride cancelled by driver.',
      });
      await booking.save();

      // Send notification to passenger
      await Notification.create({
        recipientId: booking.passengerId,
        type: 'RIDE_CANCELLED',
        title: 'Ride Cancelled',
        body: `The ride from ${ride.origin.city} to ${ride.destination.city} was cancelled by the driver.`,
        data: { rideId: ride._id, bookingId: booking._id },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ride successfully cancelled. All booked passengers have been notified.',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOfferedRides = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const rides = await Ride.find({ driverId: req.user._id })
      .populate('vehicleId')
      .sort({ departureAt: -1 });

    res.status(200).json({
      success: true,
      rides,
    });
  } catch (error) {
    next(error);
  }
};
