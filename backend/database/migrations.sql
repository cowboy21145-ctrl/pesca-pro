-- Pesca Pro Database Migrations
-- Run this file to update an existing database with all new changes
-- Make sure to backup your database before running migrations!

USE pesca_pro;

-- ============================================
-- Migration 1: Add bank_name to users table
-- ============================================
-- Check if column exists first (MySQL 8.0+ compatible)
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'bank_name'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no',
    'SELECT "Column bank_name already exists in users table"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Migration 2: Add bank_name to registrations table
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
    'SELECT "Column bank_name already exists in registrations table"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Migration 3: Add payment_details_image to tournaments table
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
    'SELECT "Column payment_details_image already exists in tournaments table"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Migration 4: Add 'draft' status to registrations table
-- ============================================
-- Modify the status enum to include 'draft' and set as default
-- This will work even if 'draft' is already in the enum
ALTER TABLE registrations 
MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft';

-- ============================================
-- Migration 5: Remove unique constraint (allows multiple drafts)
-- ============================================
-- Check if unique constraint exists and drop it
-- This allows multiple draft registrations per user/tournament
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'registrations'
    AND CONSTRAINT_NAME = 'unique_user_tournament'
);

SET @sql = IF(@constraint_exists > 0,
    'ALTER TABLE registrations DROP INDEX unique_user_tournament',
    'SELECT "Constraint unique_user_tournament does not exist, skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Verification Queries (Optional - Run to verify)
-- ============================================

-- Check users table structure
-- DESCRIBE users;

-- Check registrations table structure
-- DESCRIBE registrations;

-- Check tournaments table structure
-- DESCRIBE tournaments;

-- Check if bank_name columns exist
-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'users' 
-- AND COLUMN_NAME = 'bank_name';

-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'registrations' 
-- AND COLUMN_NAME = 'bank_name';

-- Check if payment_details_image exists
-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'tournaments' 
-- AND COLUMN_NAME = 'payment_details_image';

-- Check registrations status enum values
-- SELECT COLUMN_TYPE 
-- FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME = 'registrations' 
-- AND COLUMN_NAME = 'status';

-- ============================================
-- Migration Complete!
-- ============================================
-- All changes have been applied to your database.
-- Your database is now up to date with the latest schema.

