# 🌺 RouteBloom — Carpool & Ride Sharing Board
> *"Same direction. Better journey."*

[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20(React%20%7C%20Node%20%7C%20Express%20%7C%20MongoDB)-7046FF.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-19%20Passed%20(Vitest)-brightgreen.svg)](https://vitest.dev)
[![Motion for React](https://img.shields.io/badge/Animations-Motion%20for%20React-FF7049.svg)](https://motion.dev)

A modern, colorful, highly animated, production-oriented full-stack MERN carpool and ride-sharing application designed for students, office commuters, and everyday travelers in India. RouteBloom enables travelers heading in the same direction across key corridors (such as **Vijayawada ↔ Hyderabad**, **Bhimavaram ↔ Rajahmundry**, **Rajahmundry ↔ Visakhapatnam**, and **Guntur ↔ Amaravati**) to share empty seats, split highway fuel and toll costs directly in INR (₹), and travel sustainably.

---

## 📑 Table of Contents
1. [Problem Statement](#-problem-statement)
2. [Main Objectives](#-main-objectives)
3. [Design System & Visual Identity](#-design-system--visual-identity)
4. [Feature Overview](#-feature-overview)
5. [User Roles & Access Control](#-user-roles--access-control)
6. [System Architecture & Data Flow](#-system-architecture--data-flow)
7. [Database Collections & Schemas](#-database-collections--schemas)
8. [Folder & Project Structure](#-folder--project-structure)
9. [Security & Concurrency Safeguards](#-security--concurrency-safeguards)
10. [Local Development & Setup](#-local-development--setup)
11. [Automated Testing & QA Verification](#-automated-testing--qa-verification)
12. [Single-URL Production Deployment (Render + MongoDB Atlas)](#-single-url-production-deployment-render--mongodb-atlas)
13. [Faculty 5-Minute Demonstration Walkthrough](#-faculty-5-minute-demonstration-walkthrough)
14. [Limitations & Future Roadmap](#-limitations--future-roadmap)
15. [Academic & Developer Introduction](#-academic--developer-introduction)

---

## 🎯 Problem Statement
Every day, thousands of passenger vehicles travel along Indian intercity corridors and college routes carrying only a single occupant, with 3 to 4 empty seats. Concurrently, students and office commuters face crowded public buses, surge-priced private taxis, and difficult last-minute scheduling. 

Conventional ride-hailing services impose steep commission markups (25–35%) and are focused on short-distance urban hops rather than intercity carpooling. Existing carpool attempts frequently suffer from outdated, plain administrative interfaces, lack of real-time passenger-driver coordination, race conditions during seat reservations, and unclear safety guidelines for female travelers.

---

## 🚀 Main Objectives
- **Non-Commercial Cost Sharing**: Allow vehicle owners to offset actual highway fuel and toll expenses in Indian Rupees (₹) with zero platform booking commission.
- **Atomic Concurrency Protection**: Prevent overbooking and negative seat availability using MongoDB atomic conditional updates (`availableSeats: { $gte: requestedSeats }`), ensuring race conditions on the last available seat are handled deterministically.
- **Buttery 60 FPS Digital Travel Experience**: Implement an original startup aesthetic featuring custom motion graphics, an animated moving vehicle following curved highway trajectories, floating journey pills, and micro-interactions.
- **Safety & Trust by Design**: Conceal exact residential addresses in public listings (favoring landmark areas like Benz Circle or College Gates), reveal driver/passenger phone contact only upon confirmed reservation, provide Ladies-Only travel filters, and incorporate verified passenger reviews.
- **Real-Time Communication**: Integrate Socket.IO for real-time messaging between confirmed journey participants and instant notification alerts.
- **Production Monorepo & Single-URL Deployment**: Package the entire system with Express serving both `/api/*` and the compiled Vite React SPA from one unified Render web service.

---

## 🎨 Design System & Visual Identity
The visual identity of RouteBloom combines colorful contemporary startup aesthetics, bold editorial typography, and smooth GPU-accelerated motion:

### Color Palette Tokens
| Design Token | Hex Code | Purpose |
|---|---|---|
| **Electric Violet** | `#7046FF` | Primary brand accent, glowing buttons, hero gradients |
| **Sunset Orange** | `#FF7049` | Action buttons, drop-off pins, warm highway highlights |
| **Electric Lime** | `#CCF45B` | Instant booking badges, savings highlights, eco indicators |
| **Aqua Turquoise** | `#2DD4BF` | Trust indicators, AC amenities, positive confirmations |
| **Hot Pink** | `#FF6FAE` | Ladies-Only carpool badges, community delight tags |
| **Deep Midnight Navy** | `#11152C` | Deep high-contrast text and dark card overlays |
| **Warm Ivory** | `#FFF9F2` | Body surface background (soft, warm, paper-like) |
| **Soft Lavender** | `#F1ECFF` | Subtle input and secondary button surfaces |
| **Sky Blue** | `#DDF4FF` | Route pathway and informative notice surfaces |

### Typography Pairing
- **Headings**: `Space Grotesk` (Google Fonts) — Editorial, wide, modern geometry with tight tracking.
- **Body & Forms**: `Plus Jakarta Sans` (Google Fonts) — High legibility, crisp numbers, clean hierarchy.

---

## ✨ Feature Overview

### 1. Interactive Landing Page
- **Cinematic Split Hero**: Animated SVG roadway with moving vehicle following curve trajectory, headlight beam, destination pins, and floating trip badges (`₹550 / seat`, `Verified Commuters`, `Vijayawada → Hyd`).
- **Interactive Ride Search**: Origin, destination, date, seat count, and one-tap quick corridor buttons (`Vijayawada ↔ Hyderabad`, `Bhimavaram ↔ Rajahmundry`, `Rajahmundry ↔ Vizag`, `Guntur ↔ Amaravati`).
- **3-Step Animated Guide**: Clear explanation of publishing, connecting, and cost-sharing.
- **Why RouteBloom**: Value cards for 50% fuel savings, carbon footprint reduction, and verified profiles.
- **Interactive FAQ Accordion**: Expandable answers to carpool rules, ladies-only rides, and cancellation policies.

### 2. Ride Marketplace & Discovery
- Full search with origin/destination city filtering, date matching, seat availability, max price slider, AC toggle, Ladies-Only toggle, and Instant Booking toggle.
- Sort by departure time, price ascending/descending, and seat capacity.
- Beautiful skeleton loading states and responsive empty search states.

### 3. Ride Details & Route Timeline
- Detailed route visualization with intermediate stops, departure date/time, vehicle specifications (make, model, color, masked plate number).
- Driver profile card with rating ★, completed trip count, and travel habits (music, AC, smoking, chatter preference).
- Report Ride listing dialog with moderation escalation categories.

### 4. Driver Ride Publication Wizard
- 6-step guided wizard:
  1. Route (origin & destination cities, pickup/drop landmarks, intermediate stops).
  2. Schedule (departure date & time).
  3. Vehicle (make, model, type, color, plate number, passenger seat count).
  4. Preferences (AC, music, smoking policy, ladies-only toggle, instant booking vs approval).
  5. Contribution (seat contribution in ₹ with fuel offset calculation).
  6. Review & Publish.

### 5. Atomic Booking Lifecycle Engine
- **Instant Booking**: Confirms reservation atomically and decrements available seats. Triggers colorful confetti celebration.
- **Approval-Required Booking**: Sends pending request to driver. Driver accepts (atomically decrementing seats) or rejects.
- **Strict Guardrails**: Driver cannot book own ride; duplicate active requests prohibited; completed or departed rides locked; seat count validated on server.
- **Atomic Cancellation**: Cancelling a confirmed booking restores seats to the ride **exactly once** using conditional status updates.

### 6. Passenger & Driver Consoles
- **Passenger Dashboard**: Upcoming confirmed bookings with driver contact, pending requests with withdrawal option, trip history, and driver review modal.
- **Driver Console**: Incoming passenger requests with 1-click **Accept** and **Reject**, confirmed passenger manifest with phone details, **Complete Trip** button, and **Cancel Ride** action.

### 7. Real-Time Chat & Sockets
- Built on Socket.IO: ride-specific conversations between confirmed participants for coordinating pickup spots.
- Real-time unread badges and notification toasts across the application.

### 8. Super Admin Oversight
- Real-time platform metrics (total users, active drivers, total volume in ₹, scheduled rides).
- User management table with search and 1-click **Suspend / Reactivate** account switches.
- Ride moderation table with administrative cancellation capabilities.
- Safety reports center for reviewing commuter concerns and marking them **Resolved** or **Dismissed**.

---

## 👥 User Roles & Access Control
| Role | Capabilities |
|---|---|
| **Guest** | Browse homepage, search rides, view public ride itineraries, view safety guidelines, register, and log in. |
| **Registered Commuter** | Dual role (can act as passenger and driver):<br/>• **As Passenger**: Request/book seats, view bookings, chat with driver, cancel reservations, submit post-trip reviews.<br/>• **As Driver**: Publish rides, manage vehicles, accept/reject requests, view passenger manifests, complete trips, cancel rides. |
| **Super Administrator** | Access `/admin` console, view metrics, suspend/reactivate users, moderate/cancel rides, resolve safety reports. |

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    ClientApp["React 18 + Vite SPA<br/>(Tailwind CSS + Motion + Sonner)"]
    
    subgraph ExpressServer["Express + Socket.IO Backend Server"]
        AuthMiddleware["JWT & Cookie Auth Guard"]
        RateLimiter["Express Rate Limiting"]
        RestControllers["REST Controllers<br/>(Auth, Rides, Bookings, Messages, Admin)"]
        SocketEngine["Socket.IO Event Engine<br/>(Realtime Chat & Alerts)"]
        StaticServe["Static File Middleware<br/>(Serves client/dist in production)"]
    end
    
    subgraph MongoAtlas["MongoDB Atlas / Local MongoDB"]
        UsersCol[Users Collection]
        RidesCol[Rides Collection]
        BookingsCol[Bookings Collection]
        VehiclesCol[Vehicles Collection]
        MessagesCol[Conversations & Messages]
        ReportsCol[Reports & Settings]
    end
    
    ClientApp -->|HTTP REST /api| AuthMiddleware
    ClientApp -->|WebSocket| SocketEngine
    ClientApp -->|Static Assets| StaticServe
    AuthMiddleware --> RestControllers
    RestControllers --> MongoAtlas
    SocketEngine --> MongoAtlas
```

---

## 🗄️ Database Collections & Schemas

### 1. `User`
- `name`: String
- `email`: String (unique, trimmed, lowercase index)
- `passwordHash`: String (bcrypt, salt rounds = 10, hidden by default)
- `role`: `'user'` | `'admin'`
- `avatar`: String (URL)
- `phone`: String (revealed only upon confirmed booking)
- `city`: String (default: `'Vijayawada'`)
- `status`: `'active'` | `'suspended'`
- `preferences`: `{ ac, music, smoking, pets, ladiesOnly, chatter }`
- `stats`: `{ ridesOffered, ridesTaken, rating, reviewCount }`
- `isDriver`: Boolean

### 2. `Ride`
- `driverId`: ObjectId (ref: User, indexed)
- `vehicleId`: ObjectId (ref: Vehicle)
- `origin`: `{ name, city, address, coordinates }`
- `destination`: `{ name, city, address, coordinates }`
- `intermediateStops`: Array of `{ name, city, coordinates, order }`
- `departureAt`: Date (indexed)
- `totalPassengerSeats`: Number (1–8)
- `availableSeats`: Number (min: 0, atomic update field)
- `contributionPerSeat`: Number (INR ₹)
- `bookingMode`: `'instant'` | `'approval_required'`
- `status`: `'SCHEDULED'` | `'IN_PROGRESS'` | `'COMPLETED'` | `'CANCELLED'` (indexed)
- `preferences`: `{ ac, luggage, music, smoking, ladiesOnly }`
- `notes`: String

### 3. `Booking`
- `rideId`: ObjectId (ref: Ride, indexed)
- `passengerId`: ObjectId (ref: User, indexed)
- `driverId`: ObjectId (ref: User, indexed)
- `requestedSeats`: Number (1–8)
- `totalContribution`: Number (calculated server-side: `contributionPerSeat * requestedSeats`)
- `status`: `'REQUESTED'` | `'CONFIRMED'` | `'REJECTED'` | `'CANCELLED'` | `'COMPLETED'`
- `pickupLocation`, `dropLocation`: String
- `statusHistory`: Array of `{ status, changedAt, changedBy, reason }`
- Partial Unique Index: `{ rideId: 1, passengerId: 1 }` for active bookings (`REQUESTED`, `CONFIRMED`)

### 4. `Vehicle`
- `ownerId`: ObjectId (ref: User)
- `make`, `model`, `year`, `colour`, `plateNumber`
- `vehicleType`: `'sedan'` | `'hatchback'` | `'suv'` | `'ev'` | `'motorcycle'`
- `seatingCapacity`: Number

### 5. `Conversation` & `Message`
- `rideId`, `bookingId`, `participants: [ObjectId]`
- `content`, `senderId`, `readBy: [ObjectId]`

### 6. `Report`
- `reporterId`, `reportedUserId`, `reportedRideId`, `category`, `explanation`, `status: 'pending'|'resolved'|'dismissed'`, `adminNotes`

### 7. `PlatformSettings`
- Singleton doc: `maintenanceMode`, `allowInstantBooking`, `platformFeePercentage: 0`

---

## 📁 Folder & Project Structure
```text
routebloom/
├── package.json                 # Unified monorepo scripts (dev, build, start, test)
├── .gitignore                   # Standard git exclusions
├── README.md                    # Comprehensive documentation
├── LICENSE                      # MIT Open Source License
├── client/                      # React 18 + Vite + TypeScript Frontend
│   ├── public/
│   │   └── logo.svg             # Original RouteBloom SVG vector brandmark
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Button, Input, Badge, Card, Modal
│   │   │   ├── layout/          # Navbar, Footer
│   │   │   ├── animations/      # HeroVehicleScene
│   │   │   └── rides/           # RideCard, RideSearchForm, BookingModal
│   │   ├── pages/               # HomePage, RidesPage, RideDetailsPage, OfferRidePage,
│   │   │                        # LoginPage, RegisterPage, DashboardPage, DriverDashboardPage,
│   │   │                        # MessagesPage, ProfilePage, AdminPage, SafetyPage
│   │   ├── context/             # AuthContext, SocketContext
│   │   ├── services/            # Axios api client, Socket.io client
│   │   ├── types/               # TypeScript interfaces & types
│   │   ├── index.css            # Tailwind directives, design system tokens
│   │   ├── App.tsx              # React router shell & protected routes
│   │   └── main.tsx             # React entrypoint
│   ├── index.html               # Space Grotesk & Plus Jakarta Sans typography
│   ├── vite.config.ts           # Proxy to backend on port 5000, path aliases
│   ├── tailwind.config.js       # RouteBloom color tokens & animations
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
└── server/                      # Express + TypeScript + Socket.IO Backend
    ├── src/
    │   ├── config/              # env.ts (Zod validation), db.ts (Mongoose)
    │   ├── models/              # User, Ride, Booking, Vehicle, Conversation, Message, Report, PlatformSettings
    │   ├── controllers/         # authController, rideController, bookingController, messageController, adminController, etc.
    │   ├── routes/              # Express API routers
    │   ├── middleware/          # auth, rateLimiter, errorHandler
    │   ├── validators/          # Zod request schemas
    │   ├── sockets/             # Socket.IO connection & messaging handlers
    │   ├── utils/               # token.ts (JWT & HttpOnly cookie)
    │   ├── bootstrap/           # initAdmin.ts (Idempotent bootstrap), seed.ts (Sample AP/Telangana data)
    │   ├── app.ts               # Express configuration, static client serving
    │   └── server.ts            # HTTP server, Socket.IO attachment, DB connection
    ├── tests/                   # Vitest automated integration test suite (api.test.ts)
    ├── vitest.config.ts         # Vitest config
    ├── tsconfig.json            # Server TypeScript configuration
    └── package.json
```

---

## 🛡️ Security & Concurrency Safeguards

1. **Atomic Conditional Seat Decrements**:
   ```typescript
   const updatedRide = await Ride.findOneAndUpdate(
     { _id: rideId, status: 'SCHEDULED', availableSeats: { $gte: requestedSeats } },
     { $inc: { availableSeats: -requestedSeats } },
     { new: true }
   );
   if (!updatedRide) {
     throw new Error("INSUFFICIENT_SEATS_OR_ALREADY_BOOKED");
   }
   ```
2. **Exactly-Once Seat Restoration on Cancellation**:
   ```typescript
   const booking = await Booking.findOneAndUpdate(
     { _id: bookingId, status: 'CONFIRMED' },
     { $set: { status: 'CANCELLED' } },
     { new: false }
   );
   if (booking) {
     await Ride.findByIdAndUpdate(booking.rideId, {
       $inc: { availableSeats: booking.requestedSeats }
     });
   }
   ```
3. **Idempotent Super Admin Bootstrap**:
   - Only runs when `INITIAL_SETUP_ENABLED=true`.
   - Never overwrites an existing admin; never deletes records; password is always hashed with bcrypt; secrets never logged.
4. **Cookie & Bearer Hybrid Authentication**:
   - Employs secure `HttpOnly`, `SameSite=Lax` cookies, supplemented with `Authorization: Bearer <token>` for Postman/API clients.
5. **Express Rate Limiting & Helmet**:
   - Auth endpoints are rate-limited to 30 requests per 15 minutes to thwart brute-force password guessing.

---

## 💻 Local Development & Setup

### Prerequisites
- **Node.js**: LTS (v20+ or v24+)
- **npm**: v10+ or v11+
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas URI.

### 1. Clone & Install Dependencies
Open your Windows Terminal / PowerShell:
```powershell
cd d:\fsd_project\Carpool-Project
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `server` and `client`:

In `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/routebloom
JWT_SECRET=routebloom_super_secret_jwt_key_development_2026_secure
CLIENT_URL=http://localhost:5173
INITIAL_SETUP_ENABLED=true
BOOTSTRAP_ADMIN_NAME=Platform Administrator
BOOTSTRAP_ADMIN_EMAIL=admin@routebloom.com
BOOTSTRAP_ADMIN_PASSWORD=RouteBloom@Admin2026
```

In `client/.env`:
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Sample Indian Corridors (Optional but Recommended)
Populate realistic routes between Vijayawada, Bhimavaram, Rajahmundry, Visakhapatnam, and Hyderabad:
```powershell
npm run seed
```

### 4. Start Development Servers
Run both backend API and frontend Vite dev servers concurrently:
```powershell
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Testing & QA Verification
RouteBloom features an automated integration test suite written with **Vitest** and **Supertest**, verifying all critical workflows against an isolated test database (`routebloom_test`):

To run the automated tests:
```powershell
npm test
```

### Verified Test Cases (19/19 Passing):
1. `GET /api/health` responds with `status: 'ok'` and database connected.
2. `GET /api/ready` responds with database readiness.
3. Malformed ObjectId handling (returns 400 Bad Request with descriptive JSON error instead of crashing).
4. `initAdmin` creates super administrator when enabled.
5. Repeated `initAdmin` execution preserves existing administrator without error.
6. User registration succeeds with normalized lowercase email, hashes password, and issues JWT.
7. Duplicate email registration is safely rejected with `409 Conflict`.
8. Incorrect password login is rejected with `401 Unauthorized`.
9. `GET /api/auth/me` returns current user session.
10. Logout successfully clears authentication session.
11. Re-login after logout succeeds (verifying real MongoDB persistence).
12. Driver publishes a ride with approval-required mode.
13. Published ride appears dynamically in public search results.
14. **Strict Rule**: Driver cannot book seats on their own ride.
15. Passenger submits seat booking request.
16. **Strict Rule**: Duplicate active booking request for same passenger is rejected.
17. Driver accepts request -> `availableSeats` decrements atomically from 2 to 1.
18. **Race Condition Test**: Instant booking takes the last remaining seat; subsequent attempts are rejected.
19. **Atomic Cancellation**: Passenger cancels confirmed booking -> seats are restored **exactly once**; double-cancellation is blocked.

---

## ☁️ Single-URL Production Deployment (Render + MongoDB Atlas)
RouteBloom is architected to run as a **single Render Web Service**, serving the compiled React client directly from Express.

### Step 1: Set Up MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with read/write permissions.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.
4. Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/routebloom?retryWrites=true&w=majority`.

### Step 2: Create Render Web Service
1. Link your GitHub repository in [Render](https://dashboard.render.com).
2. Create a new **Web Service**:
   - **Environment**: Node
   - **Root Directory**: `.` (leave blank / root)
   - **Build Command**:
     ```bash
     npm ci --prefix server --omit=dev && npm ci --prefix client --include=dev && npm run build --prefix client && npm run build --prefix server
     ```
   - **Start Command**:
     ```bash
     node server/dist/server.js
     ```

### Step 3: Configure Environment Variables in Render
| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.xyz.mongodb.net/routebloom?retryWrites=true&w=majority` |
| `JWT_SECRET` | `generate_a_long_random_secret_at_least_32_chars` |
| `INITIAL_SETUP_ENABLED` | `true` (set to `false` after first successful startup) |
| `BOOTSTRAP_ADMIN_NAME` | `Platform Administrator` |
| `BOOTSTRAP_ADMIN_EMAIL` | `admin@routebloom.com` |
| `BOOTSTRAP_ADMIN_PASSWORD` | `YourStrongAdminPassword2026!` |

After deployment, visit your Render URL (e.g. `https://routebloom.onrender.com`). Both the frontend SPA and `/api/*` operate seamlessly on the single URL.

---

## 🎓 Faculty 5-Minute Demonstration Walkthrough
Follow this concise walkthrough when presenting RouteBloom to examiners or faculty:

1. **Visual First Impression (30s)**:
   - Open [http://localhost:5173](http://localhost:5173).
   - Point out the vibrant Space Grotesk typography, Electric Violet / Sunset Orange color tokens, and the animated SVG carpool scene with the moving vehicle following the highway path.
2. **Instant Evaluator Demo Login (30s)**:
   - Click **Log In** in the navbar.
   - Click the 1-click **"⚡ Login as Driver (Priya Sharma)"** demo button. You are logged in immediately with real persistent database credentials.
3. **Driver Console & Ride Publishing (1m)**:
   - Click **"Offer Ride"** in the top navigation.
   - Show the 6-step animated wizard: Route (Vijayawada → Hyderabad), Schedule, Vehicle (Tata Nexon), Preferences (AC, Ladies-Only), Contribution (₹550), and Review. Click **Publish Ride** to see the celebratory confetti.
4. **Passenger Search & Real-Time Booking (1.5m)**:
   - Log out or open an Incognito window.
   - Click **Log In** → Click **"⚡ Login as Passenger (Sneha Patel)"**.
   - Go to **Find a Ride** (`/rides`). Search for *Vijayawada to Hyderabad*.
   - Click **Book Seat** on Priya's ride. Select 1 seat. Notice the ₹0 platform commission and instant confirmation.
5. **Atomic Concurrency & Seat Decrement (1m)**:
   - Inspect the remaining seats on the card: notice how the available seat count decremented atomically from 3 to 2.
   - Log back into Priya's driver dashboard: notice the passenger manifest shows Sneha Patel confirmed.
   - Go to **Messages** (`/messages`): demonstrate real-time chat between driver and passenger.
6. **Persistence & Verification (30s)**:
   - Log out and log back in to prove that all data is persisted in real MongoDB, not temporary browser state.

---

## 🔮 Limitations & Future Roadmap
- **Payment Gateways**: Currently, RouteBloom operates strictly as a peer-to-peer community board where fuel contributions are settled directly between commuters. Future versions can incorporate UPI QR integration (e.g. Razorpay/PhonePe).
- **Native Android APK**: Built with mobile-first viewport design and touch responsiveness; future phases can wrap RouteBloom into a Capacitor/TWA APK for Google Play Store publication.
- **GPS Live Tracking**: Currently relies on landmark-based pickups; future iterations can add real-time driver GPS broadcasting during trip progress.

---

## 👨‍💻 Academic & Developer Introduction
- **Developer**: `[FRIEND_FULL_NAME]`
- **Course**: `[DEGREE_AND_BRANCH]`
- **Institution**: `[COLLEGE_NAME]`
- **Registration Number**: `[REGISTRATION_NUMBER]`
- **GitHub Profile**: `[GITHUB_PROFILE]`
- **Live Deployment URL**: `[DEPLOYED_URL]`

---

*(c) RouteBloom — Same direction. Better journey.*
