import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { initAdmin } from '../src/bootstrap/initAdmin';
import { User } from '../src/models/User';
import { Ride } from '../src/models/Ride';
import { Booking } from '../src/models/Booking';

const TEST_DB_URI = 'mongodb://localhost:27017/routebloom_test';
let app: any;

beforeAll(async () => {
  // Use dedicated test database
  await connectDB(TEST_DB_URI);
  // Clear test DB collections
  await Promise.all([
    User.deleteMany({}),
    Ride.deleteMany({}),
    Booking.deleteMany({}),
  ]);
  app = createApp();
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({}),
    Ride.deleteMany({}),
    Booking.deleteMany({}),
  ]);
  await disconnectDB();
});

describe('RouteBloom Backend Test Suite', () => {
  describe('1. Health & Infrastructure Endpoints', () => {
    it('GET /api/health responds with status ok and uptime', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('RouteBloom Core API');
      expect(res.body.database).toBe('connected');
    });

    it('GET /api/ready responds with ready status', async () => {
      const res = await request(app).get('/api/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
    });

    it('Malformed ObjectId returns 400 Bad Request instead of crashing', async () => {
      const res = await request(app).get('/api/rides/not-a-valid-object-id-12345');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid identifier format');
    });
  });

  describe('2. Idempotent Admin Bootstrap & DB Setup', () => {
    it('initAdmin creates super admin when enabled', async () => {
      await initAdmin();
      const admin = await User.findOne({ role: 'admin' });
      expect(admin).not.toBeNull();
      expect(admin?.role).toBe('admin');
    });

    it('repeated initAdmin preserves existing admin without resetting or throwing', async () => {
      const adminBefore = await User.findOne({ role: 'admin' });
      await initAdmin();
      const adminAfter = await User.findOne({ role: 'admin' });
      expect(adminBefore?._id.toString()).toBe(adminAfter?._id.toString());
    });
  });

  describe('3. Authentication: Register -> Login -> Refresh -> Logout -> Login Again', () => {
    const testUser = {
      name: 'Aditya Varma',
      email: 'aditya.varma@routebloom.test',
      password: 'SecurePassword123!',
      city: 'Bhimavaram',
    };

    let userToken = '';
    let cookie = '';

    it('Registration succeeds, hashes password, sets cookie and returns JWT', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.passwordHash).toBeUndefined(); // Never returned
      expect(res.body.token).toBeDefined();

      const rawCookie = res.headers['set-cookie'];
      expect(rawCookie).toBeDefined();
      cookie = rawCookie[0];
      userToken = res.body.token;
    });

    it('Duplicate registration with same email is rejected (409 Conflict)', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('Login with incorrect password returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me returns authenticated user using cookie or token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('Logout clears auth session', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Login again after logout succeeds and restores session (persistent MongoDB)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
    });
  });

  describe('4. Ride Publishing, Discovery & Booking Engine Workflows', () => {
    let driverToken = '';
    let driverId = '';
    let passengerToken = '';
    let passengerId = '';
    let passenger2Token = '';
    let passenger2Id = '';
    let publishedRideId = '';

    beforeAll(async () => {
      // Create Driver
      const driverRes = await request(app).post('/api/auth/register').send({
        name: 'Suresh Driver',
        email: 'suresh.driver@routebloom.test',
        password: 'DriverPass123!',
        city: 'Vijayawada',
      });
      driverToken = driverRes.body.token;
      driverId = driverRes.body.user._id;

      // Create Passenger 1
      const p1Res = await request(app).post('/api/auth/register').send({
        name: 'Kavitha Passenger',
        email: 'kavitha.passenger@routebloom.test',
        password: 'PassengerPass123!',
        city: 'Hyderabad',
      });
      passengerToken = p1Res.body.token;
      passengerId = p1Res.body.user._id;

      // Create Passenger 2
      const p2Res = await request(app).post('/api/auth/register').send({
        name: 'Manoj Passenger',
        email: 'manoj.passenger@routebloom.test',
        password: 'PassengerPass123!',
        city: 'Hyderabad',
      });
      passenger2Token = p2Res.body.token;
      passenger2Id = p2Res.body.user._id;
    });

    it('Driver publishes a ride with approval required', async () => {
      const departureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days in future
      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          origin: { name: 'Benz Circle', city: 'Vijayawada', address: 'Trendset Mall' },
          destination: { name: 'Gachibowli', city: 'Hyderabad', address: 'DLF Cybercity' },
          departureAt: departureDate.toISOString(),
          totalPassengerSeats: 2, // 2 seats total
          contributionPerSeat: 500,
          bookingMode: 'approval_required',
          preferences: { ac: true, luggage: 'medium', music: true, smoking: false, ladiesOnly: false },
          notes: 'Smooth ride via NH65',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.ride.availableSeats).toBe(2);
      publishedRideId = res.body.ride._id;
    });

    it('Ride appears in public search results', async () => {
      const res = await request(app).get('/api/rides/search?origin=Vijayawada&destination=Hyderabad');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const match = res.body.data.find((r: any) => r._id === publishedRideId);
      expect(match).toBeDefined();
    });

    it('Strict Rule: Driver cannot book their own ride', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          rideId: publishedRideId,
          requestedSeats: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cannot book seats on a ride that you are driving');
    });

    let bookingId = '';

    it('Passenger requests 1 seat on the ride', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId: publishedRideId,
          requestedSeats: 1,
          pickupLocation: 'Benz Circle',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe('REQUESTED');
      bookingId = res.body.booking._id;
    });

    it('Strict Rule: Prevent duplicate active booking request for same passenger', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId: publishedRideId,
          requestedSeats: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already have an active booking');
    });

    it('Driver accepts the booking -> availableSeats decrements from 2 to 1', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/respond`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ action: 'accept' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking.status).toBe('CONFIRMED');
      expect(res.body.availableSeats).toBe(1);

      // Verify ride doc in DB
      const ride = await Ride.findById(publishedRideId);
      expect(ride?.availableSeats).toBe(1);
    });

    it('Race Condition Handling: Passenger 2 requests the remaining 1 seat via instant booking', async () => {
      // Update ride to instant booking to test atomic decrement
      await Ride.findByIdAndUpdate(publishedRideId, { bookingMode: 'instant' });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passenger2Token}`)
        .send({
          rideId: publishedRideId,
          requestedSeats: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.status).toBe('CONFIRMED');
      expect(res.body.availableSeats).toBe(0);

      // Now availableSeats is 0. Attempting to book again MUST be rejected
      const overbookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passengerToken}`) // new request
        .send({
          rideId: publishedRideId,
          requestedSeats: 1,
        });

      // Rejected because seats are 0
      expect(overbookRes.status).toBe(400);
    });

    it('Cancellation restores seats exactly once when CONFIRMED booking is cancelled', async () => {
      // Passenger 1 cancels their confirmed booking
      const cancelRes = await request(app)
        .post(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ reason: 'Trip rescheduled' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.booking.status).toBe('CANCELLED');
      expect(cancelRes.body.restoredSeats).toBe(1);

      // Check ride availableSeats in DB: restored from 0 to 1
      const rideAfterCancel = await Ride.findById(publishedRideId);
      expect(rideAfterCancel?.availableSeats).toBe(1);

      // Repeated cancellation must NOT restore seats a second time!
      const repeatedCancelRes = await request(app)
        .post(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ reason: 'Double click cancel' });

      expect(repeatedCancelRes.status).toBe(400);
      expect(repeatedCancelRes.body.message).toContain('already cancelled');

      // Check ride availableSeats did NOT increment again
      const rideAfterRepeated = await Ride.findById(publishedRideId);
      expect(rideAfterRepeated?.availableSeats).toBe(1);
    });
  });
});
