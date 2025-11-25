import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tournamentAPI, pondAPI } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  LinkIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  CheckIcon,
  ArrowLeftIcon,
  PlusIcon,
  ClipboardIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTournament();
    fetchPonds();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const response = await tournamentAPI.getById(id);
      setTournament(response.data);
    } catch (error) {
      toast.error('Failed to load tournament');
      navigate('/organizer/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPonds = async () => {
    try {
      const response = await pondAPI.getByTournament(id);
      setPonds(response.data);
    } catch (error) {
      console.error('Error fetching ponds:', error);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await tournamentAPI.updateStatus(id, 'active');
      toast.success('Tournament activated! Participants can now register.');
      setTournament(prev => ({ ...prev, status: 'active' }));
      setShowActivateModal(false);
    } catch (error) {
      toast.error('Failed to activate tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await tournamentAPI.updateStatus(id, 'completed');
      toast.success('Tournament marked as completed!');
      setTournament(prev => ({ ...prev, status: 'completed' }));
      setShowCompleteModal(false);
    } catch (error) {
      toast.error('Failed to complete tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await tournamentAPI.delete(id);
      toast.success('Tournament deleted');
      navigate('/organizer/tournaments');
    } catch (error) {
      toast.error('Failed to delete tournament');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
      } else {
        // Fallback for non-secure contexts (HTTP)
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success(`${label} copied to clipboard!`);
        } else {
          toast.error('Failed to copy. Please copy manually.');
        }
      }
    } catch (err) {
      // Final fallback - show the text for manual copy
      toast.error('Could not copy automatically. Please select and copy the text manually.');
      console.error('Copy failed:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-slate-100 text-slate-700',
      active: 'bg-ocean-100 text-ocean-800',
      completed: 'bg-forest-100 text-forest-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) return null;

  const registrationUrl = `${window.location.origin}/t/${tournament.registration_link}`;
  const leaderboardUrl = `${window.location.origin}/lb/${tournament.leaderboard_link}`;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/organizer/tournaments')}
        className="flex items-center gap-2 text-slate-600 hover:text-forest-600 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Tournaments</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-500/20 flex items-center justify-center">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{tournament.name}</h1>
                <span className={`badge ${getStatusBadge(tournament.status)}`}>
                  {tournament.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {tournament.location || 'Location TBA'}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {tournament.status === 'draft' && (
              <button onClick={() => setShowActivateModal(true)} className="btn-success flex items-center justify-center gap-1.5">
                <PlayIcon className="w-4 h-4" />
                <span>Activate</span>
              </button>
            )}
            {tournament.status === 'active' && (
              <button onClick={() => setShowCompleteModal(true)} className="btn-primary flex items-center justify-center gap-1.5">
                <CheckIcon className="w-4 h-4" />
                <span>Complete</span>
              </button>
            )}
            <Link to={`/organizer/tournaments/${id}/edit`} className="btn-secondary flex items-center justify-center gap-1.5">
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            <button onClick={() => setShowDeleteModal(true)} className="btn-danger flex items-center justify-center gap-1.5">
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4 sm:p-6"
          >
            <h2 className="font-semibold text-lg text-slate-800 mb-4">Share Links</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Registration Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={registrationUrl}
                    readOnly
                    className="input-field text-xs sm:text-sm bg-slate-50 flex-1 min-w-0"
                  />
                  <button
                    onClick={() => copyToClipboard(registrationUrl, 'Registration link')}
                    className="btn-secondary py-2 px-3 sm:px-4 flex-shrink-0"
                    aria-label="Copy registration link"
                  >
                    <ClipboardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Leaderboard Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leaderboardUrl}
                    readOnly
                    className="input-field text-xs sm:text-sm bg-slate-50 flex-1 min-w-0"
                  />
                  <button
                    onClick={() => copyToClipboard(leaderboardUrl, 'Leaderboard link')}
                    className="btn-secondary py-2 px-3 sm:px-4 flex-shrink-0"
                    aria-label="Copy leaderboard link"
                  >
                    <ClipboardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ponds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-slate-800">Fishing Areas</h2>
              <Link
                to={`/organizer/tournaments/${id}/ponds`}
                className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 inline" />
                <span className="whitespace-nowrap">Manage Ponds</span>
              </Link>
            </div>

            {ponds.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                  <MapPinIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-4">No ponds configured yet</p>
                <Link
                  to={`/organizer/tournaments/${id}/ponds`}
                  className="text-forest-600 font-medium hover:text-forest-700"
                >
                  Add your first pond →
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {ponds.map((pond) => (
                  <div key={pond.pond_id} className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold text-slate-800">{pond.pond_name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span>{pond.zone_count || 0} zones</span>
                      <span>{pond.area_count || 0} areas</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 space-y-3"
          >
            <h2 className="font-semibold text-lg text-slate-800 mb-4">Quick Actions</h2>
            <Link
              to={`/organizer/tournaments/${id}/registrations`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-ocean-100 flex items-center justify-center group-hover:bg-ocean-200 transition-colors">
                <UserGroupIcon className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Registrations</p>
                <p className="text-xs text-slate-500">View & manage participants</p>
              </div>
            </Link>
            <Link
              to={`/organizer/tournaments/${id}/catches`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-fish-100 flex items-center justify-center group-hover:bg-fish-200 transition-colors">
                <PhotoIcon className="w-5 h-5 text-fish-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Catch Approval</p>
                <p className="text-xs text-slate-500">Review catch submissions</p>
              </div>
            </Link>
            <a
              href={leaderboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center group-hover:bg-forest-200 transition-colors">
                <ChartBarIcon className="w-5 h-5 text-forest-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Leaderboard</p>
                <p className="text-xs text-slate-500">View live rankings</p>
              </div>
            </a>
          </motion.div>

          {/* Description */}
          {tournament.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-4 sm:p-6"
            >
              <h2 className="font-semibold text-lg text-slate-800 mb-3">Description</h2>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{tournament.description}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Activate Tournament Modal */}
      <ConfirmationModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={handleActivate}
        title="Activate Tournament"
        message="Are you sure you want to activate this tournament? Once activated, participants will be able to register using the registration link."
        confirmText="Activate"
        cancelText="Cancel"
        type="success"
        loading={actionLoading}
      />

      {/* Complete Tournament Modal */}
      <ConfirmationModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleComplete}
        title="Complete Tournament"
        message="Are you sure you want to mark this tournament as completed? This will close registrations and finalize the leaderboard."
        confirmText="Complete"
        cancelText="Cancel"
        type="info"
        loading={actionLoading}
      />

      {/* Delete Tournament Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Tournament"
        message="Are you sure you want to delete this tournament? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default TournamentDetail;

