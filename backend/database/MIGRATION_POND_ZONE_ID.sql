-- Migration: Add pond_id and zone_id to registrations table
-- This allows storing pond/zone selections for pond-only and pond+zone tournaments

-- Check if pond_id column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'registrations'
  AND COLUMN_NAME = 'pond_id';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE registrations ADD COLUMN pond_id INT NULL AFTER tournament_id, ADD FOREIGN KEY (pond_id) REFERENCES ponds(pond_id) ON DELETE SET NULL',
  'SELECT "Column pond_id already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if zone_id column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'registrations'
  AND COLUMN_NAME = 'zone_id';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE registrations ADD COLUMN zone_id INT NULL AFTER pond_id, ADD FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE SET NULL',
  'SELECT "Column zone_id already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

