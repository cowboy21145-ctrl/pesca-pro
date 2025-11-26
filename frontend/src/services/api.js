import axios from 'axios';

// Get API base URL from environment or derive from current host
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // If accessing from an IP address, use the same IP for API
  const host = window.location.hostname;
  const port = 5000;
  return `http://${host}:${port}/api`;
};

// Get server base URL for images (without /api)
const getServerBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  const host = window.location.hostname;
  const port = 5000;
  return `http://${host}:${port}`;
};

// Export for use in components
export const API_BASE_URL = getApiBaseUrl();
export const SERVER_URL = getServerBaseUrl();

// Helper function to get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;
};

// Format description text (markdown-like to HTML)
export const formatDescription = (text) => {
  if (!text) return '';
  
  let html = text
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Italic: *text*
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Line breaks
    .replace(/\n/g, '<br />');
  
  // Handle bullet points and numbered lists
  const lines = html.split('<br />');
  let result = [];
  let inList = false;
  let listType = '';
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (!inList || listType !== 'bullet') {
        if (inList) result.push('</ul>');
        result.push('<ul class="list-disc list-inside space-y-1 my-2 ml-4">');
        inList = true;
        listType = 'bullet';
      }
      result.push(`<li class="text-slate-700">${trimmed.substring(2)}</li>`);
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== 'number') {
        if (inList) result.push('</ul>');
        result.push('<ul class="list-decimal list-inside space-y-1 my-2 ml-4">');
        inList = true;
        listType = 'number';
      }
      result.push(`<li class="text-slate-700">${trimmed.replace(/^\d+\.\s+/, '')}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
        listType = '';
      }
      if (trimmed) {
        result.push(`<p class="mb-2 text-slate-700">${trimmed}</p>`);
      }
    }
  });
  
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/');

    // Handle 401 only for non-auth endpoints (don't redirect on login failure)
    if (status === 401 && !isAuthEndpoint) {
      // Token expired or invalid - clear storage and show message
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/t/') && !currentPath.includes('/lb/')) {
        const errorMessage = error.response?.data?.message || 'Your session has expired';
        
        // Store error message to show after redirect
        sessionStorage.setItem('authError', errorMessage + '. Please login again.');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        // Redirect to appropriate login page
        const role = localStorage.getItem('role');
        if (role === 'organizer') {
          window.location.href = '/organizer/login';
        } else {
          window.location.href = '/login';
        }
      }
    }

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
    }

    return Promise.reject(error);
  }
);

export default api;

// Tournament API
export const tournamentAPI = {
  getAll: () => api.get('/tournaments/my-tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  getByRegisterLink: (link) => api.get(`/tournaments/register/${link}`),
  getLeaderboard: (link) => api.get(`/tournaments/leaderboard/${link}`),
  create: (data) => api.post('/tournaments', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/tournaments/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status) => api.patch(`/tournaments/${id}/status`, { status }),
  delete: (id) => api.delete(`/tournaments/${id}`)
};

// Pond API
export const pondAPI = {
  getByTournament: (tournamentId) => api.get(`/ponds/tournament/${tournamentId}`),
  getFull: (id) => api.get(`/ponds/${id}/full`),
  create: (data) => api.post('/ponds', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/ponds/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/ponds/${id}`)
};

// Zone API
export const zoneAPI = {
  getByPond: (pondId) => api.get(`/zones/pond/${pondId}`),
  create: (data) => api.post('/zones', data),
  update: (id, data) => api.put(`/zones/${id}`, data),
  delete: (id) => api.delete(`/zones/${id}`)
};

// Area API
export const areaAPI = {
  getByZone: (zoneId) => api.get(`/areas/zone/${zoneId}`),
  create: (data) => api.post('/areas', data),
  bulkCreate: (data) => api.post('/areas/bulk', data),
  update: (id, data) => api.put(`/areas/${id}`, data),
  delete: (id) => api.delete(`/areas/${id}`)
};

// Registration API
export const registrationAPI = {
  getMyRegistrations: () => api.get('/registrations/my-registrations'),
  getMyDrafts: () => api.get('/registrations/my-drafts'),
  getDraft: (tournamentId) => api.get(`/registrations/draft/${tournamentId}`),
  saveDraft: (data) => api.post('/registrations/draft', data),
  getByTournament: (tournamentId) => api.get(`/registrations/tournament/${tournamentId}`),
  getById: (id) => api.get(`/registrations/${id}`),
  create: (data) => api.post('/registrations', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status) => api.patch(`/registrations/${id}/status`, { status })
};

// Catch API
export const catchAPI = {
  getByRegistration: (registrationId) => api.get(`/catches/registration/${registrationId}`),
  getPending: (tournamentId) => api.get(`/catches/tournament/${tournamentId}/pending`),
  getByTournament: (tournamentId) => api.get(`/catches/tournament/${tournamentId}`),
  upload: (data) => api.post('/catches', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, approval_status, rejection_reason) => 
    api.patch(`/catches/${id}/status`, { approval_status, rejection_reason }),
  delete: (id) => api.delete(`/catches/${id}`)
};

