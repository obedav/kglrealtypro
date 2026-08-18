-- Session 2 migration — run ONCE in phpMyAdmin.
-- These are the NEW columns added this session.
-- seo_title / meta_description / focus_keyword / og_image_url were already added in session 1
--   and do NOT need to be re-added.
-- tour_requests (status, admin_notes) were also already added in session 1.

ALTER TABLE posts
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
