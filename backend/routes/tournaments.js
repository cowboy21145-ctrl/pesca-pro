const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { authenticate, isOrganizer, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Generate unique link
const generateUniqueLink = () => {
  return uuidv4().replace(/-/g, '').substring(0, 12);
};

// Create Tournament (Organizer only)
router.post('/', authenticate, isOrganizer, upload.fields([
  { name: 'banner_image', maxCount: 1 },
  { name: 'payment_details_image', maxCount: 1 }
]), [
  body('name').trim().notEmpty().withMessage('Tournament name is required'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, location, start_date, end_date, description,
      tournament_start_time, tournament_end_time,
      registration_start_date, registration_end_date
    } = req.body;
    const organizer_id = req.user.id;
    
    const registration_link = generateUniqueLink();
    const leaderboard_link = generateUniqueLink();
    const banner_image = req.files?.banner_image?.[0] ? `/uploads/banners/${req.files.banner_image[0].filename}` : null;
    const payment_details_image = req.files?.payment_details_image?.[0] ? `/uploads/payment-details/${req.files.payment_details_image[0].filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO tournaments (organizer_id, name, location, start_date, end_date, 
        tournament_start_time, tournament_end_time, registration_start_date, registration_end_date,
        registration_link, leaderboard_link, description, banner_image, payment_details_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [organizer_id, name, location, start_date, end_date, 
       tournament_start_time || null, tournament_end_time || null,
       registration_start_date || null, registration_end_date || null,
       registration_link, leaderboard_link, description, banner_image, payment_details_image]
    );

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament: {
        id: result.insertId,
        name,
        location,
        start_date,
        end_date,
        registration_link,
        leaderboard_link,
        status: 'draft',
        banner_image,
        payment_details_image
      }
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Server error creating tournament' });
  }
});

// Get all tournaments for organizer
router.get('/my-tournaments', authenticate, isOrganizer, async (req, res) => {
  try {
    const [tournaments] = await pool.query(
      `SELECT t.*, 
        (SELECT COUNT(*) FROM registrations r WHERE r.tournament_id = t.tournament_id) as participant_count,
        (SELECT COUNT(*) FROM ponds p WHERE p.tournament_id = t.tournament_id) as pond_count
       FROM tournaments t 
       WHERE t.organizer_id = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json(tournaments);
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ message: 'Server error fetching tournaments' });
  }
});

// Get tournament by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [tournaments] = await pool.query(
      `SELECT t.*, o.name as organizer_name, o.mobile_no as organizer_mobile
       FROM tournaments t
       JOIN organizers o ON t.organizer_id = o.organizer_id
       WHERE t.tournament_id = ?`,
      [req.params.id]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(tournaments[0]);
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ message: 'Server error fetching tournament' });
  }
});

// Get tournament by registration link
router.get('/register/:link', async (req, res) => {
  try {
    const [tournaments] = await pool.query(
      `SELECT t.*, o.name as organizer_name, o.mobile_no as organizer_mobile
       FROM tournaments t
       JOIN organizers o ON t.organizer_id = o.organizer_id
       WHERE t.registration_link = ? AND t.status = 'active'`,
      [req.params.link]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found or not active' });
    }

    // Get ponds, zones, and areas
    const tournament = tournaments[0];
    
    const [ponds] = await pool.query(
      `SELECT * FROM ponds WHERE tournament_id = ?`,
      [tournament.tournament_id]
    );

    for (let pond of ponds) {
      const [zones] = await pool.query(
        `SELECT * FROM zones WHERE pond_id = ?`,
        [pond.pond_id]
      );

      for (let zone of zones) {
        const [areas] = await pool.query(
          `SELECT a.*, 
            CASE WHEN s.selection_id IS NOT NULL THEN FALSE ELSE a.is_available END as is_available
           FROM areas a
           LEFT JOIN area_selections s ON a.area_id = s.area_id
           LEFT JOIN registrations r ON s.registration_id = r.registration_id AND r.status IN ('pending', 'confirmed')
           WHERE a.zone_id = ?`,
          [zone.zone_id]
        );
        zone.areas = areas;
      }
      pond.zones = zones;
    }

    tournament.ponds = ponds;
    res.json(tournament);
  } catch (error) {
    console.error('Get tournament by link error:', error);
    res.status(500).json({ message: 'Server error fetching tournament' });
  }
});

// Get leaderboard by link
router.get('/leaderboard/:link', async (req, res) => {
  try {
    const [tournaments] = await pool.query(
      `SELECT t.tournament_id, t.name, t.location, t.start_date, t.end_date, t.status, t.banner_image
       FROM tournaments t
       WHERE t.leaderboard_link = ?`,
      [req.params.link]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Leaderboard not found' });
    }

    const tournament = tournaments[0];

    // Get leaderboard data
    const [leaderboard] = await pool.query(
      `SELECT 
        u.user_id,
        u.full_name,
        r.registration_id,
        COUNT(c.catch_id) as total_catches,
        COALESCE(SUM(CASE WHEN c.approval_status = 'approved' THEN c.weight ELSE 0 END), 0) as total_weight,
        MAX(CASE WHEN c.approval_status = 'approved' THEN c.weight ELSE 0 END) as biggest_catch
       FROM registrations r
       JOIN users u ON r.user_id = u.user_id
       LEFT JOIN catches c ON r.registration_id = c.registration_id
       WHERE r.tournament_id = ? AND r.status = 'confirmed'
       GROUP BY u.user_id, u.full_name, r.registration_id
       ORDER BY total_weight DESC, biggest_catch DESC`,
      [tournament.tournament_id]
    );

    tournament.leaderboard = leaderboard;
    res.json(tournament);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// Update tournament status
router.patch('/:id/status', authenticate, isOrganizer, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['draft', 'active', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Verify ownership
    const [tournaments] = await pool.query(
      'SELECT tournament_id FROM tournaments WHERE tournament_id = ? AND organizer_id = ?',
      [req.params.id, req.user.id]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found or unauthorized' });
    }

    await pool.query(
      'UPDATE tournaments SET status = ? WHERE tournament_id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'Tournament status updated', status });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating tournament status' });
  }
});

// Update tournament
router.put('/:id', authenticate, isOrganizer, upload.fields([
  { name: 'banner_image', maxCount: 1 },
  { name: 'payment_details_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      name, location, start_date, end_date, description,
      tournament_start_time, tournament_end_time,
      registration_start_date, registration_end_date
    } = req.body;

    // Verify ownership
    const [tournaments] = await pool.query(
      'SELECT * FROM tournaments WHERE tournament_id = ? AND organizer_id = ?',
      [req.params.id, req.user.id]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found or unauthorized' });
    }

    const banner_image = req.files?.banner_image?.[0] ? `/uploads/banners/${req.files.banner_image[0].filename}` : tournaments[0].banner_image;
    const payment_details_image = req.files?.payment_details_image?.[0] ? `/uploads/payment-details/${req.files.payment_details_image[0].filename}` : tournaments[0].payment_details_image;

    await pool.query(
      `UPDATE tournaments SET 
        name = ?, location = ?, start_date = ?, end_date = ?, 
        tournament_start_time = ?, tournament_end_time = ?,
        registration_start_date = ?, registration_end_date = ?,
        description = ?, banner_image = ?, payment_details_image = ?
       WHERE tournament_id = ?`,
      [name, location, start_date, end_date, 
       tournament_start_time || null, tournament_end_time || null,
       registration_start_date || null, registration_end_date || null,
       description, banner_image, payment_details_image, req.params.id]
    );

    res.json({ message: 'Tournament updated successfully' });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ message: 'Server error updating tournament' });
  }
});

// Delete tournament
router.delete('/:id', authenticate, isOrganizer, async (req, res) => {
  try {
    // Verify ownership
    const [tournaments] = await pool.query(
      'SELECT tournament_id FROM tournaments WHERE tournament_id = ? AND organizer_id = ?',
      [req.params.id, req.user.id]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found or unauthorized' });
    }

    await pool.query('DELETE FROM tournaments WHERE tournament_id = ?', [req.params.id]);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ message: 'Server error deleting tournament' });
  }
});

module.exports = router;

