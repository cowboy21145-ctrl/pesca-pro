const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, isOrganizer } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create Pond
router.post('/', authenticate, isOrganizer, upload.single('layout_image'), [
  body('tournament_id').isInt().withMessage('Tournament ID is required'),
  body('pond_name').trim().notEmpty().withMessage('Pond name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tournament_id, pond_name, description, price } = req.body;

    // Verify tournament ownership
    const [tournaments] = await pool.query(
      'SELECT tournament_id FROM tournaments WHERE tournament_id = ? AND organizer_id = ?',
      [tournament_id, req.user.id]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found or unauthorized' });
    }

    const layout_image = req.file ? `/uploads/layouts/${req.file.filename}` : null;
    const pondPrice = price ? parseFloat(price) : 0.00;

    const [result] = await pool.query(
      'INSERT INTO ponds (tournament_id, pond_name, layout_image, description, price) VALUES (?, ?, ?, ?, ?)',
      [tournament_id, pond_name, layout_image, description, pondPrice]
    );

    res.status(201).json({
      message: 'Pond created successfully',
      pond: {
        pond_id: result.insertId,
        tournament_id,
        pond_name,
        layout_image,
        description
      }
    });
  } catch (error) {
    console.error('Create pond error:', error);
    res.status(500).json({ message: 'Server error creating pond' });
  }
});

// Get ponds for tournament
router.get('/tournament/:tournamentId', authenticate, async (req, res) => {
  try {
    const [ponds] = await pool.query(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM zones z WHERE z.pond_id = p.pond_id) as zone_count,
        (SELECT COUNT(*) FROM areas a JOIN zones z ON a.zone_id = z.zone_id WHERE z.pond_id = p.pond_id) as area_count
       FROM ponds p 
       WHERE p.tournament_id = ?`,
      [req.params.tournamentId]
    );

    res.json(ponds);
  } catch (error) {
    console.error('Get ponds error:', error);
    res.status(500).json({ message: 'Server error fetching ponds' });
  }
});

// Get pond with zones and areas
router.get('/:id/full', async (req, res) => {
  try {
    const [ponds] = await pool.query(
      'SELECT * FROM ponds WHERE pond_id = ?',
      [req.params.id]
    );

    if (ponds.length === 0) {
      return res.status(404).json({ message: 'Pond not found' });
    }

    const pond = ponds[0];

    // Get zones with areas
    const [zones] = await pool.query(
      'SELECT * FROM zones WHERE pond_id = ? ORDER BY zone_number',
      [pond.pond_id]
    );

    for (let zone of zones) {
      const [areas] = await pool.query(
        `SELECT a.*, 
          CASE WHEN s.selection_id IS NOT NULL AND r.status IN ('pending', 'confirmed') THEN FALSE ELSE a.is_available END as is_available
         FROM areas a
         LEFT JOIN area_selections s ON a.area_id = s.area_id
         LEFT JOIN registrations r ON s.registration_id = r.registration_id
         WHERE a.zone_id = ?
         ORDER BY a.area_number`,
        [zone.zone_id]
      );
      zone.areas = areas;
    }

    pond.zones = zones;
    res.json(pond);
  } catch (error) {
    console.error('Get pond full error:', error);
    res.status(500).json({ message: 'Server error fetching pond details' });
  }
});

// Update pond
router.put('/:id', authenticate, isOrganizer, upload.single('layout_image'), async (req, res) => {
  try {
    const { pond_name, description, price } = req.body;

    // Verify ownership through tournament
    const [ponds] = await pool.query(
      `SELECT p.* FROM ponds p
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE p.pond_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (ponds.length === 0) {
      return res.status(404).json({ message: 'Pond not found or unauthorized' });
    }

    const layout_image = req.file ? `/uploads/layouts/${req.file.filename}` : ponds[0].layout_image;
    const pondPrice = price !== undefined ? parseFloat(price) : ponds[0].price;

    await pool.query(
      'UPDATE ponds SET pond_name = ?, description = ?, layout_image = ?, price = ? WHERE pond_id = ?',
      [pond_name, description, layout_image, pondPrice, req.params.id]
    );

    res.json({ message: 'Pond updated successfully' });
  } catch (error) {
    console.error('Update pond error:', error);
    res.status(500).json({ message: 'Server error updating pond' });
  }
});

// Delete pond
router.delete('/:id', authenticate, isOrganizer, async (req, res) => {
  try {
    // Verify ownership
    const [ponds] = await pool.query(
      `SELECT p.pond_id FROM ponds p
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE p.pond_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (ponds.length === 0) {
      return res.status(404).json({ message: 'Pond not found or unauthorized' });
    }

    await pool.query('DELETE FROM ponds WHERE pond_id = ?', [req.params.id]);

    res.json({ message: 'Pond deleted successfully' });
  } catch (error) {
    console.error('Delete pond error:', error);
    res.status(500).json({ message: 'Server error deleting pond' });
  }
});

module.exports = router;

