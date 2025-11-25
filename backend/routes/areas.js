const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, isOrganizer } = require('../middleware/auth');

// Create Area
router.post('/', authenticate, isOrganizer, [
  body('zone_id').isInt().withMessage('Zone ID is required'),
  body('area_number').isInt({ min: 1 }).withMessage('Area number is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { zone_id, area_number, price, position_x, position_y } = req.body;

    // Verify zone ownership
    const [zones] = await pool.query(
      `SELECT z.zone_id FROM zones z
       JOIN ponds p ON z.pond_id = p.pond_id
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE z.zone_id = ? AND t.organizer_id = ?`,
      [zone_id, req.user.id]
    );

    if (zones.length === 0) {
      return res.status(404).json({ message: 'Zone not found or unauthorized' });
    }

    const [result] = await pool.query(
      'INSERT INTO areas (zone_id, area_number, price, position_x, position_y) VALUES (?, ?, ?, ?, ?)',
      [zone_id, area_number, price, position_x || 0, position_y || 0]
    );

    res.status(201).json({
      message: 'Area created successfully',
      area: {
        area_id: result.insertId,
        zone_id,
        area_number,
        price,
        is_available: true,
        position_x: position_x || 0,
        position_y: position_y || 0
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Area number already exists in this zone' });
    }
    console.error('Create area error:', error);
    res.status(500).json({ message: 'Server error creating area' });
  }
});

// Bulk create areas
router.post('/bulk', authenticate, isOrganizer, async (req, res) => {
  try {
    const { zone_id, areas } = req.body;

    if (!zone_id || !areas || !Array.isArray(areas)) {
      return res.status(400).json({ message: 'Zone ID and areas array required' });
    }

    // Verify zone ownership
    const [zones] = await pool.query(
      `SELECT z.zone_id FROM zones z
       JOIN ponds p ON z.pond_id = p.pond_id
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE z.zone_id = ? AND t.organizer_id = ?`,
      [zone_id, req.user.id]
    );

    if (zones.length === 0) {
      return res.status(404).json({ message: 'Zone not found or unauthorized' });
    }

    const values = areas.map(area => [
      zone_id,
      area.area_number,
      area.price || 0,
      area.position_x || 0,
      area.position_y || 0
    ]);

    const [result] = await pool.query(
      'INSERT INTO areas (zone_id, area_number, price, position_x, position_y) VALUES ?',
      [values]
    );

    res.status(201).json({
      message: `${result.affectedRows} areas created successfully`
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Duplicate area numbers found' });
    }
    console.error('Bulk create areas error:', error);
    res.status(500).json({ message: 'Server error creating areas' });
  }
});

// Get areas for zone
router.get('/zone/:zoneId', async (req, res) => {
  try {
    const [areas] = await pool.query(
      `SELECT a.*, 
        CASE WHEN s.selection_id IS NOT NULL AND r.status IN ('pending', 'confirmed') 
          THEN FALSE ELSE a.is_available 
        END as is_available,
        u.full_name as reserved_by
       FROM areas a
       LEFT JOIN area_selections s ON a.area_id = s.area_id
       LEFT JOIN registrations r ON s.registration_id = r.registration_id AND r.status IN ('pending', 'confirmed')
       LEFT JOIN users u ON r.user_id = u.user_id
       WHERE a.zone_id = ?
       ORDER BY a.area_number`,
      [req.params.zoneId]
    );

    res.json(areas);
  } catch (error) {
    console.error('Get areas error:', error);
    res.status(500).json({ message: 'Server error fetching areas' });
  }
});

// Update area
router.put('/:id', authenticate, isOrganizer, async (req, res) => {
  try {
    const { area_number, price, is_available, position_x, position_y } = req.body;

    // Verify ownership
    const [areas] = await pool.query(
      `SELECT a.* FROM areas a
       JOIN zones z ON a.zone_id = z.zone_id
       JOIN ponds p ON z.pond_id = p.pond_id
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE a.area_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (areas.length === 0) {
      return res.status(404).json({ message: 'Area not found or unauthorized' });
    }

    await pool.query(
      'UPDATE areas SET area_number = ?, price = ?, is_available = ?, position_x = ?, position_y = ? WHERE area_id = ?',
      [area_number, price, is_available, position_x, position_y, req.params.id]
    );

    res.json({ message: 'Area updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Area number already exists in this zone' });
    }
    console.error('Update area error:', error);
    res.status(500).json({ message: 'Server error updating area' });
  }
});

// Delete area
router.delete('/:id', authenticate, isOrganizer, async (req, res) => {
  try {
    // Verify ownership
    const [areas] = await pool.query(
      `SELECT a.area_id FROM areas a
       JOIN zones z ON a.zone_id = z.zone_id
       JOIN ponds p ON z.pond_id = p.pond_id
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE a.area_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (areas.length === 0) {
      return res.status(404).json({ message: 'Area not found or unauthorized' });
    }

    await pool.query('DELETE FROM areas WHERE area_id = ?', [req.params.id]);

    res.json({ message: 'Area deleted successfully' });
  } catch (error) {
    console.error('Delete area error:', error);
    res.status(500).json({ message: 'Server error deleting area' });
  }
});

module.exports = router;

