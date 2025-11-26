-- Pesca Pro Database Migration: Tournament Structure Type
-- Adds support for different tournament structures (pond only, pond+zone, pond+zone+area)
-- Safe to run multiple times

USE pesca_pro;

-- ============================================
-- 1. Add structure_type to tournaments table (if not exists)
-- ============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tournaments' 
    AND COLUMN_NAME = 'structure_type'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tournaments ADD COLUMN structure_type ENUM(\'pond_only\', \'pond_zone\', \'pond_zone_area\') DEFAULT \'pond_zone_area\' AFTER payment_details_image',
    'SELECT "Column structure_type already exists in tournaments table - skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. Add price to ponds table (if not exists)
-- ============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ponds' 
    AND COLUMN_NAME = 'price'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE ponds ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER description',
    'SELECT "Column price already exists in ponds table - skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. Add price to zones table (if not exists)
-- ============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'zones' 
    AND COLUMN_NAME = 'price'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE zones ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER color',
    'SELECT "Column price already exists in zones table - skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Migration Complete!
-- ============================================
SELECT 'Structure type migration completed successfully!' AS result;

