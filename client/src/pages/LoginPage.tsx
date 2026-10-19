import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // toast shown in context
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click demo logins for immediate faculty/demo testing
  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate(from, { replace: true });
    } catch (err) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-4xl shadow-2xl border border-brand-violet/15 overflow-hidden">
        {/* Left Colorful Brand Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-brand-violet via-[#8050FF] to-brand-orange p-8 text-white flex flex-col justify-between relative overflow-hidden select-none">
          <div className="space-y-4 relative z-10 text-left">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white/10 p-1 flex items-center justify-center">
                <img src="/logo.svg" alt="RouteBloom" className="w-full h-full" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                RouteBloom
              </span>
            </Link>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Welcome back to pleasant journeys.
            </h2>
            <p className="text-white/80 text-xs leading-relaxed">
              Log in to check ride requests, chat with commuters, and manage your trips.
            </p>
          </div>

          <div className="relative z-10 pt-8 space-y-3">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-brand-lime">
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Evaluator Demo
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('priya.sharma@example.com', 'RouteBloom@123')}
                  className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-left text-[11px] font-semibold text-white transition-colors"
                >
                  ⚡ Login as Driver (Priya Sharma)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('sneha.patel@example.com', 'RouteBloom@123')}
                  className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-left text-[11px] font-semibold text-white transition-colors"
                >
                  ⚡ Login as Passenger (Sneha Patel)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@routebloom.com', 'RouteBloom@Admin2026')}
                  className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-left text-[11px] font-semibold text-white transition-colors"
                >
                  🛡️ Login as Super Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-7 p-8 sm:p-12 text-left space-y-6 flex flex-col justify-center">
          <div>
            <h3 className="font-heading text-2xl font-extrabold text-brand-navy">
              Account Login
            </h3>
            <p className="text-xs text-brand-navy/60 mt-1">
              Enter your credentials to access your RouteBloom travel board.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="font-bold text-base mt-2"
            >
              Log In to RouteBloom <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-brand-navy/60 pt-2 border-t border-brand-violet/10">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-violet hover:underline">
              Create an account in 30 seconds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
