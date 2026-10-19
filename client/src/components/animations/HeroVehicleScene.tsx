import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, Leaf, Sparkles, Navigation } from 'lucide-react';

export const HeroVehicleScene: React.FC = () => {
  return (
    <div className="relative w-full h-[360px] sm:h-[440px] md:h-[480px] flex items-center justify-center overflow-hidden rounded-4xl bg-gradient-to-br from-brand-navy via-[#1B2144] to-[#11152C] border border-white/10 shadow-2xl p-4 select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-10 w-64 h-64 bg-brand-violet/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-72 h-72 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-48 h-48 bg-brand-lime/15 rounded-full blur-2xl pointer-events-none" />

      {/* SVG Canvas for Highway & Moving Vehicle */}
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full max-w-[560px] max-h-[380px] drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7046FF" />
            <stop offset="50%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#FF7049" />
          </linearGradient>

          <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CCF45B" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer glowing trajectory path */}
        <path
          d="M 60 320 C 180 340, 200 180, 320 200 C 420 220, 440 90, 520 80"
          stroke="url(#roadGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.3"
          filter="url(#glowEffect)"
        />

        {/* Solid road surface */}
        <path
          id="highwayPath"
          d="M 60 320 C 180 340, 200 180, 320 200 C 420 220, 440 90, 520 80"
          stroke="#1F264A"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Animated dashed highway stripe */}
        <path
          d="M 60 320 C 180 340, 200 180, 320 200 C 420 220, 440 90, 520 80"
          stroke="#CCF45B"
          strokeWidth="2.5"
          strokeDasharray="8 12"
          strokeLinecap="round"
          className="animate-[dash_20s_linear_infinite]"
        />

        {/* Origin Pin: Bhimavaram / Vijayawada */}
        <g transform="translate(60, 320)">
          <circle r="18" fill="#7046FF" opacity="0.25" className="animate-ping" />
          <circle r="12" fill="#7046FF" stroke="#FFF9F2" strokeWidth="2.5" />
          <circle r="4" fill="#CCF45B" />
        </g>

        {/* Intermediate Stop: Suryapet / Tanuku */}
        <g transform="translate(320, 200)">
          <circle r="10" fill="#2DD4BF" opacity="0.3" className="animate-pulse" />
          <circle r="7" fill="#2DD4BF" stroke="#FFF9F2" strokeWidth="2" />
        </g>

        {/* Destination Pin: Hyderabad / Vizag */}
        <g transform="translate(520, 80)">
          <circle r="22" fill="#FF7049" opacity="0.2" className="animate-ping" />
          <circle r="14" fill="#FF7049" stroke="#FFF9F2" strokeWidth="3" />
          <circle r="5" fill="#FFF9F2" />
        </g>

        {/* Animated Moving Vehicle */}
        <motion.g
          animate={{
            offsetDistance: ['0%', '100%'],
          }}
          transition={{
            duration: 8,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            offsetPath: `path("M 60 320 C 180 340, 200 180, 320 200 C 420 220, 440 90, 520 80")`,
            offsetRotate: 'auto',
          }}
        >
          {/* Headlight beam */}
          <polygon points="12,-6 35,-14 35,14 12,6" fill="#CCF45B" opacity="0.25" />

          {/* Car chassis */}
          <rect x="-16" y="-9" width="30" height="18" rx="6" fill="url(#carGradient)" stroke="#11152C" strokeWidth="1.5" />
          {/* Windshield */}
          <rect x="-4" y="-7" width="12" height="14" rx="3" fill="#11152C" opacity="0.8" />
          {/* Passenger dots */}
          <circle cx="-1" cy="-2.5" r="2" fill="#FFF9F2" />
          <circle cx="-1" cy="2.5" r="2" fill="#FF7049" />
          {/* Headlights */}
          <circle cx="13" cy="-6" r="1.5" fill="#CCF45B" />
          <circle cx="13" cy="6" r="1.5" fill="#CCF45B" />
        </motion.g>
      </svg>

      {/* Floating Badges */}
      {/* 1. Origin Label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 left-6 glass-panel-dark px-3.5 py-2 rounded-2xl flex items-center gap-2 text-white text-xs border border-white/10"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-brand-violet animate-pulse" />
        <div>
          <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Pickup</p>
          <p className="font-semibold text-white">Vijayawada</p>
        </div>
      </motion.div>

      {/* 2. Destination Label */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-6 right-6 glass-panel-dark px-3.5 py-2 rounded-2xl flex items-center gap-2 text-white text-xs border border-white/10"
      >
        <MapPin className="w-4 h-4 text-brand-orange" />
        <div>
          <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Drop-off</p>
          <p className="font-semibold text-white">Hyderabad</p>
        </div>
      </motion.div>

      {/* 3. Floating Savings Pill */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 left-6 bg-brand-lime text-brand-navy px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold shadow-lg"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-navy" />
        <span>₹550 / seat • 3 Left</span>
      </motion.div>

      {/* 4. Eco / Trust Pill */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-8 right-8 glass-panel-dark text-white px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs border border-white/10"
      >
        <div className="w-5 h-5 rounded-full bg-brand-turquoise/20 flex items-center justify-center text-brand-turquoise">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span className="font-medium text-[11px]">Verified Commuters</span>
      </motion.div>
    </div>
  );
};
