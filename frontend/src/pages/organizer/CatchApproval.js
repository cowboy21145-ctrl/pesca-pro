import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { catchAPI, getImageUrl } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  ScaleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const CatchApproval = () => {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedCatch, setSelectedCatch] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Confirmation modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [catchToAction, setCatchToAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCatches();
  }, [tournamentId, filter]);

  const fetchCatches = async () => {
    try {
      let response;
      if (filter === 'pending') {
        response = await catchAPI.getPending(tournamentId);
      } else {
        response = await catchAPI.getByTournament(tournamentId);
      }
      setCatches(filter === 'pending' ? response.data : response.data.filter(c => c.approval_status === filter));
    } catch (error) {
      console.error('Error fetching catches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!catchToAction) return;
    setActionLoading(true);
    try {
      await catchAPI.updateStatus(catchToAction.catch_id, 'approved');
      toast.success('Catch approved!');
      fetchCatches();
      setSelectedCatch(null);
      setShowApproveModal(false);
      setCatchToAction(null);
    } catch (error) {
      toast.error('Failed to approve catch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!catchToAction) return;
    setActionLoading(true);
    try {
      await catchAPI.updateStatus(catchToAction.catch_id, 'rejected', rejectionReason);
      toast.success('Catch rejected');
      fetchCatches();
      setSelectedCatch(null);
      setShowRejectModal(false);
      setCatchToAction(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject catch');
    } finally {
      setActionLoading(false);
    }
  };

  const openApproveModal = (catchItem) => {
    setCatchToAction(catchItem);
    setShowApproveModal(true);
  };

  const openRejectModal = (catchItem) => {
    setCatchToAction(catchItem);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      approved: 'badge badge-confirmed',
      rejected: 'badge badge-rejected'
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/organizer/tournaments/${tournamentId}`)}
        className="flex items-center gap-2 text-slate-600 hover:text-forest-600 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Tournament</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catch Approval</h1>
          <p className="text-slate-500">Review and approve catch submissions</p>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setLoading(true);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Catches Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
        </div>
      ) : catches.length === 0 ? (
        <div className="card p-12 text-center">
          <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No {filter} Catches
          </h3>
          <p className="text-slate-500">
            {filter === 'pending' 
              ? 'All catches have been reviewed!'
              : `No ${filter} catches found.`}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {catches.map((catchItem, index) => (
            <motion.div
              key={catchItem.catch_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card overflow-hidden group cursor-pointer"
              onClick={() => setSelectedCatch(catchItem)}
            >
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img
                  src={getImageUrl(catchItem.catch_image)}
                  alt="Catch"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={getStatusBadge(catchItem.approval_status)}>
                    {catchItem.approval_status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-bold text-slate-800">{catchItem.weight} kg</p>
                  {catchItem.species && (
                    <p className="text-sm text-slate-500">{catchItem.species}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <UserIcon className="w-4 h-4" />
                  <span>{catchItem.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{new Date(catchItem.uploaded_at).toLocaleString()}</span>
                </div>
              </div>
              
              {/* Quick Actions */}
              {filter === 'pending' && (
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openApproveModal(catchItem);
                    }}
                    className="flex-1 py-2 bg-forest-100 text-forest-700 rounded-lg hover:bg-forest-200 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openRejectModal(catchItem);
                    }}
                    className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="aspect-video bg-slate-100 relative">
              <img
                src={getImageUrl(selectedCatch.catch_image)}
                alt="Catch"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedCatch(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-800">{selectedCatch.weight} kg</p>
                  {selectedCatch.species && (
                    <p className="text-slate-500">{selectedCatch.species}</p>
                  )}
                </div>
                <span className={getStatusBadge(selectedCatch.approval_status)}>
                  {selectedCatch.approval_status}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-500">Participant</p>
                  <p className="font-semibold">{selectedCatch.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Contact</p>
                  <p className="font-semibold">{selectedCatch.mobile_no}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fishing Location</p>
                  <p className="font-semibold text-sm">{selectedCatch.fishing_location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Uploaded</p>
                  <p className="font-semibold">{new Date(selectedCatch.uploaded_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Rejection reason input */}
              {selectedCatch.approval_status === 'pending' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input-field"
                    placeholder="Enter reason for rejection..."
                    rows="2"
                  />
                </div>
              )}

              {/* Actions */}
              {selectedCatch.approval_status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => openRejectModal(selectedCatch)}
                    className="btn-danger flex-1"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openApproveModal(selectedCatch)}
                    className="btn-success flex-1"
                  >
                    Approve
                  </button>
                </div>
              )}

              {/* Show rejection reason if rejected */}
              {selectedCatch.approval_status === 'rejected' && selectedCatch.rejection_reason && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason:</p>
                  <p className="text-red-700">{selectedCatch.rejection_reason}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setCatchToAction(null);
        }}
        onConfirm={handleApprove}
        title="Approve Catch"
        message={`Are you sure you want to approve this ${catchToAction?.weight || ''}kg catch by ${catchToAction?.full_name || 'this participant'}? This will add it to the leaderboard.`}
        confirmText="Approve"
        cancelText="Cancel"
        type="success"
        loading={actionLoading}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setCatchToAction(null);
          setRejectionReason('');
        }}
        onConfirm={handleReject}
        title="Reject Catch"
        message={`Are you sure you want to reject this ${catchToAction?.weight || ''}kg catch by ${catchToAction?.full_name || 'this participant'}? This action cannot be undone.`}
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default CatchApproval;

