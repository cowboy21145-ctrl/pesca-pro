-- Pesca Pro Database Migrations (Safe Version - Skips Existing Columns)
-- This version checks if columns exist before adding them
-- Safe to run multiple times without errors

USE pesca_pro;

-- ============================================
-- 1. Add bank_name to users table (if not exists)
-- ============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'bank_name'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no',
    'SELECT "Column bank_name already exists in users table - skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. Add bank_name to registrations table (if not exists)
-- ============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'registrations' 
    AND COLUMN_NAME = 'bank_name'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE registrations ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no',
    'SELECT "Column bank_name already exists in registrations table - skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. Add payment_details_image to tournaments table (if not exists)
-- ============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tournaments' 
    AND COLUMN_NAME = 'payment_details_image'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tournaments ADD COLUMN payment_details_image VARCHAR(255) AFTER banner_image',
    'SELECT "Column payment_details_image already exists in tournaments table - skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 4. Add 'draft' status to registrations table
-- ============================================
-- This is safe to run even if 'draft' is already in the enum
ALTER TABLE registrations 
MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft';

-- ============================================
-- 5. Remove unique constraint (if exists)
-- ============================================
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'registrations'
    AND CONSTRAINT_NAME = 'unique_user_tournament'
);

SET @sql = IF(@constraint_exists > 0,
    'ALTER TABLE registrations DROP INDEX unique_user_tournament',
    'SELECT "Constraint unique_user_tournament does not exist - skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Migration Complete!
-- ============================================
SELECT 'All migrations completed successfully!' AS result;

