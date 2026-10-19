import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { IRide } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/rides/BookingModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Star,
  ShieldCheck,
  Wind,
  Music,
  Luggage,
  Cigarette,
  AlertTriangle,
  ChevronLeft,
  Zap,
  MessageSquare,
  Users,
} from 'lucide-react';

export const RideDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('safety');
  const [reportExplanation, setReportExplanation] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ride', id],
    queryFn: async () => {
      const res = await api.get(`/rides/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const ride: IRide | null = data?.ride || null;

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a safety report.');
      return;
    }

    setIsSubmittingReport(true);
    try {
      await api.post('/reports', {
        reportedRideId: ride?._id,
        reportedUserId: ride?.driverId?._id,
        category: reportCategory,
        explanation: reportExplanation,
      });
      toast.success('Report submitted to moderation team.');
      setIsReportOpen(false);
      setReportExplanation('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-4xl mx-auto px-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-violet border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-brand-navy/60">Loading ride itinerary...</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-navy">Ride Not Found</h2>
        <p className="text-sm text-brand-navy/60">
          This ride may have already completed or was removed by the driver.
        </p>
        <Link to="/rides">
          <Button variant="primary">Browse Available Rides</Button>
        </Link>
      </div>
    );
  }

  const departureDate = new Date(ride.departureAt);
  const formattedDate = departureDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isDriver = user?._id === ride.driverId?._id;

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy/60 hover:text-brand-violet transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Rides
        </button>
      </div>

      {/* Main Grid: Details Left, Booking Action Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Itinerary & Information */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-brand-violet/10">
              <div className="flex items-center gap-2">
                <Badge variant={ride.bookingMode === 'instant' ? 'lime' : 'violet'}>
                  {ride.bookingMode === 'instant' ? (
                    <>
                      <Zap className="w-3.5 h-3.5" /> Instant Confirmation
                    </>
                  ) : (
                    'Driver Approval Required'
                  )}
                </Badge>
                {ride.preferences.ladiesOnly && (
                  <Badge variant="pink">Ladies Only</Badge>
                )}
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  ride.status === 'SCHEDULED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {ride.status}
              </span>
            </div>

            {/* Departure Date & Time */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 text-brand-violet flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-brand-navy/50 tracking-wider">
                  Departure Schedule
                </p>
                <p className="text-lg sm:text-xl font-bold text-brand-navy">
                  {formattedDate} at {formattedTime}
                </p>
              </div>
            </div>

            {/* Visual Route Timeline */}
            <div className="bg-brand-lavender/30 p-5 rounded-3xl space-y-4">
              {/* Origin */}
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-4 h-4 rounded-full bg-brand-violet ring-4 ring-brand-violet/20" />
                  <div className="w-0.5 h-12 bg-dashed bg-gradient-to-b from-brand-violet to-brand-orange my-1" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet">
                    Pickup Location
                  </span>
                  <p className="text-base font-bold text-brand-navy">{ride.origin.city}</p>
                  <p className="text-xs text-brand-navy/60">
                    {ride.origin.name || ride.origin.address || 'Central Landmark'}
                  </p>
                </div>
              </div>

              {/* Intermediate Stops */}
              {ride.intermediateStops &&
                ride.intermediateStops.map((stop, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 pl-0.5">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-brand-turquoise ring-4 ring-brand-turquoise/20" />
                      <div className="w-0.5 h-10 bg-brand-navy/15 my-1" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-turquoise">
                        Stop {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-brand-navy">{stop.city}</p>
                      <p className="text-xs text-brand-navy/50">{stop.name}</p>
                    </div>
                  </div>
                ))}

              {/* Destination */}
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-4 h-4 rounded-full bg-brand-orange ring-4 ring-brand-orange/20" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                    Drop-off Location
                  </span>
                  <p className="text-base font-bold text-brand-navy">{ride.destination.city}</p>
                  <p className="text-xs text-brand-navy/60">
                    {ride.destination.name || ride.destination.address || 'Central Drop-off'}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Notes */}
            {ride.notes && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy/60 mb-1.5">
                  Notes from Driver
                </h4>
                <p className="text-sm text-brand-navy/80 bg-white p-4 rounded-2xl border border-brand-violet/10 leading-relaxed">
                  "{ride.notes}"
                </p>
              </div>
            )}
          </Card>

          {/* Vehicle Information */}
          {ride.vehicleId && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-brand-violet/10">
                <Car className="w-5 h-5 text-brand-violet" />
                <h3 className="font-heading text-lg font-bold text-brand-navy">
                  Vehicle Details
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-brand-navy/50 block">Make & Model</span>
                  <span className="font-bold text-brand-navy text-sm">
                    {ride.vehicleId.make} {ride.vehicleId.model}
                  </span>
                </div>
                <div>
                  <span className="text-brand-navy/50 block">Category</span>
                  <span className="font-bold text-brand-navy text-sm capitalize">
                    {ride.vehicleId.vehicleType}
                  </span>
                </div>
                <div>
                  <span className="text-brand-navy/50 block">Colour</span>
                  <span className="font-bold text-brand-navy text-sm">
                    {ride.vehicleId.colour}
                  </span>
                </div>
                <div>
                  <span className="text-brand-navy/50 block">Registration</span>
                  <span className="font-bold text-brand-navy text-sm">
                    {ride.vehicleId.plateNumber}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Ride Amenities & Preferences */}
          <Card className="p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-brand-navy pb-3 border-b border-brand-violet/10">
              Trip Amenities & Policies
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Wind className="w-4 h-4 text-brand-turquoise" />
                <span className="font-medium text-brand-navy">
                  {ride.preferences.ac ? 'AC Available' : 'No AC'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-brand-violet" />
                <span className="font-medium text-brand-navy">
                  {ride.preferences.music ? 'Music Permitted' : 'Quiet Ride'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Luggage className="w-4 h-4 text-brand-orange" />
                <span className="font-medium text-brand-navy capitalize">
                  {ride.preferences.luggage} Luggage
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Cigarette className="w-4 h-4 text-rose-500" />
                <span className="font-medium text-brand-navy">
                  {ride.preferences.smoking ? 'Smoking Allowed' : 'Strictly No Smoking'}
                </span>
              </div>
            </div>
          </Card>

          {/* Driver Profile */}
          <Card className="p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-brand-navy pb-3 border-b border-brand-violet/10">
              About the Driver
            </h3>

            <div className="flex items-start gap-4">
              <img
                src={ride.driverId.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={ride.driverId.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-violet/20 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-brand-navy">{ride.driverId.name}</h4>
                  <Badge variant="turquoise" size="sm">
                    <ShieldCheck className="w-3 h-3" /> Community Member
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-brand-navy/60">
                  <span className="flex items-center gap-1 font-semibold text-brand-navy">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {ride.driverId.stats?.rating || '5.0'}
                  </span>
                  <span>•</span>
                  <span>{ride.driverId.stats?.ridesOffered || 1} rides offered</span>
                  <span>•</span>
                  <span>City: {ride.driverId.city || 'Andhra Pradesh'}</span>
                </div>
                <p className="text-xs text-brand-navy/70 pt-1 leading-relaxed">
                  {ride.driverId.bio || 'Sharing rides to make travel more connected and friendly!'}
                </p>
              </div>
            </div>
          </Card>

          {/* Safety & Report Button */}
          <div className="flex justify-between items-center text-xs text-brand-navy/60 pt-2">
            <span>Notice something suspicious with this ride?</span>
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Report Listing
            </button>
          </div>
        </div>

        {/* Right Sticky Booking Box */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <Card className="p-6 space-y-5 shadow-xl border-brand-violet/20">
            <div>
              <span className="text-xs uppercase font-bold text-brand-navy/50">Shared Contribution</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-brand-violet">
                  ₹{ride.contributionPerSeat}
                </span>
                <span className="text-xs text-brand-navy/60 font-semibold">/ passenger seat</span>
              </div>
            </div>

            <div className="bg-brand-lavender/40 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold">
              <span className="text-brand-navy/70">Seats Remaining:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full ${
                  ride.availableSeats === 1
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'text-brand-navy'
                }`}
              >
                {ride.availableSeats} of {ride.totalPassengerSeats} left
              </span>
            </div>

            {/* Action Button */}
            {isDriver ? (
              <div className="p-4 bg-brand-sky/30 rounded-2xl text-center text-xs text-brand-navy">
                <p className="font-bold">You are the driver of this ride.</p>
                <Link to="/driver" className="text-brand-violet font-semibold hover:underline block mt-1">
                  Go to Driver Console to manage requests
                </Link>
              </div>
            ) : ride.availableSeats <= 0 ? (
              <Button disabled fullWidth size="lg" variant="secondary">
                Ride Full (0 Seats Left)
              </Button>
            ) : (
              <Button
                variant={ride.bookingMode === 'instant' ? 'lime' : 'primary'}
                fullWidth
                size="lg"
                className="font-bold text-base shadow-md"
                onClick={() => setIsBookingOpen(true)}
              >
                {ride.bookingMode === 'instant' ? (
                  <>
                    <Zap className="w-5 h-5 mr-1" /> Book Instantly
                  </>
                ) : (
                  'Request to Book Seats'
                )}
              </Button>
            )}

            <div className="text-[11px] text-brand-navy/50 space-y-1.5 pt-2 border-t border-brand-violet/10">
              <p>• Seats are reserved with real-time atomic safeguards.</p>
              <p>• Zero hidden fees or booking commission.</p>
              <p>• Cancel anytime before departure with instant seat restoration.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        ride={ride}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onBookingSuccess={() => refetch()}
      />

      {/* Safety Report Modal */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Report Ride Listing"
        description="Help us maintain a safe community. Reports are reviewed by moderators."
      >
        <form onSubmit={handleReportSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Category
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full bg-brand-lavender/30 rounded-2xl px-3.5 py-2.5 text-sm text-brand-navy outline-none"
            >
              <option value="safety">Safety or Driving Concern</option>
              <option value="inappropriate_behaviour">Inappropriate Communication</option>
              <option value="pricing_fraud">Commercial Taxi Overcharging</option>
              <option value="spam">Spam / Duplicate Ride</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Explanation
            </label>
            <textarea
              rows={4}
              required
              placeholder="Please provide specific details regarding this listing..."
              value={reportExplanation}
              onChange={(e) => setReportExplanation(e.target.value)}
              className="w-full bg-white border border-brand-violet/20 rounded-2xl p-3 text-sm text-brand-navy outline-none focus:border-brand-violet"
            />
          </div>

          <Button
            type="submit"
            variant="danger"
            fullWidth
            isLoading={isSubmittingReport}
          >
            Submit Safety Report
          </Button>
        </form>
      </Modal>
    </div>
  );
};
