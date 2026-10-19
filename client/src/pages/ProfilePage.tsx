import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { User, Phone, MapPin, Sliders, Lock, ShieldCheck, Star } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || 'Vijayawada');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Preferences
  const [smoking, setSmoking] = useState<boolean>(user?.preferences?.smoking ?? false);
  const [music, setMusic] = useState<boolean>(user?.preferences?.music ?? true);
  const [ac, setAc] = useState<boolean>(user?.preferences?.ac ?? true);
  const [pets, setPets] = useState<boolean>(user?.preferences?.pets ?? false);
  const [chatter, setChatter] = useState<'quiet' | 'moderate' | 'talkative'>(
    user?.preferences?.chatter || 'moderate'
  );

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        name,
        bio,
        city,
        phone,
        avatar,
        preferences: {
          smoking,
          music,
          ac,
          pets,
          ladiesOnly: user?.preferences?.ladiesOnly || false,
          chatter,
        },
      });
    } catch (err) {
      // Handled
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPass(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
      <div>
        <Badge variant="violet" size="sm" className="mb-1.5">
          Commuter Account
        </Badge>
        <h1 className="font-heading text-3xl font-extrabold text-brand-navy">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-brand-navy/60">
          Customize your public commuter identity, driving comfort, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Details Form */}
        <div className="md:col-span-7 space-y-6">
          <Card className="p-6 sm:p-8 space-y-5">
            <h3 className="font-heading text-lg font-bold text-brand-navy flex items-center gap-2 pb-3 border-b border-brand-violet/10">
              <User className="w-5 h-5 text-brand-violet" /> Personal Information
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Primary City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Shared with confirmed ride participants only."
              />

              <div>
                <label className="block text-xs font-semibold text-brand-navy/70 mb-1.5 uppercase">
                  About You (Bio)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-brand-violet/20 rounded-2xl p-3 text-sm text-brand-navy outline-none focus:border-brand-violet"
                />
              </div>

              {/* Travel Preferences */}
              <div className="pt-2 border-t border-brand-violet/10 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70">
                  Travel Habits & Preferences
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-brand-lavender/30 rounded-2xl">
                    <input
                      type="checkbox"
                      checked={ac}
                      onChange={(e) => setAc(e.target.checked)}
                      className="accent-brand-violet"
                    />
                    <span>AC Preferred</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-brand-lavender/30 rounded-2xl">
                    <input
                      type="checkbox"
                      checked={music}
                      onChange={(e) => setMusic(e.target.checked)}
                      className="accent-brand-violet"
                    />
                    <span>Music Allowed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-brand-lavender/30 rounded-2xl">
                    <input
                      type="checkbox"
                      checked={pets}
                      onChange={(e) => setPets(e.target.checked)}
                      className="accent-brand-violet"
                    />
                    <span>Pet Friendly</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-brand-lavender/30 rounded-2xl">
                    <input
                      type="checkbox"
                      checked={smoking}
                      onChange={(e) => setSmoking(e.target.checked)}
                      className="accent-brand-violet"
                    />
                    <span>Smoking Allowed</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-navy/70 mb-1.5 uppercase">
                    Conversation Style
                  </label>
                  <select
                    value={chatter}
                    onChange={(e: any) => setChatter(e.target.value)}
                    className="w-full bg-brand-lavender/30 rounded-2xl px-3.5 py-2.5 text-sm text-brand-navy outline-none"
                  >
                    <option value="quiet">Quiet (prefer relaxing silently)</option>
                    <option value="moderate">Moderate (open to casual chat)</option>
                    <option value="talkative">Talkative (love meeting new people!)</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isUpdatingProfile}
                className="mt-2"
              >
                Save Profile Changes
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Member Stats & Password Update */}
        <div className="md:col-span-5 space-y-6">
          {/* Member Card */}
          <Card className="p-6 text-center space-y-3">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-brand-violet/20"
            />
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-navy">{user?.name}</h3>
              <p className="text-xs text-brand-navy/50">{user?.email}</p>
              <div className="flex justify-center items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{user?.stats?.rating || '5.0'} Rating</span>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-violet/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-brand-lavender/30 p-2.5 rounded-xl">
                <span className="font-bold text-base text-brand-violet block">
                  {user?.stats?.ridesTaken || 0}
                </span>
                <span className="text-[10px] text-brand-navy/50 uppercase">Rides Taken</span>
              </div>
              <div className="bg-brand-lavender/30 p-2.5 rounded-xl">
                <span className="font-bold text-base text-brand-orange block">
                  {user?.stats?.ridesOffered || 0}
                </span>
                <span className="text-[10px] text-brand-navy/50 uppercase">Rides Offered</span>
              </div>
            </div>
          </Card>

          {/* Change Password Card */}
          <Card className="p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-brand-navy flex items-center gap-2 pb-2 border-b border-brand-violet/10">
              <Lock className="w-4 h-4 text-brand-violet" /> Security Credentials
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <Input
                label="Current Password"
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <Input
                label="New Password"
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="outline"
                fullWidth
                size="sm"
                isLoading={isChangingPass}
              >
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
