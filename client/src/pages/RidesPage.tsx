import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { IRide } from '../types';
import { RideCard } from '../components/rides/RideCard';
import { BookingModal } from '../components/rides/BookingModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Search,
  Filter,
  RotateCcw,
  PlusCircle,
  Wind,
  Shield,
  Zap,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';

export const RidesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [seats, setSeats] = useState<number>(Number(searchParams.get('seats')) || 1);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [acOnly, setAcOnly] = useState(false);
  const [ladiesOnly, setLadiesOnly] = useState(false);
  const [instantOnly, setInstantOnly] = useState(false);
  const [sortBy, setSortBy] = useState('departureAt');
  const [page, setPage] = useState(1);

  // Booking modal state
  const [selectedRide, setSelectedRide] = useState<IRide | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Query rides from API
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'rides',
      origin,
      destination,
      date,
      seats,
      maxPrice,
      acOnly,
      ladiesOnly,
      instantOnly,
      sortBy,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (origin.trim()) params.set('origin', origin.trim());
      if (destination.trim()) params.set('destination', destination.trim());
      if (date) params.set('date', date);
      if (seats > 1) params.set('seats', seats.toString());
      if (maxPrice < 1500) params.set('maxPrice', maxPrice.toString());
      if (acOnly) params.set('acOnly', 'true');
      if (ladiesOnly) params.set('ladiesOnly', 'true');
      if (instantOnly) params.set('instantOnly', 'true');
      params.set('sortBy', sortBy);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await api.get(`/rides/search?${params.toString()}`);
      return res.data;
    },
  });

  const rides: IRide[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1 };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleResetFilters = () => {
    setOrigin('');
    setDestination('');
    setDate('');
    setSeats(1);
    setMaxPrice(1500);
    setAcOnly(false);
    setLadiesOnly(false);
    setInstantOnly(false);
    setSortBy('departureAt');
    setPage(1);
    setSearchParams({});
  };

  const openBookingModal = (ride: IRide) => {
    setSelectedRide(ride);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <Badge variant="violet" size="sm" className="mb-1.5">
            Ride Marketplace
          </Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Find Your Next Shared Journey
          </h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            Browse verified community carpool listings across Andhra Pradesh & Telangana
          </p>
        </div>

        <Link to="/offer-ride">
          <Button variant="orange" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Offer Empty Seats
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6 bg-white p-5 sm:p-6 rounded-3xl border border-brand-violet/10 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-brand-violet/10">
            <div className="flex items-center gap-2 font-bold text-brand-navy">
              <Filter className="w-4 h-4 text-brand-violet" />
              <span>Filters</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-brand-navy/50 hover:text-brand-orange flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4 text-xs">
            {/* Origin City */}
            <div>
              <label className="font-bold text-brand-navy/70 block mb-1">From (City)</label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-brand-violet absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Vijayawada"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-brand-lavender/30 rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-navy outline-none border border-transparent focus:border-brand-violet"
                />
              </div>
            </div>

            {/* Destination City */}
            <div>
              <label className="font-bold text-brand-navy/70 block mb-1">To (City)</label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-brand-orange absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Hyderabad"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-brand-lavender/30 rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-navy outline-none border border-transparent focus:border-brand-orange"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="font-bold text-brand-navy/70 block mb-1">Departure Date</label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-brand-navy/40 absolute left-3 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-brand-lavender/30 rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-navy outline-none border border-transparent focus:border-brand-violet"
                />
              </div>
            </div>

            {/* Minimum Seats */}
            <div>
              <label className="font-bold text-brand-navy/70 block mb-1">Seats Required</label>
              <select
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full bg-brand-lavender/30 rounded-xl px-3 py-2.5 text-sm text-brand-navy outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Seat' : 'Seats'}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Max Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-brand-navy/70">Max Price: ₹{maxPrice}</label>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-violet cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-navy/50">
                <span>₹100</span>
                <span>₹1500</span>
              </div>
            </div>

            {/* Special Preferences Toggles */}
            <div className="pt-2 border-t border-brand-violet/10 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-navy">
                <input
                  type="checkbox"
                  checked={instantOnly}
                  onChange={(e) => setInstantOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-violet accent-brand-violet"
                />
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Booking
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-navy">
                <input
                  type="checkbox"
                  checked={ladiesOnly}
                  onChange={(e) => setLadiesOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-pink accent-brand-pink"
                />
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-brand-pink" /> Ladies Only
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-navy">
                <input
                  type="checkbox"
                  checked={acOnly}
                  onChange={(e) => setAcOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-turquoise accent-brand-turquoise"
                />
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-brand-turquoise" /> Air Conditioning
                </span>
              </label>
            </div>

            <Button type="submit" variant="primary" fullWidth size="md">
              Apply Filters
            </Button>
          </form>
        </aside>

        {/* Results Column */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sorting and Meta */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-brand-violet/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-brand-navy/70">
              Showing <span className="text-brand-violet font-bold">{rides.length}</span> of{' '}
              <span className="font-bold text-brand-navy">{pagination.total}</span> verified rides
            </span>

            <div className="flex items-center gap-2">
              <span className="text-brand-navy/60 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-brand-lavender/30 rounded-xl px-2.5 py-1.5 font-semibold text-brand-navy outline-none cursor-pointer"
              >
                <option value="departureAt">Departure Time (Earliest)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="seats">Most Seats Available</option>
              </select>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl p-6 border border-brand-violet/10 animate-pulse space-y-4"
                >
                  <div className="h-6 bg-brand-lavender/60 rounded-xl w-1/3" />
                  <div className="h-14 bg-brand-lavender/40 rounded-xl" />
                  <div className="h-10 bg-brand-lavender/50 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && rides.length === 0 && (
            <div className="bg-white rounded-4xl p-10 sm:p-14 text-center border border-brand-violet/10 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-violet/10 text-brand-violet flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-brand-navy">
                No rides found matching your search
              </h3>
              <p className="text-sm text-brand-navy/60 max-w-md mx-auto">
                We couldn't find any scheduled rides for this route or date. Try clearing some filters or
                be the first to offer empty seats for this journey!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
                <Link to="/offer-ride">
                  <Button variant="orange" size="sm">
                    Offer a Ride on this Route
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Ride Cards Grid */}
          {!isLoading && rides.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rides.map((ride) => (
                <RideCard
                  key={ride._id}
                  ride={ride}
                  onBookClick={() => openBookingModal(ride)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold px-3 py-1 bg-white rounded-xl border border-brand-violet/15 text-brand-navy">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Booking Dialog Modal */}
      <BookingModal
        ride={selectedRide}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onBookingSuccess={() => refetch()}
      />
    </div>
  );
};
