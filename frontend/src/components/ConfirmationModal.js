import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  danger: TrashIcon,
  logout: ArrowRightOnRectangleIcon,
  info: InformationCircleIcon,
};

const colorMap = {
  warning: {
    bg: 'bg-amber-100',
    icon: 'text-amber-600',
    button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
  },
  success: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    button: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
  },
  danger: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    button: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
  },
  logout: {
    bg: 'bg-slate-100',
    icon: 'text-slate-600',
    button: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500',
  },
  info: {
    bg: 'bg-ocean-100',
    icon: 'text-ocean-600',
    button: 'bg-ocean-500 hover:bg-ocean-600 focus:ring-ocean-500',
  },
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, success, danger, logout, info
  loading = false,
}) => {
  const Icon = iconMap[type] || ExclamationTriangleIcon;
  const colors = colorMap[type] || colorMap.warning;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6 pt-8">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-slate-800 text-center mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-slate-600 text-center leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-2 bg-slate-50/50">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-xl font-medium text-white ${colors.button} transition-all focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;

