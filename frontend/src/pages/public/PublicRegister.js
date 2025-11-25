import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tournamentAPI, registrationAPI, getImageUrl } from '../../services/api';
import { formatDescription } from '../../components/RichTextEditor';
import { useAuth } from '../../context/AuthContext';
import {
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  BanknotesIcon,
  CloudArrowUpIcon,
  UserIcon,
  PhoneIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const PublicRegister = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isUser, user, loginUser, registerUser, checkMobile } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  // Auth state
  const [authMode, setAuthMode] = useState('check'); // 'check', 'login', 'register'
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Selection state
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [link]);

  useEffect(() => {
    if (isAuthenticated && isUser) {
      setStep(2);
    }
  }, [isAuthenticated, isUser]);

  const fetchTournament = async () => {
    try {
      const response = await tournamentAPI.getByRegisterLink(link);
      setTournament(response.data);
    } catch (error) {
      toast.error('Tournament not found or not active');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckMobile = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const result = await checkMobile(mobileNo);
      if (result.exists) {
        setAuthMode('login');
        toast.success('Account found! Please enter your password.');
      } else {
        setAuthMode('register');
        toast.success('New user! Please complete registration.');
      }
    } catch (error) {
      toast.error('Error checking mobile number');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await loginUser(mobileNo, password);
      toast.success('Login successful!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await registerUser({
        full_name: fullName,
        mobile_no: mobileNo,
        password: password
      });
      toast.success('Registration successful!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleArea = (area, zone, pond) => {
    const key = `${pond.pond_id}-${zone.zone_id}-${area.area_id}`;
    const existing = selectedAreas.find(a => a.key === key);
    
    if (existing) {
      setSelectedAreas(selectedAreas.filter(a => a.key !== key));
    } else {
      if (!area.is_available) {
        toast.error('This area is not available');
        return;
      }
      setSelectedAreas([...selectedAreas, {
        key,
        area_id: area.area_id,
        area_number: area.area_number,
        price: area.price,
        zone_name: zone.zone_name,
        pond_name: pond.pond_name
      }]);
    }
  };

  const totalPayment = selectedAreas.reduce((sum, a) => sum + parseFloat(a.price), 0);

  const handleSubmit = async () => {
    if (selectedAreas.length === 0) {
      toast.error('Please select at least one area');
      return;
    }
    if (!bankAccountNo) {
      toast.error('Please enter your bank account number');
      return;
    }
    if (!receipt) {
      toast.error('Please upload payment receipt');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tournament_id', tournament.tournament_id);
      formData.append('area_ids', JSON.stringify(selectedAreas.map(a => a.area_id)));
      formData.append('bank_account_no', bankAccountNo);
      formData.append('payment_receipt', receipt);

      await registrationAPI.create(formData);
      toast.success('Registration submitted successfully!');
      navigate('/user/registrations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <TrophyIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tournament Not Found</h2>
          <p className="text-slate-500 mb-6">This tournament doesn't exist or is no longer active.</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-1.5 md:gap-2 touch-manipulation">
            <span className="text-xl md:text-2xl">🎣</span>
            <span className="font-display text-base md:text-xl font-bold text-white">Pesca Pro</span>
          </Link>
          <div className="text-white/80 text-xs md:text-sm whitespace-nowrap">Tournament Registration</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-8">
        {/* Tournament Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden mb-8 shadow-lg"
        >
          {/* Banner Image */}
          {tournament.banner_image && (
            <div className="w-full aspect-[3/1] bg-slate-100">
              <img
                src={getImageUrl(tournament.banner_image)}
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center flex-shrink-0">
                <TrophyIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-2 md:mb-3 truncate">{tournament.name}</h1>
                
                {/* Tournament Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                  {tournament.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPinIcon className="w-3 h-3 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-xs md:text-sm truncate">{tournament.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm">
                      {new Date(tournament.start_date).toLocaleDateString('en-MY', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                      {tournament.end_date && tournament.end_date !== tournament.start_date && (
                        <> - {new Date(tournament.end_date).toLocaleDateString('en-MY', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}</>
                      )}
                    </span>
                  </div>
                  {tournament.tournament_start_time && tournament.tournament_end_time && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <ClockIcon className="w-3 h-3 md:w-4 md:h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-xs md:text-sm">
                        {new Date(`2000-01-01T${tournament.tournament_start_time}`).toLocaleTimeString('en-MY', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })} - {new Date(`2000-01-01T${tournament.tournament_end_time}`).toLocaleTimeString('en-MY', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                  )}
                  {(tournament.registration_start_date || tournament.registration_end_date) && (
                    <div className="flex items-center gap-2 text-ocean-600 bg-ocean-50 px-3 py-1.5 rounded-lg">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Registration: {
                          tournament.registration_start_date 
                            ? new Date(tournament.registration_start_date).toLocaleDateString('en-MY', { 
                                day: 'numeric', 
                                month: 'short' 
                              })
                            : 'Now'
                        } - {
                          tournament.registration_end_date 
                            ? new Date(tournament.registration_end_date).toLocaleDateString('en-MY', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'Open'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description with formatting */}
            {tournament.description && (
              <div 
                className="text-slate-700 leading-relaxed space-y-2"
                style={{ lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ 
                  __html: formatDescription(tournament.description)
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Step 1: Authentication */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
                {authMode === 'check' && 'Enter Your Mobile Number'}
                {authMode === 'login' && 'Welcome Back!'}
                {authMode === 'register' && 'Create Your Account'}
              </h2>

              {authMode === 'check' && (
                <form onSubmit={handleCheckMobile} className="space-y-4">
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      className="input-field pl-12"
                      placeholder="08123456789"
                      required
                    />
                  </div>
                  <button type="submit" disabled={authLoading} className="btn-primary w-full">
                    {authLoading ? 'Checking...' : 'Continue'}
                  </button>
                </form>
              )}

              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={mobileNo}
                      className="input-field pl-12 bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-12"
                      placeholder="Password"
                      required
                    />
                  </div>
                  <button type="submit" disabled={authLoading} className="btn-primary w-full">
                    {authLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-12"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={mobileNo}
                      className="input-field pl-12 bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-12"
                      placeholder="Create Password"
                      required
                      minLength="6"
                    />
                  </div>
                  <button type="submit" disabled={authLoading} className="btn-primary w-full">
                    {authLoading ? 'Creating Account...' : 'Create Account & Continue'}
                  </button>
                </form>
              )}

              {authMode !== 'check' && (
                <button
                  onClick={() => setAuthMode('check')}
                  className="w-full text-center text-ocean-600 mt-4 text-sm"
                >
                  Use different number
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Area Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Area Selection */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Select Fishing Areas</h2>
                  
                  {tournament.ponds?.map((pond) => (
                    <div key={pond.pond_id} className="mb-6 last:mb-0">
                      <h3 className="font-semibold text-slate-700 mb-3">{pond.pond_name}</h3>
                      
                      {pond.zones?.map((zone) => (
                        <div key={zone.zone_id} className="mb-4">
                          <div 
                            className="text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: zone.color }}
                          >
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: zone.color }}
                            />
                            {zone.zone_name}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {zone.areas?.map((area) => {
                              const isSelected = selectedAreas.some(
                                a => a.area_id === area.area_id
                              );
                              return (
                                <button
                                  key={area.area_id}
                                  onClick={() => toggleArea(area, zone, pond)}
                                  disabled={!area.is_available && !isSelected}
                                  className={`
                                    w-16 h-16 rounded-lg flex flex-col items-center justify-center
                                    text-sm font-medium transition-all border-2
                                    ${isSelected 
                                      ? 'bg-ocean-500 border-ocean-500 text-white' 
                                      : area.is_available
                                        ? 'bg-white border-slate-200 hover:border-ocean-300'
                                        : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
                                    }
                                  `}
                                >
                                  <span className="font-bold">{area.area_number}</span>
                                  <span className="text-xs">
                                    {parseFloat(area.price).toLocaleString()}
                                  </span>
                                  {isSelected && <CheckIcon className="w-4 h-4 absolute" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & Payment */}
              <div className="space-y-6">
                {/* Selected Areas */}
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Selected Areas</h3>
                  {selectedAreas.length === 0 ? (
                    <p className="text-slate-500 text-sm">No areas selected yet</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {selectedAreas.map((area) => (
                        <div key={area.key} className="flex justify-between text-sm">
                          <span>{area.pond_name} - {area.zone_name} - Area {area.area_number}</span>
                          <span className="font-medium">RM {parseFloat(area.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">RM {totalPayment.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Payment Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Your Bank Account Number
                      </label>
                      <div className="relative">
                        <BanknotesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={bankAccountNo}
                          onChange={(e) => setBankAccountNo(e.target.value)}
                          className="input-field pl-12"
                          placeholder="Bank account number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Payment Receipt
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReceipt(e.target.files[0])}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="block w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:border-ocean-500 hover:bg-ocean-50 transition-colors"
                      >
                        {receipt ? (
                          <span className="text-ocean-600 font-medium">{receipt.name}</span>
                        ) : (
                          <>
                            <CloudArrowUpIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <span className="text-slate-500 text-sm">Upload receipt image</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedAreas.length === 0}
                  className="btn-primary w-full py-4"
                >
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicRegister;

