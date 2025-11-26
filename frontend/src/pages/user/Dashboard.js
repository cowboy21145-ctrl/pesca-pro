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
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedRegistrations: 0,
    totalCatches: 0,
    totalWeight: 0
  });

  useEffect(() => {
    fetchRegistrations();
    fetchDrafts();
  }, []);

  // Debug: Log drafts whenever they change
  useEffect(() => {
    console.log('Drafts state updated:', drafts);
    console.log('Drafts length:', drafts?.length || 0);
  }, [drafts]);

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

  const fetchDrafts = async () => {
    setDraftsLoading(true);
    try {
      const response = await registrationAPI.getMyDrafts();
      console.log('Drafts API response:', response); // Debug log
      console.log('Drafts data:', response.data); // Debug log
      
      // Handle different response structures
      const draftsData = response?.data || response || [];
      
      if (Array.isArray(draftsData)) {
        console.log('Setting drafts:', draftsData); // Debug log
        setDrafts(draftsData);
      } else {
        console.warn('Drafts data is not an array:', draftsData);
        setDrafts([]);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      console.error('Error details:', error.response?.data || error.message);
      setDrafts([]); // Ensure drafts is set to empty array on error
    } finally {
      setDraftsLoading(false);
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
        className="bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 text-white"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl md:text-3xl">🎣</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-ocean-200 mt-1 text-sm md:text-base">
              Ready for your next fishing adventure?
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
            className="card p-4 md:p-6"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3 md:mb-4 flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-xs md:text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Draft Registrations */}
      {!draftsLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6">Continue Registration</h2>
          {drafts && Array.isArray(drafts) && drafts.length > 0 ? (
            <div className="grid gap-4">
              {drafts.map((draft) => {
                // Ensure registration_link exists
                if (!draft.registration_link) {
                  console.warn('Draft missing registration_link:', draft);
                  return null;
                }
                return (
                <Link
                  key={draft.registration_id}
                  to={`/t/${draft.registration_link}`}
                  className="card p-4 md:p-6 hover:shadow-xl transition-all group border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50"
                >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                      <ClipboardDocumentListIcon className="w-6 h-6 md:w-7 md:h-7 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm md:text-base text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                          {draft.tournament_name}
                        </h3>
                        <span className="badge bg-amber-100 text-amber-700 text-xs">Draft</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(draft.start_date).toLocaleDateString()}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{draft.area_count || 0} areas selected</span>
                        {draft.bank_account_no && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="whitespace-nowrap">Payment info saved</span>
                          </>
                        )}
                      </div>
                      {draft.updated_at && (
                        <p className="text-xs text-slate-400 mt-1">
                          Last saved: {new Date(draft.updated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 w-full sm:w-auto">
                    <span className="text-amber-600 font-medium text-sm">Continue →</span>
                    <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                  </div>
                </Link>
              );
            })}
            </div>
          ) : (
            <div className="card p-6 md:p-8 text-center">
              <ClipboardDocumentListIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm md:text-base">No incomplete registrations found</p>
              <p className="text-slate-400 text-xs md:text-sm mt-2">Start a new tournament registration to see it here</p>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Show loading state for drafts */}
      {draftsLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6">Continue Registration</h2>
          <div className="card p-6 md:p-8 text-center">
            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm md:text-base">Loading drafts...</p>
          </div>
        </motion.div>
      )}

      {/* Recent Registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-3">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">My Tournaments</h2>
          <Link to="/user/registrations" className="text-ocean-600 hover:text-ocean-700 font-medium flex items-center gap-1 text-sm md:text-base touch-manipulation min-h-[44px] px-2">
            View All <ArrowRightIcon className="w-4 h-4 flex-shrink-0" />
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
                className="card p-4 md:p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-ocean-100 to-ocean-50 flex items-center justify-center flex-shrink-0">
                      <TrophyIcon className="w-6 h-6 md:w-7 md:h-7 text-ocean-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm md:text-base text-slate-800 group-hover:text-ocean-600 transition-colors truncate">
                        {registration.tournament_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(registration.start_date).toLocaleDateString()}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{registration.area_count} areas selected</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 w-full sm:w-auto">
                    <span className={`${getStatusBadge(registration.status)} text-xs md:text-sm whitespace-nowrap`}>
                      {registration.status}
                    </span>
                    <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-ocean-600 transition-colors flex-shrink-0" />
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
        className="bg-gradient-to-r from-fish-50 to-fish-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-fish-200"
      >
        <h3 className="font-semibold text-fish-800 mb-2 md:mb-3 text-sm md:text-base">💡 Quick Tips</h3>
        <ul className="text-fish-700 text-xs md:text-sm space-y-1.5 md:space-y-2">
          <li>• Make sure your registration is confirmed before the tournament starts</li>
          <li>• Upload your catch photos clearly with visible weight measurement</li>
          <li>• Check the leaderboard regularly to see your ranking</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default UserDashboard;

