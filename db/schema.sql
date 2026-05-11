-- KGL Realty Pro — MySQL schema
-- Target: MySQL 8+ on Namecheap cPanel. Apply with:
--   mysql -h <host> -u <user> -p <db> < db/schema.sql
--
-- Design notes:
-- - Slugs are the public identifier in URLs; AUTO_INCREMENT ids stay internal.
-- - amenities/specialties/languages/categories are JSON columns — these are
--   small, bounded string arrays. A join table would be more work than value.
-- - listing_images is 1:N so ORDER BY position is cheap and gallery order is
--   editor-controlled.
-- - date_updated is ON UPDATE CURRENT_TIMESTAMP so editors never have to think
--   about it; listing cards can show "Updated 3 days ago" correctly.

SET NAMES utf8mb4;
SET sql_mode = 'STRICT_ALL_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- --------------------------------------------------------------------------
-- Listings
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
  id               INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug             VARCHAR(191) NOT NULL UNIQUE,
  title            VARCHAR(255) NOT NULL,
  excerpt          TEXT NOT NULL,
  description      MEDIUMTEXT NOT NULL,
  price_ngn        BIGINT UNSIGNED NOT NULL,
  city             VARCHAR(80)  NOT NULL,
  country          VARCHAR(80)  NOT NULL DEFAULT 'Nigeria',
  bedrooms         TINYINT UNSIGNED NOT NULL,
  bathrooms        TINYINT UNSIGNED NOT NULL,
  sqm              INT UNSIGNED NOT NULL DEFAULT 0,
  amenities        JSON NOT NULL,
  status           ENUM('available','sold','off_market','pending') NOT NULL DEFAULT 'available',
  featured         TINYINT(1)   NOT NULL DEFAULT 0,
  just_listed      TINYINT(1)   NOT NULL DEFAULT 0,
  virtual_tour_url VARCHAR(500) DEFAULT NULL,
  agent_id         INT UNSIGNED DEFAULT NULL,
  date_posted      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city     (city),
  INDEX idx_featured (featured),
  INDEX idx_status   (status),
  INDEX idx_date     (date_posted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listing_images (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  listing_id INT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  alt        VARCHAR(255) DEFAULT NULL,
  position   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_listing (listing_id, position),
  CONSTRAINT fk_listing_images_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- Agents
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug          VARCHAR(191) NOT NULL UNIQUE,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(200) NOT NULL,
  bio           MEDIUMTEXT NOT NULL,
  photo_url     VARCHAR(500) DEFAULT NULL,
  phone         VARCHAR(40)  NOT NULL,
  whatsapp      VARCHAR(40)  DEFAULT NULL,
  email         VARCHAR(120) NOT NULL,
  specialties   JSON NOT NULL,
  languages     JSON NOT NULL,
  date_posted   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE listings
  ADD CONSTRAINT fk_listings_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

-- --------------------------------------------------------------------------
-- Blog posts
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id                 INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug               VARCHAR(191) NOT NULL UNIQUE,
  title              VARCHAR(255) NOT NULL,
  excerpt            TEXT NOT NULL,
  content            MEDIUMTEXT NOT NULL,
  author_name        VARCHAR(120) NOT NULL DEFAULT 'KGL Realty Pro',
  featured_image_url VARCHAR(500) DEFAULT NULL,
  categories         JSON NOT NULL,
  date_posted        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date_posted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- Concierge captures
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id                   INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  source               ENUM('concierge','form','whatsapp','phone','referral') NOT NULL DEFAULT 'concierge',
  status               ENUM('new','qualified','contacted','tour_booked','won','lost') NOT NULL DEFAULT 'new',
  full_name            VARCHAR(200) NOT NULL,
  phone                VARCHAR(40)  DEFAULT NULL,
  email                VARCHAR(120) DEFAULT NULL,
  listing_slug         VARCHAR(191) DEFAULT NULL,
  interest_summary     TEXT NOT NULL,
  budget_ngn           BIGINT UNSIGNED DEFAULT NULL,
  location_preference  VARCHAR(200) DEFAULT NULL,
  timeframe            ENUM('immediate','3_months','6_months','12_months','exploratory') DEFAULT NULL,
  notes                TEXT DEFAULT NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status     (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_requests (
  id                    INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  listing_slug          VARCHAR(191) NOT NULL,
  preferred_date        DATE NOT NULL,
  preferred_time_window VARCHAR(80) DEFAULT NULL,
  full_name             VARCHAR(200) NOT NULL,
  phone                 VARCHAR(40)  NOT NULL,
  email                 VARCHAR(120) DEFAULT NULL,
  notes                 TEXT DEFAULT NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS handoff_requests (
  id                   INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reason               ENUM('legal_question','negotiation','off_market','complex_financing','user_requested','frustrated_tone','other') NOT NULL,
  summary              TEXT NOT NULL,
  urgency              ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  contact_phone        VARCHAR(40)  DEFAULT NULL,
  contact_email        VARCHAR(120) DEFAULT NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- PHP admin users. Password hash is always created by PHP's password_hash()
-- (bcrypt). Never INSERT plaintext; use the seed script.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id             INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username       VARCHAR(80)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  full_name      VARCHAR(200) NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at  DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
