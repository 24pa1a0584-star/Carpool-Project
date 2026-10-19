import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Calendar,
  Car,
  Sliders,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Wind,
  Music,
  Shield,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['Route', 'Schedule', 'Vehicle', 'Preferences', 'Contribution', 'Review'];

export const OfferRidePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [originCity, setOriginCity] = useState(user?.city || 'Vijayawada');
  const [originName, setOriginName] = useState('Benz Circle');
  const [destinationCity, setDestinationCity] = useState('Hyderabad');
  const [destinationName, setDestinationName] = useState('Gachibowli DLF');

  const [intermediateStops, setIntermediateStops] = useState<Array<{ name: string; city: string; order: number }>>([]);

  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [departureTime, setDepartureTime] = useState('08:00');

  // Vehicle
  const [vehicleMake, setVehicleMake] = useState('Tata');
  const [vehicleModel, setVehicleModel] = useState('Nexon');
  const [vehicleColour, setVehicleColour] = useState('White');
  const [plateNumber, setPlateNumber] = useState('AP 39 BK 2024');
  const [vehicleType, setVehicleType] = useState<'sedan' | 'hatchback' | 'suv' | 'ev' | 'motorcycle'>('suv');
  const [passengerSeats, setPassengerSeats] = useState(3);

  // Preferences
  const [ac, setAc] = useState(true);
  const [luggage, setLuggage] = useState<'small' | 'medium' | 'large'>('medium');
  const [music, setMusic] = useState(true);
  const [smoking, setSmoking] = useState(false);
  const [ladiesOnly, setLadiesOnly] = useState(false);
  const [bookingMode, setBookingMode] = useState<'instant' | 'approval_required'>('approval_required');
  const [notes, setNotes] = useState('Leaving on time. Comfortable AC highway drive.');

  // Contribution
  const [contributionPerSeat, setContributionPerSeat] = useState(500);

  const handleAddStop = () => {
    if (intermediateStops.length >= 3) {
      toast.error('Maximum 3 intermediate stops allowed.');
      return;
    }
    setIntermediateStops([
      ...intermediateStops,
      { city: 'Suryapet', name: 'Highway Food Court', order: intermediateStops.length + 1 },
    ]);
  };

  const handleRemoveStop = (idx: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!originCity.trim() || !destinationCity.trim()) {
        toast.error('Please specify both origin and destination cities.');
        return;
      }
    }
    if (currentStep === 1) {
      const departureDateTime = new Date(`${departureDate}T${departureTime}`);
      if (departureDateTime <= new Date()) {
        toast.error('Departure time must be in the future.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!vehicleMake.trim() || !vehicleModel.trim() || !plateNumber.trim()) {
        toast.error('Please complete vehicle details.');
        return;
      }
    }
    if (currentStep === 4) {
      if (contributionPerSeat < 0) {
        toast.error('Contribution cannot be negative.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error('Please log in to publish a ride.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const departureAt = new Date(`${departureDate}T${departureTime}`);

      const payload = {
        origin: {
          city: originCity.trim(),
          name: originName.trim() || originCity.trim(),
        },
        destination: {
          city: destinationCity.trim(),
          name: destinationName.trim() || destinationCity.trim(),
        },
        intermediateStops,
        departureAt: departureAt.toISOString(),
        totalPassengerSeats: passengerSeats,
        contributionPerSeat,
        bookingMode,
        preferences: {
          ac,
          luggage,
          music,
          smoking,
          ladiesOnly,
        },
        notes: notes.trim(),
        vehicleDetails: {
          make: vehicleMake.trim(),
          model: vehicleModel.trim(),
          year: 2023,
          colour: vehicleColour.trim(),
          plateNumber: plateNumber.trim(),
          vehicleType,
        },
      };

      const res = await api.post('/rides', payload);

      if (res.data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7046FF', '#FF7049', '#CCF45B'],
        });
        toast.success('Your ride has been successfully published!');
        navigate(`/rides/${res.data.ride._id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish ride.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="mb-8 space-y-2">
        <Badge variant="orange" size="sm">
          Driver Publication Wizard
        </Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy">
          Offer a Ride & Share Your Journey
        </h1>
        <p className="text-sm text-brand-navy/60">
          Publish your empty seats in 6 simple steps. Help commuters travel safely while splitting fuel costs.
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-white p-3 rounded-2xl border border-brand-violet/10 shadow-sm mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px]">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-brand-violet text-white'
                      : isCurrent
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20'
                      : 'bg-brand-lavender text-brand-navy/50'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-brand-navy font-bold' : 'text-brand-navy/50'
                  }`}
                >
                  {step}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-6 sm:w-10 h-0.5 mx-1 ${
                      idx < currentStep ? 'bg-brand-violet' : 'bg-brand-lavender'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: ROUTE */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-violet" />
                Where are you driving?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Starting City"
                  placeholder="e.g. Vijayawada"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                />
                <Input
                  label="Pickup Landmark / Area"
                  placeholder="e.g. Benz Circle"
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Destination City"
                  placeholder="e.g. Hyderabad"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                />
                <Input
                  label="Drop-off Landmark / Area"
                  placeholder="e.g. Gachibowli DLF"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                />
              </div>

              {/* Intermediate Stops */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-navy/70">
                    Intermediate Stops along Highway (Optional)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="text-xs font-semibold text-brand-violet hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Stop
                  </button>
                </div>

                {intermediateStops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-3 bg-brand-lavender/30 p-3 rounded-2xl">
                    <input
                      type="text"
                      placeholder="Stop City (e.g. Suryapet)"
                      value={stop.city}
                      onChange={(e) => {
                        const copy = [...intermediateStops];
                        copy[i].city = e.target.value;
                        setIntermediateStops(copy);
                      }}
                      className="w-1/2 bg-white rounded-xl px-3 py-2 text-sm text-brand-navy outline-none border border-brand-violet/15"
                    />
                    <input
                      type="text"
                      placeholder="Stop Landmark"
                      value={stop.name}
                      onChange={(e) => {
                        const copy = [...intermediateStops];
                        copy[i].name = e.target.value;
                        setIntermediateStops(copy);
                      }}
                      className="w-1/2 bg-white rounded-xl px-3 py-2 text-sm text-brand-navy outline-none border border-brand-violet/15"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(i)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: SCHEDULE */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-violet" />
                When are you leaving?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Departure Date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
                <Input
                  label="Departure Time"
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>

              <div className="p-4 bg-brand-sky/30 border border-brand-sky rounded-2xl text-xs text-brand-navy/70 leading-relaxed">
                Tip: Punctuality is the top factor in 5-star community driver reviews. Please choose a departure time when you are confident you can leave without delay.
              </div>
            </motion.div>
          )}

          {/* STEP 3: VEHICLE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
                <Car className="w-5 h-5 text-brand-violet" />
                Your Vehicle & Seating Capacity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Vehicle Make"
                  placeholder="e.g. Tata, Hyundai, Maruti"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                />
                <Input
                  label="Vehicle Model"
                  placeholder="e.g. Nexon, i20, Swift"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-navy/70 mb-1.5 uppercase">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e: any) => setVehicleType(e.target.value)}
                    className="w-full bg-brand-lavender/30 rounded-2xl px-3.5 py-3 text-sm text-brand-navy outline-none"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="suv">SUV</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>

                <Input
                  label="Colour"
                  placeholder="e.g. White"
                  value={vehicleColour}
                  onChange={(e) => setVehicleColour(e.target.value)}
                />

                <Input
                  label="Number Plate"
                  placeholder="e.g. AP 39 BK 2024"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy/70 mb-1.5 uppercase">
                  Available Passenger Seats to Offer
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPassengerSeats(num)}
                      className={`flex-1 py-3 rounded-2xl font-bold text-sm border transition-all ${
                        passengerSeats === num
                          ? 'bg-brand-violet text-white border-brand-violet shadow-sm'
                          : 'bg-white border-brand-violet/20 text-brand-navy hover:bg-brand-lavender/40'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PREFERENCES */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-violet" />
                Ride Preferences & Comfort
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 bg-brand-lavender/30 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Wind className="w-5 h-5 text-brand-turquoise" />
                    <span className="text-sm font-semibold text-brand-navy">Air Conditioning</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ac}
                    onChange={(e) => setAc(e.target.checked)}
                    className="w-5 h-5 accent-brand-violet"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-brand-lavender/30 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Music className="w-5 h-5 text-brand-violet" />
                    <span className="text-sm font-semibold text-brand-navy">Music on the Road</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={music}
                    onChange={(e) => setMusic(e.target.checked)}
                    className="w-5 h-5 accent-brand-violet"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-brand-lavender/30 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-brand-pink" />
                    <span className="text-sm font-semibold text-brand-navy">Ladies-Only Carpool</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ladiesOnly}
                    onChange={(e) => setLadiesOnly(e.target.checked)}
                    className="w-5 h-5 accent-brand-pink"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-brand-lavender/30 rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div>
                      <span className="text-sm font-semibold text-brand-navy block">Instant Booking</span>
                      <span className="text-[10px] text-brand-navy/50">Auto-confirm without review</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={bookingMode === 'instant'}
                    onChange={(e) => setBookingMode(e.target.checked ? 'instant' : 'approval_required')}
                    className="w-5 h-5 accent-brand-lime"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy/70 mb-1.5 uppercase">
                  Luggage Capacity Allowed
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setLuggage(size)}
                      className={`py-2.5 rounded-2xl font-bold text-xs capitalize border transition-all ${
                        luggage === size
                          ? 'bg-brand-violet text-white border-brand-violet'
                          : 'bg-white border-brand-violet/20 text-brand-navy hover:bg-brand-lavender/40'
                      }`}
                    >
                      {size} Bag
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy/70 mb-1.5 uppercase">
                  Notes / Instructions for Passengers
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Meeting point near toll plaza. Stopping 15 mins for tea."
                  className="w-full bg-white border border-brand-violet/20 rounded-2xl p-3 text-sm text-brand-navy outline-none focus:border-brand-violet"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 5: CONTRIBUTION */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-brand-violet" />
                Seat Contribution (INR ₹)
              </h3>

              <div className="bg-brand-lavender/40 p-6 rounded-3xl text-center space-y-4">
                <span className="text-xs uppercase font-bold text-brand-navy/50">
                  Contribution per passenger seat
                </span>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setContributionPerSeat((p) => Math.max(50, p - 50))}
                    className="w-10 h-10 rounded-full bg-white border border-brand-violet/20 text-xl font-bold text-brand-navy hover:bg-brand-violet hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="text-4xl font-extrabold text-brand-violet">
                    ₹{contributionPerSeat}
                  </span>
                  <button
                    type="button"
                    onClick={() => setContributionPerSeat((p) => p + 50)}
                    className="w-10 h-10 rounded-full bg-white border border-brand-violet/20 text-xl font-bold text-brand-navy hover:bg-brand-violet hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-brand-navy/60">
                  Potential total fuel offset if all {passengerSeats} seats are filled:{' '}
                  <span className="font-bold text-brand-navy">
                    ₹{contributionPerSeat * passengerSeats}
                  </span>
                </p>
              </div>

              <div className="p-4 bg-brand-lime/20 border border-brand-lime/40 rounded-2xl text-xs text-brand-navy/80 space-y-1">
                <p className="font-bold text-brand-navy">Legal Cost-Sharing Principles:</p>
                <p>
                  RouteBloom is a community board for shared private journeys. Seat contributions must only cover proportional fuel, maintenance, and toll expenses. Commercial profit-making is strictly prohibited.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 6: REVIEW & PUBLISH */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-heading text-xl font-bold text-brand-navy flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Review Your Ride Itinerary
              </h3>

              <div className="bg-brand-lavender/30 p-5 rounded-3xl space-y-4 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-brand-violet/10">
                  <span className="font-bold text-brand-navy text-sm">Route</span>
                  <span className="font-bold text-brand-violet text-sm">
                    {originCity} → {destinationCity}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-brand-violet/10">
                  <span className="font-bold text-brand-navy">Departure</span>
                  <span>{departureDate} at {departureTime}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-brand-violet/10">
                  <span className="font-bold text-brand-navy">Vehicle</span>
                  <span>{vehicleMake} {vehicleModel} ({plateNumber})</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-brand-violet/10">
                  <span className="font-bold text-brand-navy">Offered Seats</span>
                  <span className="font-bold text-brand-navy">{passengerSeats} seats</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-brand-violet/10">
                  <span className="font-bold text-brand-navy">Contribution</span>
                  <span className="font-extrabold text-brand-violet text-base">₹{contributionPerSeat} / seat</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-navy">Booking Policy</span>
                  <Badge variant={bookingMode === 'instant' ? 'lime' : 'violet'}>
                    {bookingMode === 'instant' ? 'Instant Confirmation' : 'Driver Approval Required'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-brand-violet/10 flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" variant="primary" onClick={handleNext}>
              Next Step <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="orange"
              size="lg"
              isLoading={isSubmitting}
              onClick={handlePublish}
              className="font-bold"
            >
              Publish Ride Now 🚀
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
