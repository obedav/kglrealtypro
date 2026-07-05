<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$id = (int)($_POST['listing_id'] ?? 0);
if ($id <= 0) { http_response_code(400); exit('bad input'); }

$stmt = db()->prepare('SELECT title FROM listings WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
$listing = $stmt->fetch();

if (!$listing) {
    flash('Listing not found.');
    header('Location: /listings.php'); exit;
}

// listing_images cascade-deletes via FK constraint
db()->prepare('DELETE FROM listings WHERE id = ?')->execute([$id]);

flash('"' . $listing['title'] . '" has been deleted.');
header('Location: /listings.php');
