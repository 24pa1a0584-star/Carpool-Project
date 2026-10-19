import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IRide, IBooking } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import {
  Car,
  Calendar,
  Check,
  X,
  Users,
  MapPin,
  Clock,
  PlusCircle,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const DriverDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'rides'>('requests');

  // Cancel ride modal
  const [selectedRideToCancel, setSelectedRideToCancel] = useState<IRide | null>(null);
  const [cancelRideReason, setCancelRideReason] = useState('');
  const [isCancellingRide, setIsCancellingRide] = useState(false);

  // Queries
  const { data: ridesData, refetch: refetchRides } = useQuery({
    queryKey: ['my-offered-rides'],
    queryFn: async () => {
      const res = await api.get('/rides/my-rides');
      return res.data;
    },
  });

  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ['driver-requests'],
    queryFn: async () => {
      const res = await api.get('/bookings/driver-requests');
      return res.data;
    },
  });

  const myRides: IRide[] = ridesData?.rides || [];
  const bookings: IBooking[] = requestsData?.bookings || [];

  const pendingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const confirmedPassengers = bookings.filter((b) => b.status === 'CONFIRMED');

  const handleRespond = async (bookingId: string, action: 'accept' | 'reject') => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/respond`, { action });
      if (res.data.success) {
        toast.success(
          action === 'accept'
            ? 'Booking accepted! Seats have been atomically reserved.'
            : 'Booking request rejected.'
        );
        refetchRequests();
        refetchRides();
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} booking.`);
    }
  };

  const handleCompleteTrip = async (rideId: string) => {
    try {
      const res = await api.post(`/bookings/ride/${rideId}/complete`);
      if (res.data.success) {
        toast.success('Trip marked as COMPLETED! Passengers have been notified to review.');
        refetchRides();
        refetchRequests();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete trip.');
    }
  };

  const handleCancelRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRideToCancel) return;

    setIsCancellingRide(true);
    try {
      const res = await api.post(`/rides/${selectedRideToCancel._id}/cancel`, {
        reason: cancelRideReason.trim() || 'Driver cancelled the ride.',
      });
      if (res.data.success) {
        toast.success('Ride cancelled. All passengers have been notified.');
        setSelectedRideToCancel(null);
        setCancelRideReason('');
        refetchRides();
        refetchRequests();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel ride.');
    } finally {
      setIsCancellingRide(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
      {/* Driver Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="orange" size="sm" className="mb-1.5 font-bold">
            Driver Command Center
          </Badge>
          <h1 className="font-heading text-3xl font-extrabold text-brand-navy">
            Manage Your Offered Rides & Passengers
          </h1>
          <p className="text-xs sm:text-sm text-brand-navy/60">
            Accept seat requests, coordinate pickups, and mark trips completed.
          </p>
        </div>

        <Link to="/offer-ride">
          <Button variant="orange" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Publish New Ride
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-violet/10 pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-brand-violet text-white shadow-sm'
              : 'text-brand-navy/70 hover:bg-brand-lavender/50'
          }`}
        >
          Passenger Requests & Manifest ({pendingRequests.length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('rides')}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
            activeTab === 'rides'
              ? 'bg-brand-violet text-white shadow-sm'
              : 'text-brand-navy/70 hover:bg-brand-lavender/50'
          }`}
        >
          My Published Rides ({myRides.length})
        </button>
      </div>

      {/* TAB 1: PASSENGER REQUESTS & MANIFEST */}
      {activeTab === 'requests' && (
        <div className="space-y-8">
          {/* Incoming Pending Requests */}
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-orange" />
              Incoming Requests Waiting For Your Approval
            </h3>

            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-brand-violet/10 text-xs text-brand-navy/60">
                No pending requests right now. As commuters discover your ride, requests will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((b) => (
                  <Card key={b._id} className="p-5 space-y-4 border-amber-200">
                    <div className="flex items-center justify-between pb-2 border-b border-brand-violet/10">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={(b.passengerId as any)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt="Passenger"
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-brand-navy">
                            {(b.passengerId as any)?.name}
                          </p>
                          <p className="text-[11px] text-brand-navy/50">
                            {(b.passengerId as any)?.city || 'Commuter'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="orange">
                        {b.requestedSeats} Seat{b.requestedSeats > 1 ? 's' : ''} (₹{b.totalContribution})
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-brand-navy">
                        Trip: {b.rideId?.origin?.city} → {b.rideId?.destination?.city}
                      </p>
                      {b.pickupLocation && (
                        <p className="text-brand-navy/70">
                          Pickup Landmark: <span className="font-semibold">{b.pickupLocation}</span>
                        </p>
                      )}
                      {b.dropLocation && (
                        <p className="text-brand-navy/70">
                          Drop Landmark: <span className="font-semibold">{b.dropLocation}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleRespond(b._id, 'accept')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept & Reserve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleRespond(b._id, 'reject')}
                      >
                        <X className="w-4 h-4 mr-1" /> Decline
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Confirmed Passenger Manifest */}
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Confirmed Passenger Manifest
            </h3>

            {confirmedPassengers.length === 0 ? (
              <p className="text-xs text-brand-navy/50 italic">No confirmed passengers yet.</p>
            ) : (
              <div className="bg-white rounded-3xl border border-brand-violet/10 overflow-hidden divide-y divide-brand-violet/10">
                {confirmedPassengers.map((b) => (
                  <div key={b._id} className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={(b.passengerId as any)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt="Passenger"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-brand-navy">
                          {(b.passengerId as any)?.name}
                        </p>
                        <p className="text-brand-navy/60">
                          Phone: <span className="font-semibold text-brand-navy">{(b.passengerId as any)?.phone || 'Verified'}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-brand-navy">
                        {b.rideId?.origin?.city} → {b.rideId?.destination?.city}
                      </p>
                      <p className="text-brand-navy/50">
                        {b.requestedSeats} Seat{b.requestedSeats > 1 ? 's' : ''} • Contribution: ₹{b.totalContribution}
                      </p>
                    </div>

                    <Link to="/messages">
                      <Button variant="secondary" size="sm" className="rounded-xl">
                        Message Passenger
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY PUBLISHED RIDES */}
      {activeTab === 'rides' && (
        <div className="space-y-4">
          {myRides.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-brand-violet/10 space-y-3">
              <Car className="w-10 h-10 text-brand-violet/40 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-brand-navy">
                No rides published yet
              </h3>
              <p className="text-xs text-brand-navy/60">
                Share your empty seats on journeys you are already taking.
              </p>
              <Link to="/offer-ride">
                <Button variant="orange" size="sm">
                  Publish Your First Ride
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myRides.map((ride) => (
                <Card key={ride._id} className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-violet/10">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        ride.status === 'SCHEDULED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ride.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ride.status}
                    </span>
                    <span className="text-base font-extrabold text-brand-violet">
                      ₹{ride.contributionPerSeat} / seat
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-brand-navy">
                      {ride.origin.city} → {ride.destination.city}
                    </h4>
                    <p className="text-xs text-brand-navy/60 mt-0.5">
                      Departure: {new Date(ride.departureAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-brand-navy/60 mt-1 font-semibold">
                      {ride.availableSeats} of {ride.totalPassengerSeats} seats currently available
                    </p>
                  </div>

                  {/* Actions for Scheduled Ride */}
                  {ride.status === 'SCHEDULED' && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompleteTrip(ride._id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Complete Trip
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRideToCancel(ride)}
                      >
                        Cancel Ride
                      </Button>
                      <Link to={`/rides/${ride._id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Ride Modal */}
      <Modal
        isOpen={!!selectedRideToCancel}
        onClose={() => setSelectedRideToCancel(null)}
        title="Cancel Published Ride"
        description="Cancelling this ride will notify all passengers and cancel their reservations."
      >
        <form onSubmit={handleCancelRide} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Cancellation Reason
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Mechanical issue / trip rescheduled"
              value={cancelRideReason}
              onChange={(e) => setCancelRideReason(e.target.value)}
              className="w-full bg-white border border-brand-violet/20 rounded-2xl p-3 text-sm text-brand-navy outline-none focus:border-brand-violet"
            />
          </div>

          <Button type="submit" variant="danger" fullWidth isLoading={isCancellingRide}>
            Confirm Ride Cancellation
          </Button>
        </form>
      </Modal>
    </div>
  );
};
