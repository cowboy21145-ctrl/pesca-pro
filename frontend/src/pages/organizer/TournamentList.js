import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tournamentAPI } from '../../services/api';
import {
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  PlusIcon,
  ArrowRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentAPI.getAll();
      setTournaments(response.data);
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

  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Tournaments</h1>
          <p className="text-slate-500">Manage and monitor your fishing tournaments</p>
        </div>
        <Link to="/organizer/tournaments/create" className="btn-success flex items-center gap-2 w-fit">
          <PlusIcon className="w-5 h-5" />
          Create Tournament
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FunnelIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
        {['all', 'draft', 'active', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
        </div>
      ) : filteredTournaments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-forest-50 flex items-center justify-center">
            <TrophyIcon className="w-10 h-10 text-forest-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            {filter === 'all' ? 'No Tournaments Yet' : `No ${filter} Tournaments`}
          </h3>
          <p className="text-slate-500 mb-6">
            {filter === 'all' 
              ? 'Create your first tournament to get started!'
              : `You don't have any ${filter} tournaments.`}
          </p>
          {filter === 'all' && (
            <Link to="/organizer/tournaments/create" className="btn-success inline-flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Create Tournament
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.tournament_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/organizer/tournaments/${tournament.tournament_id}`}
                className="card p-4 md:p-6 block hover:shadow-xl transition-all group h-full"
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-forest-100 to-forest-50 flex items-center justify-center flex-shrink-0">
                    <TrophyIcon className="w-6 h-6 md:w-7 md:h-7 text-forest-600" />
                  </div>
                  <span className={`${getStatusBadge(tournament.status)} text-xs md:text-sm whitespace-nowrap`}>
                    {tournament.status}
                  </span>
                </div>
                
                <h3 className="font-semibold text-base md:text-lg text-slate-800 group-hover:text-forest-600 transition-colors mb-2 truncate">
                  {tournament.name}
                </h3>
                
                <div className="space-y-2 text-xs md:text-sm text-slate-500 mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{tournament.location || 'Location TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-center">
                      <p className="font-bold text-slate-800 text-sm md:text-base">{tournament.participant_count || 0}</p>
                      <p className="text-xs text-slate-500">Participants</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 text-sm md:text-base">{tournament.pond_count || 0}</p>
                      <p className="text-xs text-slate-500">Ponds</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-forest-600 transition-colors flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentList;

