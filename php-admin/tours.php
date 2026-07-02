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

render_header('Tour Requests');
?>

<div class="page-header">
    <div>
        <div class="page-title">Tour Requests</div>
        <div class="page-count"><?= count($tours) ?> total</div>
    </div>
</div>

<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>Received</th>
            <th>Preferred Date</th>
            <th>Listing</th>
            <th>Client</th>
            <th>Contact</th>
            <th>Notes</th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($tours as $t): ?>
        <tr>
            <td class="muted"><?= e(substr((string)$t['created_at'], 0, 10)) ?></td>
            <td>
                <div style="font-weight:600;color:var(--text)"><?= e($t['preferred_date']) ?></div>
                <?php if ($t['preferred_time_window']): ?>
                    <div class="muted"><?= e($t['preferred_time_window']) ?></div>
                <?php endif; ?>
            </td>
            <td><span class="badge" style="background:#F1F5F9;color:#0F172A;font-weight:500"><?= e($t['listing_slug']) ?></span></td>
            <td style="font-weight:600;color:var(--text)"><?= e($t['full_name']) ?></td>
            <td class="muted">
                <?php if ($t['phone']): ?><div><?= e($t['phone']) ?></div><?php endif; ?>
                <?php if ($t['email']): ?><div><?= e($t['email']) ?></div><?php endif; ?>
            </td>
            <td class="muted" style="max-width:280px;font-size:13px"><?= e($t['notes'] ?? '—') ?></td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$tours): ?>
        <tr><td colspan="6">
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p>No tour requests yet.</p>
            </div>
        </td></tr>
    <?php endif; ?>
    </tbody>
</table>
</div>

<?php render_footer(); ?>
