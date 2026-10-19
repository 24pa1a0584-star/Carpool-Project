import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().trim().min(2, 'Location name is required'),
  city: z.string().trim().min(2, 'City is required'),
  address: z.string().trim().optional().default(''),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
});

export const createRideSchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
  intermediateStops: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        city: z.string().trim().min(1),
        coordinates: z.tuple([z.number(), z.number()]).optional(),
        order: z.number().int().nonnegative(),
      })
    )
    .optional()
    .default([]),
  departureAt: z.string().or(z.date()).transform((val) => new Date(val)),
  estimatedArrivalAt: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  totalPassengerSeats: z.number().int().min(1).max(8),
  contributionPerSeat: z.number().int().min(0, 'Contribution cannot be negative'),
  bookingMode: z.enum(['instant', 'approval_required']).default('approval_required'),
  preferences: z
    .object({
      ac: z.boolean().default(true),
      luggage: z.enum(['small', 'medium', 'large']).default('medium'),
      music: z.boolean().default(true),
      smoking: z.boolean().default(false),
      ladiesOnly: z.boolean().default(false),
    })
    .default({
      ac: true,
      luggage: 'medium',
      music: true,
      smoking: false,
      ladiesOnly: false,
    }),
  notes: z.string().max(500).optional().default(''),
  vehicleDetails: z
    .object({
      make: z.string().trim().min(1),
      model: z.string().trim().min(1),
      year: z.number().int().min(2005).max(new Date().getFullYear() + 1),
      colour: z.string().trim().min(1),
      plateNumber: z.string().trim().min(1),
      vehicleType: z.enum(['sedan', 'hatchback', 'suv', 'ev', 'motorcycle']).default('sedan'),
    })
    .optional(),
});

export const searchRidesSchema = z.object({
  origin: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  date: z.string().trim().optional(),
  seats: z.coerce.number().int().min(1).default(1),
  maxPrice: z.coerce.number().int().optional(),
  acOnly: z.coerce.boolean().optional(),
  ladiesOnly: z.coerce.boolean().optional(),
  instantOnly: z.coerce.boolean().optional(),
  sortBy: z.enum(['departureAt', 'price_asc', 'price_desc', 'seats']).default('departureAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
