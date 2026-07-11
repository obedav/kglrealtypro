<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/layout.php';
require_admin();



$rows = db()->query(
    "SELECT id, slug, title, city, price_ngn, category, status, featured, date_updated
       FROM investment_opportunities
       ORDER BY date_updated DESC
       LIMIT 200"
)->fetchAll();

render_header('Investments');
?>

<div class="page-header">
    <div>
        <div class="page-title">Investments</div>
        <div class="page-count"><?= count($rows) ?> opportunities</div>
    </div>
    <a href="/investment-edit.php" class="btn btn-primary">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        New Opportunity
    </a>
</div>

<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>Title</th>
            <th>City</th>
            <th>Category</th>
            <th>Starting Price (₦)</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Updated</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($rows as $r): ?>
        <tr>
            <td>
                <a href="/investment-edit.php?id=<?= (int)$r['id'] ?>" class="td-title"><?= e($r['title']) ?></a>
                <div class="td-sub">/investment/<?= e($r['slug']) ?></div>
            </td>
            <td><?= e($r['city']) ?></td>
            <td><?= e($r['category'] ?? '—') ?></td>
            <td>₦<?= number_format((int)$r['price_ngn']) ?></td>
            <td>
                <?php
                $statusClass = match($r['status']) {
                    'available'    => 'available',
                    'sold_out'     => 'sold',
                    'coming_soon'  => 'pending',
                    default        => 'off_market',
                };
                $statusLabel = ucwords(str_replace('_', ' ', $r['status']));
                ?>
                <span class="badge badge-<?= e($statusClass) ?>"><?= e($statusLabel) ?></span>
            </td>
            <td><?= $r['featured'] ? '<span class="badge badge-new">Yes</span>' : '' ?></td>
            <td class="muted"><?= e(substr((string)$r['date_updated'], 0, 10)) ?></td>
            <td>
                <div style="display:flex;gap:6px;align-items:center;justify-content:flex-end">
                    <a class="btn btn-sm" href="/investment-edit.php?id=<?= (int)$r['id'] ?>">Edit</a>
                    <form method="post" action="/investment-delete.php"
                          onsubmit="return confirm('Delete this opportunity permanently?')">
                        <?= csrf_field() ?>
                        <input type="hidden" name="investment_id" value="<?= (int)$r['id'] ?>">
                        <button class="btn btn-sm btn-danger" type="submit">Delete</button>
                    </form>
                </div>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$rows): ?>
        <tr><td colspan="8">
            <div class="empty-state">
                <div class="empty-icon">📈</div>
                <p>No investment opportunities yet. Click "New Opportunity" to add the first one.</p>
            </div>
        </td></tr>
    <?php endif; ?>
    </tbody>
</table>
</div>

<?php render_footer(); ?>
