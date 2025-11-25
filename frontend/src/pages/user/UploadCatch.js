import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { catchAPI } from '../../services/api';
import {
  ArrowLeftIcon,
  CameraIcon,
  ScaleIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

const UploadCatch = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    weight: '',
    species: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      toast.error('Please upload a catch image');
      return;
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('registration_id', registrationId);
      submitData.append('catch_image', image);
      submitData.append('weight', formData.weight);
      if (formData.species) {
        submitData.append('species', formData.species);
      }

      await catchAPI.upload(submitData);
      toast.success('Catch uploaded successfully!');
      navigate(`/user/registrations/${registrationId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload catch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-ocean-600 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Upload Your Catch</h1>
        <p className="text-slate-500 mt-1">
          Take a clear photo of your catch with the weight measurement visible
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Catch Photo <span className="text-red-500">*</span>
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
                className="w-full aspect-video object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-ocean-500 hover:bg-ocean-50/50 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-ocean-100 flex items-center justify-center mb-4 transition-colors">
                <CameraIcon className="w-8 h-8 text-slate-400 group-hover:text-ocean-500" />
              </div>
              <p className="text-slate-600 font-medium">Click to upload photo</p>
              <p className="text-slate-400 text-sm mt-1">JPEG, PNG or WebP, max 10MB</p>
            </button>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <ScaleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="input-field pl-12"
              placeholder="e.g., 2.5"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kg</span>
          </div>
        </div>

        {/* Species (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fish Species (Optional)
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              className="input-field pl-12"
              placeholder="e.g., Tilapia, Catfish, etc."
            />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-fish-50 rounded-xl p-4 border border-fish-200">
          <h3 className="font-medium text-fish-800 mb-2">📸 Photo Tips</h3>
          <ul className="text-fish-700 text-sm space-y-1">
            <li>• Make sure the weight measurement is clearly visible</li>
            <li>• Take the photo in good lighting</li>
            <li>• Include the whole fish in the frame</li>
            <li>• Avoid blurry or dark photos</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !image}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CloudArrowUpIcon className="w-5 h-5" />
              Upload Catch
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default UploadCatch;

