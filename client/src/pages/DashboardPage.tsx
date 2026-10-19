import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IBooking } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  ShieldCheck,
  Phone,
  AlertCircle,
  PlusCircle,
  Search,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<IBooking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch passenger's bookings
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my-bookings');
      return res.data;
    },
  });

  const bookings: IBooking[] = data?.bookings || [];

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const requestedBookings = bookings.filter((b) => b.status === 'REQUESTED');
  const pastBookings = bookings.filter((b) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsCancelling(true);
    try {
      const res = await api.post(`/bookings/${selectedBooking._id}/cancel`, {
        reason: cancelReason.trim() || 'Passenger cancelled journey.',
      });
      if (res.data.success) {
        toast.success('Booking cancelled. Reserved seats have been restored.');
        setIsCancelModalOpen(false);
        setCancelReason('');
        refetch();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setIsSubmittingReview(true);
    try {
      const driverId =
        typeof reviewBooking.rideId.driverId === 'object'
          ? reviewBooking.rideId.driverId._id
          : reviewBooking.driverId;

      await api.post('/reviews', {
        rideId: reviewBooking.rideId._id,
        recipientId: driverId,
        rating,
        comment: comment.trim(),
      });

      toast.success('Thank you! Your review has been recorded.');
      setIsReviewModalOpen(false);
      setComment('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-violet via-[#855BFF] to-brand-orange p-6 sm:p-8 rounded-4xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-3xl object-cover ring-4 ring-white/20 shadow-md"
          />
          <div>
            <Badge variant="lime" size="sm" className="mb-1 font-bold">
              Passenger Console
            </Badge>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Manage your upcoming trips, track seat requests, and view your commuter history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/rides">
            <Button variant="lime" size="md" className="font-bold">
              <Search className="w-4 h-4 mr-1.5" /> Find New Ride
            </Button>
          </Link>
          <Link to="/offer-ride">
            <Button variant="ghost" size="md" className="text-white border border-white/20 hover:bg-white/10">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Offer Ride
            </Button>
          </Link>
        </div>
      </div>

      {/* Commuter Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy/50">
            Trips Taken
          </span>
          <p className="text-2xl font-extrabold text-brand-navy mt-1">
            {user?.stats?.ridesTaken || 0}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy/50">
            Confirmed Upcoming
          </span>
          <p className="text-2xl font-extrabold text-brand-violet mt-1">
            {confirmedBookings.length}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy/50">
            Pending Approval
          </span>
          <p className="text-2xl font-extrabold text-brand-orange mt-1">
            {requestedBookings.length}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy/50">
            Member Rating
          </span>
          <p className="text-2xl font-extrabold text-[#5B7808] mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-[#5B7808]" />
            {user?.stats?.rating || '5.0'}
          </p>
        </Card>
      </div>

      {/* SECTION 1: CONFIRMED UPCOMING TRIPS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-brand-navy flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirmed Upcoming Journeys
          </h2>
          <span className="text-xs text-brand-navy/50 font-semibold">
            {confirmedBookings.length} Active
          </span>
        </div>

        {confirmedBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-brand-violet/10 space-y-3">
            <p className="text-sm font-semibold text-brand-navy/60">
              You have no confirmed upcoming journeys right now.
            </p>
            <Link to="/rides">
              <Button variant="primary" size="sm">
                Explore Available Rides
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {confirmedBookings.map((b) => {
              const ride = b.rideId;
              const depDate = new Date(ride.departureAt);
              return (
                <Card key={b._id} className="p-6 space-y-4 border-emerald-200">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-violet/10">
                    <Badge variant="turquoise">Confirmed Seat</Badge>
                    <span className="text-sm font-extrabold text-brand-violet">
                      ₹{b.totalContribution} ({b.requestedSeats} Seat{b.requestedSeats > 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-base font-bold text-brand-navy">
                      <span>{ride.origin?.city}</span>
                      <span className="text-brand-violet">→</span>
                      <span>{ride.destination?.city}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-brand-navy/60">
                      <span className="flex items-center gap-1 font-semibold text-brand-navy">
                        <Calendar className="w-3.5 h-3.5" />
                        {depDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>
                        {depDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Driver details revealed after confirmation */}
                  <div className="p-3 bg-brand-lavender/30 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={(ride.driverId as any)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt="Driver"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-brand-navy">{(ride.driverId as any)?.name}</p>
                        <p className="text-[11px] text-brand-navy/60">
                          Phone: {(ride.driverId as any)?.phone || '+91 Verified Driver'}
                        </p>
                      </div>
                    </div>

                    <Link to="/messages">
                      <Button variant="outline" size="sm" className="rounded-xl py-1 text-xs">
                        Chat
                      </Button>
                    </Link>
                  </div>

                  {/* Cancel Action */}
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <Link to={`/rides/${ride._id}`} className="text-brand-violet font-semibold hover:underline">
                      Itinerary Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBooking(b);
                        setIsCancelModalOpen(true);
                      }}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: PENDING SEAT REQUESTS */}
      {requestedBookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-orange" /> Pending Driver Approvals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requestedBookings.map((b) => (
              <Card key={b._id} className="p-5 space-y-3 border-amber-200">
                <div className="flex items-center justify-between">
                  <Badge variant="orange">Pending Driver Response</Badge>
                  <span className="text-xs font-bold text-brand-navy">
                    {b.requestedSeats} Seat{b.requestedSeats > 1 ? 's' : ''} (₹{b.totalContribution})
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-brand-navy">
                    {b.rideId?.origin?.city} → {b.rideId?.destination?.city}
                  </p>
                  <p className="text-xs text-brand-navy/60">
                    Departure:{' '}
                    {new Date(b.rideId?.departureAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-brand-navy/50">Driver has been notified</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBooking(b);
                      setIsCancelModalOpen(true);
                    }}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    Withdraw Request
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: PAST COMMUTE HISTORY */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-brand-navy">
          Travel History & Reviews
        </h2>

        {pastBookings.length === 0 ? (
          <p className="text-xs text-brand-navy/50 italic">No past completed journeys yet.</p>
        ) : (
          <div className="bg-white rounded-3xl border border-brand-violet/10 overflow-hidden shadow-sm">
            <div className="divide-y divide-brand-violet/10">
              {pastBookings.map((b) => (
                <div key={b._id} className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-brand-navy">
                        {b.rideId?.origin?.city} → {b.rideId?.destination?.city}
                      </span>
                      <Badge
                        variant={
                          b.status === 'COMPLETED'
                            ? 'lime'
                            : b.status === 'CANCELLED'
                            ? 'red'
                            : 'neutral'
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-brand-navy/50 mt-0.5">
                      {new Date(b.rideId?.departureAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' • '}
                      {b.requestedSeats} Seat{b.requestedSeats > 1 ? 's' : ''} • ₹{b.totalContribution}
                    </p>
                  </div>

                  <div>
                    {b.status === 'COMPLETED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReviewBooking(b);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                        Rate Driver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Seat Booking"
        description="Are you sure you want to cancel this reservation?"
      >
        <form onSubmit={handleCancelBooking} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Cancellation Reason (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Change of plans / rescheduled travel"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-white border border-brand-violet/20 rounded-2xl p-3 text-sm text-brand-navy outline-none focus:border-brand-violet"
            />
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
            Note: Cancelling will instantly restore the seats to other commuters on the platform.
          </div>

          <Button type="submit" variant="danger" fullWidth isLoading={isCancelling}>
            Confirm Cancellation
          </Button>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Your Driver"
        description="Share honest feedback about your journey comfort, punctuality, and driving."
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`p-2 rounded-xl transition-all ${
                    rating >= s ? 'text-amber-500 scale-110' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-7 h-7 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Your Review Comments
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Smooth highway drive, friendly conversation, left exactly on time!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-brand-violet/20 rounded-2xl p-3 text-sm text-brand-navy outline-none focus:border-brand-violet"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmittingReview}>
            Submit Review
          </Button>
        </form>
      </Modal>
    </div>
  );
};
