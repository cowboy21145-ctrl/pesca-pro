-- Pesca Pro Database Migrations (Simple Version)
-- Run these SQL statements one by one or all at once
-- Make sure to backup your database first!
-- If you get "Duplicate column" errors, that column already exists - skip that line!

USE pesca_pro;

-- ============================================
-- 1. Add bank_name to users table
-- ============================================
-- If you get "Duplicate column name 'bank_name'" error, skip this - it already exists!
ALTER TABLE users 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;

-- ============================================
-- 2. Add bank_name to registrations table
-- ============================================
-- If you get "Duplicate column name 'bank_name'" error, skip this - it already exists!
ALTER TABLE registrations 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;

-- ============================================
-- 3. Add payment_details_image to tournaments table
-- ============================================
-- If you get "Duplicate column name 'payment_details_image'" error, skip this - it already exists!
ALTER TABLE tournaments 
ADD COLUMN payment_details_image VARCHAR(255) AFTER banner_image;

-- ============================================
-- 4. Add 'draft' status to registrations table
-- ============================================
-- This is safe to run even if 'draft' is already in the enum
ALTER TABLE registrations 
MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft';

-- ============================================
-- 5. Remove unique constraint (if exists)
-- ============================================
-- This allows multiple draft registrations per user/tournament
-- If you get an error that the constraint doesn't exist, that's okay - skip it!
ALTER TABLE registrations DROP INDEX unique_user_tournament;

-- ============================================
-- Migration Complete!
-- ============================================
-- All changes have been applied.
-- Your database is now up to date.

