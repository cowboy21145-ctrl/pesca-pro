import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tournamentAPI, getImageUrl } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';
import {
  ArrowLeftIcon,
  TrophyIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const TournamentEdit = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const response = await tournamentAPI.getById(id);
      const t = response.data;
      setFormData({
        name: t.name,
        location: t.location || '',
        start_date: t.start_date?.split('T')[0] || '',
        end_date: t.end_date?.split('T')[0] || '',
        tournament_start_time: t.tournament_start_time || '',
        tournament_end_time: t.tournament_end_time || '',
        registration_start_date: t.registration_start_date?.split('T')[0] || '',
        registration_end_date: t.registration_end_date?.split('T')[0] || '',
        description: t.description || ''
      });
      if (t.banner_image) {
        setPreview(getImageUrl(t.banner_image));
      }
    } catch (error) {
      toast.error('Failed to load tournament');
      navigate('/organizer/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (banner) {
        submitData.append('banner_image', banner);
      }

      await tournamentAPI.update(id, submitData);
      toast.success('Tournament updated successfully!');
      navigate(`/organizer/tournaments/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tournament');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/organizer/tournaments/${id}`)}
        className="flex items-center gap-2 text-slate-600 hover:text-forest-600 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Tournament</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Edit Tournament</h1>
        <p className="text-slate-500 mt-1">Update your tournament details</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tournament Banner
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full aspect-[3/1] object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                Change Banner
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[3/1] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-forest-500 hover:bg-forest-50/50 transition-colors group"
            >
              <PhotoIcon className="w-12 h-12 text-slate-400 group-hover:text-forest-500 mb-2" />
              <p className="text-slate-600 font-medium">Click to upload banner</p>
            </button>
          )}
        </div>

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
              className="input-field pl-12"
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
              className="input-field pl-12"
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

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(`/organizer/tournaments/${id}`)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-success flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default TournamentEdit;

