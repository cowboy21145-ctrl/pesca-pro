import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    if (token && userData) {
      setUser({ ...JSON.parse(userData), role });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const checkMobile = async (mobile_no) => {
    const response = await api.post('/auth/user/check-mobile', { mobile_no });
    return response.data;
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

