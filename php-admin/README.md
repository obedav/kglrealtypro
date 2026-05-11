# KGL Realty Pro — PHP admin

A tiny editorial admin for the KGL Realty Pro MySQL database. Deploys to the
Namecheap cPanel subdomain (e.g. `admin.kglrealtypro.com`) and writes to the
same MySQL instance the Next.js public site reads from.

**Principles:** SOLID, DRY, KISS.

- `includes/db.php` — PDO connection, one place.
- `includes/auth.php` — session auth + CSRF; one place.
- `includes/layout.php` — page chrome; shared across every admin page.
- `pages/*.php` — one file per screen; thin wrappers that load shared helpers.
- No frameworks. No Composer dependencies. Plain PHP 8+ on cPanel.

## Deploy

1. In cPanel, create a subdomain (`admin.kglrealtypro.com`) pointed at a
   directory above `public_html` — e.g. `/home/<user>/admin.kglrealtypro.com`.
2. Upload the contents of `php-admin/` into that document root.
3. Create `/home/<user>/admin.kglrealtypro.com/.htaccess` with the contents of
   `deploy/.htaccess.sample` (HSTS, noindex, block `includes/` + `.env`).
4. Create `/home/<user>/admin.kglrealtypro.com/.env` from `.env.sample`,
   populate DB creds, and `chmod 600`.
5. Apply the schema:  
   `mysql -h HOST -u USER -p DB < ../db/schema.sql`
6. Seed the first admin user:  
   `php bin/seed-admin.php <username> <password> "<full name>"`
7. Force HTTPS at the cPanel level (AutoSSL + "Force HTTPS Redirect").

## Security

- Sessions are `HttpOnly`, `Secure`, `SameSite=Strict`.
- Every form carries a CSRF token (`includes/auth.php:csrf_token()`), and every
  `POST` handler rejects mismatches with HTTP 400.
- Passwords: `password_hash()` with `PASSWORD_BCRYPT`. Verified with
  `password_verify()`. Rehashed on login if the PHP default cost has moved.
- All DB calls use PDO prepared statements (`$pdo->prepare()` + `->execute([...])`).
  No string concatenation into SQL.
- File-upload handler validates MIME by sniffing bytes (`finfo_file`), caps at
  8 MB, rejects anything outside an explicit image allowlist.
- `.htaccess` blocks direct access to `includes/`, `bin/`, `.env`.
- Admin subdomain is `X-Robots-Tag: noindex` + disallowed in robots.txt.

## What the admin can do (v1)

- Log in / log out admin users.
- List / create / edit / archive listings (fields match `db/schema.sql`).
- Add / remove listing images via cPanel's `public_html/uploads/` — URLs are
  stored in `listing_images`; serve directly from the CDN origin.
- List recent leads, tour_requests, handoff_requests (read-only; status
  updates live on `leads` only).

Agents, blog posts, and user management are out of scope for v1 — extend the
same pattern as the listings editor when needed.
