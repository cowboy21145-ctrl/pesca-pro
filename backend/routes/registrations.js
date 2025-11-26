const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, isOrganizer, isUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create Registration with Area Selections
router.post('/', authenticate, isUser, upload.single('payment_receipt'), [
  body('tournament_id').isInt().withMessage('Tournament ID is required'),
  body('area_ids').optional().custom(value => {
    if (!value) return true; // Allow empty/undefined for pond-only tournaments
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed);
  }).withMessage('Area IDs must be an array'),
  body('bank_account_no').trim().notEmpty().withMessage('Bank account number is required')
], async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tournament_id, bank_account_no, bank_name, notes, pond_id, zone_id } = req.body;
    const area_ids = req.body.area_ids 
      ? (typeof req.body.area_ids === 'string' ? JSON.parse(req.body.area_ids) : req.body.area_ids)
      : [];
    const user_id = req.user.id;

    await connection.beginTransaction();

    // Get tournament structure type
    const [tournaments] = await connection.query(
      'SELECT structure_type FROM tournaments WHERE tournament_id = ?',
      [tournament_id]
    );

    if (tournaments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const structure_type = tournaments[0].structure_type || 'pond_zone_area';

    // Check if already registered (not draft)
    const [existingReg] = await connection.query(
      'SELECT registration_id FROM registrations WHERE user_id = ? AND tournament_id = ? AND status IN ("pending", "confirmed")',
      [user_id, tournament_id]
    );

    if (existingReg.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'You have already registered for this tournament' });
    }

    // Check if draft exists - if so, update it instead of creating new
    const [draftReg] = await connection.query(
      'SELECT registration_id FROM registrations WHERE user_id = ? AND tournament_id = ? AND status = "draft"',
      [user_id, tournament_id]
    );

    let total_payment = 0;
    let areas = [];

    // Calculate payment based on structure type
    if (structure_type === 'pond_zone_area' && area_ids && area_ids.length > 0) {
      // Verify areas are available
      const [areaResults] = await connection.query(
        `SELECT a.area_id, a.price, a.is_available,
          (SELECT COUNT(*) FROM area_selections s 
           JOIN registrations r ON s.registration_id = r.registration_id 
           WHERE s.area_id = a.area_id AND r.status IN ('pending', 'confirmed')) as selection_count
         FROM areas a
         WHERE a.area_id IN (?)`,
        [area_ids]
      );

      if (areaResults.length !== area_ids.length) {
        await connection.rollback();
        return res.status(400).json({ message: 'Some selected areas do not exist' });
      }

      const unavailable = areaResults.filter(a => !a.is_available || a.selection_count > 0);
      if (unavailable.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Some selected areas are no longer available' });
      }

      areas = areaResults;
      total_payment = areas.reduce((sum, a) => sum + parseFloat(a.price), 0);
    } else if (structure_type === 'pond_zone' && zone_id) {
      // Get zone price
      const [zones] = await connection.query(
        'SELECT price FROM zones WHERE zone_id = ?',
        [zone_id]
      );
      if (zones.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Zone not found' });
      }
      total_payment = parseFloat(zones[0].price);
    } else if (structure_type === 'pond_only' && pond_id) {
      // Get pond price
      const [ponds] = await connection.query(
        'SELECT price FROM ponds WHERE pond_id = ?',
        [pond_id]
      );
      if (ponds.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Pond not found' });
      }
      total_payment = parseFloat(ponds[0].price);
    }

    const payment_receipt = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    let registration_id;

    // Update draft or create new registration
    if (draftReg.length > 0) {
      registration_id = draftReg[0].registration_id;
      // Update draft to pending
      await connection.query(
        `UPDATE registrations SET total_payment = ?, payment_receipt = ?, bank_account_no = ?, bank_name = ?, notes = ?, status = 'pending'
         WHERE registration_id = ?`,
        [total_payment, payment_receipt, bank_account_no, bank_name || null, notes, registration_id]
      );
      // Delete old area selections
      await connection.query('DELETE FROM area_selections WHERE registration_id = ?', [registration_id]);
    } else {
      // Create new registration
      const [regResult] = await connection.query(
        `INSERT INTO registrations (user_id, tournament_id, total_payment, payment_receipt, bank_account_no, bank_name, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [user_id, tournament_id, total_payment, payment_receipt, bank_account_no, bank_name || null, notes]
      );
      registration_id = regResult.insertId;
    }

    // Create area selections only if areas were selected (for pond_zone_area structure)
    if (structure_type === 'pond_zone_area' && area_ids && area_ids.length > 0) {
      const selectionValues = area_ids.map(area_id => [registration_id, area_id]);
      await connection.query(
        'INSERT INTO area_selections (registration_id, area_id) VALUES ?',
        [selectionValues]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Registration submitted successfully',
      registration: {
        registration_id,
        tournament_id,
        total_payment,
        status: 'pending',
        area_count: area_ids ? area_ids.length : 0
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

// Save/Update Draft Registration
router.post('/draft', authenticate, isUser, [
  body('tournament_id').isInt().withMessage('Tournament ID is required')
], async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tournament_id, bank_account_no, bank_name, area_ids, pond_id, zone_id } = req.body;
    const user_id = req.user.id;

    await connection.beginTransaction();

    // Get tournament structure type
    const [tournaments] = await connection.query(
      'SELECT structure_type FROM tournaments WHERE tournament_id = ?',
      [tournament_id]
    );

    if (tournaments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const structure_type = tournaments[0].structure_type || 'pond_zone_area';

    // Calculate total payment based on structure type
    let total_payment = 0;
    
    if (structure_type === 'pond_zone_area' && area_ids && area_ids.length > 0) {
      const areaIdsArray = typeof area_ids === 'string' ? JSON.parse(area_ids) : area_ids;
      const [areas] = await connection.query(
        'SELECT area_id, price FROM areas WHERE area_id IN (?)',
        [areaIdsArray]
      );
      total_payment = areas.reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
    } else if (structure_type === 'pond_zone' && zone_id) {
      const [zones] = await connection.query(
        'SELECT price FROM zones WHERE zone_id = ?',
        [zone_id]
      );
      if (zones.length > 0) {
        total_payment = parseFloat(zones[0].price || 0);
      }
    } else if (structure_type === 'pond_only' && pond_id) {
      const [ponds] = await connection.query(
        'SELECT price FROM ponds WHERE pond_id = ?',
        [pond_id]
      );
      if (ponds.length > 0) {
        total_payment = parseFloat(ponds[0].price || 0);
      }
    }

    // Check if draft exists
    const [draftReg] = await connection.query(
      'SELECT registration_id FROM registrations WHERE user_id = ? AND tournament_id = ? AND status = "draft"',
      [user_id, tournament_id]
    );

    let registration_id;

    if (draftReg.length > 0) {
      // Update existing draft
      registration_id = draftReg[0].registration_id;
      
      // Check if pond_id and zone_id columns exist
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'registrations' 
         AND COLUMN_NAME IN ('pond_id', 'zone_id')`
      );
      const hasPondZoneColumns = columns.length === 2;
      
      // Check if updated_at column exists
      const [updateColumns] = await connection.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'registrations' 
         AND COLUMN_NAME = 'updated_at'`
      );
      const hasUpdatedAt = updateColumns.length > 0;
      
      if (hasPondZoneColumns) {
        if (hasUpdatedAt) {
          await connection.query(
            `UPDATE registrations SET total_payment = ?, bank_account_no = ?, bank_name = ?, 
             pond_id = ?, zone_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE registration_id = ?`,
            [total_payment, bank_account_no || null, bank_name || null, pond_id || null, zone_id || null, registration_id]
          );
        } else {
          await connection.query(
            `UPDATE registrations SET total_payment = ?, bank_account_no = ?, bank_name = ?, 
             pond_id = ?, zone_id = ?
             WHERE registration_id = ?`,
            [total_payment, bank_account_no || null, bank_name || null, pond_id || null, zone_id || null, registration_id]
          );
        }
      } else {
        // Fallback: update without pond_id/zone_id
        if (hasUpdatedAt) {
          await connection.query(
            `UPDATE registrations SET total_payment = ?, bank_account_no = ?, bank_name = ?, updated_at = CURRENT_TIMESTAMP
             WHERE registration_id = ?`,
            [total_payment, bank_account_no || null, bank_name || null, registration_id]
          );
        } else {
          await connection.query(
            `UPDATE registrations SET total_payment = ?, bank_account_no = ?, bank_name = ?
             WHERE registration_id = ?`,
            [total_payment, bank_account_no || null, bank_name || null, registration_id]
          );
        }
      }
      // Delete old area selections
      await connection.query('DELETE FROM area_selections WHERE registration_id = ?', [registration_id]);
    } else {
      // Create new draft
      // Check if pond_id and zone_id columns exist
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'registrations' 
         AND COLUMN_NAME IN ('pond_id', 'zone_id')`
      );
      const hasPondZoneColumns = columns.length === 2;
      
      if (hasPondZoneColumns) {
        const [regResult] = await connection.query(
          `INSERT INTO registrations (user_id, tournament_id, total_payment, bank_account_no, bank_name, pond_id, zone_id, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
          [user_id, tournament_id, total_payment, bank_account_no || null, bank_name || null, pond_id || null, zone_id || null]
        );
        registration_id = regResult.insertId;
      } else {
        // Fallback: insert without pond_id/zone_id
        const [regResult] = await connection.query(
          `INSERT INTO registrations (user_id, tournament_id, total_payment, bank_account_no, bank_name, status)
           VALUES (?, ?, ?, ?, ?, 'draft')`,
          [user_id, tournament_id, total_payment, bank_account_no || null, bank_name || null]
        );
        registration_id = regResult.insertId;
      }
    }

    // Add area selections if provided
    if (area_ids && area_ids.length > 0) {
      const areaIdsArray = typeof area_ids === 'string' ? JSON.parse(area_ids) : area_ids;
      const selectionValues = areaIdsArray.map(area_id => [registration_id, area_id]);
      if (selectionValues.length > 0) {
        await connection.query(
          'INSERT INTO area_selections (registration_id, area_id) VALUES ?',
          [selectionValues]
        );
      }
    }

    await connection.commit();

    res.json({
      message: 'Draft saved successfully',
      registration_id,
      tournament_id
    });
  } catch (error) {
    await connection.rollback();
    console.error('Save draft error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error saving draft',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

// Get draft registration for tournament
router.get('/draft/:tournamentId', authenticate, isUser, async (req, res) => {
  try {
    // Check if pond_id and zone_id columns exist
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'registrations' 
       AND COLUMN_NAME IN ('pond_id', 'zone_id')`
    );
    const hasPondZoneColumns = columns.length === 2;
    
    let query;
    if (hasPondZoneColumns) {
      query = `SELECT r.*, t.name as tournament_name, t.registration_link, t.structure_type,
       p.pond_name, p.price as pond_price,
       z.zone_name, z.price as zone_price
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       LEFT JOIN ponds p ON r.pond_id = p.pond_id
       LEFT JOIN zones z ON r.zone_id = z.zone_id
       WHERE r.user_id = ? AND r.tournament_id = ? AND r.status = 'draft'`;
    } else {
      query = `SELECT r.*, t.name as tournament_name, t.registration_link, t.structure_type
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       WHERE r.user_id = ? AND r.tournament_id = ? AND r.status = 'draft'`;
    }
    
    const [registrations] = await pool.query(query, [req.user.id, req.params.tournamentId]);

    if (registrations.length === 0) {
      return res.status(404).json({ message: 'No draft found' });
    }

    const registration = registrations[0];

    // Get selected areas (for pond_zone_area structure)
    const [areas] = await pool.query(
      `SELECT s.area_id, a.area_number, a.price, z.zone_name, z.zone_number, z.zone_id, p.pond_name, p.pond_id
       FROM area_selections s
       JOIN areas a ON s.area_id = a.area_id
       JOIN zones z ON a.zone_id = z.zone_id
       JOIN ponds p ON z.pond_id = p.pond_id
       WHERE s.registration_id = ?`,
      [registration.registration_id]
    );

    registration.selected_areas = areas;
    registration.area_ids = areas.map(a => a.area_id);

    // If pond_id or zone_id is stored directly, include them
    // (These are already in the registration object from the SELECT query)

    res.json(registration);
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ message: 'Server error fetching draft' });
  }
});

// Get user's registrations (excluding drafts)
router.get('/my-registrations', authenticate, isUser, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT r.*, t.name as tournament_name, t.location, t.start_date, t.end_date, t.leaderboard_link,
        (SELECT COUNT(*) FROM area_selections s WHERE s.registration_id = r.registration_id) as area_count,
        (SELECT COUNT(*) FROM catches c WHERE c.registration_id = r.registration_id) as catch_count,
        (SELECT COALESCE(SUM(c.weight), 0) FROM catches c WHERE c.registration_id = r.registration_id AND c.approval_status = 'approved') as total_weight
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       WHERE r.user_id = ? AND r.status != 'draft'
       ORDER BY r.registered_at DESC`,
      [req.user.id]
    );

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// Get user's draft registrations
router.get('/my-drafts', authenticate, isUser, async (req, res) => {
  try {
    // Check if updated_at column exists
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'registrations' 
       AND COLUMN_NAME = 'updated_at'`
    );
    const hasUpdatedAt = columns.length > 0;
    
    const orderBy = hasUpdatedAt ? 'r.updated_at DESC' : 'r.registered_at DESC';
    
    const [registrations] = await pool.query(
      `SELECT r.*, t.name as tournament_name, t.location, t.start_date, t.end_date, t.registration_link,
        (SELECT COUNT(*) FROM area_selections s WHERE s.registration_id = r.registration_id) as area_count
       FROM registrations r
       JOIN tournaments t ON r.tournament_id = t.tournament_id
       WHERE r.user_id = ? AND r.status = 'draft'
       ORDER BY ${orderBy}`,
      [req.user.id]
    );

    res.json(registrations);
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ message: 'Server error fetching drafts' });
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
    const allowedStatuses = ['draft', 'pending', 'confirmed', 'rejected', 'cancelled'];

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

