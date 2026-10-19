import { z } from 'zod';

export const createBookingSchema = z.object({
  rideId: z.string().min(1, 'Ride ID is required'),
  requestedSeats: z.number().int().min(1, 'Must request at least 1 seat').max(8),
  pickupLocation: z.string().trim().optional().default(''),
  dropLocation: z.string().trim().optional().default(''),
  idempotencyKey: z.string().optional(),
});

export const respondBookingSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().trim().max(300).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});
