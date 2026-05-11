<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$listingId = (int)($_POST['listing_id'] ?? 0);
$url       = trim((string)($_POST['url'] ?? ''));
$alt       = trim((string)($_POST['alt'] ?? ''));

if ($listingId <= 0 || !filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400); exit('bad input');
}

// Next position = current max + 1.
$stmt = db()->prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM listing_images WHERE listing_id = ?');
$stmt->execute([$listingId]);
$pos = (int)$stmt->fetchColumn();

db()->prepare(
    'INSERT INTO listing_images (listing_id, url, alt, position) VALUES (?, ?, ?, ?)'
)->execute([$listingId, $url, $alt !== '' ? $alt : null, $pos]);

flash('Image added.');
header("Location: /listing-edit.php?id=$listingId");
