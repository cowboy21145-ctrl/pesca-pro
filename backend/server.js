const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
// CORS configuration - supports Railway deployment and local development
const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const pondRoutes = require('./routes/ponds');
const zoneRoutes = require('./routes/zones');
const areaRoutes = require('./routes/areas');
const registrationRoutes = require('./routes/registrations');
const catchRoutes = require('./routes/catches');

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/ponds', pondRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/catches', catchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pesca Pro API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🎣 ================================
     PESCA PRO API SERVER
  ================================
  
  🚀 Server running on port ${PORT}
  📍 API URL: http://localhost:${PORT}/api
  
  Available endpoints:
  - POST /api/auth/user/register
  - POST /api/auth/user/login
  - POST /api/auth/organizer/register
  - POST /api/auth/organizer/login
  - GET  /api/tournaments
  - GET  /api/tournaments/register/:link
  - GET  /api/tournaments/leaderboard/:link
  - And more...
  
  🎣 ================================
  `);
});

module.exports = app;

