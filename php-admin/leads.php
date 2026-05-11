<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

/**
 * Read-only list of recent concierge leads + quick status update.
 * Status transitions are the only write this screen allows.
 */

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
    "SELECT id, status, full_name, phone, email, listing_slug, budget_ngn,
            timeframe, created_at, interest_summary
       FROM leads
       ORDER BY created_at DESC
       LIMIT 300"
)->fetchAll();

render_header('Leads');
?>

<h1>Leads</h1>
<p class="muted"><?= count($leads) ?> recent.</p>

<table>
    <thead>
        <tr>
            <th>When</th>
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
            <td><?= e($l['full_name']) ?></td>
            <td class="muted">
                <?= e($l['phone'] ?? '') ?><br>
                <?= e($l['email'] ?? '') ?>
            </td>
            <td style="max-width:420px">
                <?= e($l['interest_summary']) ?>
                <?php if ($l['listing_slug']): ?>
                    <div class="muted">listing: <?= e($l['listing_slug']) ?></div>
                <?php endif; ?>
            </td>
            <td><?= $l['budget_ngn'] ? '₦'.number_format((int)$l['budget_ngn']) : '' ?></td>
            <td class="muted"><?= e($l['timeframe'] ?? '') ?></td>
            <td>
                <form method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="id" value="<?= (int)$l['id'] ?>">
                    <select name="status" onchange="this.form.submit()">
                        <?php foreach (['new','qualified','contacted','tour_booked','won','lost'] as $s): ?>
                            <option value="<?= $s ?>" <?= $l['status']===$s?'selected':'' ?>><?= $s ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$leads): ?>
        <tr><td colspan="7" class="muted">No leads yet.</td></tr>
    <?php endif; ?>
    </tbody>
</table>

<?php render_footer(); ?>
