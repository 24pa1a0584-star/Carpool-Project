import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Ride } from '../models/Ride';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const createReviewSchema = z.object({
  rideId: z.string().min(1),
  recipientId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(2, 'Review comment must be at least 2 characters').max(500),
});

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validated = createReviewSchema.parse(req.body);

    if (validated.recipientId === req.user._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You cannot review yourself.',
      });
      return;
    }

    const ride = await Ride.findById(validated.rideId);
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found.' });
      return;
    }

    // Verify ride was completed or departed
    if (ride.status !== 'COMPLETED' && new Date(ride.departureAt) > new Date()) {
      res.status(400).json({
        success: false,
        message: 'You can only review participants after the trip has departed or completed.',
      });
      return;
    }

    // Check relationship
    const isDriver = ride.driverId.toString() === req.user._id.toString();
    if (isDriver) {
      // Driver reviewing passenger: check passenger had booking
      const booking = await Booking.findOne({
        rideId: ride._id,
        passengerId: validated.recipientId,
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
      });
      if (!booking) {
        res.status(400).json({
          success: false,
          message: 'This user was not a confirmed passenger on this ride.',
        });
        return;
      }
    } else {
      // Passenger reviewing driver: verify passenger had confirmed booking
      const booking = await Booking.findOne({
        rideId: ride._id,
        passengerId: req.user._id,
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
      });
      if (!booking || ride.driverId.toString() !== validated.recipientId) {
        res.status(400).json({
          success: false,
          message: 'You were not a confirmed passenger on this driver’s ride.',
        });
        return;
      }
    }

    // Check if review already exists
    const existing = await Review.findOne({
      authorId: req.user._id,
      recipientId: validated.recipientId,
      rideId: ride._id,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this journey.',
      });
      return;
    }

    const review = await Review.create({
      authorId: req.user._id,
      recipientId: validated.recipientId,
      rideId: ride._id,
      rating: validated.rating,
      comment: validated.comment,
      role: isDriver ? 'driver' : 'passenger',
    });

    // Recalculate recipient rating
    const allReviews = await Review.find({ recipientId: validated.recipientId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(validated.recipientId, {
      $set: {
        'stats.rating': parseFloat(avgRating.toFixed(1)),
        'stats.reviewCount': allReviews.length,
      },
    });

    await review.populate('authorId', 'name avatar city');

    res.status(201).json({
      success: true,
      message: 'Thank you for submitting your review!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ recipientId: userId })
      .populate('authorId', 'name avatar city')
      .populate('rideId', 'origin destination departureAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
