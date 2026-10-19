import React, { useState } from 'react';
import { IRide } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Zap, ShieldCheck, Users, IndianRupee, MapPin } from 'lucide-react';

interface BookingModalProps {
  ride: IRide | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  ride,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { user } = useAuth();
  const [requestedSeats, setRequestedSeats] = useState<number>(1);
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropLocation, setDropLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!ride) return null;

  const totalContribution = requestedSeats * ride.contributionPerSeat;
  const isInstant = ride.bookingMode === 'instant';

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to reserve seats.');
      return;
    }

    if (user._id === ride.driverId?._id) {
      toast.error('You cannot book your own ride!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        rideId: ride._id,
        requestedSeats,
        pickupLocation: pickupLocation.trim(),
        dropLocation: dropLocation.trim(),
      });

      if (res.data.success) {
        if (isInstant) {
          // Trigger joyful confetti for instant confirmed seat
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#7046FF', '#FF7049', '#CCF45B', '#2DD4BF'],
          });
          toast.success('Your seat is confirmed! Safe travels!');
        } else {
          toast.success('Booking request sent to driver for approval.');
        }

        onBookingSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isInstant ? '⚡ Instant Seat Booking' : '📋 Request Seat Booking'}
      description={`Trip from ${ride.origin.city} to ${ride.destination.city}`}
      maxWidth="md"
    >
      <form onSubmit={handleBooking} className="space-y-5 mt-2">
        {/* Seats Selector */}
        <div className="bg-brand-lavender/40 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-navy">Number of Seats</p>
              <p className="text-xs text-brand-navy/60">
                {ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={requestedSeats <= 1}
              onClick={() => setRequestedSeats((s) => Math.max(1, s - 1))}
              className="w-8 h-8 rounded-full bg-white border border-brand-violet/20 font-bold text-brand-navy disabled:opacity-40 hover:bg-brand-violet hover:text-white transition-colors"
            >
              -
            </button>
            <span className="w-6 text-center font-bold text-base text-brand-navy">
              {requestedSeats}
            </span>
            <button
              type="button"
              disabled={requestedSeats >= ride.availableSeats}
              onClick={() => setRequestedSeats((s) => Math.min(ride.availableSeats, s + 1))}
              className="w-8 h-8 rounded-full bg-white border border-brand-violet/20 font-bold text-brand-navy disabled:opacity-40 hover:bg-brand-violet hover:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Pickup & Drop area notes */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Your Preferred Pickup Area (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. Near ${ride.origin.name || 'Main Junction'}`}
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full bg-white border border-brand-violet/20 rounded-2xl px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-violet outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Your Preferred Drop-off Area (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. Near ${ride.destination.name || 'Highway Exit'}`}
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              className="w-full bg-white border border-brand-violet/20 rounded-2xl px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-violet outline-none"
            />
          </div>
        </div>

        {/* Financial Contribution Breakdown */}
        <div className="border-t border-brand-violet/10 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-brand-navy/70">
            <span>Seat Contribution (₹{ride.contributionPerSeat} × {requestedSeats})</span>
            <span className="font-semibold text-brand-navy">₹{totalContribution}</span>
          </div>
          <div className="flex justify-between text-xs text-brand-navy/70">
            <span>Platform Service Fee</span>
            <span className="font-semibold text-[#0F766E]">₹0 (Free Community Board)</span>
          </div>
          <div className="flex justify-between items-center text-base font-bold text-brand-navy pt-2 border-t border-brand-violet/10">
            <span>Total Payable to Driver</span>
            <span className="text-xl font-extrabold text-brand-violet">
              ₹{totalContribution}
            </span>
          </div>
        </div>

        {/* Trust disclaimer */}
        <div className="p-3 bg-brand-sky/30 border border-brand-sky rounded-2xl flex items-start gap-2.5 text-xs text-brand-navy/80">
          <ShieldCheck className="w-4 h-4 text-brand-violet shrink-0 mt-0.5" />
          <p>
            Seat contribution is shared directly with the driver to cover highway fuel and toll costs.
            Never transfer full payment in advance without direct phone verification.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant={isInstant ? 'lime' : 'primary'}
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            className="font-bold text-base"
          >
            {isInstant ? (
              <>
                <Zap className="w-5 h-5 mr-1" /> Confirm & Reserve Instantly (₹{totalContribution})
              </>
            ) : (
              `Send Seat Request (₹${totalContribution})`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
