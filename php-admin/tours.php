<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

$tours = db()->query(
    "SELECT id, listing_slug, preferred_date, preferred_time_window,
            full_name, phone, email, notes, created_at
       FROM tour_requests
       ORDER BY created_at DESC
       LIMIT 300"
)->fetchAll();

render_header('Tour requests');
?>

<h1>Tour requests</h1>
<p class="muted"><?= count($tours) ?> recent.</p>

<table>
    <thead>
        <tr><th>When</th><th>Preferred</th><th>Listing</th><th>Name</th><th>Contact</th><th>Notes</th></tr>
    </thead>
    <tbody>
    <?php foreach ($tours as $t): ?>
        <tr>
            <td class="muted"><?= e(substr((string)$t['created_at'], 0, 16)) ?></td>
            <td><?= e($t['preferred_date']) ?><?= $t['preferred_time_window'] ? ' — ' . e($t['preferred_time_window']) : '' ?></td>
            <td><?= e($t['listing_slug']) ?></td>
            <td><?= e($t['full_name']) ?></td>
            <td class="muted"><?= e($t['phone']) ?><br><?= e($t['email'] ?? '') ?></td>
            <td style="max-width:420px" class="muted"><?= e($t['notes'] ?? '') ?></td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$tours): ?>
        <tr><td colspan="6" class="muted">No tour requests yet.</td></tr>
    <?php endif; ?>
    </tbody>
</table>

<?php render_footer(); ?>
