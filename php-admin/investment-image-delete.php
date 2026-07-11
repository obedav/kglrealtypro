<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$id           = (int)($_POST['id']            ?? 0);
$investmentId = (int)($_POST['investment_id'] ?? 0);
if ($id <= 0 || $investmentId <= 0) { http_response_code(400); exit('bad input'); }

db()->prepare('DELETE FROM investment_images WHERE id = ? AND investment_id = ?')
    ->execute([$id, $investmentId]);

flash('Image deleted.');
header("Location: /investment-edit.php?id=$investmentId#images");
