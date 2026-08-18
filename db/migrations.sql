-- KGL Realty Pro — incremental migrations for existing databases.
-- Run once. If "Duplicate column name" errors appear, those columns already exist.
--
--   mysql -h <host> -u <user> -p <db> < db/migrations.sql

-- 1. SEO fields on posts --------------------------------------------------------
ALTER TABLE posts
  ADD COLUMN seo_title                VARCHAR(255) DEFAULT NULL AFTER categories,
  ADD COLUMN meta_description         VARCHAR(500) DEFAULT NULL AFTER seo_title,
  ADD COLUMN focus_keyword            VARCHAR(255) DEFAULT NULL AFTER meta_description,
  ADD COLUMN og_image_url             VARCHAR(500) DEFAULT NULL AFTER focus_keyword,
  ADD COLUMN featured_image_alt       VARCHAR(255) DEFAULT NULL AFTER og_image_url,
  ADD COLUMN secondary_keywords       TEXT DEFAULT NULL AFTER featured_image_alt,
  ADD COLUMN long_tail_keywords       TEXT DEFAULT NULL AFTER secondary_keywords,
  ADD COLUMN low_competition_keywords TEXT DEFAULT NULL AFTER long_tail_keywords,
  ADD COLUMN buyer_intent_keywords    TEXT DEFAULT NULL AFTER low_competition_keywords,
  ADD COLUMN internal_links           TEXT DEFAULT NULL AFTER buyer_intent_keywords,
  ADD COLUMN social_title             VARCHAR(255) DEFAULT NULL AFTER internal_links,
  ADD COLUMN social_description       TEXT DEFAULT NULL AFTER social_title,
  ADD COLUMN canonical_url            VARCHAR(500) DEFAULT NULL AFTER social_description,
  ADD COLUMN robots_meta              VARCHAR(50) NOT NULL DEFAULT 'index,follow' AFTER canonical_url,
  ADD COLUMN schema_type              VARCHAR(50) NOT NULL DEFAULT 'BlogPosting'  AFTER robots_meta;

-- 2. Post images gallery -------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_images (
  id       INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  post_id  INT UNSIGNED NOT NULL,
  url      VARCHAR(500) NOT NULL,
  alt      VARCHAR(255) DEFAULT NULL,
  caption  VARCHAR(500) DEFAULT NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_post (post_id, position),
  CONSTRAINT fk_post_images_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tour request status + admin notes ----------------------------------------
ALTER TABLE tour_requests
  ADD COLUMN status      ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending' AFTER notes,
  ADD COLUMN admin_notes TEXT DEFAULT NULL AFTER status,
  ADD INDEX idx_status (status);
