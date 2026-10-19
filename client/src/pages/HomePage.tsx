import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroVehicleScene } from '../components/animations/HeroVehicleScene';
import { RideSearchForm } from '../components/rides/RideSearchForm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Compass,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
  MapPin,
  TrendingDown,
  Leaf,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const popularRoutes = [
    {
      from: 'Vijayawada',
      to: 'Hyderabad',
      distance: '275 km',
      duration: '4.5 hrs',
      price: '₹500 - ₹600',
      tag: 'Most Popular',
      color: 'violet',
    },
    {
      from: 'Bhimavaram',
      to: 'Rajahmundry',
      distance: '85 km',
      duration: '2.0 hrs',
      price: '₹200 - ₹250',
      tag: 'College Route',
      color: 'orange',
    },
    {
      from: 'Rajahmundry',
      to: 'Visakhapatnam',
      distance: '190 km',
      duration: '3.5 hrs',
      price: '₹400 - ₹480',
      tag: 'Coastal Corridor',
      color: 'turquoise',
    },
    {
      from: 'Guntur',
      to: 'Amaravati',
      distance: '35 km',
      duration: '45 mins',
      price: '₹100 - ₹150',
      tag: 'Daily Commute',
      color: 'lime',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Search or Publish a Ride',
      description: 'Heading somewhere? Offer your empty seats or search for a commuter driving your exact route.',
      icon: Compass,
      color: 'bg-brand-violet text-white',
    },
    {
      number: '02',
      title: 'Connect & Confirm',
      description: 'Book seats instantly or submit a request. Coordinate pickup landmarks with built-in real-time chat.',
      icon: Users,
      color: 'bg-brand-orange text-white',
    },
    {
      number: '03',
      title: 'Travel & Split Highway Costs',
      description: 'Meet at your pickup point, enjoy pleasant travel together, and share the fuel cost directly in INR (₹).',
      icon: Sparkles,
      color: 'bg-brand-lime text-brand-navy',
    },
  ];

  const faqs = [
    {
      question: 'How does cost sharing work on RouteBloom?',
      answer:
        'Drivers determine a reasonable contribution per seat strictly to offset fuel and toll charges. RouteBloom does not charge commission fees, ensuring everyday highway travel remains affordable.',
    },
    {
      question: 'Can female commuters travel in ladies-only rides?',
      answer:
        'Yes! Drivers can flag rides as "Ladies Only". These rides are clearly badged and can be filtered during search for safe, comfortable travel for women.',
    },
    {
      question: 'What happens if a driver or passenger cancels?',
      answer:
        'Our atomic booking engine ensures that if a confirmed passenger cancels, their reserved seats are immediately restored to the marketplace, and the other party is notified instantly.',
    },
    {
      question: 'How do I coordinate pickup and drop locations?',
      answer:
        'Each ride specifies central pickup areas (like Benz Circle or College Gates). Once your seat is reserved, you can communicate directly through real-time chat.',
    },
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 space-y-20 sm:space-y-28 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-xs font-bold tracking-wide uppercase select-none">
              <span className="w-2 h-2 rounded-full bg-brand-violet animate-ping" />
              🌺 India's Vibrant Carpool Community
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight leading-[1.1]">
              Same direction.{' '}
              <span className="bg-gradient-to-r from-brand-violet via-brand-orange to-brand-pink bg-clip-text text-transparent">
                Better journey.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-brand-navy/70 max-w-xl leading-relaxed">
              Why travel with empty seats? RouteBloom connects students, office commuters,
              and everyday highway travelers across Andhra Pradesh, Telangana, and beyond.
              Save on fuel, make real friends, and travel comfortably.
            </p>

            {/* Interactive Ride Search Bar */}
            <div className="pt-2">
              <RideSearchForm />
            </div>

            {/* Honest Trust Metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-brand-navy/60 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                <span>Zero Platform Booking Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                <span>Verified Commuter Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-violet" />
                <span>Atomic Seat Safeguards</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Animated Vehicle Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <HeroVehicleScene />
          </motion.div>
        </div>
      </section>

      {/* 2. POPULAR COMMUTER CORRIDORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="orange" size="md">
            Trending Highways
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Popular Shared Corridors
          </h2>
          <p className="text-sm sm:text-base text-brand-navy/60">
            Hundreds of empty car seats shared every week between colleges, tech parks, and coastal hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRoutes.map((route, i) => (
            <motion.div
              key={route.from + route.to}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                hoverable
                className="p-5 h-full flex flex-col justify-between"
                onClick={() =>
                  navigate(`/rides?origin=${route.from}&destination=${route.to}`)
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={route.color as any}>
                      {route.tag}
                    </Badge>
                    <span className="text-xs text-brand-navy/50 font-semibold">{route.distance}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-brand-navy">
                      <span>{route.from}</span>
                      <ArrowRight className="w-4 h-4 text-brand-violet" />
                      <span>{route.to}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-brand-navy/50 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {route.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-brand-violet/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-brand-navy/50 uppercase font-bold block">Avg. Share</span>
                    <span className="text-base font-bold text-brand-violet">{route.price}</span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Find Rides
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. HOW ROUTEBLOOM WORKS */}
      <section className="bg-brand-lavender/30 py-16 sm:py-20 border-y border-brand-violet/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="violet" size="md">
              Simple 3-Step Journey
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy">
              How RouteBloom Works
            </h2>
            <p className="text-sm sm:text-base text-brand-navy/60">
              No complicated logistics. Just simple community carpooling built for Indian commuters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-3xl p-7 shadow-sm border border-brand-violet/10 relative overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.color} shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-extrabold text-brand-navy/15 font-heading">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-brand-navy/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WHY ROUTEBLOOM - VALUE PROPOSITION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <Badge variant="lime" size="md">
              Community Benefits
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy">
              More than just a ride. A better way to move.
            </h2>
            <p className="text-base text-brand-navy/70 leading-relaxed">
              Every day, thousands of cars commute between cities with 3 or 4 empty seats.
              RouteBloom turns those empty seats into shared savings, meaningful road trips,
              and cleaner Indian highways.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0 mt-0.5">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">Cut Fuel Expenses in Half</h4>
                  <p className="text-xs text-brand-navy/60">
                    Share toll and fuel costs with fellow passengers traveling to the same city.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-brand-lime/30 flex items-center justify-center text-[#5B7808] shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">Reduce Highway Carbon Footprint</h4>
                  <p className="text-xs text-brand-navy/60">
                    Fewer individual vehicles on NH16 and NH65 means fewer emissions and less traffic congestion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-brand-pink/20 flex items-center justify-center text-[#BE185D] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">Ladies-Only Carpools</h4>
                  <p className="text-xs text-brand-navy/60">
                    Comfortable, vetted rides exclusively for women commuters and students.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link to="/offer-ride">
                <Button variant="orange" size="md">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Publish Your First Ride
                </Button>
              </Link>
              <Link to="/safety">
                <Button variant="outline" size="md">
                  Safety Information
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-brand-violet p-6 rounded-3xl text-white shadow-lg space-y-2">
                <span className="text-3xl font-extrabold font-heading">₹1,200+</span>
                <p className="text-xs text-white/80">Average monthly fuel savings for daily commuters</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-brand-violet/10 shadow-sm space-y-2 text-brand-navy">
                <span className="text-3xl font-extrabold font-heading text-brand-orange">100%</span>
                <p className="text-xs text-brand-navy/60">Direct community cost-sharing with no hidden fees</p>
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="bg-brand-lime p-6 rounded-3xl text-brand-navy shadow-lg space-y-2">
                <span className="text-3xl font-extrabold font-heading">4.9 ★</span>
                <p className="text-xs text-brand-navy/80">Community travel rating across active routes</p>
              </div>
              <div className="bg-brand-navy p-6 rounded-3xl text-white shadow-sm space-y-2">
                <span className="text-3xl font-extrabold font-heading text-brand-turquoise">Instant</span>
                <p className="text-xs text-white/70">Automatic seat confirmation with race-condition guards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="turquoise" size="md">
            Got Questions?
          </Badge>
          <h2 className="font-heading text-3xl font-extrabold text-brand-navy">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.question}
                className="bg-white border border-brand-violet/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-brand-navy text-sm sm:text-base hover:text-brand-violet"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-brand-navy/50 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-violet' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-4 text-xs sm:text-sm text-brand-navy/70 leading-relaxed border-t border-brand-violet/5 pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-brand-violet via-[#855BFF] to-brand-orange p-8 sm:p-12 text-white text-center shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to bloom your next commute?
            </h2>
            <p className="text-white/80 text-sm sm:text-base">
              Join thousands of commuters sharing rides every day across Andhra Pradesh and Telangana.
              Sign up in 30 seconds.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link to="/register">
                <Button variant="lime" size="lg" className="font-bold">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/rides">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 border border-white/20">
                  Explore Rides
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
