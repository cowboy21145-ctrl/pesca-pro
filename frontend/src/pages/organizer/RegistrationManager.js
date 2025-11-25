import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registrationAPI, getImageUrl } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const RegistrationManager = () => {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState(null);
  
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [regToAction, setRegToAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [tournamentId]);

  const fetchRegistrations = async () => {
    try {
      const response = await registrationAPI.getByTournament(tournamentId);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!regToAction) return;
    setActionLoading(true);
    try {
      await registrationAPI.updateStatus(regToAction.registration_id, 'confirmed');
      toast.success('Registration confirmed!');
      fetchRegistrations();
      setSelectedReg(null);
      setShowConfirmModal(false);
      setRegToAction(null);
    } catch (error) {
      toast.error('Failed to confirm registration');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!regToAction) return;
    setActionLoading(true);
    try {
      await registrationAPI.updateStatus(regToAction.registration_id, 'rejected');
      toast.success('Registration rejected');
      fetchRegistrations();
      setSelectedReg(null);
      setShowRejectModal(false);
      setRegToAction(null);
    } catch (error) {
      toast.error('Failed to reject registration');
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmModal = (reg) => {
    setRegToAction(reg);
    setShowConfirmModal(true);
  };

  const openRejectModal = (reg) => {
    setRegToAction(reg);
    setShowRejectModal(true);
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
          <h1 className="text-2xl font-bold text-slate-800">Registrations</h1>
          <p className="text-slate-500">
            {registrations.length} total • {registrations.filter(r => r.status === 'pending').length} pending
          </p>
        </div>
        
        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && registrations.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-fish-500 text-white text-xs rounded-full">
                  {registrations.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="card p-12 text-center">
          <UserIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Registrations</h3>
          <p className="text-slate-500">
            {filter === 'all' 
              ? 'No one has registered yet. Share your registration link!'
              : `No ${filter} registrations found.`}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Participant</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Areas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Payment</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.registration_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{reg.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{reg.mobile_no}</p>
                      {reg.email && <p className="text-xs text-slate-400">{reg.email}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{reg.area_count} areas</p>
                      <p className="text-xs text-slate-500 max-w-xs truncate">{reg.selected_areas}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        RM {parseFloat(reg.total_payment).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(reg.status)}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5 text-slate-600" />
                        </button>
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openConfirmModal(reg)}
                              className="p-2 hover:bg-forest-100 rounded-lg transition-colors"
                              title="Confirm"
                            >
                              <CheckIcon className="w-5 h-5 text-forest-600" />
                            </button>
                            <button
                              onClick={() => openRejectModal(reg)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XMarkIcon className="w-5 h-5 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Registration Details</h3>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Participant Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700">Participant</h4>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-ocean-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{selectedReg.full_name}</p>
                    <p className="text-sm text-slate-500">{selectedReg.mobile_no}</p>
                  </div>
                </div>
              </div>

              {/* Selected Areas */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700">Selected Areas</h4>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">{selectedReg.selected_areas}</p>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700">Payment</h4>
                <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total</span>
                    <span className="font-bold">RM {parseFloat(selectedReg.total_payment).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Account</span>
                    <span className="font-mono text-sm">{selectedReg.bank_account_no}</span>
                  </div>
                </div>
              </div>

              {/* Receipt */}
              {selectedReg.payment_receipt && (
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700">Payment Receipt</h4>
                  <img
                    src={getImageUrl(selectedReg.payment_receipt)}
                    alt="Receipt"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {/* Actions */}
              {selectedReg.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => openRejectModal(selectedReg)}
                    className="btn-danger flex-1"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openConfirmModal(selectedReg)}
                    className="btn-success flex-1"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Registration Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setRegToAction(null);
        }}
        onConfirm={handleConfirm}
        title="Confirm Registration"
        message={`Are you sure you want to confirm ${regToAction?.full_name || 'this participant'}'s registration? They will be notified that their payment has been verified.`}
        confirmText="Confirm"
        cancelText="Cancel"
        type="success"
        loading={actionLoading}
      />

      {/* Reject Registration Modal */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRegToAction(null);
        }}
        onConfirm={handleReject}
        title="Reject Registration"
        message={`Are you sure you want to reject ${regToAction?.full_name || 'this participant'}'s registration? They will need to register again.`}
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default RegistrationManager;

