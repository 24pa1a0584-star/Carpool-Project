import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { Ride } from '../models/Ride';
import { PlatformSettings } from '../models/PlatformSettings';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';

export const seedDatabase = async (): Promise<void> => {
  await connectDB();
  console.log('🌱 Starting RouteBloom sample data seeding...');

  // Ensure settings exist
  await PlatformSettings.findOneAndUpdate(
    {},
    {
      appName: 'RouteBloom',
      maintenanceMode: false,
      allowInstantBooking: true,
      platformFeePercentage: 0,
      contactEmail: 'support@routebloom.com',
    },
    { upsert: true }
  );

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('RouteBloom@123', salt);

  // Sample verified community drivers in AP & Telangana
  const sampleUsers = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      passwordHash,
      role: 'user' as const,
      phone: '+91 98480 12345',
      bio: 'Software engineer traveling weekly from Vijayawada to Hyderabad. Love classical Telugu music and chill rides!',
      city: 'Vijayawada',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      preferences: { smoking: false, music: true, pets: false, ac: true, ladiesOnly: false, chatter: 'moderate' as const },
      stats: { ridesOffered: 14, ridesTaken: 22, rating: 4.9, reviewCount: 18 },
      isDriver: true,
    },
    {
      name: 'Ravi Teja Varma',
      email: 'ravi.varma@example.com',
      passwordHash,
      role: 'user' as const,
      phone: '+91 94401 56789',
      bio: 'Daily commuter between Bhimavaram and Rajahmundry. Quiet driving style, spacious sedan.',
      city: 'Bhimavaram',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      preferences: { smoking: false, music: false, pets: false, ac: true, ladiesOnly: false, chatter: 'quiet' as const },
      stats: { ridesOffered: 28, ridesTaken: 5, rating: 4.8, reviewCount: 24 },
      isDriver: true,
    },
    {
      name: 'Dr. Ananya Reddy',
      email: 'ananya.reddy@example.com',
      passwordHash,
      role: 'user' as const,
      phone: '+91 98492 88812',
      bio: 'Healthcare professional heading to Visakhapatnam on weekends. Safe, punctual, and female passengers welcome.',
      city: 'Rajahmundry',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      preferences: { smoking: false, music: true, pets: false, ac: true, ladiesOnly: true, chatter: 'moderate' as const },
      stats: { ridesOffered: 9, ridesTaken: 12, rating: 5.0, reviewCount: 9 },
      isDriver: true,
    },
    {
      name: 'Kiran Kumar',
      email: 'kiran.kumar@example.com',
      passwordHash,
      role: 'user' as const,
      phone: '+91 99887 76655',
      bio: 'Tech lead driving between Guntur and Hyderabad IT corridor. EV car, zero emissions!',
      city: 'Guntur',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      preferences: { smoking: false, music: true, pets: true, ac: true, ladiesOnly: false, chatter: 'talkative' as const },
      stats: { ridesOffered: 42, ridesTaken: 15, rating: 4.95, reviewCount: 38 },
      isDriver: true,
    },
    {
      name: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      passwordHash,
      role: 'user' as const,
      phone: '+91 97012 34567',
      bio: 'Student at SRKR College Bhimavaram traveling to Vijayawada on weekends.',
      city: 'Bhimavaram',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      preferences: { smoking: false, music: true, pets: false, ac: true, ladiesOnly: true, chatter: 'moderate' as const },
      stats: { ridesOffered: 0, ridesTaken: 8, rating: 5.0, reviewCount: 7 },
      isDriver: false,
    },
  ];

  for (const u of sampleUsers) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const createdUser = await User.create(u);

      // Create vehicle if driver
      if (createdUser.isDriver) {
        let vehicleData: {
          ownerId: any;
          make: string;
          model: string;
          year: number;
          colour: string;
          plateNumber: string;
          vehicleType: 'sedan' | 'hatchback' | 'suv' | 'ev' | 'motorcycle';
          seatingCapacity: number;
        } = {
          ownerId: createdUser._id,
          make: 'Tata',
          model: 'Nexon EV',
          year: 2023,
          colour: 'Teal Blue',
          plateNumber: 'AP 39 EV 2024',
          vehicleType: 'ev',
          seatingCapacity: 4,
        };

        if (createdUser.name.includes('Ravi')) {
          vehicleData = {
            ownerId: createdUser._id,
            make: 'Hyundai',
            model: 'Verna Sedan',
            year: 2022,
            colour: 'Starry Night Black',
            plateNumber: 'AP 37 BK 5521',
            vehicleType: 'sedan' as const,
            seatingCapacity: 4,
          };
        } else if (createdUser.name.includes('Ananya')) {
          vehicleData = {
            ownerId: createdUser._id,
            make: 'Maruti Suzuki',
            model: 'Brezza SUV',
            year: 2024,
            colour: 'Pearl Arctic White',
            plateNumber: 'AP 05 RT 8812',
            vehicleType: 'suv' as const,
            seatingCapacity: 4,
          };
        }

        const vehicle = await Vehicle.create(vehicleData);

        // Schedule realistic future rides
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        tomorrow.setHours(7, 30, 0, 0);

        const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        dayAfter.setHours(16, 0, 0, 0);

        const threeDaysLater = new Date(now.getTime() + 72 * 60 * 60 * 1000);
        threeDaysLater.setHours(6, 0, 0, 0);

        if (createdUser.name.includes('Priya')) {
          await Ride.create({
            driverId: createdUser._id,
            vehicleId: vehicle._id,
            origin: {
              name: 'Benz Circle',
              city: 'Vijayawada',
              address: 'Near Trendset Mall, Benz Circle, Vijayawada',
              coordinates: [80.648, 16.506],
            },
            destination: {
              name: 'Gachibowli ORR Junction',
              city: 'Hyderabad',
              address: 'Near DLF Cybercity, Gachibowli, Hyderabad',
              coordinates: [78.36, 17.44],
            },
            intermediateStops: [
              { name: 'Suryapet Highway Food Court', city: 'Suryapet', order: 1, coordinates: [79.62, 17.14] },
            ],
            departureAt: tomorrow,
            estimatedArrivalAt: new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000),
            totalPassengerSeats: 3,
            availableSeats: 3,
            contributionPerSeat: 550,
            bookingMode: 'instant',
            preferences: { ac: true, luggage: 'medium', music: true, smoking: false, ladiesOnly: false },
            notes: 'Spacious boot space. Stopping 20 minutes at 7 Hills Suryapet for breakfast. Fastag onboard.',
          });
        } else if (createdUser.name.includes('Ravi')) {
          await Ride.create({
            driverId: createdUser._id,
            vehicleId: vehicle._id,
            origin: {
              name: 'SRKR Engineering College',
              city: 'Bhimavaram',
              address: 'Chinna Amiram, Bhimavaram',
              coordinates: [81.52, 16.54],
            },
            destination: {
              name: 'Morampudi Junction',
              city: 'Rajahmundry',
              address: 'NH16 Bypass, Rajahmundry',
              coordinates: [81.78, 17.0],
            },
            intermediateStops: [
              { name: 'Tanuku Flyover', city: 'Tanuku', order: 1, coordinates: [81.68, 16.75] },
            ],
            departureAt: dayAfter,
            estimatedArrivalAt: new Date(dayAfter.getTime() + 2 * 60 * 60 * 1000),
            totalPassengerSeats: 3,
            availableSeats: 2,
            contributionPerSeat: 220,
            bookingMode: 'approval_required',
            preferences: { ac: true, luggage: 'small', music: false, smoking: false, ladiesOnly: false },
            notes: 'Smooth highway drive. Leaving on time at 4:00 PM sharp.',
          });
        } else if (createdUser.name.includes('Ananya')) {
          await Ride.create({
            driverId: createdUser._id,
            vehicleId: vehicle._id,
            origin: {
              name: 'Kotipalli Bus Stand',
              city: 'Rajahmundry',
              address: 'Kotipalli, Rajahmundry',
              coordinates: [81.78, 16.98],
            },
            destination: {
              name: 'Maddilapalem Junction',
              city: 'Visakhapatnam',
              address: 'Near AU Campus, Maddilapalem, Vizag',
              coordinates: [83.31, 17.72],
            },
            intermediateStops: [
              { name: 'Annavaram Temple Ghat', city: 'Annavaram', order: 1, coordinates: [82.4, 17.28] },
            ],
            departureAt: threeDaysLater,
            estimatedArrivalAt: new Date(threeDaysLater.getTime() + 4 * 60 * 60 * 1000),
            totalPassengerSeats: 3,
            availableSeats: 3,
            contributionPerSeat: 420,
            bookingMode: 'approval_required',
            preferences: { ac: true, luggage: 'medium', music: true, smoking: false, ladiesOnly: true },
            notes: 'Ladies-only ride. Peaceful morning journey with safe driving and pleasant conversation.',
          });
        }
      }
    }
  }

  console.log('✅ RouteBloom sample data seeded successfully!');
  await disconnectDB();
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
