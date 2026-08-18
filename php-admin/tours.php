<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

// Status filter
$validStatuses  = ['', 'pending', 'confirmed', 'completed', 'cancelled'];
$filterStatus   = in_array($_GET['status'] ?? '', $validStatuses, true) ? ($_GET['status'] ?? '') : '';

$sql    = "SELECT id, listing_slug, preferred_date, preferred_time_window,
                  full_name, phone, email, notes, status, admin_notes, created_at
             FROM tour_requests";
$params = [];

if ($filterStatus !== '') {
    $sql    .= ' WHERE status = ?';
    $params[] = $filterStatus;
}

$sql   .= ' ORDER BY created_at DESC LIMIT 300';
$stmt   = db()->prepare($sql);
$stmt->execute($params);
$tours  = $stmt->fetchAll();

// Counts by status for filter pills
$counts = db()->query(
    "SELECT status, COUNT(*) AS n FROM tour_requests GROUP BY status"
)->fetchAll(\PDO::FETCH_KEY_PAIR);

$total = array_sum($counts);

render_header('Tour Requests');
?>

<div class="page-header">
    <div>
        <div class="page-title">Tour Requests</div>
        <div class="page-count"><?= $total ?> total</div>
    </div>
</div>

<!-- Status filter pills -->
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
    <?php
    $pills = [
        ''          => 'All',
        'pending'   => 'Pending',
        'confirmed' => 'Confirmed',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];
    foreach ($pills as $val => $label):
        $active = $filterStatus === $val;
        $count  = $val === '' ? $total : ($counts[$val] ?? 0);
    ?>
    <a href="?status=<?= urlencode($val) ?>"
       style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;
              font-size:12.5px;font-weight:600;text-decoration:none;border:1.5px solid;
              background:<?= $active ? 'var(--navy)' : 'var(--surface)' ?>;
              color:<?= $active ? '#fff' : 'var(--text-2)' ?>;
              border-color:<?= $active ? 'var(--navy)' : 'var(--border)' ?>">
        <?= e($label) ?>
        <span style="background:<?= $active ? 'rgba(255,255,255,.2)' : 'var(--surface-2)' ?>;
                     color:<?= $active ? '#fff' : 'var(--muted)' ?>;
                     border-radius:999px;padding:1px 7px;font-size:11px">
            <?= $count ?>
        </span>
    </a>
    <?php endforeach; ?>
</div>

<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>Received</th>
            <th>Preferred date</th>
            <th>Listing</th>
            <th>Client</th>
            <th>Contact</th>
            <th>Status</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($tours as $t): ?>
        <?php
        $statusColors = [
            'pending'   => ['bg'=>'#FFFBEB','color'=>'#92400E'],
            'confirmed' => ['bg'=>'#DBEAFE','color'=>'#1D4ED8'],
            'completed' => ['bg'=>'#ECFDF5','color'=>'#065F46'],
            'cancelled' => ['bg'=>'#FEF2F2','color'=>'#991B1B'],
        ];
        $sc = $statusColors[$t['status']] ?? ['bg'=>'#F1F5F9','color'=>'#475569'];
        ?>
        <tr>
            <td class="muted"><?= e(substr((string)$t['created_at'], 0, 10)) ?></td>
            <td>
                <div style="font-weight:600;color:var(--text)"><?= e($t['preferred_date']) ?></div>
                <?php if ($t['preferred_time_window']): ?>
                    <div class="muted"><?= e($t['preferred_time_window']) ?></div>
                <?php endif; ?>
            </td>
            <td>
                <span class="badge" style="background:#F1F5F9;color:#0F172A;font-weight:500">
                    <?= e($t['listing_slug']) ?>
                </span>
            </td>
            <td style="font-weight:600;color:var(--text)"><?= e($t['full_name']) ?></td>
            <td class="muted">
                <?php if ($t['phone']): ?><div><?= e($t['phone']) ?></div><?php endif; ?>
                <?php if ($t['email']): ?><div><?= e($t['email']) ?></div><?php endif; ?>
            </td>
            <td>
                <span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;
                             font-size:11.5px;font-weight:600;
                             background:<?= $sc['bg'] ?>;color:<?= $sc['color'] ?>">
                    <?= ucfirst(e($t['status'])) ?>
                </span>
            </td>
            <td>
                <button type="button" class="btn btn-sm"
                        onclick="toggleDetail(<?= $t['id'] ?>)">
                    Details
                </button>
            </td>
        </tr>

        <!-- Expandable detail row -->
        <tr id="detail-<?= $t['id'] ?>" style="display:none">
            <td colspan="7" style="padding:0;background:var(--surface-2)">
                <div style="padding:20px 24px;border-top:1px solid var(--border)">

                    <?php if ($t['notes']): ?>
                    <div style="margin-bottom:16px">
                        <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Client notes</div>
                        <div style="font-size:13.5px;color:var(--text-2);background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 14px">
                            <?= nl2br(e($t['notes'])) ?>
                        </div>
                    </div>
                    <?php endif; ?>

                    <form method="post" action="/tour-update.php" style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end">
                        <?= csrf_field() ?>
                        <input type="hidden" name="id" value="<?= $t['id'] ?>">

                        <label style="margin:0;min-width:160px">
                            <span style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:4px">Status</span>
                            <select name="status" style="width:100%">
                                <?php foreach (['pending','confirmed','completed','cancelled'] as $s): ?>
                                    <option value="<?= $s ?>" <?= $t['status'] === $s ? 'selected' : '' ?>>
                                        <?= ucfirst($s) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </label>

                        <label style="margin:0;flex:1;min-width:240px">
                            <span style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:4px">Admin notes</span>
                            <input type="text" name="admin_notes"
                                   value="<?= e($t['admin_notes'] ?? '') ?>"
                                   placeholder="e.g. Confirmed via WhatsApp, Saturday 10am">
                        </label>

                        <button type="submit" class="btn btn-primary" style="margin:0">Save</button>
                    </form>

                    <?php if ($t['admin_notes']): ?>
                    <div style="margin-top:12px;font-size:12.5px;color:var(--muted)">
                        <strong>Current note:</strong> <?= e($t['admin_notes']) ?>
                    </div>
                    <?php endif; ?>
                </div>
            </td>
        </tr>
    <?php endforeach; ?>

    <?php if (!$tours): ?>
        <tr><td colspan="7">
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p><?= $filterStatus ? "No $filterStatus tour requests." : 'No tour requests yet.' ?></p>
                <?php if ($filterStatus): ?><a href="/tours.php" class="btn">Clear filter</a><?php endif; ?>
            </div>
        </td></tr>
    <?php endif; ?>
    </tbody>
</table>
</div>

<script>
function toggleDetail(id) {
    const row = document.getElementById('detail-' + id);
    if (!row) return;
    row.style.display = row.style.display === 'none' ? '' : 'none';
}
</script>

<?php render_footer(); ?>
