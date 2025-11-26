-- Pesca Pro Database Migrations (Remaining Changes Only)
-- Use this if you already have some columns added
-- This file only includes the remaining changes

USE pesca_pro;

-- ============================================
-- Check what's already done and what's remaining
-- ============================================

-- Check if bank_name exists in users
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ bank_name already exists in users'
        ELSE '✗ bank_name missing in users'
    END AS users_bank_name_status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'bank_name';

-- Check if bank_name exists in registrations
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ bank_name already exists in registrations'
        ELSE '✗ bank_name missing in registrations'
    END AS registrations_bank_name_status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'registrations' 
AND COLUMN_NAME = 'bank_name';

-- Check if payment_details_image exists in tournaments
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ payment_details_image already exists in tournaments'
        ELSE '✗ payment_details_image missing in tournaments'
    END AS tournaments_payment_image_status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'tournaments' 
AND COLUMN_NAME = 'payment_details_image';

-- Check registrations status enum
SELECT 
    COLUMN_TYPE AS current_status_enum
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'registrations' 
AND COLUMN_NAME = 'status';

-- ============================================
-- Run only the remaining migrations below
-- ============================================

-- If bank_name is missing in registrations (and you got error on users, it means users already has it)
-- Uncomment the line below if needed:
-- ALTER TABLE registrations ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;

-- If payment_details_image is missing:
-- Uncomment the line below if needed:
-- ALTER TABLE tournaments ADD COLUMN payment_details_image VARCHAR(255) AFTER banner_image;

-- Always run this (safe even if 'draft' already exists):
ALTER TABLE registrations 
MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft';

-- Remove unique constraint (if exists):
-- Uncomment if you get an error about the constraint:
-- ALTER TABLE registrations DROP INDEX unique_user_tournament;

