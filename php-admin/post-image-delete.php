<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$id     = (int)($_POST['id']      ?? 0);
$postId = (int)($_POST['post_id'] ?? 0);
if ($id <= 0 || $postId <= 0) { http_response_code(400); exit('bad input'); }

db()->prepare('DELETE FROM post_images WHERE id = ? AND post_id = ?')
    ->execute([$id, $postId]);

flash('Image deleted.');
header("Location: /post-edit.php?id=$postId#images");
