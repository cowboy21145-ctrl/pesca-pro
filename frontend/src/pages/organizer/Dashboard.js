import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { tournamentAPI } from '../../services/api';
import {
  TrophyIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    participants: 0
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentAPI.getAll();
      const data = response.data;
      setTournaments(data);
      
      setStats({
        total: data.length,
        active: data.filter(t => t.status === 'active').length,
        completed: data.filter(t => t.status === 'completed').length,
        participants: data.reduce((sum, t) => sum + (t.participant_count || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge bg-slate-100 text-slate-700',
      active: 'badge badge-active',
      completed: 'badge badge-confirmed',
      cancelled: 'badge badge-rejected'
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-500/20 flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome, {user?.name}!
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your fishing tournaments from one place
              </p>
            </div>
          </div>
          <Link to="/organizer/tournaments/create" className="btn-success flex items-center justify-center gap-2 w-full sm:w-auto">
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Create Tournament</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: TrophyIcon, label: 'Total Tournaments', value: stats.total, color: 'ocean' },
          { icon: ClockIcon, label: 'Active', value: stats.active, color: 'fish' },
          { icon: CheckCircleIcon, label: 'Completed', value: stats.completed, color: 'forest' },
          { icon: UserGroupIcon, label: 'Total Participants', value: stats.participants, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4 sm:p-6"
          >
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Tournaments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Recent Tournaments</h2>
          <Link to="/organizer/tournaments" className="text-ocean-600 hover:text-ocean-700 font-medium flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-forest-50 flex items-center justify-center">
              <TrophyIcon className="w-10 h-10 text-forest-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Tournaments Yet</h3>
            <p className="text-slate-500 mb-6">
              Create your first tournament and start managing fishing events!
            </p>
            <Link to="/organizer/tournaments/create" className="btn-success inline-flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Create Tournament
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tournaments.slice(0, 4).map((tournament) => (
              <Link
                key={tournament.tournament_id}
                to={`/organizer/tournaments/${tournament.tournament_id}`}
                className="card p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-forest-100 to-forest-50 flex items-center justify-center">
                      <TrophyIcon className="w-7 h-7 text-forest-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-forest-600 transition-colors">
                        {tournament.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{tournament.participant_count || 0} participants</span>
                        <span>•</span>
                        <span>{tournament.pond_count || 0} ponds</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={getStatusBadge(tournament.status)}>
                      {tournament.status}
                    </span>
                    <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-forest-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Link to="/organizer/tournaments/create" className="card p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center group-hover:bg-forest-200 transition-colors">
              <PlusIcon className="w-6 h-6 text-forest-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">New Tournament</h3>
              <p className="text-sm text-slate-500">Create a new fishing event</p>
            </div>
          </div>
        </Link>
        
        {tournaments.length > 0 && (
          <>
            <Link to={`/organizer/tournaments/${tournaments[0]?.tournament_id}/registrations`} className="card p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-ocean-100 flex items-center justify-center group-hover:bg-ocean-200 transition-colors">
                  <UserGroupIcon className="w-6 h-6 text-ocean-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Manage Registrations</h3>
                  <p className="text-sm text-slate-500">Review & approve participants</p>
                </div>
              </div>
            </Link>
            
            <Link to={`/organizer/tournaments/${tournaments[0]?.tournament_id}/catches`} className="card p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-fish-100 flex items-center justify-center group-hover:bg-fish-200 transition-colors">
                  <CheckCircleIcon className="w-6 h-6 text-fish-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Approve Catches</h3>
                  <p className="text-sm text-slate-500">Review catch submissions</p>
                </div>
              </div>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default OrganizerDashboard;

