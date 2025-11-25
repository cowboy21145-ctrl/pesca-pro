import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tournamentAPI } from '../../services/api';
import {
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  ScaleIcon,
  UserIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const PublicLeaderboard = () => {
  const { link } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [link]);

  const fetchLeaderboard = async () => {
    try {
      const response = await tournamentAPI.getLeaderboard(link);
      setTournament(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (position) => {
    switch (position) {
      case 1: return 'from-yellow-400 to-yellow-500';
      case 2: return 'from-slate-300 to-slate-400';
      case 3: return 'from-amber-600 to-amber-700';
      default: return 'from-slate-100 to-slate-200';
    }
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <TrophyIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Leaderboard Not Found</h2>
          <p className="text-slate-500 mb-6">This leaderboard doesn't exist.</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-forest-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎣</span>
            <span className="font-display text-xl font-bold text-white">Pesca Pro</span>
          </Link>
          <div className="text-white/80 text-sm">Live Leaderboard</div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Tournament Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-fish-400 to-fish-500 flex items-center justify-center shadow-lg shadow-fish-500/30">
            <TrophyIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            {tournament.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/60">
            {tournament.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {tournament.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-4">
            <span className={`badge ${tournament.status === 'active' ? 'badge-active' : 'badge-confirmed'}`}>
              {tournament.status}
            </span>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden"
        >
          {/* Top 3 Podium */}
          {tournament.leaderboard?.length >= 3 && (
            <div className="p-8 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-end justify-center gap-4">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg">
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-2xl mb-1">🥈</p>
                  <p className="text-white font-semibold truncate max-w-[100px]">
                    {tournament.leaderboard[1]?.full_name}
                  </p>
                  <p className="text-white/60 text-sm">
                    {parseFloat(tournament.leaderboard[1]?.total_weight || 0).toFixed(2)} kg
                  </p>
                  <div className="h-20 w-24 bg-gradient-to-b from-slate-400/30 to-slate-400/10 rounded-t-lg mt-2" />
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 ring-4 ring-yellow-300/30">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-3xl mb-1">🥇</p>
                  <p className="text-white font-bold text-lg truncate max-w-[120px]">
                    {tournament.leaderboard[0]?.full_name}
                  </p>
                  <p className="text-white/60">
                    {parseFloat(tournament.leaderboard[0]?.total_weight || 0).toFixed(2)} kg
                  </p>
                  <div className="h-28 w-28 bg-gradient-to-b from-yellow-500/30 to-yellow-500/10 rounded-t-lg mt-2" />
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg">
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-2xl mb-1">🥉</p>
                  <p className="text-white font-semibold truncate max-w-[100px]">
                    {tournament.leaderboard[2]?.full_name}
                  </p>
                  <p className="text-white/60 text-sm">
                    {parseFloat(tournament.leaderboard[2]?.total_weight || 0).toFixed(2)} kg
                  </p>
                  <div className="h-16 w-24 bg-gradient-to-b from-amber-600/30 to-amber-600/10 rounded-t-lg mt-2" />
                </motion.div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          {tournament.leaderboard?.length === 0 ? (
            <div className="p-12 text-center">
              <PhotoIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No catches recorded yet</p>
              <p className="text-white/40 text-sm mt-2">Results will appear here once participants upload their catches</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">#</th>
                    <th className="text-left px-6 py-4 text-white/60 font-medium text-sm">Participant</th>
                    <th className="text-center px-6 py-4 text-white/60 font-medium text-sm">Catches</th>
                    <th className="text-center px-6 py-4 text-white/60 font-medium text-sm">Biggest</th>
                    <th className="text-right px-6 py-4 text-white/60 font-medium text-sm">Total Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {tournament.leaderboard?.map((entry, index) => (
                    <motion.tr
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {getMedalEmoji(index + 1) || (
                          <span className="text-white/40">{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMedalColor(index + 1)} flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">
                              {entry.full_name?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-white font-medium">{entry.full_name}</span>
                        </div>
                      </td>
                      <td className="text-center px-6 py-4 text-white/80">
                        {entry.total_catches}
                      </td>
                      <td className="text-center px-6 py-4 text-white/80">
                        {parseFloat(entry.biggest_catch || 0).toFixed(2)} kg
                      </td>
                      <td className="text-right px-6 py-4">
                        <span className="text-white font-bold">
                          {parseFloat(entry.total_weight || 0).toFixed(2)} kg
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Auto refresh indicator */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-sm">
            Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicLeaderboard;

