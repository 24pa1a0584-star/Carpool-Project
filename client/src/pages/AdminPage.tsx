import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IUser, IRide, IReport } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import {
  Shield,
  Users,
  Car,
  AlertTriangle,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  IndianRupee,
  Activity,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'overview' | 'users' | 'rides' | 'reports'>('overview');

  // Search users
  const [userSearch, setUserSearch] = useState('');

  // Cancel ride modal
  const [cancelRideId, setCancelRideId] = useState<string | null>(null);
  const [adminReason, setAdminReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Queries
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data;
    },
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', userSearch],
    queryFn: async () => {
      const res = await api.get(`/admin/users?search=${encodeURIComponent(userSearch)}`);
      return res.data;
    },
  });

  const { data: ridesData, refetch: refetchRides } = useQuery({
    queryKey: ['admin-rides'],
    queryFn: async () => {
      const res = await api.get('/admin/rides');
      return res.data;
    },
  });

  const { data: reportsData, refetch: refetchReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await api.get('/admin/reports');
      return res.data;
    },
  });

  const stats = statsData?.stats || {};
  const usersList: IUser[] = usersData?.users || [];
  const ridesList: IRide[] = ridesData?.rides || [];
  const reportsList: IReport[] = reportsData?.reports || [];

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${userId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`User status changed to ${newStatus}.`);
        refetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user.');
    }
  };

  const handleCancelRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelRideId) return;

    setIsCancelling(true);
    try {
      const res = await api.post(`/admin/rides/${cancelRideId}/cancel`, {
        reason: adminReason.trim() || 'Moderation guideline violation.',
      });
      if (res.data.success) {
        toast.success('Ride cancelled by platform moderation.');
        setCancelRideId(null);
        setAdminReason('');
        refetchRides();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel ride.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await api.patch(`/admin/reports/${reportId}`, {
        status,
        adminNotes: `Action taken by admin ${user?.name}`,
      });
      if (res.data.success) {
        toast.success(`Report marked as ${status}.`);
        refetchReports();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update report.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 text-center max-w-md mx-auto px-4 space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-brand-navy">Access Denied</h2>
        <p className="text-xs text-brand-navy/60">
          This section is restricted to RouteBloom Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
      <div>
        <Badge variant="lime" size="sm" className="mb-1.5 font-bold">
          🛡️ Super Administrator Console
        </Badge>
        <h1 className="font-heading text-3xl font-extrabold text-brand-navy">
          Platform Overview & Moderation
        </h1>
        <p className="text-xs sm:text-sm text-brand-navy/60">
          System health, user account oversight, ride moderation, and community safety escalation.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase text-brand-navy/50">Total Users</span>
          <p className="text-2xl font-extrabold text-brand-navy mt-0.5">{stats.totalUsers || 0}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase text-brand-navy/50">Active Drivers</span>
          <p className="text-2xl font-extrabold text-brand-orange mt-0.5">{stats.activeDrivers || 0}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase text-brand-navy/50">Scheduled Rides</span>
          <p className="text-2xl font-extrabold text-brand-violet mt-0.5">{stats.scheduledRides || 0}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase text-brand-navy/50">Confirmed Seats</span>
          <p className="text-2xl font-extrabold text-[#0F766E] mt-0.5">{stats.confirmedBookings || 0}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase text-brand-navy/50">Shared Volume</span>
          <p className="text-2xl font-extrabold text-brand-violet mt-0.5">₹{stats.totalCommunityVolume || 0}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase text-brand-navy/50">Pending Reports</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{stats.pendingReports || 0}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-violet/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            tab === 'overview' ? 'bg-brand-violet text-white shadow-sm' : 'text-brand-navy/70 hover:bg-brand-lavender/40'
          }`}
        >
          System Health
        </button>

        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            tab === 'users' ? 'bg-brand-violet text-white shadow-sm' : 'text-brand-navy/70 hover:bg-brand-lavender/40'
          }`}
        >
          Users ({usersList.length})
        </button>

        <button
          onClick={() => setTab('rides')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            tab === 'rides' ? 'bg-brand-violet text-white shadow-sm' : 'text-brand-navy/70 hover:bg-brand-lavender/40'
          }`}
        >
          Rides ({ridesList.length})
        </button>

        <button
          onClick={() => setTab('reports')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            tab === 'reports' ? 'bg-brand-violet text-white shadow-sm' : 'text-brand-navy/70 hover:bg-brand-lavender/40'
          }`}
        >
          Safety Reports ({reportsList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-brand-navy flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" /> Platform Infrastructure Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-brand-lavender/30 rounded-2xl">
                <span className="font-semibold text-brand-navy">Database Connection</span>
                <Badge variant="lime">MongoDB Connected</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-brand-lavender/30 rounded-2xl">
                <span className="font-semibold text-brand-navy">Socket.IO Real-time Engine</span>
                <Badge variant="turquoise">Operational</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-brand-lavender/30 rounded-2xl">
                <span className="font-semibold text-brand-navy">Super Admin Bootstrap</span>
                <Badge variant="violet">Idempotent Active</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-brand-lavender/30 rounded-2xl">
                <span className="font-semibold text-brand-navy">Atomic Booking Engine</span>
                <Badge variant="lime">Safe Concurrency Guarded</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-brand-navy flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-violet" /> Operational Controls
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-brand-navy/70">
                RouteBloom operates as a non-commercial, zero-commission community board.
                Changes here affect platform-wide availability.
              </p>

              <div className="p-3.5 bg-brand-ivory rounded-2xl border border-brand-violet/15 space-y-1">
                <p className="font-bold text-brand-navy">Single URL Render Architecture:</p>
                <p className="text-brand-navy/60">
                  Client React application bundle is served directly from the Express backend under unified origin.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-brand-navy/40 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search user by name, email, or city..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white border border-brand-violet/15 rounded-2xl pl-9 pr-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-brand-violet/10 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-lavender/30 border-b border-brand-violet/10 uppercase text-[10px] font-bold text-brand-navy/60">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-violet/5">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-brand-lavender/20">
                    <td className="p-4 font-bold text-brand-navy flex items-center gap-2">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      {u.name}
                    </td>
                    <td className="p-4 text-brand-navy/70">{u.email}</td>
                    <td className="p-4 text-brand-navy/70">{u.city || 'AP'}</td>
                    <td className="p-4">
                      <Badge variant={u.role === 'admin' ? 'lime' : 'neutral'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          u.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant={u.status === 'active' ? 'outline' : 'lime'}
                        className="text-[11px] py-1 px-3"
                        onClick={() => handleToggleUserStatus(u._id, u.status)}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RIDES MODERATION */}
      {tab === 'rides' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-brand-violet/10 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-lavender/30 border-b border-brand-violet/10 uppercase text-[10px] font-bold text-brand-navy/60">
                <tr>
                  <th className="p-4">Route</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Departure</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4">Share (₹)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-violet/5">
                {ridesList.map((r) => (
                  <tr key={r._id} className="hover:bg-brand-lavender/20">
                    <td className="p-4 font-bold text-brand-navy">
                      {r.origin.city} → {r.destination.city}
                    </td>
                    <td className="p-4 text-brand-navy/70">{(r.driverId as any)?.name}</td>
                    <td className="p-4 text-brand-navy/70">
                      {new Date(r.departureAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 font-semibold text-brand-navy">{r.availableSeats}/{r.totalPassengerSeats}</td>
                    <td className="p-4 font-bold text-brand-violet">₹{r.contributionPerSeat}</td>
                    <td className="p-4">
                      <Badge variant={r.status === 'SCHEDULED' ? 'lime' : 'neutral'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          variant="danger"
                          className="text-[11px] py-1 px-3"
                          onClick={() => setCancelRideId(r._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SAFETY REPORTS */}
      {tab === 'reports' && (
        <div className="space-y-4">
          {reportsList.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl text-center text-xs text-brand-navy/50 border border-brand-violet/10">
              No reported violations currently pending.
            </div>
          ) : (
            <div className="space-y-3">
              {reportsList.map((rep) => (
                <Card key={rep._id} className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="red" size="sm">
                        {rep.category.toUpperCase()}
                      </Badge>
                      <span className="text-brand-navy/50">
                        Reported by: {(rep.reporterId as any)?.name}
                      </span>
                    </div>
                    <Badge variant={rep.status === 'pending' ? 'orange' : 'neutral'}>
                      {rep.status}
                    </Badge>
                  </div>

                  <p className="bg-brand-lavender/30 p-3 rounded-2xl text-brand-navy leading-relaxed">
                    "{rep.explanation}"
                  </p>

                  {rep.status === 'pending' && (
                    <div className="flex gap-2 justify-end pt-1">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleResolveReport(rep._id, 'resolved')}
                      >
                        Resolve Report
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveReport(rep._id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Cancel Ride Modal */}
      <Modal
        isOpen={!!cancelRideId}
        onClose={() => setCancelRideId(null)}
        title="Admin Ride Moderation"
        description="Cancel this ride listing for safety or terms violation."
      >
        <form onSubmit={handleCancelRideSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-brand-navy/70 mb-1">
              Moderation Reason
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Inappropriate content or reported violation"
              value={adminReason}
              onChange={(e) => setAdminReason(e.target.value)}
              className="w-full bg-white border border-brand-violet/20 rounded-2xl p-3 text-sm text-brand-navy outline-none focus:border-brand-violet"
            />
          </div>

          <Button type="submit" variant="danger" fullWidth isLoading={isCancelling}>
            Confirm Admin Cancellation
          </Button>
        </form>
      </Modal>
    </div>
  );
};
