import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { MapPin, Calendar, Users, ArrowRightLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const POPULAR_CITIES = [
  'Vijayawada',
  'Hyderabad',
  'Bhimavaram',
  'Rajahmundry',
  'Visakhapatnam',
  'Guntur',
  'Tanuku',
  'Kakinada',
  'Amaravati',
];

interface RideSearchFormProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string;
  initialSeats?: number;
  onSearch?: (origin: string, destination: string, date: string, seats: number) => void;
  compact?: boolean;
}

export const RideSearchForm: React.FC<RideSearchFormProps> = ({
  initialOrigin = '',
  initialDestination = '',
  initialDate = '',
  initialSeats = 1,
  onSearch,
}) => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(initialDate);
  const [seats, setSeats] = useState(initialSeats);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(origin, destination, date, seats);
    } else {
      const params = new URLSearchParams();
      if (origin) params.set('origin', origin);
      if (destination) params.set('destination', destination);
      if (date) params.set('date', date);
      if (seats > 1) params.set('seats', seats.toString());
      navigate(`/rides?${params.toString()}`);
    }
  };

  const handleQuickRoute = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    if (onSearch) {
      onSearch(from, to, date, seats);
    } else {
      navigate(`/rides?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`);
    }
  };

  return (
    <div className="w-full space-y-3.5">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-brand-violet/15 space-y-3"
      >
        {/* Row 1: Origin and Destination with Swap Button */}
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-2.5 items-center">
          {/* Origin Input */}
          <div className="relative sm:col-span-5 flex items-center">
            <MapPin className="absolute left-3.5 w-4 h-4 text-brand-violet pointer-events-none" />
            <input
              type="text"
              placeholder="Leaving from..."
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-brand-lavender/30 hover:bg-brand-lavender/50 focus:bg-white border border-transparent focus:border-brand-violet rounded-2xl pl-10 pr-3 py-3 text-sm text-brand-navy font-medium outline-none transition-all placeholder:text-brand-navy/40"
              list="cities-list"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:col-span-1">
            <motion.button
              type="button"
              whileHover={{ scale: 1.12, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={handleSwap}
              className="w-9 h-9 rounded-full bg-brand-lavender/40 border border-brand-violet/20 shadow-xs flex items-center justify-center text-brand-violet hover:bg-brand-violet hover:text-white transition-colors"
              title="Swap Origin and Destination"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Destination Input */}
          <div className="relative sm:col-span-5 flex items-center">
            <MapPin className="absolute left-3.5 w-4 h-4 text-brand-orange pointer-events-none" />
            <input
              type="text"
              placeholder="Going to..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-brand-lavender/30 hover:bg-brand-lavender/50 focus:bg-white border border-transparent focus:border-brand-orange rounded-2xl pl-10 pr-3 py-3 text-sm text-brand-navy font-medium outline-none transition-all placeholder:text-brand-navy/40"
              list="cities-list"
            />
          </div>
        </div>

        {/* Row 2: Date, Passenger Seats, and Search Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Date Picker */}
          <div className="relative sm:col-span-5 flex items-center">
            <Calendar className="absolute left-3.5 w-4 h-4 text-brand-navy/50 pointer-events-none" />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-brand-lavender/30 hover:bg-brand-lavender/50 focus:bg-white border border-transparent focus:border-brand-violet rounded-2xl pl-10 pr-3 py-3 text-sm text-brand-navy font-medium outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Seats Selector */}
          <div className="relative sm:col-span-3 flex items-center">
            <Users className="absolute left-3.5 w-4 h-4 text-brand-navy/50 pointer-events-none" />
            <select
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full bg-brand-lavender/30 hover:bg-brand-lavender/50 focus:bg-white border border-transparent focus:border-brand-violet rounded-2xl pl-10 pr-2 py-3 text-sm font-semibold text-brand-navy outline-none cursor-pointer transition-all"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Seat' : 'Seats'}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Search Button */}
          <div className="sm:col-span-4">
            <Button
              type="submit"
              variant="orange"
              size="md"
              fullWidth
              className="py-3 font-bold text-sm shadow-md rounded-2xl flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search Rides</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Autocomplete datalist */}
      <datalist id="cities-list">
        {POPULAR_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* Popular Quick Corridor Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
        <span className="font-semibold text-brand-navy/50">Fast Routes:</span>
        <button
          type="button"
          onClick={() => handleQuickRoute('Vijayawada', 'Hyderabad')}
          className="px-3 py-1 bg-white hover:bg-brand-violet/5 border border-brand-violet/20 hover:border-brand-violet rounded-full text-brand-navy/80 hover:text-brand-violet transition-all shadow-xs font-medium"
        >
          Vijayawada → Hyderabad
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('Bhimavaram', 'Rajahmundry')}
          className="px-3 py-1 bg-white hover:bg-brand-violet/5 border border-brand-violet/20 hover:border-brand-violet rounded-full text-brand-navy/80 hover:text-brand-violet transition-all shadow-xs font-medium"
        >
          Bhimavaram → Rajahmundry
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('Rajahmundry', 'Visakhapatnam')}
          className="px-3 py-1 bg-white hover:bg-brand-violet/5 border border-brand-violet/20 hover:border-brand-violet rounded-full text-brand-navy/80 hover:text-brand-violet transition-all shadow-xs font-medium"
        >
          Rajahmundry → Vizag
        </button>
        <button
          type="button"
          onClick={() => handleQuickRoute('Guntur', 'Amaravati')}
          className="px-3 py-1 bg-white hover:bg-brand-violet/5 border border-brand-violet/20 hover:border-brand-violet rounded-full text-brand-navy/80 hover:text-brand-violet transition-all shadow-xs font-medium"
        >
          Guntur → Amaravati
        </button>
      </div>
    </div>
  );
};
