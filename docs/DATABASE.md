# Database Guide — KGL Realty Pro

## Overview

The site uses **MySQL 8** hosted on Namecheap cPanel. The Next.js app connects either:
- **Directly** via `mysql2` using `MYSQL_*` env vars (preferred for Vercel)
- **Via PHP proxy** using `DATA_API_URL` + `DATA_API_TOKEN` (fallback for shared hosting restrictions)

---

## Schema Files

| File | Purpose |
|---|---|
| `db/schema.sql` | Full initial schema — run once on a fresh database |
| `db/migrations.sql` | Session 1 migrations — run after initial schema |
| `db/migration-session2.sql` | Session 2 migrations — run after migrations.sql |

---

## Initial Setup

### Step 1 — Create the Database in cPanel

1. Log in to Namecheap cPanel
2. Navigate to **MySQL Databases**
3. Create a database named `cpuser_kglrealty` (or your chosen name)
4. Create a user `cpuser_kgl_app` with a strong password
5. Grant **All Privileges** on the database to the user

### Step 2 — Allow Remote Connections

Still in cPanel:
1. Navigate to **Remote MySQL**
2. Add Vercel's outbound IP ranges (see vercel.com/docs/infrastructure/regions for current IPs)
3. Alternatively, add `%` (wildcard) to allow all IPs — only do this if Namecheap permits it on your plan

### Step 3 — Run the Schema

Via **phpMyAdmin** (recommended):
1. cPanel → phpMyAdmin → select your database
2. Click **Import**
3. Upload and run `db/schema.sql`
4. Upload and run `db/migrations.sql`
5. Upload and run `db/migration-session2.sql`

Via **cPanel Terminal** (if available):
```bash
mysql -u cpuser_kgl_app -p cpuser_kglrealty < db/schema.sql
mysql -u cpuser_kgl_app -p cpuser_kglrealty < db/migrations.sql
mysql -u cpuser_kgl_app -p cpuser_kglrealty < db/migration-session2.sql
```

---

## Tables Reference

| Table | Purpose |
|---|---|
| `listings` | Property listings with full detail and SEO fields |
| `listing_images` | 1:N gallery images per listing (position-ordered) |
| `agents` | Staff profiles with bio, photo, specialties |
| `posts` | Blog articles |
| `post_images` | Blog featured/gallery images |
| `leads` | Captured from concierge and contact form |
| `tour_requests` | Viewing/tour bookings |
| `handoff_requests` | Escalation records when concierge routes to a human |
| `admin_users` | PHP admin credentials (bcrypt-hashed passwords) |
| `investment_opportunities` | Off-plan / investment listing programs |
| `investment_images` | Gallery images for investment listings |

---

## Seeding Agents

The About page and Agents directory pull from the `agents` table. After setting up the schema, seed your real agents:

```sql
INSERT INTO agents (slug, full_name, role, photo_url, bio, phone, whatsapp, email, specialties, languages)
VALUES
  ('adekunle-moruf', 'Mr Adekunle Moruf', 'CEO / Managing Director',
   '/images/Mr Adekunle Moruf.jpeg',
   '<p>Adekunle leads the firm with two decades of experience.</p>',
   '+2347038141774', '+2347038141774', 'ceo@kglrealtypro.com',
   '["Luxury residential","Diaspora clients","Off-market sales"]',
   '["English","Yoruba"]'),
  ('popoola-nimotalai', 'Mrs Popoola Nimotalai', 'Lead Consultant',
   '/images/Mrs Popoola Nimotalai.jpeg',
   '<p>Nimotalai specialises in diaspora buyer representation.</p>',
   '+2347038141774', NULL, 'hello@kglrealtypro.com',
   '["Buyer representation","Diaspora"]',
   '["English","Yoruba"]');
```

---

## Connection Troubleshooting

### "ECONNREFUSED" or timeout in Vercel logs

- Verify the Vercel outbound IP is whitelisted in cPanel → Remote MySQL
- Confirm `MYSQL_HOST` matches the cPanel hostname exactly (not `localhost`)
- Check `MYSQL_PORT` — cPanel MySQL is usually `3306`

### "Access denied for user"

- Ensure the cPanel user has been granted privileges on the specific database
- Confirm `MYSQL_USER` and `MYSQL_PASSWORD` match exactly (no trailing spaces)

### Data appears as stubs in production

- Neither `MYSQL_*` nor `DATA_API_URL` env vars are set in Vercel
- The app falls back to stub data only in development; in production it serves empty results
- Add and set the required variables in Vercel → Settings → Environment Variables, then redeploy

---

## PHP Admin Panel

The `admin/` directory contains a PHP-based admin interface for managing listings, leads, and tour requests. Deploy it to cPanel's `public_html` and set up `.htpasswd` authentication. It is excluded from the Next.js build and from version control (`.gitignore`).
