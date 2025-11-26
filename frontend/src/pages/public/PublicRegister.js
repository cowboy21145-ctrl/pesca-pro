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
  BuildingOfficeIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const PublicRegister = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isUser, isOrganizer, user, loginUser, registerUser, checkMobile, logout } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  // Initialize step based on authentication status - skip auth if already logged in
  // If user has a draft, start at step 2 (will be set when draft loads)
  const [step, setStep] = useState(isAuthenticated && isUser ? 2 : 1);
  
  // Auth state
  const [authMode, setAuthMode] = useState('check'); // 'check', 'login', 'register'
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Selection state
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedPond, setSelectedPond] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [link]);

  // Load draft when tournament is loaded and user is authenticated
  useEffect(() => {
    const loadDraft = async () => {
      if (tournament && isAuthenticated && isUser && !draftLoaded) {
        try {
          // Try to load from server first
          const response = await registrationAPI.getDraft(tournament.tournament_id);
          const draft = response.data;
          
          // Restore form data from draft
          if (draft.bank_name) setBankName(draft.bank_name);
          if (draft.bank_account_no) setBankAccountNo(draft.bank_account_no);
          
          const structureType = tournament?.structure_type || 'pond_zone_area';
          
          // Restore selections based on structure type
          if (structureType === 'pond_zone_area' && draft.selected_areas && draft.selected_areas.length > 0) {
            const restoredAreas = draft.selected_areas.map(area => ({
              key: `${area.pond_id}-${area.zone_id}-${area.area_id}`,
              area_id: area.area_id,
              area_number: area.area_number,
              price: area.price,
              zone_name: area.zone_name,
              pond_name: area.pond_name
            }));
            setSelectedAreas(restoredAreas);
          } else if (structureType === 'pond_zone' && draft.zone_id) {
            // Find and restore selected zone from tournament data
            const zone = tournament.ponds?.flatMap(p => p.zones || [])
              .find(z => z.zone_id === draft.zone_id);
            if (zone) {
              const pond = tournament.ponds?.find(p => p.zones?.some(z => z.zone_id === zone.zone_id));
              setSelectedZone({ 
                ...zone, 
                pond_name: pond?.pond_name,
                price: draft.zone_price || zone.price
              });
            } else if (draft.zone_name) {
              // Fallback: create zone object from draft data
              setSelectedZone({
                zone_id: draft.zone_id,
                zone_name: draft.zone_name,
                price: draft.zone_price || 0,
                pond_name: draft.pond_name || ''
              });
            }
          } else if (structureType === 'pond_only' && draft.pond_id) {
            // Find and restore selected pond from tournament data
            const pond = tournament.ponds?.find(p => p.pond_id === draft.pond_id);
            if (pond) {
              setSelectedPond(pond);
            } else if (draft.pond_name) {
              // Fallback: create pond object from draft data
              setSelectedPond({
                pond_id: draft.pond_id,
                pond_name: draft.pond_name,
                price: draft.pond_price || 0
              });
            }
          }
          
          // If draft has any data, move to step 2 (registration form)
          if (draft.bank_name || draft.bank_account_no || draft.selected_areas?.length > 0 || draft.zone_id || draft.pond_id) {
            setStep(2);
            toast.success('Draft registration loaded. Continue where you left off!', { duration: 4000 });
          }
          
          setDraftLoaded(true);
        } catch (error) {
          // If server draft not found, try localStorage as fallback
          if (error.response?.status === 404) {
            const draftKey = `draft_${tournament.tournament_id}`;
            const localDraft = localStorage.getItem(draftKey);
            if (localDraft) {
              try {
                const draft = JSON.parse(localDraft);
                if (draft.bankName) setBankName(draft.bankName);
                if (draft.bankAccountNo) setBankAccountNo(draft.bankAccountNo);
                
                const structureType = tournament?.structure_type || draft.structureType || 'pond_zone_area';
                
                // Restore selections from localStorage
                if (structureType === 'pond_zone_area' && draft.selectedAreas && draft.selectedAreas.length > 0) {
                  setSelectedAreas(draft.selectedAreas);
                } else if (structureType === 'pond_zone' && draft.selectedZone) {
                  // Try to find zone in tournament data first
                  const zone = tournament.ponds?.flatMap(p => p.zones || [])
                    .find(z => z.zone_id === draft.selectedZone.zone_id);
                  if (zone) {
                    const pond = tournament.ponds?.find(p => p.zones?.some(z => z.zone_id === zone.zone_id));
                    setSelectedZone({ ...zone, pond_name: pond?.pond_name });
                  } else {
                    setSelectedZone(draft.selectedZone);
                  }
                } else if (structureType === 'pond_only' && draft.selectedPond) {
                  // Try to find pond in tournament data first
                  const pond = tournament.ponds?.find(p => p.pond_id === draft.selectedPond.pond_id);
                  if (pond) {
                    setSelectedPond(pond);
                  } else {
                    setSelectedPond(draft.selectedPond);
                  }
                }
                
                // If draft has any data, move to step 2
                if (draft.bankName || draft.bankAccountNo || draft.selectedAreas?.length > 0 || draft.selectedZone || draft.selectedPond) {
                  setStep(2);
                  toast.success('Local draft loaded. Your progress was saved!', { duration: 4000 });
                }
              } catch (e) {
                console.error('Error parsing local draft:', e);
              }
            }
          } else {
            console.error('Error loading draft:', error);
          }
          setDraftLoaded(true);
        }
      }
    };

    loadDraft();
  }, [tournament, isAuthenticated, isUser, draftLoaded]);

  // Auto-save draft when form data changes (debounced)
  useEffect(() => {
    if (!isAuthenticated || !isUser || !tournament || step !== 2 || !draftLoaded) return;

    const saveDraft = async () => {
      try {
        setSavingDraft(true);
        const structureType = tournament?.structure_type || 'pond_zone_area';
        
        const formData = {
          tournament_id: tournament.tournament_id,
          bank_name: bankName,
          bank_account_no: bankAccountNo
        };
        
        // Add selections based on structure type
        if (structureType === 'pond_zone_area' && selectedAreas.length > 0) {
          formData.area_ids = JSON.stringify(selectedAreas.map(a => a.area_id));
        } else if (structureType === 'pond_zone' && selectedZone) {
          formData.zone_id = selectedZone.zone_id;
        } else if (structureType === 'pond_only' && selectedPond) {
          formData.pond_id = selectedPond.pond_id;
        }

        try {
          await registrationAPI.saveDraft(formData);
          setLastSaved(new Date());
        } catch (apiError) {
          // If API fails, still save to localStorage
          console.warn('Failed to save draft to server, saving locally:', apiError);
          // Don't show error toast for auto-save failures
        }
        
        // Always save to localStorage as backup (even if API succeeds)
        const draftKey = `draft_${tournament.tournament_id}`;
        localStorage.setItem(draftKey, JSON.stringify({
          bankName,
          bankAccountNo,
          selectedAreas,
          selectedPond,
          selectedZone,
          structureType,
          savedAt: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error in save draft function:', error);
        // Save to localStorage as fallback
        const draftKey = `draft_${tournament.tournament_id}`;
        try {
          localStorage.setItem(draftKey, JSON.stringify({
            bankName,
            bankAccountNo,
            selectedAreas,
            selectedPond,
            selectedZone,
            structureType: tournament?.structure_type || 'pond_zone_area',
            savedAt: new Date().toISOString()
          }));
        } catch (storageError) {
          console.error('Failed to save to localStorage:', storageError);
        }
      } finally {
        setSavingDraft(false);
      }
    };

    // Debounce auto-save (save 2 seconds after user stops typing)
    const timeoutId = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timeoutId);
  }, [bankName, bankAccountNo, selectedAreas, selectedPond, selectedZone, tournament, isAuthenticated, isUser, step, draftLoaded]);

  // Countdown timer effect
  useEffect(() => {
    if (!tournament?.start_date) return;

    const updateCountdown = () => {
      try {
        // Handle different date formats from backend
        let startDateStr = tournament.start_date;
        
        // If start_date is already a full datetime string, use it directly
        if (startDateStr.includes('T') || startDateStr.includes(' ')) {
          // Already has time component
          startDateStr = startDateStr.split('T')[0]; // Extract just the date part
        }
        
        // Get time component
        let timeStr = tournament.tournament_start_time || '00:00:00';
        
        // Remove seconds if present (format: HH:MM:SS -> HH:MM)
        if (timeStr.split(':').length > 2) {
          timeStr = timeStr.split(':').slice(0, 2).join(':');
        }
        
        // Construct datetime string
        const dateTimeString = `${startDateStr}T${timeStr}:00`;
        const startDateTime = new Date(dateTimeString);
        
        // Validate date
        if (isNaN(startDateTime.getTime())) {
          console.error('Invalid date:', dateTimeString);
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
          return;
        }
        
        const now = new Date();
        const diff = startDateTime.getTime() - now.getTime();

        if (diff <= 0 || isNaN(diff)) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24)) || 0;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) || 0;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) || 0;
        const seconds = Math.floor((diff % (1000 * 60)) / 1000) || 0;

        // Ensure all values are valid numbers
        setCountdown({ 
          days: isNaN(days) ? 0 : days, 
          hours: isNaN(hours) ? 0 : hours, 
          minutes: isNaN(minutes) ? 0 : minutes, 
          seconds: isNaN(seconds) ? 0 : seconds, 
          isPast: false 
        });
      } catch (error) {
        console.error('Error calculating countdown:', error);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [tournament]);

  // Skip authentication step if user is already logged in
  useEffect(() => {
    if (isAuthenticated && isUser) {
      setStep(2);
      // Show welcome message for logged-in users
      if (user) {
        toast.success(`Welcome back, ${user.full_name || user.name}! Continue with registration.`, {
          duration: 3000
        });
      }
    } else {
      setStep(1);
    }
  }, [isAuthenticated, isUser, user]);

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

  // Calculate total payment based on tournament structure type
  const calculateTotalPayment = () => {
    const structureType = tournament?.structure_type || 'pond_zone_area';
    
    if (structureType === 'pond_zone_area') {
      // Calculate from selected areas
      return selectedAreas.reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
    } else if (structureType === 'pond_zone' && selectedZone) {
      // Calculate from selected zone price
      return parseFloat(selectedZone.price || 0);
    } else if (structureType === 'pond_only' && selectedPond) {
      // Calculate from selected pond price
      return parseFloat(selectedPond.price || 0);
    }
    return 0;
  };

  const totalPayment = calculateTotalPayment();

  const handleSubmit = async () => {
    const structureType = tournament?.structure_type || 'pond_zone_area';
    
    // Validate based on structure type
    if (structureType === 'pond_zone_area') {
      const hasAreas = tournament.ponds?.some(pond => 
        pond.zones?.some(zone => zone.areas && zone.areas.length > 0)
      );
      if (hasAreas && selectedAreas.length === 0) {
        toast.error('Please select at least one area');
        return;
      }
    } else if (structureType === 'pond_zone') {
      if (!selectedZone) {
        toast.error('Please select a zone');
        return;
      }
    } else if (structureType === 'pond_only') {
      if (!selectedPond) {
        toast.error('Please select a pond');
        return;
      }
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
      
      // Add selections based on structure type
      if (structureType === 'pond_zone_area' && selectedAreas.length > 0) {
        formData.append('area_ids', JSON.stringify(selectedAreas.map(a => a.area_id)));
      } else if (structureType === 'pond_zone' && selectedZone) {
        formData.append('zone_id', selectedZone.zone_id);
      } else if (structureType === 'pond_only' && selectedPond) {
        formData.append('pond_id', selectedPond.pond_id);
      }
      
      formData.append('bank_name', bankName);
      formData.append('bank_account_no', bankAccountNo);
      formData.append('payment_receipt', receipt);

      await registrationAPI.create(formData);
      
      // Clear draft data after successful submission
      const draftKey = `draft_${tournament.tournament_id}`;
      localStorage.removeItem(draftKey);
      
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

  // Check if organizer is logged in - they shouldn't register
  if (isAuthenticated && isOrganizer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 text-center max-w-md shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Organizer Account Detected</h2>
          <p className="text-slate-600 mb-2">
            You are currently logged in as an organizer account.
          </p>
          <p className="text-slate-500 mb-6 text-sm">
            Please logout to test the custom registration link as a regular user.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                logout();
                toast.success('Logged out successfully. You can now test the registration link.');
                // Refresh to show the registration page
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
              className="btn-primary"
            >
              Logout & Continue
            </button>
            <Link to="/organizer" className="btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
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
          className="bg-white rounded-2xl overflow-hidden mb-8 shadow-xl"
        >
          {/* Banner Image - Full Display */}
          {tournament.banner_image && (
            <div className="w-full bg-slate-100">
              <img
                src={getImageUrl(tournament.banner_image)}
                alt={tournament.name}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          {/* Countdown Timer */}
          {tournament.start_date && !countdown.isPast && (
            <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 px-4 md:px-6 py-4 md:py-5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  <div>
                    <p className="text-white/90 text-xs md:text-sm font-medium">Tournament Starts In</p>
                    <p className="text-white text-sm md:text-base">
                      {(() => {
                        try {
                          // Handle different date formats
                          let dateStr = tournament.start_date;
                          if (dateStr.includes('T')) {
                            dateStr = dateStr.split('T')[0];
                          }
                          
                          const timeStr = tournament.tournament_start_time || '00:00';
                          const timeOnly = timeStr.split(':').slice(0, 2).join(':');
                          
                          // Create date object
                          const dateTime = new Date(`${dateStr}T${timeOnly}:00`);
                          
                          if (!isNaN(dateTime.getTime())) {
                            // Format date
                            const formattedDate = dateTime.toLocaleDateString('en-MY', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                            
                            // Format time
                            const formattedTime = dateTime.toLocaleTimeString('en-MY', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                            
                            return `${formattedDate} at ${formattedTime}`;
                          }
                        } catch (e) {
                          console.error('Error formatting date:', e);
                        }
                        // Fallback: try to format just the date part
                        try {
                          const dateOnly = new Date(tournament.start_date.split('T')[0]);
                          if (!isNaN(dateOnly.getTime())) {
                            return dateOnly.toLocaleDateString('en-MY', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }) + (tournament.tournament_start_time ? ` at ${tournament.tournament_start_time}` : '');
                          }
                        } catch (e2) {
                          console.error('Error formatting fallback date:', e2);
                        }
                        return 'Date not available';
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 md:gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 md:py-3 text-center min-w-[60px] md:min-w-[80px]">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {countdown.days !== undefined && !isNaN(countdown.days) ? countdown.days : 0}
                    </div>
                    <div className="text-xs md:text-sm text-white/80">Days</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 md:py-3 text-center min-w-[60px] md:min-w-[80px]">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {countdown.hours !== undefined && !isNaN(countdown.hours) ? countdown.hours : 0}
                    </div>
                    <div className="text-xs md:text-sm text-white/80">Hours</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 md:py-3 text-center min-w-[60px] md:min-w-[80px]">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {countdown.minutes !== undefined && !isNaN(countdown.minutes) ? countdown.minutes : 0}
                    </div>
                    <div className="text-xs md:text-sm text-white/80">Mins</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 md:py-3 text-center min-w-[60px] md:min-w-[80px]">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {countdown.seconds !== undefined && !isNaN(countdown.seconds) ? countdown.seconds : 0}
                    </div>
                    <div className="text-xs md:text-sm text-white/80">Secs</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <TrophyIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-2 md:mb-3 truncate">{tournament.name}</h1>
                
                {/* Organizer Info */}
                {tournament.organizer_name && (
                  <div className="flex items-center gap-2 mb-3 text-slate-600">
                    <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm md:text-base font-medium">{tournament.organizer_name}</span>
                    {tournament.organizer_mobile && (
                      <span className="text-xs md:text-sm text-slate-500">• {tournament.organizer_mobile}</span>
                    )}
                  </div>
                )}
                
                {/* Tournament Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-5">
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
            {/* Show logged-in user info */}
            {isAuthenticated && isUser && user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-2xl p-4 md:p-5 mb-6 shadow-lg"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/90 text-xs md:text-sm font-medium">Registering as</p>
                      <p className="text-white font-semibold text-sm md:text-base">{user.full_name || user.name}</p>
                      {user.mobile_no && (
                        <p className="text-white/80 text-xs">{user.mobile_no}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Auto-save indicator */}
                    {savingDraft ? (
                      <div className="flex items-center gap-2 text-white/80 text-xs">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : lastSaved ? (
                      <div className="text-white/70 text-xs">
                        Saved {new Date(lastSaved).toLocaleTimeString()}
                      </div>
                    ) : null}
                    <button
                      onClick={() => {
                        if (window.confirm('Do you want to logout and use a different account?')) {
                          logout();
                          setStep(1);
                          toast.success('Logged out. Please login with a different account.');
                        }
                      }}
                      className="text-white/90 hover:text-white text-xs md:text-sm underline transition-colors"
                    >
                      Use different account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Area Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Check if tournament has areas */}
                {tournament.ponds?.some(pond => 
                  pond.zones?.some(zone => zone.areas && zone.areas.length > 0)
                ) ? (
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">Select Fishing Areas</h2>
                        <p className="text-sm text-slate-500">Choose your preferred fishing spots</p>
                      </div>
                    </div>
                    
                    {tournament.ponds?.map((pond) => (
                      <div key={pond.pond_id} className="mb-6 last:mb-0">
                        <h3 className="font-semibold text-slate-700 mb-3">{pond.pond_name}</h3>
                        
                        {pond.zones?.length > 0 ? (
                          pond.zones.map((zone) => (
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
                                    <motion.button
                                      key={area.area_id}
                                      onClick={() => toggleArea(area, zone, pond)}
                                      disabled={!area.is_available && !isSelected}
                                      className={`
                                        relative w-16 h-16 rounded-lg flex flex-col items-center justify-center
                                        text-sm font-medium transition-all border-2 shadow-sm
                                        ${isSelected 
                                          ? 'bg-gradient-to-br from-ocean-500 to-ocean-600 border-ocean-500 text-white shadow-lg scale-105' 
                                          : area.is_available
                                            ? 'bg-white border-slate-200 hover:border-ocean-400 hover:shadow-md hover:scale-105'
                                            : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                        }
                                      `}
                                      whileHover={area.is_available && !isSelected ? { scale: 1.05 } : {}}
                                      whileTap={area.is_available ? { scale: 0.95 } : {}}
                                    >
                                      <span className="font-bold text-base">{area.area_number}</span>
                                      <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                                        RM {parseFloat(area.price).toLocaleString()}
                                      </span>
                                      {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-forest-500 rounded-full flex items-center justify-center">
                                          <CheckIcon className="w-3 h-3 text-white" />
                                        </div>
                                      )}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No zones configured for this pond</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center">
                        <TrophyIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">Tournament Registration</h2>
                        <p className="text-sm text-slate-500">General participation</p>
                      </div>
                    </div>
                    {(() => {
                      const structureType = tournament?.structure_type || 'pond_zone_area';
                      
                      // Pond + Zone selection
                      if (structureType === 'pond_zone') {
                        return (
                          <div className="space-y-4">
                            <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-4">
                              <p className="text-slate-700 text-sm mb-3">
                                Please select a zone to register for this tournament.
                              </p>
                            </div>
                            {tournament.ponds?.map((pond) => (
                              <div key={pond.pond_id} className="mb-4">
                                <h3 className="font-semibold text-slate-700 mb-3">{pond.pond_name}</h3>
                                {pond.zones?.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {pond.zones.map((zone) => {
                                      const isSelected = selectedZone?.zone_id === zone.zone_id;
                                      return (
                                        <motion.button
                                          key={zone.zone_id}
                                          onClick={() => setSelectedZone({ ...zone, pond_name: pond.pond_name })}
                                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                                            isSelected
                                              ? 'border-forest-500 bg-forest-50'
                                              : 'border-slate-200 hover:border-forest-300 hover:bg-slate-50'
                                          }`}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div 
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: zone.color }}
                                              />
                                              <span className="font-medium text-slate-800">{zone.zone_name}</span>
                                            </div>
                                            <span className="font-bold text-forest-600">
                                              RM {parseFloat(zone.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                          </div>
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-slate-500 text-sm">No zones available</p>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // Pond-only selection
                      if (structureType === 'pond_only') {
                        return (
                          <div className="space-y-4">
                            <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-4">
                              <p className="text-slate-700 text-sm mb-3">
                                Please select a pond to register for this tournament.
                              </p>
                            </div>
                            {tournament.ponds?.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {tournament.ponds.map((pond) => {
                                  const isSelected = selectedPond?.pond_id === pond.pond_id;
                                  return (
                                    <motion.button
                                      key={pond.pond_id}
                                      onClick={() => setSelectedPond(pond)}
                                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                                        isSelected
                                          ? 'border-forest-500 bg-forest-50'
                                          : 'border-slate-200 hover:border-forest-300 hover:bg-slate-50'
                                      }`}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-800">{pond.pond_name}</span>
                                        <span className="font-bold text-forest-600">
                                          RM {parseFloat(pond.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-sm">No ponds available</p>
                            )}
                          </div>
                        );
                      }
                      
                      // Default message for tournaments without structure
                      return (
                        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4">
                          <p className="text-slate-700 text-sm">
                            This tournament does not require area selection. Please proceed with payment details below to complete your registration.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

              </div>

              {/* Summary & Payment */}
              <div className="space-y-6">
                {/* Selected Areas */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-forest-600" />
                    Registration Summary
                  </h3>
                  {(() => {
                    const structureType = tournament?.structure_type || 'pond_zone_area';
                    
                    // For pond_zone_area structure
                    if (structureType === 'pond_zone_area') {
                      if (selectedAreas.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-slate-500 text-sm">No areas selected yet</p>
                            <p className="text-slate-400 text-xs mt-2">Select areas from the list above</p>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2 mb-4">
                          {selectedAreas.map((area) => (
                            <div key={area.key} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-slate-800">{area.pond_name}</span>
                                <span className="text-slate-500"> - {area.zone_name} - Area {area.area_number}</span>
                              </div>
                              <span className="font-semibold text-ocean-600 ml-2">RM {parseFloat(area.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    // For pond_zone structure
                    if (structureType === 'pond_zone') {
                      if (selectedZone) {
                        return (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-slate-800">{selectedZone.pond_name || 'Pond'}</span>
                                <span className="text-slate-500"> - {selectedZone.zone_name}</span>
                              </div>
                              <span className="font-semibold text-ocean-600 ml-2">RM {parseFloat(selectedZone.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="text-center py-4">
                          <p className="text-slate-500 text-sm">No zone selected yet</p>
                          <p className="text-slate-400 text-xs mt-2">This tournament requires zone selection</p>
                        </div>
                      );
                    }
                    
                    // For pond_only structure
                    if (structureType === 'pond_only') {
                      if (selectedPond) {
                        return (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-slate-800">{selectedPond.pond_name}</span>
                              </div>
                              <span className="font-semibold text-ocean-600 ml-2">RM {parseFloat(selectedPond.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="text-center py-4">
                          <p className="text-slate-500 text-sm">No pond selected yet</p>
                          <p className="text-slate-400 text-xs mt-2">This tournament requires pond selection</p>
                        </div>
                      );
                    }
                    
                    // Default fallback
                    return (
                      <div className="text-center py-4">
                        <p className="text-slate-500 text-sm">No areas selected yet</p>
                        {!tournament.ponds?.some(pond => 
                          pond.zones?.some(zone => zone.areas && zone.areas.length > 0)
                        ) && (
                          <p className="text-slate-400 text-xs mt-2">This tournament doesn't require area selection</p>
                        )}
                      </div>
                    );
                  })()}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Total Payment</span>
                      <span className="font-bold text-xl text-ocean-600">
                        RM {totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                  <h3 className="font-semibold text-slate-800 mb-4 md:mb-6 flex items-center gap-2 text-base md:text-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                      <BanknotesIcon className="w-4 h-4 md:w-5 md:h-5 text-ocean-600" />
                    </div>
                    Payment Details
                  </h3>
                  
                  <div className="space-y-5 md:space-y-6">
                    {/* Organizer Payment Information - Always show */}
                    <div className="bg-gradient-to-br from-ocean-50 to-slate-50 rounded-xl p-4 md:p-5 border-2 border-ocean-200">
                      <h4 className="font-medium text-slate-700 mb-3 md:mb-4 text-sm md:text-base">Organizer Payment Information</h4>
                      {tournament.payment_details_image ? (
                        <>
                          <div className="flex justify-center mb-3">
                            <img
                              src={getImageUrl(tournament.payment_details_image)}
                              alt="Payment Details"
                              className="max-w-full h-auto max-h-[300px] md:max-h-[400px] rounded-lg shadow-md border-2 border-white object-contain"
                            />
                          </div>
                          <p className="text-xs md:text-sm text-slate-600 text-center font-medium">
                            Please transfer to the account shown above
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 md:py-12 bg-white/50 rounded-lg border-2 border-dashed border-ocean-200">
                          <BanknotesIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mb-3" />
                          <p className="text-sm md:text-base text-slate-400 font-medium">Payment Details</p>
                          <p className="text-xs md:text-sm text-slate-400 mt-2 text-center px-4">
                            Organizer payment information will be displayed here
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Your Bank Information */}
                    <div className="space-y-3 md:space-y-4">
                      <h4 className="font-medium text-slate-700 text-sm md:text-base">Your Bank Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Bank Name
                          </label>
                          <div className="relative">
                            <BanknotesIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="input-field pl-10 md:pl-12 min-h-[44px] w-full"
                              placeholder="e.g., BCA, Mandiri, BRI"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Bank Account Number
                          </label>
                          <input
                            type="text"
                            value={bankAccountNo}
                            onChange={(e) => setBankAccountNo(e.target.value)}
                            className="input-field min-h-[44px] w-full"
                            placeholder="Bank account number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Receipt */}
                    <div>
                      <label className="block text-sm md:text-base font-medium text-slate-700 mb-2 md:mb-3">
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
                        className="flex flex-col items-center justify-center w-full min-h-[120px] md:min-h-[150px] p-6 md:p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-ocean-500 hover:bg-ocean-50/50 transition-all group"
                      >
                        {receipt ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-ocean-100 flex items-center justify-center">
                              <CloudArrowUpIcon className="w-6 h-6 md:w-8 md:h-8 text-ocean-600" />
                            </div>
                            <span className="text-ocean-600 font-medium text-sm md:text-base break-all text-center max-w-full px-2">
                              {receipt.name}
                            </span>
                            <span className="text-xs text-slate-500 mt-1">Click to change</span>
                          </div>
                        ) : (
                          <>
                            <CloudArrowUpIcon className="w-10 h-10 md:w-12 md:h-12 text-slate-400 group-hover:text-ocean-500 transition-colors mb-3" />
                            <span className="text-slate-500 text-sm md:text-base font-medium">Upload receipt image</span>
                            <span className="text-xs text-slate-400 mt-1">PNG, JPG, or JPEG up to 5MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={(() => {
                    if (submitting) return true;
                    const structureType = tournament?.structure_type || 'pond_zone_area';
                    if (structureType === 'pond_zone_area') {
                      const hasAreas = tournament.ponds?.some(pond => 
                        pond.zones?.some(zone => zone.areas && zone.areas.length > 0)
                      );
                      return hasAreas && selectedAreas.length === 0;
                    } else if (structureType === 'pond_zone') {
                      return !selectedZone;
                    } else if (structureType === 'pond_only') {
                      return !selectedPond;
                    }
                    return false;
                  })()}
                  className="btn-primary w-full py-4 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckIcon className="w-5 h-5" />
                      Submit Registration
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicRegister;

