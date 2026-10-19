export interface IUserPreferences {
  smoking: boolean;
  music: boolean;
  pets: boolean;
  ac: boolean;
  ladiesOnly: boolean;
  chatter: 'quiet' | 'moderate' | 'talkative';
}

export interface IUserStats {
  ridesOffered: number;
  ridesTaken: number;
  rating: number;
  reviewCount: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  phone?: string;
  bio?: string;
  city?: string;
  status: 'active' | 'suspended';
  preferences: IUserPreferences;
  stats: IUserStats;
  isDriver: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVehicle {
  _id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  colour: string;
  plateNumber: string;
  vehicleType: 'sedan' | 'hatchback' | 'suv' | 'ev' | 'motorcycle';
  seatingCapacity: number;
}

export interface ILocationPoint {
  name: string;
  city: string;
  address?: string;
  coordinates?: [number, number];
}

export interface IRidePreferences {
  ac: boolean;
  luggage: 'small' | 'medium' | 'large';
  music: boolean;
  smoking: boolean;
  ladiesOnly: boolean;
}

export interface IRide {
  _id: string;
  driverId: IUser;
  vehicleId?: IVehicle;
  origin: ILocationPoint;
  destination: ILocationPoint;
  intermediateStops: Array<{
    name: string;
    city: string;
    coordinates?: [number, number];
    order: number;
  }>;
  departureAt: string;
  estimatedArrivalAt?: string;
  totalPassengerSeats: number;
  availableSeats: number;
  contributionPerSeat: number;
  bookingMode: 'instant' | 'approval_required';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  preferences: IRidePreferences;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface IBooking {
  _id: string;
  rideId: IRide;
  passengerId: IUser;
  driverId: IUser | string;
  requestedSeats: number;
  totalContribution: number;
  status: BookingStatus;
  pickupLocation?: string;
  dropLocation?: string;
  statusHistory: Array<{
    status: BookingStatus;
    changedAt: string;
    changedBy: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  _id: string;
  rideId: {
    _id: string;
    origin: ILocationPoint;
    destination: ILocationPoint;
    departureAt: string;
    status: string;
  };
  bookingId?: string;
  participants: IUser[];
  lastMessage?: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: IUser;
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface INotification {
  _id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface IReview {
  _id: string;
  authorId: IUser;
  recipientId: string;
  rideId: any;
  rating: number;
  comment: string;
  role: 'driver' | 'passenger';
  createdAt: string;
}

export interface IReport {
  _id: string;
  reporterId: IUser;
  reportedUserId?: IUser;
  reportedRideId?: IRide;
  category: string;
  explanation: string;
  status: 'pending' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}
