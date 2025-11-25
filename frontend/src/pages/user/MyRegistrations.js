import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registrationAPI } from '../../services/api';
import {
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await registrationAPI.getMyRegistrations();
      setRegistrations(response.data);
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

  const filteredRegistrations = filter === 'all' 
    ? registrations 
    : registrations.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Registrations</h1>
          <p className="text-slate-500">View and manage your tournament registrations</p>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === status
                  ? 'bg-ocean-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ocean-50 flex items-center justify-center">
            <TrophyIcon className="w-10 h-10 text-ocean-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            {filter === 'all' ? 'No Registrations Yet' : `No ${filter} Registrations`}
          </h3>
          <p className="text-slate-500">
            {filter === 'all' 
              ? 'Get a tournament registration link from an organizer to join!'
              : `You don't have any ${filter} registrations.`}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredRegistrations.map((registration, index) => (
            <motion.div
              key={registration.registration_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/user/registrations/${registration.registration_id}`}
                className="card p-6 block hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-ocean-100 to-ocean-50 flex items-center justify-center flex-shrink-0">
                      <TrophyIcon className="w-8 h-8 text-ocean-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 group-hover:text-ocean-600 transition-colors">
                        {registration.tournament_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {registration.location || 'TBA'}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(registration.start_date).toLocaleDateString()} - {new Date(registration.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-slate-800">{registration.area_count}</p>
                        <p className="text-xs text-slate-500">Areas</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">{registration.catch_count || 0}</p>
                        <p className="text-xs text-slate-500">Catches</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">{parseFloat(registration.total_weight || 0).toFixed(1)}</p>
                        <p className="text-xs text-slate-500">kg</p>
                      </div>
                    </div>
                    <span className={getStatusBadge(registration.status)}>
                      {registration.status}
                    </span>
                    <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-ocean-600 transition-colors hidden md:block" />
                  </div>
                </div>

                {/* Leaderboard Link */}
                {registration.status === 'confirmed' && registration.leaderboard_link && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-ocean-600">
                      <ChartBarIcon className="w-4 h-4" />
                      <span>View Leaderboard</span>
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;

