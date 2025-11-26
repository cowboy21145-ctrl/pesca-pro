const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, isOrganizer } = require('../middleware/auth');

// Create Zone
router.post('/', authenticate, isOrganizer, [
  body('pond_id').isInt().withMessage('Pond ID is required'),
  body('zone_name').trim().notEmpty().withMessage('Zone name is required'),
  body('zone_number').isInt({ min: 1 }).withMessage('Zone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pond_id, zone_name, zone_number, color, price } = req.body;

    // Verify pond ownership
    const [ponds] = await pool.query(
      `SELECT p.pond_id FROM ponds p
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE p.pond_id = ? AND t.organizer_id = ?`,
      [pond_id, req.user.id]
    );

    if (ponds.length === 0) {
      return res.status(404).json({ message: 'Pond not found or unauthorized' });
    }

    const zonePrice = price ? parseFloat(price) : 0.00;

    const [result] = await pool.query(
      'INSERT INTO zones (pond_id, zone_name, zone_number, color, price) VALUES (?, ?, ?, ?, ?)',
      [pond_id, zone_name, zone_number, color || '#3B82F6', zonePrice]
    );

    res.status(201).json({
      message: 'Zone created successfully',
      zone: {
        zone_id: result.insertId,
        pond_id,
        zone_name,
        zone_number,
        color: color || '#3B82F6'
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Zone number already exists in this pond' });
    }
    console.error('Create zone error:', error);
    res.status(500).json({ message: 'Server error creating zone' });
  }
});

// Get zones for pond
router.get('/pond/:pondId', authenticate, async (req, res) => {
  try {
    const [zones] = await pool.query(
      `SELECT z.*, 
        (SELECT COUNT(*) FROM areas a WHERE a.zone_id = z.zone_id) as area_count,
        (SELECT COUNT(*) FROM areas a WHERE a.zone_id = z.zone_id AND a.is_available = TRUE) as available_count
       FROM zones z 
       WHERE z.pond_id = ?
       ORDER BY z.zone_number`,
      [req.params.pondId]
    );

    res.json(zones);
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ message: 'Server error fetching zones' });
  }
});

// Update zone
router.put('/:id', authenticate, isOrganizer, async (req, res) => {
  try {
    const { zone_name, zone_number, color, price } = req.body;

    // Verify ownership
    const [zones] = await pool.query(
      `SELECT z.* FROM zones z
       JOIN ponds p ON z.pond_id = p.pond_id
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE z.zone_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (zones.length === 0) {
      return res.status(404).json({ message: 'Zone not found or unauthorized' });
    }

    const zonePrice = price !== undefined ? parseFloat(price) : zones[0].price;

    await pool.query(
      'UPDATE zones SET zone_name = ?, zone_number = ?, color = ?, price = ? WHERE zone_id = ?',
      [zone_name, zone_number, color, zonePrice, req.params.id]
    );

    res.json({ message: 'Zone updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Zone number already exists in this pond' });
    }
    console.error('Update zone error:', error);
    res.status(500).json({ message: 'Server error updating zone' });
  }
});

// Delete zone
router.delete('/:id', authenticate, isOrganizer, async (req, res) => {
  try {
    // Verify ownership
    const [zones] = await pool.query(
      `SELECT z.zone_id FROM zones z
       JOIN ponds p ON z.pond_id = p.pond_id
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE z.zone_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (zones.length === 0) {
      return res.status(404).json({ message: 'Zone not found or unauthorized' });
    }

    await pool.query('DELETE FROM zones WHERE zone_id = ?', [req.params.id]);

    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({ message: 'Server error deleting zone' });
  }
});

module.exports = router;

