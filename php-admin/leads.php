<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $id     = (int)($_POST['id'] ?? 0);
    $status = (string)($_POST['status'] ?? '');
    $allowed = ['new','qualified','contacted','tour_booked','won','lost'];
    if ($id > 0 && in_array($status, $allowed, true)) {
        db()->prepare('UPDATE leads SET status = ? WHERE id = ?')->execute([$status, $id]);
        flash('Lead status updated.');
    }
    header('Location: /leads.php'); exit;
}

$leads = db()->query(
    "SELECT id, source, status, full_name, phone, email, listing_slug, budget_ngn,
            timeframe, created_at, interest_summary
       FROM leads
       ORDER BY created_at DESC
       LIMIT 300"
)->fetchAll();

render_header('Leads');
?>

<div class="page-header">
    <div>
        <div class="page-title">Leads</div>
        <div class="page-count"><?= count($leads) ?> total — contact forms, concierge &amp; more</div>
    </div>
</div>

<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>When</th>
            <th>Source</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Interest</th>
            <th>Budget</th>
            <th>Timeframe</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($leads as $l): ?>
        <tr>
            <td class="muted"><?= e(substr((string)$l['created_at'], 0, 16)) ?></td>
            <td><span class="badge badge-<?= e($l['source']) ?>"><?= e($l['source']) ?></span></td>
            <td>
                <div style="font-weight:600;color:var(--text)"><?= e($l['full_name']) ?></div>
            </td>
            <td class="muted">
                <?php if ($l['phone']): ?><div><?= e($l['phone']) ?></div><?php endif; ?>
                <?php if ($l['email']): ?><div><?= e($l['email']) ?></div><?php endif; ?>
            </td>
            <td style="max-width:360px;font-size:13px;color:var(--text-2)">
                <?= e(mb_strimwidth($l['interest_summary'], 0, 120, '…')) ?>
                <?php if ($l['listing_slug']): ?>
                    <div class="muted">Listing: <?= e($l['listing_slug']) ?></div>
                <?php endif; ?>
            </td>
            <td style="white-space:nowrap"><?= $l['budget_ngn'] ? '₦'.number_format((int)$l['budget_ngn']) : '<span class="muted">—</span>' ?></td>
            <td><span class="muted"><?= e(str_replace('_', ' ', $l['timeframe'] ?? '—')) ?></span></td>
            <td>
                <form method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="id" value="<?= (int)$l['id'] ?>">
                    <select name="status" onchange="this.form.submit()" style="width:auto;padding:5px 8px;font-size:12.5px">
                        <?php foreach (['new','qualified','contacted','tour_booked','won','lost'] as $s): ?>
                            <option value="<?= $s ?>" <?= $l['status']===$s?'selected':'' ?>><?= $s ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$leads): ?>
        <tr><td colspan="8">
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>No leads yet. They'll appear here as visitors contact you.</p>
            </div>
        </td></tr>
    <?php endif; ?>
    </tbody>
</table>
</div>

<?php render_footer(); ?>
