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

render_header('Agent Handoffs');
?>

<div class="page-header">
    <div>
        <div class="page-title">Agent Handoffs</div>
        <div class="page-count"><?= count($rows) ?> escalation requests</div>
    </div>
</div>

<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>When</th>
            <th>Urgency</th>
            <th>Reason</th>
            <th>Summary</th>
            <th>Contact</th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($rows as $r):
        $urgency_class = match($r['urgency']) {
            'high'   => 'badge-new',
            'medium' => 'badge-contacted',
            default  => 'badge-off_market',
        };
    ?>
        <tr>
            <td class="muted"><?= e(substr((string)$r['created_at'], 0, 16)) ?></td>
            <td><span class="badge <?= $urgency_class ?>"><?= e($r['urgency']) ?></span></td>
            <td style="font-weight:500;color:var(--text-2)"><?= e(str_replace('_', ' ', $r['reason'])) ?></td>
            <td style="max-width:420px;font-size:13px;color:var(--text-2)"><?= e(mb_strimwidth($r['summary'], 0, 180, '…')) ?></td>
            <td class="muted">
                <?php if ($r['contact_phone']): ?><div><?= e($r['contact_phone']) ?></div><?php endif; ?>
                <?php if ($r['contact_email']): ?><div><?= e($r['contact_email']) ?></div><?php endif; ?>
                <?php if (!$r['contact_phone'] && !$r['contact_email']): ?>—<?php endif; ?>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$rows): ?>
        <tr><td colspan="5">
            <div class="empty-state">
                <div class="empty-icon">🔀</div>
                <p>No handoff requests yet.</p>
            </div>
        </td></tr>
    <?php endif; ?>
    </tbody>
</table>
</div>

<?php render_footer(); ?>
