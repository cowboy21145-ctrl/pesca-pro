import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registrationAPI, getImageUrl } from '../../services/api';
import {
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistration();
  }, [id]);

  const fetchRegistration = async () => {
    try {
      const response = await registrationAPI.getById(id);
      setRegistration(response.data);
    } catch (error) {
      toast.error('Failed to load registration');
      navigate('/user/registrations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-6 h-6 text-forest-500" />;
      case 'rejected':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'pending':
      default:
        return <ClockIcon className="w-6 h-6 text-fish-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'from-forest-500 to-forest-600';
      case 'rejected':
        return 'from-red-500 to-red-600';
      case 'pending':
      default:
        return 'from-fish-500 to-fish-600';
    }
  };

  const getCatchStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      approved: 'badge badge-confirmed',
      rejected: 'badge badge-rejected'
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!registration) return null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/user/registrations')}
        className="flex items-center gap-2 text-slate-600 hover:text-ocean-600 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Registrations</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${getStatusColor(registration.status)} rounded-3xl p-8 text-white`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{registration.tournament_name}</h1>
              <div className="flex items-center gap-4 mt-2 text-white/80">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {registration.location || 'TBA'}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date(registration.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/20">
            {getStatusIcon(registration.status)}
            <span className="font-semibold capitalize">{registration.status}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="font-semibold text-lg text-slate-800 mb-4">Selected Fishing Areas</h2>
            <div className="space-y-3">
              {registration.selected_areas?.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ocean-100 flex items-center justify-center text-ocean-600 font-bold">
                      {area.area_number}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{area.pond_name}</p>
                      <p className="text-sm text-slate-500">{area.zone_name}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-800">
                    RM {parseFloat(area.price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Catches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-slate-800">My Catches</h2>
              {registration.status === 'confirmed' && (
                <Link
                  to={`/user/upload-catch/${registration.registration_id}`}
                  className="btn-primary text-sm py-2"
                >
                  <PlusIcon className="w-4 h-4 mr-1 inline" />
                  Upload Catch
                </Link>
              )}
            </div>

            {registration.catches?.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                  <PhotoIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No catches uploaded yet</p>
                {registration.status === 'confirmed' && (
                  <Link
                    to={`/user/upload-catch/${registration.registration_id}`}
                    className="text-ocean-600 font-medium mt-2 inline-block hover:text-ocean-700"
                  >
                    Upload your first catch →
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {registration.catches?.map((catchItem) => (
                  <div
                    key={catchItem.catch_id}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="aspect-video bg-slate-100">
                      <img
                        src={getImageUrl(catchItem.catch_image)}
                        alt="Catch"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-xl text-slate-800">{catchItem.weight} kg</p>
                        <span className={getCatchStatusBadge(catchItem.approval_status)}>
                          {catchItem.approval_status}
                        </span>
                      </div>
                      {catchItem.species && (
                        <p className="text-sm text-slate-500">{catchItem.species}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(catchItem.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h2 className="font-semibold text-lg text-slate-800 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Areas</span>
                <span className="font-medium">{registration.selected_areas?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Payment</span>
                <span className="font-bold text-lg">
                  RM {parseFloat(registration.total_payment).toLocaleString()}
                </span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bank Account</span>
                <span className="font-mono text-sm">{registration.bank_account_no}</span>
              </div>
            </div>

            {registration.payment_receipt && (
              <div className="mt-4">
                <p className="text-sm text-slate-500 mb-2">Payment Receipt:</p>
                <img
                  src={getImageUrl(registration.payment_receipt)}
                  alt="Receipt"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </motion.div>

          {/* Actions */}
          {registration.status === 'confirmed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6 space-y-3"
            >
              <Link
                to={`/user/upload-catch/${registration.registration_id}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <PhotoIcon className="w-5 h-5" />
                Upload Catch
              </Link>
              
              {registration.leaderboard_link && (
                <a
                  href={`/lb/${registration.leaderboard_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  View Leaderboard
                </a>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetail;

