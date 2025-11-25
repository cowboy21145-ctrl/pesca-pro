import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tournamentAPI } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';
import {
  ArrowLeftIcon,
  TrophyIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const TournamentCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    start_date: '',
    end_date: '',
    tournament_start_time: '',
    tournament_end_time: '',
    registration_start_date: '',
    registration_end_date: '',
    description: ''
  });
  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      if (banner) {
        submitData.append('banner_image', banner);
      }

      const response = await tournamentAPI.create(submitData);
      toast.success('Tournament created successfully!');
      navigate(`/organizer/tournaments/${response.data.tournament.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full -m-3 md:-m-4 lg:-m-6 xl:-m-8">
      {/* Full Page Container */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ocean-50/30 to-forest-50/30">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 xl:px-8 py-3 md:py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/organizer/tournaments')}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800">Create New Tournament</h1>
                  <p className="text-slate-500 text-xs md:text-sm lg:text-base">
                    Set up your fishing tournament details
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs md:text-sm text-forest-600 bg-forest-50 px-3 md:px-4 py-2 rounded-full">
                <SparklesIcon className="w-4 h-4" />
                <span>New Tournament</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 xl:px-8 py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Form Section - Takes 2 columns on large screens */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="lg:col-span-2 space-y-6"
            >
              {/* Banner Image Card */}
              <div className="card p-4 md:p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Tournament Banner
                  <span className="text-slate-400 font-normal ml-2">(Optional)</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full aspect-[21/9] md:aspect-[3/1] object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-white rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors shadow-lg"
                      >
                        Change Banner
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[21/9] md:aspect-[3/1] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-forest-500 hover:bg-forest-50/50 transition-all duration-300 group min-h-[200px] touch-manipulation"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 group-hover:bg-forest-100 flex items-center justify-center mb-3 transition-colors">
                      <PhotoIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 group-hover:text-forest-500 transition-colors" />
                    </div>
                    <p className="text-slate-600 font-medium text-xs md:text-sm lg:text-base">Click to upload banner</p>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">Recommended: 1200 x 400 pixels</p>
                  </button>
                )}
              </div>

              {/* Basic Info Card */}
              <div className="card p-4 sm:p-6 space-y-5">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-forest-500" />
                  Basic Information
                </h2>

                {/* Tournament Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tournament Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TrophyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field pl-12 text-base"
                      placeholder="e.g., Spring Fishing Championship 2024"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field pl-12 text-base"
                      placeholder="e.g., Lake Toba, North Sumatra"
                    />
                  </div>
                </div>

                {/* Tournament Dates */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Tournament Dates <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Start Date
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="input-field pl-12 text-base"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        End Date
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="input-field pl-12 text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tournament Times */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Tournament Times
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Start Time
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="time"
                          value={formData.tournament_start_time}
                          onChange={(e) => setFormData({ ...formData, tournament_start_time: e.target.value })}
                          className="input-field pl-12 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        End Time
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="time"
                          value={formData.tournament_end_time}
                          onChange={(e) => setFormData({ ...formData, tournament_end_time: e.target.value })}
                          className="input-field pl-12 text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Dates */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Registration Period
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Registration Start
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          value={formData.registration_start_date}
                          onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                          className="input-field pl-12 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Registration End
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          value={formData.registration_end_date}
                          onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                          className="input-field pl-12 text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                    <span className="text-slate-400 font-normal ml-2">(Supports bold, italic, lists)</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your tournament, rules, prizes, etc. Use **bold**, *italic*, or - for lists"
                  />
                </div>
              </div>

              {/* Submit Buttons - Mobile */}
              <div className="lg:hidden flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/organizer/tournaments')}
                  className="btn-secondary flex-1 py-3 text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-success flex-1 py-3 text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <TrophyIcon className="w-5 h-5" />
                      Create Tournament
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            {/* Sidebar - Info & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* What's Next Card */}
              <div className="card p-5 sm:p-6 bg-gradient-to-br from-forest-50 to-ocean-50 border-forest-200">
                <h3 className="font-semibold text-forest-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  What's Next?
                </h3>
                <p className="text-forest-700 text-sm mb-4">
                  After creating the tournament, you'll be able to:
                </p>
                <ul className="text-forest-700 text-sm space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-forest-200 text-forest-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
                    <span>Add ponds and configure fishing zones/areas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-forest-200 text-forest-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
                    <span>Set pricing for each area</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-forest-200 text-forest-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
                    <span>Get shareable registration and leaderboard links</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-forest-200 text-forest-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">4</span>
                    <span>Manage participant registrations</span>
                  </li>
                </ul>
              </div>

              {/* Tips Card */}
              <div className="card p-5 sm:p-6 bg-gradient-to-br from-ocean-50 to-slate-50 border-ocean-200">
                <h3 className="font-semibold text-ocean-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Pro Tips
                </h3>
                <ul className="text-ocean-700 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-500">•</span>
                    <span>Use a clear, descriptive tournament name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-500">•</span>
                    <span>Add location details for easier discovery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-500">•</span>
                    <span>Include rules and prizes in the description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ocean-500">•</span>
                    <span>A banner image makes your tournament stand out</span>
                  </li>
                </ul>
              </div>

              {/* Submit Buttons - Desktop */}
              <div className="hidden lg:flex flex-col gap-3 sticky top-32">
                <button
                  type="submit"
                  form="tournament-form"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="btn-success w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-forest-500/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <TrophyIcon className="w-5 h-5" />
                      Create Tournament
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/organizer/tournaments')}
                  className="btn-secondary w-full py-3 text-base"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentCreate;

