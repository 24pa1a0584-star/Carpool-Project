import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Heart, Compass, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy text-white/80 pt-16 pb-12 border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 p-1.5 flex items-center justify-center">
                <img src="/logo.svg" alt="RouteBloom" className="w-full h-full" />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-white">
                Route<span className="text-brand-violet">Bloom</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              RouteBloom is India's colourful carpool & ride-sharing community board.
              Connecting commuters traveling in the same direction to share empty seats,
              split highway fuel costs, and make everyday travel enjoyable and sustainable.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-lime bg-brand-lime/10 px-3 py-1 rounded-full border border-brand-lime/20 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Community Cost Sharing
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-turquoise bg-brand-turquoise/10 px-3 py-1 rounded-full border border-brand-turquoise/20 font-medium">
                <Shield className="w-3.5 h-3.5" />
                Safety First
              </span>
            </div>
          </div>

          {/* Column 2: Popular AP / Telangana Routes */}
          <div className="space-y-3">
            <h4 className="font-heading text-base font-bold text-white tracking-wide uppercase text-xs">
              Popular Routes
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/rides?origin=Vijayawada&destination=Hyderabad" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                  Vijayawada ↔ Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/rides?origin=Bhimavaram&destination=Rajahmundry" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-violet" />
                  Bhimavaram ↔ Rajahmundry
                </Link>
              </li>
              <li>
                <Link to="/rides?origin=Rajahmundry&destination=Visakhapatnam" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-turquoise" />
                  Rajahmundry ↔ Vizag
                </Link>
              </li>
              <li>
                <Link to="/rides?origin=Guntur&destination=Amaravati" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-lime" />
                  Guntur ↔ Amaravati
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-heading text-base font-bold text-white tracking-wide uppercase text-xs">
              Commuter Portal
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/rides" className="hover:text-white transition-colors">
                  Find a Ride
                </Link>
              </li>
              <li>
                <Link to="/offer-ride" className="hover:text-white transition-colors">
                  Offer Empty Seats
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Passenger Dashboard
                </Link>
              </li>
              <li>
                <Link to="/driver" className="hover:text-white transition-colors">
                  Driver Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Safety */}
          <div className="space-y-3">
            <h4 className="font-heading text-base font-bold text-white tracking-wide uppercase text-xs">
              Trust & Guidelines
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <span className="text-white/50 cursor-default">
                  Zero Commercial Markup
                </span>
              </li>
              <li>
                <span className="text-white/50 cursor-default">
                  ID & Profile Trust
                </span>
              </li>
              <li>
                <Link to="/safety#conduct" className="hover:text-white transition-colors">
                  Community Code of Conduct
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Project & Student Developer Attributions */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div className="text-center md:text-left space-y-1">
            <p>
              © {new Date().getFullYear()} RouteBloom. Built with passion for sustainable community mobility.
            </p>
            <p className="text-[11px] text-white/40">
              Developer: <span className="text-white/70">[FRIEND_FULL_NAME]</span> • Course: <span className="text-white/70">[DEGREE_AND_BRANCH]</span> • Institution: <span className="text-white/70">[COLLEGE_NAME]</span> • Reg: <span className="text-white/70">[REGISTRATION_NUMBER]</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-white/70">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
            <span>for Andhra Pradesh & Telangana Commuters</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
