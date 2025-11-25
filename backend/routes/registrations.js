const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, isOrganizer, isUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create Registration with Area Selections
router.post('/', authenticate, isUser, upload.single('payment_receipt'), [
  body('tournament_id').isInt().withMessage('Tournament ID is required'),
  body('area_ids').custom(value => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) && parsed.length > 0;
  }).withMessage('At least one area must be selected'),
  body('bank_account_no').trim().notEmpty().withMessage('Bank account number is required')
], async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tournament_id, bank_account_no, notes } = req.body;
    const area_ids = typeof req.body.area_ids === 'string' 
      ? JSON.parse(req.body.area_ids) 
      : req.body.area_ids;
    const user_id = req.user.id;

    await connection.beginTransaction();

    // Check if already registered
    const [existingReg] = await connection.query(
      'SELECT registration_id FROM registrations WHERE user_id = ? AND tournament_id = ? AND status IN ("pending", "confirmed")',
      [user_id, tournament_id]
    );

    if (existingReg.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'You have already registered for this tournament' });
    }

    // Verify areas are available
    const [areas] = await connection.query(
      `SELECT a.area_id, a.price, a.is_available,
        (SELECT COUNT(*) FROM area_selections s 
         JOIN registrations r ON s.registration_id = r.registration_id 
         WHERE s.area_id = a.area_id AND r.status IN ('pending', 'confirmed')) as selection_count
       FROM areas a
       WHERE a.area_id IN (?)`,
      [area_ids]
    );

    if (areas.length !== area_ids.length) {
      await connection.rollback();
      return res.status(400).json({ message: 'Some selected areas do not exist' });
    }

    const unavailable = areas.filter(a => !a.is_available || a.selection_count > 0);
    if (unavailable.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Some selected areas are no longer available' });
    }

    // Calculate total payment
    const total_payment = areas.reduce((sum, a) => sum + parseFloat(a.price), 0);

    const payment_receipt = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    // Create registration
    const [regResult] = await connection.query(
      `INSERT INTO registrations (user_id, tournament_id, total_payment, payment_receipt, bank_account_no, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, tournament_id, total_payment, payment_receipt, bank_account_no, notes]
    );

    const registration_id = regResult.insertId;

    // Create area selections
    const selectionValues = area_ids.map(area_id => [registration_id, area_id]);
    await connection.query(
      'INSERT INTO area_selections (registration_id, area_id) VALUES ?',
      [selectionValues]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Registration submitted successfully',
      registration: {
        registration_id,
        tournament_id,
        total_payment,
        status: 'pending',
        area_count: area_ids.length
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  } finally {
    connection.release();
  }
});

// Get user's registrations
router.get('/my-registrations', authenticate, isUser, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT r.*, t.name as tournament_name, t.location, t.start_date, t.end_date, t.leaderboard_link,
        (SELECT COUNT(*) FROM area_selections s WHERE s.registration_id = r.registration_id) as area_count,
        (SELECT COUNT(*) FROM catches c WHERE c.registration_id = r.registration_id) as catch_count,
        (SELECT COALESCE(SUM(c.weight), 0) FROM catches c WHERE c.registration_id = r.registration_id AND c.approval_status = 'approved') as total_weight
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       WHERE r.user_id = ?
       ORDER BY r.registered_at DESC`,
      [req.user.id]
    );

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// Get registrations for tournament (Organizer)
router.get('/tournament/:tournamentId', authenticate, isOrganizer, async (req, res) => {
  try {
    // Verify ownership
    const [tournaments] = await pool.query(
      'SELECT tournament_id FROM tournaments WHERE tournament_id = ? AND organizer_id = ?',
      [req.params.tournamentId, req.user.id]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found or unauthorized' });
    }

    const [registrations] = await pool.query(
      `SELECT r.*, u.full_name, u.mobile_no, u.email,
        (SELECT COUNT(*) FROM area_selections s WHERE s.registration_id = r.registration_id) as area_count,
        (SELECT GROUP_CONCAT(
          CONCAT(p.pond_name, ' - ', z.zone_name, ' - Area ', a.area_number) 
          SEPARATOR ', '
        ) FROM area_selections s
        JOIN areas a ON s.area_id = a.area_id
        JOIN zones z ON a.zone_id = z.zone_id
        JOIN ponds p ON z.pond_id = p.pond_id
        WHERE s.registration_id = r.registration_id) as selected_areas
       FROM registrations r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.tournament_id = ?
       ORDER BY r.registered_at DESC`,
      [req.params.tournamentId]
    );

    res.json(registrations);
  } catch (error) {
    console.error('Get tournament registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// Update registration status (Organizer)
router.patch('/:id/status', authenticate, isOrganizer, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Verify ownership
    const [registrations] = await pool.query(
      `SELECT r.registration_id FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       WHERE r.registration_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({ message: 'Registration not found or unauthorized' });
    }

    const confirmed_at = status === 'confirmed' ? new Date() : null;

    await pool.query(
      'UPDATE registrations SET status = ?, confirmed_at = ? WHERE registration_id = ?',
      [status, confirmed_at, req.params.id]
    );

    res.json({ message: 'Registration status updated', status });
  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({ message: 'Server error updating registration' });
  }
});

// Get registration details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT r.*, t.name as tournament_name, t.location, t.start_date, t.end_date, t.leaderboard_link,
        u.full_name, u.mobile_no, u.email
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       JOIN users u ON r.user_id = u.user_id
       WHERE r.registration_id = ?`,
      [req.params.id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const registration = registrations[0];

    // Get selected areas
    const [areas] = await pool.query(
      `SELECT s.*, a.area_number, a.price, z.zone_name, z.zone_number, p.pond_name
       FROM area_selections s
       JOIN areas a ON s.area_id = a.area_id
       JOIN zones z ON a.zone_id = z.zone_id
       JOIN ponds p ON z.pond_id = p.pond_id
       WHERE s.registration_id = ?`,
      [req.params.id]
    );

    registration.selected_areas = areas;

    // Get catches
    const [catches] = await pool.query(
      'SELECT * FROM catches WHERE registration_id = ? ORDER BY uploaded_at DESC',
      [req.params.id]
    );

    registration.catches = catches;

    res.json(registration);
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ message: 'Server error fetching registration' });
  }
});

module.exports = router;

