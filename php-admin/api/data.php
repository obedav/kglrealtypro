<?php
declare(strict_types=1);

/**
 * Public data API — serves JSON to the Next.js frontend on Vercel.
 * PHP connects to MySQL via localhost; Vercel fetches this endpoint.
 *
 * Authentication : X-Data-Token header must match DATA_API_TOKEN in .env
 * CORS           : restricted to kglrealtypro.com
 */

require_once __DIR__ . '/../includes/db.php';

// ── Helpers ───────────────────────────────────────────────────────────────────

function json_out(mixed $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function safe_int(mixed $v, int $min, int $max, int $default): int
{
    if ($v === null || $v === '') return $default;
    $i = filter_var($v, FILTER_VALIDATE_INT);
    if ($i === false) return $default;
    return max($min, min($max, (int)$i));
}

function safe_str(mixed $v, int $maxlen = 255): ?string
{
    if (!is_string($v) || trim($v) === '') return null;
    return mb_substr($v, 0, $maxlen);
}

// ── CORS ──────────────────────────────────────────────────────────────────────

$allowed_origins = ['https://kglrealtypro.com', 'https://www.kglrealtypro.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: X-Data-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['error' => 'Method not allowed'], 405);
}

// ── Token auth ────────────────────────────────────────────────────────────────

$secret = env('DATA_API_TOKEN');
$incoming = $_SERVER['HTTP_X_DATA_TOKEN'] ?? '';

if (!$secret || !hash_equals($secret, $incoming)) {
    json_out(['error' => 'Unauthorized'], 401);
}

// ── DB helpers ────────────────────────────────────────────────────────────────

function fetch_galleries(array $ids): array
{
    if (!$ids) return [];
    $ph = implode(',', array_fill(0, count($ids), '?'));
    $stmt = db()->prepare(
        "SELECT listing_id, url FROM listing_images
          WHERE listing_id IN ($ph) ORDER BY position ASC"
    );
    $stmt->execute($ids);
    $galleries = [];
    foreach ($stmt->fetchAll() as $row) {
        $galleries[(int)$row['listing_id']][] = $row['url'];
    }
    return $galleries;
}

function hydrate_listings(array $rows): array
{
    if (!$rows) return [];
    $ids = array_map('intval', array_column($rows, 'id'));
    $galleries = fetch_galleries($ids);
    foreach ($rows as &$row) {
        $row['gallery'] = $galleries[(int)$row['id']] ?? [];
    }
    unset($row);
    return $rows;
}

function build_where(array &$params): string
{
    $clauses = [];

    $q = safe_str($_GET['q'] ?? null, 200);
    if ($q !== null) {
        $like = "%$q%";
        $clauses[] = '(title LIKE ? OR excerpt LIKE ? OR city LIKE ?)';
        array_push($params, $like, $like, $like);
    }

    $city = safe_str($_GET['city'] ?? null);
    if ($city !== null) { $clauses[] = 'city = ?'; $params[] = $city; }

    $type = safe_str($_GET['type'] ?? null);
    if ($type !== null) { $clauses[] = 'property_type = ?'; $params[] = $type; }

    foreach (['minPrice' => ['price_ngn >= ?', 0], 'maxPrice' => ['price_ngn <= ?', 0]] as $key => [$sql, $min]) {
        $raw = $_GET[$key] ?? null;
        if ($raw !== null && $raw !== '') {
            $v = filter_var($raw, FILTER_VALIDATE_INT, ['options' => ['min_range' => $min]]);
            if ($v !== false) { $clauses[] = $sql; $params[] = $v; }
        }
    }

    $beds = $_GET['bedrooms'] ?? null;
    if ($beds !== null && $beds !== '') {
        $v = filter_var($beds, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($v !== false) { $clauses[] = 'bedrooms >= ?'; $params[] = $v; }
    }

    $status = safe_str($_GET['status'] ?? null);
    if ($status !== null && in_array($status, ['available', 'under_offer', 'sold', 'let'], true)) {
        $clauses[] = 'status = ?';
        $params[] = $status;
    }

    $amenities_raw = $_GET['amenities'] ?? null;
    if (is_array($amenities_raw)) {
        foreach ($amenities_raw as $a) {
            $a = safe_str($a, 120);
            if ($a !== null) {
                $clauses[] = "JSON_CONTAINS(amenities, JSON_QUOTE(?))";
                $params[] = $a;
            }
        }
    }

    return $clauses ? ('WHERE ' . implode(' AND ', $clauses)) : '';
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

$action = safe_str($_GET['action'] ?? null, 64) ?? '';

try {
    switch ($action) {

        case 'featured_listings': {
            $limit = safe_int($_GET['limit'] ?? null, 1, 50, 6);
            $stmt = db()->query(
                "SELECT * FROM listings
                  WHERE featured = 1 AND status = 'available'
                  ORDER BY date_posted DESC LIMIT $limit"
            );
            json_out(hydrate_listings($stmt->fetchAll()));
        }

        case 'listings': {
            $params = [];
            $where  = build_where($params);
            $limit  = safe_int($_GET['first'] ?? null, 1, 500, 24);
            $page   = safe_int($_GET['page']  ?? null, 1, 10000, 1);
            $offset = ($page - 1) * $limit;
            $stmt = db()->prepare(
                "SELECT * FROM listings $where
                  ORDER BY featured DESC, date_posted DESC
                  LIMIT $limit OFFSET $offset"
            );
            $stmt->execute($params);
            json_out(hydrate_listings($stmt->fetchAll()));
        }

        case 'listing_count': {
            $params = [];
            $where  = build_where($params);
            $stmt = db()->prepare("SELECT COUNT(*) AS n FROM listings $where");
            $stmt->execute($params);
            $row = $stmt->fetch();
            json_out(['count' => (int)($row['n'] ?? 0)]);
        }

        case 'listing_by_slug': {
            $slug = safe_str($_GET['slug'] ?? null, 160);
            if ($slug === null) json_out(['error' => 'missing slug'], 400);
            $stmt = db()->prepare("SELECT * FROM listings WHERE slug = ? LIMIT 1");
            $stmt->execute([$slug]);
            $row = $stmt->fetch();
            if (!$row) json_out(null);
            $rows = hydrate_listings([$row]);
            json_out($rows[0]);
        }

        case 'listing_slugs': {
            $rows = db()->query(
                "SELECT slug FROM listings ORDER BY date_posted DESC LIMIT 1000"
            )->fetchAll(PDO::FETCH_COLUMN, 0);
            json_out(array_values($rows));
        }

        case 'listing_facets': {
            $cities = db()->query(
                "SELECT DISTINCT city FROM listings ORDER BY city ASC"
            )->fetchAll(PDO::FETCH_COLUMN, 0);

            $amenities = db()->query(
                "SELECT DISTINCT jt.amenity AS amenity
                   FROM listings,
                        JSON_TABLE(amenities, '\$[*]' COLUMNS (amenity VARCHAR(120) PATH '\$')) AS jt
                   WHERE amenities IS NOT NULL AND JSON_VALID(amenities)
                   ORDER BY jt.amenity ASC"
            )->fetchAll(PDO::FETCH_COLUMN, 0);

            $types = db()->query(
                "SELECT DISTINCT property_type FROM listings
                  WHERE property_type IS NOT NULL ORDER BY property_type ASC"
            )->fetchAll(PDO::FETCH_COLUMN, 0);

            json_out([
                'cities'        => array_values(array_filter($cities)),
                'amenities'     => array_values(array_filter($amenities)),
                'propertyTypes' => array_values(array_filter($types)),
            ]);
        }

        case 'blog_posts': {
            $limit = safe_int($_GET['limit'] ?? null, 1, 100, 12);
            $rows = db()->query(
                "SELECT * FROM posts ORDER BY date_posted DESC LIMIT $limit"
            )->fetchAll();
            json_out($rows);
        }

        case 'blog_post_by_slug': {
            $slug = safe_str($_GET['slug'] ?? null, 160);
            if ($slug === null) json_out(['error' => 'missing slug'], 400);
            $stmt = db()->prepare("SELECT * FROM posts WHERE slug = ? LIMIT 1");
            $stmt->execute([$slug]);
            $row = $stmt->fetch();
            json_out($row ?: null);
        }

        case 'agents': {
            $rows = db()->query(
                "SELECT * FROM agents ORDER BY id ASC LIMIT 100"
            )->fetchAll();
            json_out($rows);
        }

        case 'agent_by_slug': {
            $slug = safe_str($_GET['slug'] ?? null, 160);
            if ($slug === null) json_out(['error' => 'missing slug'], 400);
            $stmt = db()->prepare("SELECT * FROM agents WHERE slug = ? LIMIT 1");
            $stmt->execute([$slug]);
            $row = $stmt->fetch();
            json_out($row ?: null);
        }

        // ── Investment opportunities ───────────────────────────────────────────

        case 'investments': {
            $status = safe_str($_GET['status'] ?? null);
            $where  = '';
            $params = [];
            if ($status !== null && in_array($status, ['available', 'sold_out', 'coming_soon'], true)) {
                $where    = 'WHERE io.status = ?';
                $params[] = $status;
            }
            $limit  = safe_int($_GET['limit'] ?? null, 1, 200, 50);
            $stmt   = db()->prepare(
                "SELECT io.*,
                        (SELECT url FROM investment_images ii WHERE ii.investment_id = io.id ORDER BY ii.position ASC LIMIT 1) AS cover_image
                   FROM investment_opportunities io
                   $where
                   ORDER BY io.featured DESC, io.date_posted DESC
                   LIMIT $limit"
            );
            $stmt->execute($params);
            json_out($stmt->fetchAll());
        }

        case 'featured_investments': {
            $limit = safe_int($_GET['limit'] ?? null, 1, 50, 6);
            $stmt  = db()->query(
                "SELECT io.*,
                        (SELECT url FROM investment_images ii WHERE ii.investment_id = io.id ORDER BY ii.position ASC LIMIT 1) AS cover_image
                   FROM investment_opportunities io
                   WHERE io.featured = 1 AND io.status = 'available'
                   ORDER BY io.date_posted DESC LIMIT $limit"
            );
            json_out($stmt->fetchAll());
        }

        case 'investment_by_slug': {
            $slug = safe_str($_GET['slug'] ?? null, 160);
            if ($slug === null) json_out(['error' => 'missing slug'], 400);
            $stmt = db()->prepare(
                "SELECT io.*,
                        (SELECT url FROM investment_images ii WHERE ii.investment_id = io.id ORDER BY ii.position ASC LIMIT 1) AS cover_image
                   FROM investment_opportunities io
                   WHERE io.slug = ? LIMIT 1"
            );
            $stmt->execute([$slug]);
            $row = $stmt->fetch();
            if (!$row) { json_out(null); }
            // Attach full gallery
            $imgs = db()->prepare("SELECT url FROM investment_images WHERE investment_id = ? ORDER BY position ASC");
            $imgs->execute([(int)$row['id']]);
            $row['gallery'] = $imgs->fetchAll(PDO::FETCH_COLUMN, 0);
            json_out($row);
        }

        case 'investment_slugs': {
            $rows = db()->query(
                "SELECT slug FROM investment_opportunities ORDER BY date_posted DESC LIMIT 500"
            )->fetchAll(PDO::FETCH_COLUMN, 0);
            json_out(array_values($rows));
        }

        default:
            json_out(['error' => 'unknown action'], 400);
    }
} catch (PDOException) {
    json_out(['error' => 'server error'], 500);
} catch (Throwable) {
    json_out(['error' => 'server error'], 500);
}
