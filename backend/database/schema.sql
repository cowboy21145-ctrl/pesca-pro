-- Pesca Pro Database Schema
-- Fishing Tournament Management System

CREATE DATABASE IF NOT EXISTS pesca_pro
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE pesca_pro;

-- Set default charset for this session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Drop tables if exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS catches;
DROP TABLE IF EXISTS area_selections;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS zones;
DROP TABLE IF EXISTS ponds;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS organizers;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    mobile_no VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    bank_account_no VARCHAR(50),
    bank_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mobile (mobile_no),
    INDEX idx_email (email)
);

-- Organizers Table
CREATE TABLE organizers (
    organizer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_no VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile_no)
);

-- Tournaments Table
CREATE TABLE tournaments (
    tournament_id INT PRIMARY KEY AUTO_INCREMENT,
    organizer_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(300),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    tournament_start_time TIME,
    tournament_end_time TIME,
    registration_start_date DATE,
    registration_end_date DATE,
    registration_link VARCHAR(100) UNIQUE,
    leaderboard_link VARCHAR(100) UNIQUE,
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    description TEXT,
    banner_image VARCHAR(255),
    payment_details_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES organizers(organizer_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_registration_link (registration_link),
    INDEX idx_leaderboard_link (leaderboard_link)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ponds Table
CREATE TABLE ponds (
    pond_id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    pond_name VARCHAR(100) NOT NULL,
    layout_image VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    INDEX idx_tournament (tournament_id)
);

-- Zones Table
CREATE TABLE zones (
    zone_id INT PRIMARY KEY AUTO_INCREMENT,
    pond_id INT NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    zone_number INT NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pond_id) REFERENCES ponds(pond_id) ON DELETE CASCADE,
    INDEX idx_pond (pond_id),
    UNIQUE KEY unique_zone_number (pond_id, zone_number)
);

-- Areas Table
CREATE TABLE areas (
    area_id INT PRIMARY KEY AUTO_INCREMENT,
    zone_id INT NOT NULL,
    area_number INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE,
    INDEX idx_zone (zone_id),
    INDEX idx_available (is_available),
    UNIQUE KEY unique_area_number (zone_id, area_number)
);

-- Registrations Table
CREATE TABLE registrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tournament_id INT NOT NULL,
    total_payment DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_receipt VARCHAR(255),
    bank_account_no VARCHAR(50),
    bank_name VARCHAR(100),
    status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft',
    notes TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_tournament (tournament_id),
    INDEX idx_status (status)
);

-- Area Selections Table
CREATE TABLE area_selections (
    selection_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL,
    area_id INT NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(area_id) ON DELETE CASCADE,
    INDEX idx_registration (registration_id),
    INDEX idx_area (area_id),
    UNIQUE KEY unique_selection (registration_id, area_id)
);

-- Catches Table
CREATE TABLE catches (
    catch_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL,
    catch_image VARCHAR(255) NOT NULL,
    weight DECIMAL(8, 2) NOT NULL,
    species VARCHAR(100),
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT,
    FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES organizers(organizer_id) ON DELETE SET NULL,
    INDEX idx_registration (registration_id),
    INDEX idx_approval_status (approval_status)
);

-- Insert sample organizer (password: password)
INSERT INTO organizers (name, email, mobile_no, password) VALUES 
('Admin', 'admin@pescapro.com', '08001234567', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Note: The hash above is for the password "password"
-- To login as admin, use:
--   Email: admin@pescapro.com
--   Password: password

