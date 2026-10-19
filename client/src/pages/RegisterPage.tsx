import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, User, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        phone,
        city,
      });
      navigate('/dashboard');
    } catch (err) {
      // toast in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-4xl shadow-2xl border border-brand-violet/15 overflow-hidden">
        {/* Left Colorful Brand Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-brand-orange via-[#FF7E5B] to-brand-violet p-8 text-white flex flex-col justify-between relative overflow-hidden select-none text-left">
          <div className="space-y-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white/10 p-1 flex items-center justify-center">
                <img src="/logo.svg" alt="RouteBloom" className="w-full h-full" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                RouteBloom
              </span>
            </Link>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Start sharing rides today.
            </h2>
            <p className="text-white/80 text-xs leading-relaxed">
              Join students, tech commuters, and highway travelers across Andhra Pradesh and Telangana.
            </p>
          </div>

          <div className="relative z-10 pt-8 space-y-3">
            <div className="flex items-center gap-2 text-xs text-white/90">
              <ShieldCheck className="w-4 h-4 text-brand-lime" />
              <span>100% Free Commuter Registration</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <ShieldCheck className="w-4 h-4 text-brand-lime" />
              <span>Zero hidden platform commissions</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <ShieldCheck className="w-4 h-4 text-brand-lime" />
              <span>Safe phone masking until booking</span>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-7 p-8 sm:p-12 text-left space-y-6 flex flex-col justify-center">
          <div>
            <h3 className="font-heading text-2xl font-extrabold text-brand-navy">
              Create Commuter Account
            </h3>
            <p className="text-xs text-brand-navy/60 mt-1">
              Enter your details to publish or reserve seats on RouteBloom.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Aditya Varma"
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. aditya@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Create Password (min. 6 chars)"
              type="password"
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone (for confirmed booking)"
                placeholder="e.g. +91 98480 12345"
                leftIcon={<Phone className="w-4 h-4" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Primary City"
                placeholder="e.g. Vijayawada"
                leftIcon={<MapPin className="w-4 h-4" />}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="orange"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="font-bold text-base mt-2"
            >
              Sign Up & Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-brand-navy/60 pt-2 border-t border-brand-violet/10">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-orange hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
