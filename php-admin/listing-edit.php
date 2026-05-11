<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

/**
 * Create or edit a single listing. Same form file serves both modes:
 *   /listing-edit.php          → create
 *   /listing-edit.php?id=123   → edit
 * Writes go through PDO prepared statements only.
 */

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$errors = [];

$form = [
    'slug' => '', 'title' => '', 'excerpt' => '', 'description' => '',
    'price_ngn' => '', 'city' => '', 'country' => 'Nigeria',
    'bedrooms' => 0, 'bathrooms' => 0, 'sqm' => 0,
    'amenities_csv' => '',
    'status' => 'available', 'featured' => 0, 'just_listed' => 0,
    'virtual_tour_url' => '',
];

if ($id > 0) {
    $stmt = db()->prepare('SELECT * FROM listings WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { http_response_code(404); exit('Listing not found'); }
    $amenities = json_decode($row['amenities'] ?: '[]', true) ?: [];
    $form = [
        'slug' => $row['slug'], 'title' => $row['title'],
        'excerpt' => $row['excerpt'], 'description' => $row['description'],
        'price_ngn' => $row['price_ngn'], 'city' => $row['city'], 'country' => $row['country'],
        'bedrooms' => (int)$row['bedrooms'], 'bathrooms' => (int)$row['bathrooms'], 'sqm' => (int)$row['sqm'],
        'amenities_csv' => implode(', ', $amenities),
        'status' => $row['status'], 'featured' => (int)$row['featured'], 'just_listed' => (int)$row['just_listed'],
        'virtual_tour_url' => $row['virtual_tour_url'] ?? '',
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    foreach (array_keys($form) as $k) {
        $form[$k] = $_POST[$k] ?? $form[$k];
    }
    $form['featured']    = !empty($_POST['featured']) ? 1 : 0;
    $form['just_listed'] = !empty($_POST['just_listed']) ? 1 : 0;

    $slug = slugify($form['slug'] !== '' ? $form['slug'] : $form['title']);
    if (!preg_match('/^[a-z0-9-]{2,191}$/', $slug)) {
        $errors[] = 'Slug must be 2–191 lowercase letters, digits, or hyphens.';
    }
    if (trim((string)$form['title']) === '') $errors[] = 'Title is required.';
    if (!is_numeric($form['price_ngn']) || (int)$form['price_ngn'] < 0) {
        $errors[] = 'Price must be a non-negative number.';
    }
    $status = in_array($form['status'], ['available','sold','off_market','pending'], true)
        ? $form['status'] : 'available';

    $amenities = array_values(array_filter(array_map(
        fn($s) => trim($s),
        explode(',', (string)$form['amenities_csv'])
    )));

    if (!$errors) {
        $params = [
            $slug, $form['title'], $form['excerpt'], $form['description'],
            (int)$form['price_ngn'], $form['city'], $form['country'],
            (int)$form['bedrooms'], (int)$form['bathrooms'], (int)$form['sqm'],
            json_encode($amenities, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $status, (int)$form['featured'], (int)$form['just_listed'],
            $form['virtual_tour_url'] !== '' ? $form['virtual_tour_url'] : null,
        ];

        try {
            if ($id > 0) {
                $params[] = $id;
                db()->prepare(
                    'UPDATE listings SET
                       slug=?, title=?, excerpt=?, description=?, price_ngn=?,
                       city=?, country=?, bedrooms=?, bathrooms=?, sqm=?,
                       amenities=CAST(? AS JSON), status=?, featured=?, just_listed=?,
                       virtual_tour_url=?
                     WHERE id=?'
                )->execute($params);
                flash('Listing updated.');
            } else {
                db()->prepare(
                    'INSERT INTO listings
                       (slug, title, excerpt, description, price_ngn,
                        city, country, bedrooms, bathrooms, sqm,
                        amenities, status, featured, just_listed, virtual_tour_url)
                     VALUES
                       (?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        CAST(? AS JSON), ?, ?, ?, ?)'
                )->execute($params);
                $id = (int)db()->lastInsertId();
                flash('Listing created.');
            }
            header("Location: /listing-edit.php?id=$id");
            exit;
        } catch (PDOException $ex) {
            if ((int)$ex->errorInfo[1] === 1062) {
                $errors[] = 'That slug is already in use on another listing.';
            } else {
                $errors[] = 'Database error: ' . $ex->getMessage();
            }
        }
    }
}

function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

render_header($id ? 'Edit listing' : 'New listing');
?>
<h1><?= $id ? 'Edit listing' : 'New listing' ?></h1>

<?php if ($errors): ?>
    <div class="card" style="background:#fef2f2;border-color:#fecaca;color:#991b1b">
        <strong>Could not save:</strong>
        <ul><?php foreach ($errors as $e): ?><li><?= e($e) ?></li><?php endforeach; ?></ul>
    </div>
<?php endif; ?>

<form method="post" class="card">
    <?= csrf_field() ?>

    <label>Title
        <input type="text" name="title" value="<?= e($form['title']) ?>" required>
    </label>

    <label>Slug (URL — leave blank to derive from title)
        <input type="text" name="slug" value="<?= e($form['slug']) ?>" pattern="[a-z0-9-]{2,191}">
    </label>

    <div class="row">
        <label>City
            <input type="text" name="city" value="<?= e($form['city']) ?>" required>
        </label>
        <label>Country
            <input type="text" name="country" value="<?= e($form['country']) ?>" required>
        </label>
    </div>

    <div class="row">
        <label>Price (₦)
            <input type="number" name="price_ngn" value="<?= e($form['price_ngn']) ?>" min="0" required>
        </label>
        <label>Sqm
            <input type="number" name="sqm" value="<?= e($form['sqm']) ?>" min="0">
        </label>
    </div>

    <div class="row">
        <label>Bedrooms
            <input type="number" name="bedrooms" value="<?= e($form['bedrooms']) ?>" min="0" max="30">
        </label>
        <label>Bathrooms
            <input type="number" name="bathrooms" value="<?= e($form['bathrooms']) ?>" min="0" max="30">
        </label>
    </div>

    <label>Excerpt (one-sentence summary)
        <textarea name="excerpt" rows="2"><?= e($form['excerpt']) ?></textarea>
    </label>

    <label>Description (HTML allowed)
        <textarea name="description" rows="8"><?= e($form['description']) ?></textarea>
    </label>

    <label>Amenities (comma-separated)
        <input type="text" name="amenities_csv" value="<?= e($form['amenities_csv']) ?>"
               placeholder="Pool, Staff quarters, Solar backup">
    </label>

    <div class="row">
        <label>Status
            <select name="status">
                <?php foreach (['available','pending','sold','off_market'] as $s): ?>
                    <option value="<?= $s ?>" <?= $form['status']===$s?'selected':'' ?>><?= $s ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>Virtual tour URL
            <input type="text" name="virtual_tour_url" value="<?= e($form['virtual_tour_url']) ?>">
        </label>
    </div>

    <label><input type="checkbox" name="featured" <?= $form['featured']?'checked':'' ?>> Featured on homepage</label>
    <label><input type="checkbox" name="just_listed" <?= $form['just_listed']?'checked':'' ?>> Show "just listed" badge</label>

    <div style="margin-top:18px;display:flex;gap:10px">
        <button class="btn btn-primary" type="submit">Save</button>
        <a class="btn" href="/">Cancel</a>
    </div>
</form>

<?php if ($id > 0): ?>
    <h2>Images</h2>
    <?php
    $imgs = db()->prepare('SELECT id, url, alt, position FROM listing_images WHERE listing_id = ? ORDER BY position ASC');
    $imgs->execute([$id]);
    $images = $imgs->fetchAll();
    ?>
    <div class="card">
        <form method="post" action="/listing-image-add.php" style="margin:0 0 14px">
            <?= csrf_field() ?>
            <input type="hidden" name="listing_id" value="<?= (int)$id ?>">
            <label>Image URL (upload the file in cPanel under <code>public_html/uploads/</code>, paste the public URL here)
                <input type="text" name="url" required placeholder="https://kglrealtypro.com/uploads/villa-1.jpg">
            </label>
            <label>Alt text <input type="text" name="alt"></label>
            <button class="btn btn-primary" type="submit">Add image</button>
        </form>

        <?php if ($images): ?>
            <table>
                <thead><tr><th>URL</th><th>Alt</th><th>Position</th><th></th></tr></thead>
                <tbody>
                <?php foreach ($images as $img): ?>
                    <tr>
                        <td class="muted" style="word-break:break-all"><?= e($img['url']) ?></td>
                        <td><?= e($img['alt']) ?></td>
                        <td><?= (int)$img['position'] ?></td>
                        <td>
                            <form method="post" action="/listing-image-delete.php" onsubmit="return confirm('Delete this image?')">
                                <?= csrf_field() ?>
                                <input type="hidden" name="id" value="<?= (int)$img['id'] ?>">
                                <input type="hidden" name="listing_id" value="<?= (int)$id ?>">
                                <button class="btn btn-danger" type="submit">Delete</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p class="muted">No images yet.</p>
        <?php endif; ?>
    </div>
<?php endif; ?>

<?php render_footer(); ?>
