<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/layout.php';
require_admin();

$listings = db()->query(
    "SELECT id, slug, title, city, price_ngn, bedrooms, bathrooms, status, featured, date_updated
       FROM listings
       ORDER BY date_updated DESC
       LIMIT 200"
)->fetchAll();

render_header('Listings');
?>

<div class="page-header">
    <div>
        <div class="page-title">Listings</div>
        <div class="page-count"><?= count($listings) ?> properties</div>
    </div>
    <a href="/listing-edit.php" class="btn btn-primary">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        New Listing
    </a>
</div>

<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>City</th>
            <th>Price (₦)</th>
            <th>Beds</th>
            <th>Baths</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Updated</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($listings as $l): ?>
        <tr>
            <td>
                <a href="/listing-edit.php?id=<?= (int)$l['id'] ?>" class="td-title"><?= e($l['title']) ?></a>
                <div class="td-sub">/<?= e($l['slug']) ?></div>
            </td>
            <td><?= e($l['city']) ?></td>
            <td>₦<?= number_format((int)$l['price_ngn']) ?></td>
            <td><?= (int)$l['bedrooms'] ?></td>
            <td><?= (int)$l['bathrooms'] ?></td>
            <td><span class="badge badge-<?= e($l['status']) ?>"><?= e($l['status']) ?></span></td>
            <td><?= $l['featured'] ? '<span class="badge badge-new">Yes</span>' : '' ?></td>
            <td class="muted"><?= e(substr((string)$l['date_updated'], 0, 10)) ?></td>
            <td>
                <div style="display:flex;gap:6px;align-items:center;justify-content:flex-end">
                    <a class="btn btn-sm" href="/listing-edit.php?id=<?= (int)$l['id'] ?>">Edit</a>
                    <form method="post" action="/listing-delete.php"
                          onsubmit="return confirm('Delete this listing permanently?')">
                        <?= csrf_field() ?>
                        <input type="hidden" name="listing_id" value="<?= (int)$l['id'] ?>">
                        <button class="btn btn-sm btn-danger" type="submit">Delete</button>
                    </form>
                </div>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$listings): ?>
        <tr><td colspan="9">
            <div class="empty-state">
                <div class="empty-icon">🏠</div>
                <p>No listings yet. Click "New Listing" to add the first property.</p>
            </div>
        </td></tr>
    <?php endif; ?>
    </tbody>
</table>
</div>

<?php render_footer(); ?>
