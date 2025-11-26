const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// User Registration
router.post('/user/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('mobile_no').trim().notEmpty().withMessage('Mobile number is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, mobile_no, email, password, bank_account_no, bank_name } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM users WHERE mobile_no = ?',
      [mobile_no]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, mobile_no, email, password, bank_account_no, bank_name) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, mobile_no, email || null, hashedPassword, bank_account_no || null, bank_name || null]
    );

    const token = generateToken({
      id: result.insertId,
      mobile_no,
      role: 'user'
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.insertId,
        full_name,
        mobile_no,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
router.post('/user/login', [
  body('mobile_no').trim().notEmpty().withMessage('Mobile number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile_no, password } = req.body;

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE mobile_no = ?',
      [mobile_no]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.user_id,
      mobile_no: user.mobile_no,
      role: 'user'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        mobile_no: user.mobile_no,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Check mobile number (for auto-detect)
router.post('/user/check-mobile', [
  body('mobile_no').trim().notEmpty().withMessage('Mobile number is required')
], async (req, res) => {
  try {
    const { mobile_no } = req.body;

    const [users] = await pool.query(
      'SELECT user_id, full_name, mobile_no, email FROM users WHERE mobile_no = ?',
      [mobile_no]
    );

    if (users.length > 0) {
      res.json({ exists: true, user: users[0] });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Check mobile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Organizer Registration
router.post('/organizer/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile_no').trim().notEmpty().withMessage('Mobile number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile_no, password } = req.body;

    // Check if organizer exists
    const [existingOrganizers] = await pool.query(
      'SELECT organizer_id FROM organizers WHERE email = ? OR mobile_no = ?',
      [email, mobile_no]
    );

    if (existingOrganizers.length > 0) {
      return res.status(400).json({ message: 'Email or mobile number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organizer
    const [result] = await pool.query(
      'INSERT INTO organizers (name, email, mobile_no, password) VALUES (?, ?, ?, ?)',
      [name, email, mobile_no, hashedPassword]
    );

    const token = generateToken({
      id: result.insertId,
      email,
      role: 'organizer'
    });

    res.status(201).json({
      message: 'Organizer registration successful',
      token,
      organizer: {
        id: result.insertId,
        name,
        email,
        mobile_no
      }
    });
  } catch (error) {
    console.error('Organizer registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Validate Token
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      
      // Optionally verify user still exists in database
      if (decoded.role === 'user') {
        const [users] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [decoded.id]);
        if (users.length === 0) {
          return res.status(401).json({ valid: false, message: 'User not found' });
        }
      } else if (decoded.role === 'organizer') {
        const [organizers] = await pool.query('SELECT organizer_id FROM organizers WHERE organizer_id = ?', [decoded.id]);
        if (organizers.length === 0) {
          return res.status(401).json({ valid: false, message: 'Organizer not found' });
        }
      }
      
      res.json({ valid: true, user: decoded });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ valid: false, message: 'Token expired' });
      }
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ valid: false, message: 'Server error validating token' });
  }
});

// Organizer Login
router.post('/organizer/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find organizer
    const [organizers] = await pool.query(
      'SELECT * FROM organizers WHERE email = ?',
      [email]
    );

    if (organizers.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const organizer = organizers[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: organizer.organizer_id,
      email: organizer.email,
      role: 'organizer'
    });

    res.json({
      message: 'Login successful',
      token,
      organizer: {
        id: organizer.organizer_id,
        name: organizer.name,
        email: organizer.email,
        mobile_no: organizer.mobile_no
      }
    });
  } catch (error) {
    console.error('Organizer login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;

