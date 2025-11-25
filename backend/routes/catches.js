const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, isOrganizer, isUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload Catch
router.post('/', authenticate, isUser, upload.single('catch_image'), [
  body('registration_id').isInt().withMessage('Registration ID is required'),
  body('weight').isFloat({ min: 0.01 }).withMessage('Valid weight is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Catch image is required' });
    }

    const { registration_id, weight, species } = req.body;
    const user_id = req.user.id;

    // Verify registration ownership and confirmed status
    const [registrations] = await pool.query(
      `SELECT r.registration_id, t.status as tournament_status
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       WHERE r.registration_id = ? AND r.user_id = ? AND r.status = 'confirmed'`,
      [registration_id, user_id]
    );

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'Registration not found, not confirmed, or unauthorized' });
    }

    if (registrations[0].tournament_status !== 'active') {
      return res.status(400).json({ message: 'Tournament is not currently active' });
    }

    const catch_image = `/uploads/catches/${req.file.filename}`;

    const [result] = await pool.query(
      'INSERT INTO catches (registration_id, catch_image, weight, species) VALUES (?, ?, ?, ?)',
      [registration_id, catch_image, weight, species || null]
    );

    res.status(201).json({
      message: 'Catch uploaded successfully',
      catch: {
        catch_id: result.insertId,
        registration_id,
        catch_image,
        weight,
        species,
        approval_status: 'pending'
      }
    });
  } catch (error) {
    console.error('Upload catch error:', error);
    res.status(500).json({ message: 'Server error uploading catch' });
  }
});

// Get catches for registration (User)
router.get('/registration/:registrationId', authenticate, async (req, res) => {
  try {
    const [catches] = await pool.query(
      'SELECT * FROM catches WHERE registration_id = ? ORDER BY uploaded_at DESC',
      [req.params.registrationId]
    );

    res.json(catches);
  } catch (error) {
    console.error('Get catches error:', error);
    res.status(500).json({ message: 'Server error fetching catches' });
  }
});

// Get pending catches for tournament (Organizer)
router.get('/tournament/:tournamentId/pending', authenticate, isOrganizer, async (req, res) => {
  try {
    // Verify ownership
    const [tournaments] = await pool.query(
      'SELECT tournament_id FROM tournaments WHERE tournament_id = ? AND organizer_id = ?',
      [req.params.tournamentId, req.user.id]
    );

    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'Tournament not found or unauthorized' });
    }

    const [catches] = await pool.query(
      `SELECT c.*, u.full_name, u.mobile_no,
        (SELECT GROUP_CONCAT(
          CONCAT(p.pond_name, ' - Zone ', z.zone_number, ' - Area ', a.area_number)
          SEPARATOR ', '
        ) FROM area_selections s
        JOIN areas a ON s.area_id = a.area_id
        JOIN zones z ON a.zone_id = z.zone_id
        JOIN ponds p ON z.pond_id = p.pond_id
        WHERE s.registration_id = c.registration_id) as fishing_location
       FROM catches c
       JOIN registrations r ON c.registration_id = r.registration_id
       JOIN users u ON r.user_id = u.user_id
       WHERE r.tournament_id = ? AND c.approval_status = 'pending'
       ORDER BY c.uploaded_at ASC`,
      [req.params.tournamentId]
    );

    res.json(catches);
  } catch (error) {
    console.error('Get pending catches error:', error);
    res.status(500).json({ message: 'Server error fetching catches' });
  }
});

// Get all catches for tournament (Organizer)
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

    const [catches] = await pool.query(
      `SELECT c.*, u.full_name, u.mobile_no
       FROM catches c
       JOIN registrations r ON c.registration_id = r.registration_id
       JOIN users u ON r.user_id = u.user_id
       WHERE r.tournament_id = ?
       ORDER BY c.uploaded_at DESC`,
      [req.params.tournamentId]
    );

    res.json(catches);
  } catch (error) {
    console.error('Get tournament catches error:', error);
    res.status(500).json({ message: 'Server error fetching catches' });
  }
});

// Approve/Reject catch (Organizer)
router.patch('/:id/status', authenticate, isOrganizer, async (req, res) => {
  try {
    const { approval_status, rejection_reason } = req.body;
    const allowedStatuses = ['pending', 'approved', 'rejected'];

    if (!allowedStatuses.includes(approval_status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Verify ownership through tournament
    const [catches] = await pool.query(
      `SELECT c.catch_id FROM catches c
       JOIN registrations r ON c.registration_id = r.registration_id
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       WHERE c.catch_id = ? AND t.organizer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (catches.length === 0) {
      return res.status(404).json({ message: 'Catch not found or unauthorized' });
    }

    const approved_at = approval_status === 'approved' ? new Date() : null;
    const approved_by = approval_status === 'approved' ? req.user.id : null;

    await pool.query(
      `UPDATE catches SET approval_status = ?, rejection_reason = ?, approved_at = ?, approved_by = ?
       WHERE catch_id = ?`,
      [approval_status, rejection_reason || null, approved_at, approved_by, req.params.id]
    );

    res.json({ message: `Catch ${approval_status}`, approval_status });
  } catch (error) {
    console.error('Update catch status error:', error);
    res.status(500).json({ message: 'Server error updating catch' });
  }
});

// Delete catch (User - only pending catches)
router.delete('/:id', authenticate, isUser, async (req, res) => {
  try {
    // Verify ownership and pending status
    const [catches] = await pool.query(
      `SELECT c.catch_id FROM catches c
       JOIN registrations r ON c.registration_id = r.registration_id
       WHERE c.catch_id = ? AND r.user_id = ? AND c.approval_status = 'pending'`,
      [req.params.id, req.user.id]
    );

    if (catches.length === 0) {
      return res.status(404).json({ message: 'Catch not found, unauthorized, or already processed' });
    }

    await pool.query('DELETE FROM catches WHERE catch_id = ?', [req.params.id]);

    res.json({ message: 'Catch deleted successfully' });
  } catch (error) {
    console.error('Delete catch error:', error);
    res.status(500).json({ message: 'Server error deleting catch' });
  }
});

module.exports = router;

