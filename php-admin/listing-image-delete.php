<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$id        = (int)($_POST['id'] ?? 0);
$listingId = (int)($_POST['listing_id'] ?? 0);
if ($id <= 0 || $listingId <= 0) { http_response_code(400); exit('bad input'); }

db()->prepare('DELETE FROM listing_images WHERE id = ? AND listing_id = ?')
    ->execute([$id, $listingId]);

flash('Image deleted.');
header("Location: /listing-edit.php?id=$listingId");
