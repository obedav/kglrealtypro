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

<h1>Listings</h1>
<p class="muted"><?= count($listings) ?> listings.
  <a class="btn btn-primary" href="/listing-edit.php">+ New listing</a>
</p>

<table>
    <thead>
        <tr>
            <th>Title</th>
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
                <a href="/listing-edit.php?id=<?= (int)$l['id'] ?>"><?= e($l['title']) ?></a>
                <div class="muted">/<?= e($l['slug']) ?></div>
            </td>
            <td><?= e($l['city']) ?></td>
            <td><?= number_format((int)$l['price_ngn']) ?></td>
            <td><?= (int)$l['bedrooms'] ?></td>
            <td><?= (int)$l['bathrooms'] ?></td>
            <td><?= e($l['status']) ?></td>
            <td><?= $l['featured'] ? 'Yes' : '' ?></td>
            <td class="muted"><?= e(substr((string)$l['date_updated'], 0, 16)) ?></td>
            <td><a class="btn" href="/listing-edit.php?id=<?= (int)$l['id'] ?>">Edit</a></td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$listings): ?>
        <tr><td colspan="9" class="muted">No listings yet. Click "+ New listing" to add one.</td></tr>
    <?php endif; ?>
    </tbody>
</table>

<?php render_footer(); ?>
