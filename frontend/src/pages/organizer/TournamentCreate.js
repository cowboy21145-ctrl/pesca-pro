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
    description: '',
    structure_type: 'pond_zone_area'
  });
  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const paymentInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePaymentDetailsChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentDetails(file);
      setPaymentPreview(URL.createObjectURL(file));
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
      if (paymentDetails) {
        submitData.append('payment_details_image', paymentDetails);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ocean-50/30 to-forest-50/30">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/organizer/tournaments')}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex-shrink-0 touch-manipulation min-h-[44px]"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 truncate">Create New Tournament</h1>
              <p className="text-slate-500 text-xs sm:text-sm md:text-base mt-0.5">
                Set up your fishing tournament details
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs md:text-sm text-forest-600 bg-forest-50 px-3 md:px-4 py-2 rounded-full flex-shrink-0">
              <SparklesIcon className="w-4 h-4" />
              <span>New Tournament</span>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Form Section - Takes 2 columns on large screens */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="lg:col-span-2 space-y-4 sm:space-y-6"
            >
              {/* Banner Image Card */}
              <div className="card p-4 sm:p-6">
                <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-3">
                  Tournament Banner
                  <span className="text-slate-400 font-normal ml-2 text-xs sm:text-sm">(Optional)</span>
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
                    className="w-full aspect-[21/9] sm:aspect-[3/1] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-forest-500 hover:bg-forest-50/50 active:bg-forest-50 transition-all duration-300 group min-h-[150px] sm:min-h-[200px] touch-manipulation"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-slate-100 group-hover:bg-forest-100 flex items-center justify-center mb-2 sm:mb-3 transition-colors flex-shrink-0">
                      <PhotoIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-400 group-hover:text-forest-500 transition-colors" />
                    </div>
                    <p className="text-slate-600 font-medium text-xs sm:text-sm md:text-base px-2 text-center">Click to upload banner</p>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 px-2 text-center">Recommended: 1200 x 400 pixels</p>
                  </button>
                )}
              </div>

              {/* Payment Details Image Card */}
              <div className="card p-4 sm:p-6">
                <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-3">
                  Payment Details Image
                  <span className="text-slate-400 font-normal ml-1 sm:ml-2 text-xs sm:text-sm block sm:inline mt-1 sm:mt-0">(Optional - Bank account info, QR code, etc.)</span>
                </label>
                <input
                  type="file"
                  ref={paymentInputRef}
                  onChange={handlePaymentDetailsChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {paymentPreview ? (
                  <div className="relative group">
                    <img
                      src={paymentPreview}
                      alt="Payment Details Preview"
                      className="w-full max-w-md mx-auto rounded-xl border-2 border-slate-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => paymentInputRef.current?.click()}
                        className="px-6 py-3 bg-white rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors shadow-lg"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => paymentInputRef.current?.click()}
                    className="w-full max-w-md mx-auto border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center hover:border-forest-500 hover:bg-forest-50/50 active:bg-forest-50 transition-all duration-300 group min-h-[120px] sm:min-h-[150px] touch-manipulation"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 group-hover:bg-forest-100 flex items-center justify-center mb-2 sm:mb-3 transition-colors flex-shrink-0">
                      <PhotoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-forest-500 transition-colors" />
                    </div>
                    <p className="text-slate-600 font-medium text-xs sm:text-sm px-2 text-center">Click to upload payment details</p>
                    <p className="text-slate-400 text-xs mt-1 px-2 text-center">Bank account info, QR code, etc.</p>
                  </button>
                )}
              </div>

              {/* Basic Info Card */}
              <div className="card p-4 sm:p-6 space-y-4 sm:space-y-5">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-forest-500 flex-shrink-0" />
                  Basic Information
                </h2>

                {/* Tournament Name */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                    Tournament Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TrophyIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                      placeholder="e.g., Spring Fishing Championship 2024"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                      placeholder="e.g., Lake Toba, North Sumatra"
                    />
                  </div>
                </div>

                {/* Tournament Dates */}
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-3">
                    Tournament Dates <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                        Start Date
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                        End Date
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tournament Times */}
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-3">
                    Tournament Times
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                        Start Time
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                        <input
                          type="time"
                          value={formData.tournament_start_time}
                          onChange={(e) => setFormData({ ...formData, tournament_start_time: e.target.value })}
                          className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                        End Time
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                        <input
                          type="time"
                          value={formData.tournament_end_time}
                          onChange={(e) => setFormData({ ...formData, tournament_end_time: e.target.value })}
                          className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Dates */}
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-3">
                    Registration Period
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                        Registration Start
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                        <input
                          type="date"
                          value={formData.registration_start_date}
                          onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                          className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                        Registration End
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
                        <input
                          type="date"
                          value={formData.registration_end_date}
                          onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                          className="input-field pl-10 sm:pl-12 text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tournament Structure */}
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 sm:mb-3">
                    Tournament Structure <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs sm:text-sm text-slate-500 mb-3">
                    Choose how participants will register: by pond, by zone, or by specific area
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all active:bg-forest-50/50 hover:border-forest-500 hover:bg-forest-50/50 touch-manipulation"
                      style={{ borderColor: formData.structure_type === 'pond_only' ? '#10b981' : '#e2e8f0' }}>
                      <input
                        type="radio"
                        name="structure_type"
                        value="pond_only"
                        checked={formData.structure_type === 'pond_only'}
                        onChange={(e) => setFormData({ ...formData, structure_type: e.target.value })}
                        className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-forest-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-slate-800">Pond Only</div>
                        <div className="text-xs text-slate-600 mt-1">Participants register by selecting a pond. Set price per pond.</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all active:bg-forest-50/50 hover:border-forest-500 hover:bg-forest-50/50 touch-manipulation"
                      style={{ borderColor: formData.structure_type === 'pond_zone' ? '#10b981' : '#e2e8f0' }}>
                      <input
                        type="radio"
                        name="structure_type"
                        value="pond_zone"
                        checked={formData.structure_type === 'pond_zone'}
                        onChange={(e) => setFormData({ ...formData, structure_type: e.target.value })}
                        className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-forest-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-slate-800">Pond + Zone</div>
                        <div className="text-xs text-slate-600 mt-1">Participants register by selecting a zone within a pond. Set price per zone.</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all active:bg-forest-50/50 hover:border-forest-500 hover:bg-forest-50/50 touch-manipulation"
                      style={{ borderColor: formData.structure_type === 'pond_zone_area' ? '#10b981' : '#e2e8f0' }}>
                      <input
                        type="radio"
                        name="structure_type"
                        value="pond_zone_area"
                        checked={formData.structure_type === 'pond_zone_area'}
                        onChange={(e) => setFormData({ ...formData, structure_type: e.target.value })}
                        className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-forest-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-slate-800">Pond + Zone + Area</div>
                        <div className="text-xs text-slate-600 mt-1">Participants register by selecting specific areas. Set price per area. (Most detailed)</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                    Description
                    <span className="text-slate-400 font-normal ml-1 sm:ml-2 text-xs sm:text-sm block sm:inline mt-1 sm:mt-0">(Supports bold, italic, lists)</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your tournament, rules, prizes, etc. Use **bold**, *italic*, or - for lists"
                  />
                </div>
              </div>

              {/* Submit Buttons - Mobile */}
              <div className="lg:hidden flex flex-col sm:flex-row gap-3 sm:gap-4 pb-4">
                <button
                  type="button"
                  onClick={() => navigate('/organizer/tournaments')}
                  className="btn-secondary flex-1 py-3 sm:py-3.5 text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-success flex-1 py-3 sm:py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>Create Tournament</span>
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
              className="hidden lg:block space-y-4 sm:space-y-6"
            >
              {/* What's Next Card */}
              <div className="card p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-forest-50 to-ocean-50 border-forest-200">
                <h3 className="font-semibold text-sm sm:text-base text-forest-800 mb-2 sm:mb-3 flex items-center gap-2">
                  <span className="text-lg sm:text-xl">📋</span>
                  What's Next?
                </h3>
                <p className="text-forest-700 text-xs sm:text-sm mb-3 sm:mb-4">
                  After creating the tournament, you'll be able to:
                </p>
                <ul className="text-forest-700 text-xs sm:text-sm space-y-2 sm:space-y-3">
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
              <div className="card p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-ocean-50 to-slate-50 border-ocean-200">
                <h3 className="font-semibold text-sm sm:text-base text-ocean-800 mb-2 sm:mb-3 flex items-center gap-2">
                  <span className="text-lg sm:text-xl">💡</span>
                  Pro Tips
                </h3>
                <ul className="text-ocean-700 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
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

