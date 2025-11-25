import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import {
  HomeIcon,
  TrophyIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  PhotoIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

const Layout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const userNavItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/user' },
    { name: 'My Registrations', icon: ClipboardDocumentListIcon, path: '/user/registrations' },
  ];

  const organizerNavItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/organizer' },
    { name: 'Tournaments', icon: TrophyIcon, path: '/organizer/tournaments' },
    { name: 'Create Tournament', icon: PlusCircleIcon, path: '/organizer/tournaments/create' },
  ];

  const navItems = role === 'organizer' ? organizerNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ocean-50/30 to-slate-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl shadow-slate-200/50
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-100">
          <Link to={role === 'organizer' ? '/organizer' : '/user'} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-500/30">
              <span className="text-2xl">🎣</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-800">Pesca Pro</h1>
              <p className="text-xs text-slate-500">{role === 'organizer' ? 'Organizer' : 'Participant'}</p>
            </div>
          </Link>
        </div>

        {/* User info */}
        <div className="flex-shrink-0 p-3 sm:p-4 mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-xl bg-gradient-to-r from-ocean-50 to-forest-50 border border-ocean-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white font-semibold">
              {user?.full_name?.[0] || user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate text-sm">
                {user?.full_name || user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.mobile_no || user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 min-h-0 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Exact match for the path
            const isExactMatch = location.pathname === item.path;
            // For parent routes (like /organizer/tournaments), check if current path is a child
            // but exclude if there's another nav item that matches more specifically
            const isParentMatch = !isExactMatch && 
              item.path !== '/user' && 
              item.path !== '/organizer' &&
              location.pathname.startsWith(item.path + '/') &&
              // Don't highlight parent if there's a more specific nav item that matches
              !navItems.some(other => 
                other.path !== item.path && 
                other.path.startsWith(item.path) && 
                (location.pathname === other.path || location.pathname.startsWith(other.path + '/'))
              );
            
            const isActive = isExactMatch || isParentMatch;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base
                  ${isActive 
                    ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg shadow-ocean-500/30' 
                    : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout - Fixed at bottom */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-slate-100 bg-white">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm sm:text-base min-h-[44px]"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Stay"
        type="logout"
      />

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-slate-600" />
            </button>
            <Link 
              to={role === 'organizer' ? '/organizer' : '/user'} 
              className="flex items-center gap-2"
            >
              <span className="text-xl">🎣</span>
              <span className="font-display font-bold text-slate-800">Pesca Pro</span>
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.full_name?.[0] || user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

