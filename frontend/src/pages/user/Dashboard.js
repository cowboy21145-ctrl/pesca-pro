import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { registrationAPI } from '../../services/api';
import {
  TrophyIcon,
  ClipboardDocumentListIcon,
  ScaleIcon,
  PhotoIcon,
  ArrowRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedRegistrations: 0,
    totalCatches: 0,
    totalWeight: 0
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await registrationAPI.getMyRegistrations();
      const data = response.data;
      setRegistrations(data);
      
      setStats({
        totalRegistrations: data.length,
        confirmedRegistrations: data.filter(r => r.status === 'confirmed').length,
        totalCatches: data.reduce((sum, r) => sum + (r.catch_count || 0), 0),
        totalWeight: data.reduce((sum, r) => sum + parseFloat(r.total_weight || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      confirmed: 'badge badge-confirmed',
      rejected: 'badge badge-rejected',
      cancelled: 'badge bg-slate-100 text-slate-800'
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-3xl p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-3xl">🎣</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-ocean-200 mt-1">
              Ready for your next fishing adventure?
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ClipboardDocumentListIcon, label: 'Registrations', value: stats.totalRegistrations, color: 'ocean' },
          { icon: TrophyIcon, label: 'Confirmed', value: stats.confirmedRegistrations, color: 'forest' },
          { icon: PhotoIcon, label: 'Total Catches', value: stats.totalCatches, color: 'fish' },
          { icon: ScaleIcon, label: 'Total Weight', value: `${stats.totalWeight.toFixed(2)} kg`, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">My Tournaments</h2>
          <Link to="/user/registrations" className="text-ocean-600 hover:text-ocean-700 font-medium flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ocean-50 flex items-center justify-center">
              <TrophyIcon className="w-10 h-10 text-ocean-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Registrations Yet</h3>
            <p className="text-slate-500 mb-6">
              You haven't registered for any tournaments. Get a tournament link from an organizer to join!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {registrations.slice(0, 3).map((registration) => (
              <Link
                key={registration.registration_id}
                to={`/user/registrations/${registration.registration_id}`}
                className="card p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ocean-100 to-ocean-50 flex items-center justify-center">
                      <TrophyIcon className="w-7 h-7 text-ocean-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-ocean-600 transition-colors">
                        {registration.tournament_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(registration.start_date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{registration.area_count} areas selected</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={getStatusBadge(registration.status)}>
                      {registration.status}
                    </span>
                    <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-ocean-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-fish-50 to-fish-100 rounded-2xl p-6 border border-fish-200"
      >
        <h3 className="font-semibold text-fish-800 mb-3">💡 Quick Tips</h3>
        <ul className="text-fish-700 text-sm space-y-2">
          <li>• Make sure your registration is confirmed before the tournament starts</li>
          <li>• Upload your catch photos clearly with visible weight measurement</li>
          <li>• Check the leaderboard regularly to see your ranking</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default UserDashboard;

