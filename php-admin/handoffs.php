<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

$rows = db()->query(
    "SELECT id, reason, urgency, summary, contact_phone, contact_email, created_at
       FROM handoff_requests
       ORDER BY created_at DESC
       LIMIT 300"
)->fetchAll();

render_header('Handoffs');
?>

<h1>Human handoffs</h1>
<p class="muted"><?= count($rows) ?> recent.</p>

<table>
    <thead>
        <tr><th>When</th><th>Urgency</th><th>Reason</th><th>Summary</th><th>Contact</th></tr>
    </thead>
    <tbody>
    <?php foreach ($rows as $r): ?>
        <tr>
            <td class="muted"><?= e(substr((string)$r['created_at'], 0, 16)) ?></td>
            <td><strong><?= e($r['urgency']) ?></strong></td>
            <td><?= e($r['reason']) ?></td>
            <td style="max-width:480px"><?= e($r['summary']) ?></td>
            <td class="muted"><?= e($r['contact_phone'] ?? '') ?><br><?= e($r['contact_email'] ?? '') ?></td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$rows): ?>
        <tr><td colspan="5" class="muted">No handoff requests yet.</td></tr>
    <?php endif; ?>
    </tbody>
</table>

<?php render_footer(); ?>
