-- Migration: Add updated_at column to registrations table
-- This allows tracking when registrations are updated

-- Check if updated_at column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'registrations'
  AND COLUMN_NAME = 'updated_at';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE registrations ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER registered_at',
  'SELECT "Column updated_at already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

