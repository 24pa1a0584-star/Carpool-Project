import React from 'react';
import { Link } from 'react-router-dom';
import { IRide } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Star,
  MapPin,
  Clock,
  Zap,
  Users,
  Wind,
  ShieldAlert,
  ChevronRight,
  Car,
} from 'lucide-react';

interface RideCardProps {
  ride: IRide;
  onBookClick?: (ride: IRide) => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onBookClick }) => {
  const departureDate = new Date(ride.departureAt);
  const formattedDate = departureDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card hoverable className="p-5 sm:p-6 relative overflow-hidden group">
      {/* Top Banner: Departure Time and Price */}
      <div className="flex items-start justify-between pb-4 border-b border-brand-violet/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-lavender/60 flex items-center justify-center text-brand-violet">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-navy/60">
              {formattedDate}
            </span>
            <p className="text-base sm:text-lg font-bold text-brand-navy">
              {formattedTime}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-brand-navy/50 block">Contribution</span>
          <span className="text-xl sm:text-2xl font-extrabold text-brand-violet">
            ₹{ride.contributionPerSeat}
          </span>
          <span className="text-xs text-brand-navy/60 ml-0.5">/seat</span>
        </div>
      </div>

      {/* Middle Section: Route visualization */}
      <div className="py-4 space-y-3">
        {/* Origin */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-3.5 h-3.5 rounded-full bg-brand-violet ring-4 ring-brand-violet/20" />
            <div className="w-0.5 h-8 bg-dashed bg-gradient-to-b from-brand-violet to-brand-orange my-0.5" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-brand-navy leading-tight">
              {ride.origin.city}
            </p>
            <p className="text-xs text-brand-navy/60 truncate">
              {ride.origin.name || ride.origin.address || 'Central Landmark'}
            </p>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-0.5">
            <div className="w-3.5 h-3.5 rounded-full bg-brand-orange ring-4 ring-brand-orange/20" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-brand-navy leading-tight">
              {ride.destination.city}
            </p>
            <p className="text-xs text-brand-navy/60 truncate">
              {ride.destination.name || ride.destination.address || 'Central Drop-off'}
            </p>
          </div>
        </div>

        {ride.intermediateStops && ride.intermediateStops.length > 0 && (
          <p className="text-[11px] text-brand-navy/50 pl-6">
            Via {ride.intermediateStops.map((s) => s.city).join(', ')}
          </p>
        )}
      </div>

      {/* Driver info & tags */}
      <div className="pt-3 border-t border-brand-violet/10 flex flex-wrap items-center justify-between gap-3">
        {/* Driver identity */}
        <div className="flex items-center gap-2.5">
          <img
            src={ride.driverId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={ride.driverId?.name || 'Driver'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-violet/10"
          />
          <div>
            <p className="text-xs font-bold text-brand-navy leading-tight">
              {ride.driverId?.name || 'Community Driver'}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-brand-navy/60">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{ride.driverId?.stats?.rating || '5.0'}</span>
              <span>({ride.driverId?.stats?.reviewCount || 1})</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ride.bookingMode === 'instant' && (
            <Badge variant="lime">
              <Zap className="w-3 h-3 text-[#5B7808]" />
              Instant
            </Badge>
          )}

          {ride.preferences?.ladiesOnly && (
            <Badge variant="pink">
              Ladies Only
            </Badge>
          )}

          {ride.preferences?.ac && (
            <Badge variant="turquoise">
              <Wind className="w-3 h-3" />
              AC
            </Badge>
          )}

          {/* Seats left indicator */}
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              ride.availableSeats === 1
                ? 'bg-rose-100 text-rose-700 animate-pulse'
                : 'bg-brand-lavender text-brand-violet'
            }`}
          >
            {ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} left
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 flex items-center justify-between gap-2">
        <Link
          to={`/rides/${ride._id}`}
          className="text-xs font-semibold text-brand-violet hover:underline flex items-center gap-0.5"
        >
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {onBookClick ? (
          <Button
            size="sm"
            variant={ride.bookingMode === 'instant' ? 'lime' : 'primary'}
            onClick={() => onBookClick(ride)}
          >
            {ride.bookingMode === 'instant' ? 'Book Instantly' : 'Request Seat'}
          </Button>
        ) : (
          <Link to={`/rides/${ride._id}`}>
            <Button size="sm" variant="secondary">
              Reserve Seat
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};
