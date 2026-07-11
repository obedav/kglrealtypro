<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /investments.php');
    exit;
}

$id = (int)($_POST['investment_id'] ?? 0);
if ($id > 0) {
    db()->prepare('DELETE FROM investment_opportunities WHERE id = ?')->execute([$id]);
    flash('Investment opportunity deleted.');
}
header('Location: /investments.php');
exit;
