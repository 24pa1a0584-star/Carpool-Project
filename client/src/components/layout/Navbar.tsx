import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Menu,
  X,
  Compass,
  PlusCircle,
  Bell,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Shield,
  Car,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Find a Ride', path: '/rides', icon: Compass },
    { label: 'Offer a Ride', path: '/offer-ride', icon: PlusCircle },
    { label: 'Safety', path: '/safety', icon: Shield },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-brand-violet/10 py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-brand-navy p-1.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <img src="/logo.svg" alt="RouteBloom" className="w-full h-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-brand-navy">
                Route<span className="text-brand-violet">Bloom</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-orange -mt-1 hidden sm:block">
                Same direction. Better journey.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-violet/10 text-brand-violet font-semibold'
                      : 'text-brand-navy/80 hover:text-brand-navy hover:bg-brand-lavender/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Messages Link */}
                <Link
                  to="/messages"
                  className="relative p-2.5 rounded-2xl text-brand-navy/70 hover:text-brand-violet hover:bg-brand-lavender/50 transition-colors"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Offer a Ride Button */}
                <Link to="/offer-ride">
                  <Button variant="orange" size="sm">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Offer Ride
                  </Button>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-2xl border border-brand-violet/20 hover:border-brand-violet/40 bg-white/80 transition-all select-none"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-violet/20"
                    />
                    <span className="text-sm font-semibold text-brand-navy max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-brand-navy/50" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-brand-violet/10 p-2 z-50 text-left"
                      >
                        <div className="px-3.5 py-2.5 border-b border-brand-violet/10 mb-1">
                          <p className="text-sm font-bold text-brand-navy truncate">{user.name}</p>
                          <p className="text-xs text-brand-navy/50 truncate">{user.email}</p>
                          {user.role === 'admin' && (
                            <Badge variant="lime" className="mt-1">
                              Super Admin
                            </Badge>
                          )}
                        </div>

                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-brand-navy/80 hover:text-brand-violet hover:bg-brand-lavender/50 rounded-2xl transition-colors"
                        >
                          <Compass className="w-4 h-4 text-brand-violet" />
                          Passenger Trips
                        </Link>

                        <Link
                          to="/driver"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-brand-navy/80 hover:text-brand-orange hover:bg-brand-orange/5 rounded-2xl transition-colors"
                        >
                          <Car className="w-4 h-4 text-brand-orange" />
                          Driver Console
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-brand-navy/80 hover:text-brand-navy hover:bg-brand-lavender/40 rounded-2xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-brand-navy/60" />
                          My Profile
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-brand-violet font-semibold hover:bg-brand-violet/10 rounded-2xl transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Moderation
                          </Link>
                        )}

                        <div className="my-1 border-t border-brand-violet/10" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link to="/messages" className="relative p-2 text-brand-navy/70">
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-white/80 border border-brand-violet/20 text-brand-navy hover:bg-brand-lavender/50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-b border-brand-violet/15 px-6 pt-4 pb-8 space-y-4 shadow-xl overflow-hidden"
          >
            {user ? (
              <div className="p-3 bg-brand-lavender/40 rounded-3xl flex items-center gap-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-violet"
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-brand-navy truncate">{user.name}</p>
                  <p className="text-xs text-brand-navy/60 truncate">{user.email}</p>
                </div>
              </div>
            ) : null}

            <nav className="flex flex-col space-y-1">
              <Link
                to="/rides"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-navy hover:bg-brand-lavender/40"
              >
                <Compass className="w-5 h-5 text-brand-violet" />
                Find a Ride
              </Link>

              <Link
                to="/offer-ride"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-navy hover:bg-brand-lavender/40"
              >
                <PlusCircle className="w-5 h-5 text-brand-orange" />
                Offer a Ride
              </Link>

              <Link
                to="/safety"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-navy hover:bg-brand-lavender/40"
              >
                <Shield className="w-5 h-5 text-brand-turquoise" />
                Safety Guidelines
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-navy hover:bg-brand-lavender/40"
                  >
                    <Compass className="w-5 h-5 text-brand-violet" />
                    My Bookings
                  </Link>

                  <Link
                    to="/driver"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-navy hover:bg-brand-lavender/40"
                  >
                    <Car className="w-5 h-5 text-brand-orange" />
                    Driver Console
                  </Link>

                  <Link
                    to="/messages"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-navy hover:bg-brand-lavender/40"
                  >
                    <MessageSquare className="w-5 h-5 text-brand-pink" />
                    Messages
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-navy hover:bg-brand-lavender/40"
                  >
                    <UserIcon className="w-5 h-5 text-brand-navy/60" />
                    Profile & Preferences
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold text-brand-violet bg-brand-violet/10"
                    >
                      <Shield className="w-5 h-5" />
                      Super Admin Panel
                    </Link>
                  )}

                  <div className="pt-2">
                    <Button variant="danger" fullWidth onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-4 flex flex-col gap-2.5">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" fullWidth>
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button variant="primary" fullWidth>
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
