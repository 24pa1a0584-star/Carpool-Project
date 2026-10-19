import { Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { Ride } from '../models/Ride';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { Conversation } from '../models/Conversation';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  createBookingSchema,
  respondBookingSchema,
  cancelBookingSchema,
} from '../validators/bookingValidators';

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validated = createBookingSchema.parse(req.body);

    // Find the ride
    const ride = await Ride.findById(validated.rideId);
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found.' });
      return;
    }

    // 1. Strict Rule: Driver cannot book own ride
    if (ride.driverId.toString() === req.user._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You cannot book seats on a ride that you are driving.',
      });
      return;
    }

    // 2. Strict Rule: Ride must be in SCHEDULED status
    if (ride.status !== 'SCHEDULED') {
      res.status(400).json({
        success: false,
        message: `This ride is ${ride.status.toLowerCase()} and no longer accepting reservations.`,
      });
      return;
    }

    // 3. Strict Rule: Departure must be in the future
    if (new Date(ride.departureAt) <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'This ride has already departed.',
      });
      return;
    }

    // 4. Strict Rule: Prevent duplicate active bookings for the same user and ride
    const existingActiveBooking = await Booking.findOne({
      rideId: ride._id,
      passengerId: req.user._id,
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    });

    if (existingActiveBooking) {
      res.status(400).json({
        success: false,
        message: `You already have an active booking (${existingActiveBooking.status}) for this ride.`,
      });
      return;
    }

    // 5. Check if requested seats exceed remaining capacity
    if (ride.availableSeats < validated.requestedSeats) {
      res.status(400).json({
        success: false,
        message: `Only ${ride.availableSeats} seat(s) available. You requested ${validated.requestedSeats}.`,
      });
      return;
    }

    // Calculate total contribution on server side (never trust frontend contribution value)
    const totalContribution = ride.contributionPerSeat * validated.requestedSeats;

    // Handle Instant Booking vs Approval Required
    if (ride.bookingMode === 'instant') {
      // Atomic conditional update for last seat race-condition safety
      const updatedRide = await Ride.findOneAndUpdate(
        {
          _id: ride._id,
          status: 'SCHEDULED',
          availableSeats: { $gte: validated.requestedSeats },
        },
        {
          $inc: { availableSeats: -validated.requestedSeats },
        },
        { new: true }
      );

      if (!updatedRide) {
        res.status(409).json({
          success: false,
          message: 'Unable to reserve seats. The remaining seats were just booked by another commuter.',
        });
        return;
      }

      // Create confirmed booking
      const booking = await Booking.create({
        rideId: ride._id,
        passengerId: req.user._id,
        driverId: ride.driverId,
        requestedSeats: validated.requestedSeats,
        totalContribution,
        status: 'CONFIRMED',
        pickupLocation: validated.pickupLocation,
        dropLocation: validated.dropLocation,
        statusHistory: [
          {
            status: 'CONFIRMED',
            changedAt: new Date(),
            changedBy: req.user._id,
            reason: 'Instant booking confirmed.',
          },
        ],
        idempotencyKey: validated.idempotencyKey,
      });

      // Ensure conversation exists between driver and passenger
      const existingConvo = await Conversation.findOne({
        rideId: ride._id,
        participants: { $all: [ride.driverId, req.user._id] },
      });
      if (!existingConvo) {
        await Conversation.create({
          rideId: ride._id,
          bookingId: booking._id,
          participants: [ride.driverId, req.user._id],
          lastMessage: `Seat reserved (${validated.requestedSeats} seats)`,
          lastMessageAt: new Date(),
        });
      }

      // Notify driver of confirmed booking
      await Notification.create({
        recipientId: ride.driverId,
        type: 'BOOKING_ACCEPTED',
        title: 'New Confirmed Booking',
        body: `${req.user.name} instantly booked ${validated.requestedSeats} seat(s) on your trip from ${ride.origin.city} to ${ride.destination.city}.`,
        data: { rideId: ride._id, bookingId: booking._id },
      });

      res.status(201).json({
        success: true,
        message: 'Seats booked instantly! Your journey is confirmed.',
        booking,
        availableSeats: updatedRide.availableSeats,
      });
    } else {
      // Approval-required booking
      const booking = await Booking.create({
        rideId: ride._id,
        passengerId: req.user._id,
        driverId: ride.driverId,
        requestedSeats: validated.requestedSeats,
        totalContribution,
        status: 'REQUESTED',
        pickupLocation: validated.pickupLocation,
        dropLocation: validated.dropLocation,
        statusHistory: [
          {
            status: 'REQUESTED',
            changedAt: new Date(),
            changedBy: req.user._id,
            reason: 'Booking request submitted to driver.',
          },
        ],
        idempotencyKey: validated.idempotencyKey,
      });

      // Notify driver of pending request
      await Notification.create({
        recipientId: ride.driverId,
        type: 'BOOKING_REQUESTED',
        title: 'New Seat Request',
        body: `${req.user.name} requested ${validated.requestedSeats} seat(s) on your ride to ${ride.destination.city}. Please review.`,
        data: { rideId: ride._id, bookingId: booking._id },
      });

      res.status(201).json({
        success: true,
        message: 'Seat request sent to the driver for approval.',
        booking,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const respondToBooking = async (
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
    const validated = respondBookingSchema.parse(req.body);

    const booking = await Booking.findById(id).populate('rideId');
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking request not found.' });
      return;
    }

    // Only driver of this ride or admin can respond
    if (booking.driverId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this booking request.',
      });
      return;
    }

    if (booking.status !== 'REQUESTED') {
      res.status(400).json({
        success: false,
        message: `This booking is already in ${booking.status} state.`,
      });
      return;
    }

    const ride = booking.rideId as any;

    if (validated.action === 'accept') {
      // Atomically decrement seats to handle race condition where last seat is taken
      const updatedRide = await Ride.findOneAndUpdate(
        {
          _id: ride._id,
          status: 'SCHEDULED',
          availableSeats: { $gte: booking.requestedSeats },
        },
        {
          $inc: { availableSeats: -booking.requestedSeats },
        },
        { new: true }
      );

      if (!updatedRide) {
        res.status(409).json({
          success: false,
          message: 'Insufficient seats remaining on this ride to accept this request.',
        });
        return;
      }

      booking.status = 'CONFIRMED';
      booking.statusHistory.push({
        status: 'CONFIRMED',
        changedAt: new Date(),
        changedBy: req.user._id,
        reason: validated.reason || 'Driver accepted your booking request.',
      });
      await booking.save();

      // Create or update conversation
      const existingConvo = await Conversation.findOne({
        rideId: ride._id,
        participants: { $all: [booking.driverId, booking.passengerId] },
      });
      if (!existingConvo) {
        await Conversation.create({
          rideId: ride._id,
          bookingId: booking._id,
          participants: [booking.driverId, booking.passengerId],
          lastMessage: `Booking accepted for ${booking.requestedSeats} seat(s)`,
          lastMessageAt: new Date(),
        });
      }

      // Notify passenger
      await Notification.create({
        recipientId: booking.passengerId,
        type: 'BOOKING_ACCEPTED',
        title: 'Booking Approved!',
        body: `Your request for ${booking.requestedSeats} seat(s) to ${ride.destination.city} was accepted!`,
        data: { rideId: ride._id, bookingId: booking._id },
      });

      res.status(200).json({
        success: true,
        message: 'Booking request accepted and seats reserved.',
        booking,
        availableSeats: updatedRide.availableSeats,
      });
    } else {
      // Driver rejects request
      booking.status = 'REJECTED';
      booking.statusHistory.push({
        status: 'REJECTED',
        changedAt: new Date(),
        changedBy: req.user._id,
        reason: validated.reason || 'Driver declined your booking request.',
      });
      await booking.save();

      // Notify passenger
      await Notification.create({
        recipientId: booking.passengerId,
        type: 'BOOKING_REJECTED',
        title: 'Booking Request Declined',
        body: `Unfortunately, the driver was unable to accept your request for the ride to ${ride.destination.city}.`,
        data: { rideId: ride._id, bookingId: booking._id },
      });

      res.status(200).json({
        success: true,
        message: 'Booking request rejected.',
        booking,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
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
    const validated = cancelBookingSchema.parse(req.body);

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Only passenger, driver, or admin can cancel
    const isPassenger = booking.passengerId.toString() === req.user._id.toString();
    const isDriver = booking.driverId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPassenger && !isDriver && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
      });
      return;
    }

    // Strict Rule: If already cancelled or completed, disallow
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED' || booking.status === 'REJECTED') {
      res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status.toLowerCase()}.`,
      });
      return;
    }

    const previousStatus = booking.status;

    // Atomically update booking status to CANCELLED
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: previousStatus, // ensures state hasn't changed concurrently
      },
      {
        $set: { status: 'CANCELLED' },
        $push: {
          statusHistory: {
            status: 'CANCELLED',
            changedAt: new Date(),
            changedBy: req.user._id,
            reason: validated.reason || (isPassenger ? 'Passenger cancelled.' : 'Driver cancelled.'),
          },
        },
      },
      { new: true }
    );

    if (!updatedBooking) {
      res.status(409).json({
        success: false,
        message: 'The booking state changed before cancellation could be completed. Please refresh.',
      });
      return;
    }

    // Strict Rule: Restore seats exactly once IF AND ONLY IF booking was CONFIRMED
    let restoredSeats = 0;
    if (previousStatus === 'CONFIRMED') {
      await Ride.findByIdAndUpdate(booking.rideId, {
        $inc: { availableSeats: booking.requestedSeats },
      });
      restoredSeats = booking.requestedSeats;
    }

    // Notify counterpart
    const notifyRecipientId = isPassenger ? booking.driverId : booking.passengerId;
    await Notification.create({
      recipientId: notifyRecipientId,
      type: 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      body: isPassenger
        ? `Passenger cancelled their reservation (${booking.requestedSeats} seat(s)). Seats have been restored.`
        : `Your ride reservation was cancelled by the driver.`,
      data: { rideId: booking.rideId, bookingId: booking._id },
    });

    res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled.',
      booking: updatedBooking,
      restoredSeats,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const bookings = await Booking.find({ passengerId: req.user._id })
      .populate({
        path: 'rideId',
        populate: [
          { path: 'driverId', select: 'name avatar stats phone city' },
          { path: 'vehicleId' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const bookings = await Booking.find({ driverId: req.user._id })
      .populate('passengerId', 'name avatar stats city phone')
      .populate('rideId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const completeRide = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found.' });
      return;
    }

    if (ride.driverId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only the driver can complete this trip.',
      });
      return;
    }

    ride.status = 'COMPLETED';
    await ride.save();

    // Mark confirmed bookings as COMPLETED and increment passenger ridesTaken stats
    const confirmedBookings = await Booking.find({
      rideId: ride._id,
      status: 'CONFIRMED',
    });

    for (const b of confirmedBookings) {
      b.status = 'COMPLETED';
      b.statusHistory.push({
        status: 'COMPLETED',
        changedAt: new Date(),
        changedBy: req.user._id,
        reason: 'Trip marked as completed by driver.',
      });
      await b.save();

      await User.findByIdAndUpdate(b.passengerId, {
        $inc: { 'stats.ridesTaken': 1 },
      });

      await Notification.create({
        recipientId: b.passengerId,
        type: 'TRIP_COMPLETED',
        title: 'Trip Completed!',
        body: `You arrived at ${ride.destination.city}! How was your journey? Leave a review for your driver.`,
        data: { rideId: ride._id, bookingId: b._id },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trip completed! All passenger bookings have been marked as completed.',
      ride,
    });
  } catch (error) {
    next(error);
  }
};
