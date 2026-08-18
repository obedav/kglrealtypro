<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$id     = (int)($_POST['id'] ?? 0);
if ($id <= 0) { http_response_code(400); exit('bad input'); }

$validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
$status        = $_POST['status'] ?? '';
if (!in_array($status, $validStatuses, true)) { http_response_code(400); exit('invalid status'); }

$adminNotes = trim((string)($_POST['admin_notes'] ?? '')) ?: null;

db()->prepare(
    'UPDATE tour_requests SET status = ?, admin_notes = ? WHERE id = ?'
)->execute([$status, $adminNotes, $id]);

flash('Tour request updated.');
header('Location: /tours.php');
