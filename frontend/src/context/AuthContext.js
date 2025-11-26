import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const validationIntervalRef = useRef(null);

  // Validate token function
  const validateToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await api.get('/auth/validate');
      return response.data.valid === true;
    } catch (error) {
      // Token is invalid or expired
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    
    // Clear validation interval
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      
      if (token && userData) {
        // Validate token on mount
        const isValid = await validateToken();
        if (isValid) {
          setUser({ ...JSON.parse(userData), role });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Set up periodic token validation (every 5 minutes)
          validationIntervalRef.current = setInterval(async () => {
            const stillValid = await validateToken();
            if (!stillValid) {
              toast.error('Your session has expired. Please login again.');
              logout();
              // Redirect to login
              const currentPath = window.location.pathname;
              if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/t/') && !currentPath.includes('/lb/')) {
                if (role === 'organizer') {
                  window.location.href = '/organizer/login';
                } else {
                  window.location.href = '/login';
                }
              }
            }
          }, 5 * 60 * 1000); // Check every 5 minutes
        } else {
          // Token invalid, clear storage
          toast.error('Your session has expired. Please login again.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Cleanup interval on unmount
    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, [validateToken, logout]);

  const loginUser = async (mobile_no, password) => {
    const response = await api.post('/auth/user/login', { mobile_no, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', 'user');
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ ...user, role: 'user' });
    
    return response.data;
  };

  const loginOrganizer = async (email, password) => {
    const response = await api.post('/auth/organizer/login', { email, password });
    const { token, organizer } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(organizer));
    localStorage.setItem('role', 'organizer');
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ ...organizer, role: 'organizer' });
    
    return response.data;
  };

  const registerUser = async (userData) => {
    const response = await api.post('/auth/user/register', userData);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', 'user');
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ ...user, role: 'user' });
    
    return response.data;
  };

  const registerOrganizer = async (organizerData) => {
    const response = await api.post('/auth/organizer/register', organizerData);
    const { token, organizer } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(organizer));
    localStorage.setItem('role', 'organizer');
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ ...organizer, role: 'organizer' });
    
    return response.data;
  };


  const checkMobile = async (mobile_no) => {
    const response = await api.post('/auth/user/check-mobile', { mobile_no });
    return response.data;
  };

  // Check if login is valid (exposed for manual checks)
  const checkLoginValid = async () => {
    const isValid = await validateToken();
    if (!isValid) {
      logout();
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginUser,
      loginOrganizer,
      registerUser,
      registerOrganizer,
      logout,
      checkMobile,
      checkLoginValid,
      validateToken,
      isAuthenticated: !!user,
      isOrganizer: user?.role === 'organizer',
      isUser: user?.role === 'user'
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

