<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

$id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$errors = [];

$form = [
    'slug'             => '',
    'title'            => '',
    'excerpt'          => '',
    'description'      => '',
    'category'         => '',
    'location_detail'  => '',
    'city'             => '',
    'country'          => 'Nigeria',
    'price_ngn'        => '',
    'expected_roi_pct' => '',
    'land_size'        => '',
    'units_available'  => '',
    'payment_plan'     => '',
    'timeline'         => '',
    'title_type'       => '',
    'status'           => 'available',
    'featured'         => 0,
    'seo_title'        => '',
    'meta_description' => '',
];

/* ── Load existing record ────────────────────────────────────────── */
if ($id > 0) {
    $stmt = db()->prepare('SELECT * FROM investment_opportunities WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { http_response_code(404); exit('Investment opportunity not found'); }
    foreach (array_keys($form) as $k) {
        if (array_key_exists($k, $row)) {
            $form[$k] = $row[$k] ?? $form[$k];
        }
    }
    $form['featured'] = (int)($form['featured'] ?? 0);
}

/* ── POST handler ────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    $textFields = [
        'slug', 'title', 'excerpt', 'description', 'category',
        'location_detail', 'city', 'country', 'land_size',
        'payment_plan', 'timeline', 'title_type',
        'seo_title', 'meta_description',
    ];
    foreach ($textFields as $k) { $form[$k] = $_POST[$k] ?? ''; }

    $form['price_ngn']        = $_POST['price_ngn']        ?? '';
    $form['expected_roi_pct'] = $_POST['expected_roi_pct'] ?? '';
    $form['units_available']  = $_POST['units_available']  ?? '';
    $form['status']           = $_POST['status']           ?? 'available';
    $form['featured']         = !empty($_POST['featured']) ? 1 : 0;

    // Validation
    $slug = slugify_inv($form['slug'] !== '' ? $form['slug'] : $form['title']);
    if (!preg_match('/^[a-z0-9-]{2,191}$/', $slug)) {
        $errors[] = 'Slug must be 2–191 lowercase letters, digits, or hyphens.';
    }
    if (trim((string)$form['title']) === '') $errors[] = 'Title is required.';
    if (!is_numeric($form['price_ngn']) || (int)$form['price_ngn'] < 0) {
        $errors[] = 'Price must be a non-negative number.';
    }
    $status = in_array($form['status'], ['available', 'sold_out', 'coming_soon'], true)
        ? $form['status'] : 'available';
    $form['status'] = $status;

    $roi = $form['expected_roi_pct'] !== '' ? (float)$form['expected_roi_pct'] : null;
    $units = $form['units_available'] !== '' ? (int)$form['units_available'] : null;

    if (!$errors) {
        $save = [
            'slug'             => $slug,
            'title'            => trim($form['title']),
            'excerpt'          => trim($form['excerpt']),
            'description'      => trim($form['description']),
            'category'         => trim($form['category']) ?: null,
            'location_detail'  => trim($form['location_detail']) ?: null,
            'city'             => trim($form['city']),
            'country'          => trim($form['country']) ?: 'Nigeria',
            'price_ngn'        => (int)$form['price_ngn'],
            'expected_roi_pct' => $roi,
            'land_size'        => trim($form['land_size']) ?: null,
            'units_available'  => $units,
            'payment_plan'     => trim($form['payment_plan']) ?: null,
            'timeline'         => trim($form['timeline']) ?: null,
            'title_type'       => trim($form['title_type']) ?: null,
            'status'           => $status,
            'featured'         => $form['featured'],
            'seo_title'        => trim($form['seo_title']) ?: null,
            'meta_description' => trim($form['meta_description']) ?: null,
        ];

        $namedParams = [];
        foreach ($save as $k => $v) { $namedParams[':' . $k] = $v; }

        $cols = array_keys($save);
        $setClauses = array_map(fn($c) => "`$c` = :$c", $cols);

        try {
            if ($id > 0) {
                $sql = 'UPDATE investment_opportunities SET ' . implode(', ', $setClauses) . ' WHERE id = :id';
                $namedParams[':id'] = $id;
                db()->prepare($sql)->execute($namedParams);
                flash('Investment opportunity updated.');
            } else {
                $colList = implode(', ', array_map(fn($c) => "`$c`", $cols));
                $phList  = implode(', ', array_map(fn($k) => ':' . $k, $cols));
                db()->prepare("INSERT INTO investment_opportunities ($colList) VALUES ($phList)")
                    ->execute($namedParams);
                $id = (int)db()->lastInsertId();
                flash('Investment opportunity created — now add images below.');
            }
            header("Location: /investment-edit.php?id=$id");
            exit;
        } catch (PDOException $ex) {
            $errors[] = (int)$ex->errorInfo[1] === 1062
                ? 'That slug is already in use on another opportunity.'
                : 'Database error: ' . $ex->getMessage();
        }
    }
}

function slugify_inv(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

render_header($id ? 'Edit investment opportunity' : 'New investment opportunity');
?>

<div class="page-header">
    <div>
        <div class="page-title"><?= $id ? 'Edit opportunity' : 'New opportunity' ?></div>
        <?php if ($id): ?>
            <div class="page-count">ID #<?= $id ?> · <a href="/investments.php" style="color:var(--muted);font-size:13px">← Back to investments</a></div>
        <?php endif; ?>
    </div>
    <?php if ($id): ?>
        <?php
        $statusClass = match($form['status']) {
            'available'   => 'available',
            'sold_out'    => 'sold',
            'coming_soon' => 'pending',
            default       => 'off_market',
        };
        ?>
        <span class="badge badge-<?= e($statusClass) ?>" style="font-size:13px;padding:5px 12px">
            <?= e(ucwords(str_replace('_', ' ', $form['status']))) ?>
        </span>
    <?php endif; ?>
</div>

<?php if ($errors): ?>
    <div class="error-card">
        <strong>Could not save:</strong>
        <ul><?php foreach ($errors as $err): ?><li><?= e($err) ?></li><?php endforeach; ?></ul>
    </div>
<?php endif; ?>

<form method="post" id="inv-form">
<?= csrf_field() ?>

<!-- ══════════════════════════════════════════════════════════════════
     1. CORE DETAILS
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">Opportunity Details</h2>

    <label>Title <span class="hint">Clear, investment-focused headline</span>
        <input type="text" name="title" value="<?= e($form['title']) ?>" required
               placeholder="e.g. Prime Land Investment — Ibeju-Lekki Corridor, Lagos">
    </label>

    <label>Slug <span class="hint">Leave blank to auto-derive from title</span>
        <input type="text" name="slug" value="<?= e($form['slug']) ?>"
               pattern="[a-z0-9-]{2,191}"
               placeholder="e.g. prime-land-ibeju-lekki-corridor">
    </label>

    <div class="form-row">
        <label>Category
            <input type="text" name="category" value="<?= e($form['category']) ?>"
                   list="inv-categories" placeholder="e.g. Land, Off-Plan, Buy-to-Let">
            <datalist id="inv-categories">
                <option value="Land"><option value="Off-Plan Development">
                <option value="Buy-to-Let"><option value="Commercial">
                <option value="Short-Let"><option value="Mixed Use">
                <option value="Student Accommodation">
            </datalist>
        </label>
        <label>Status
            <select name="status">
                <?php foreach (['available' => 'Available', 'coming_soon' => 'Coming Soon', 'sold_out' => 'Sold Out'] as $val => $label): ?>
                    <option value="<?= $val ?>" <?= $form['status']===$val?'selected':'' ?>><?= $label ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>

    <div class="form-row">
        <label>City <input type="text" name="city" value="<?= e($form['city']) ?>" required placeholder="Lagos"></label>
        <label>Country <input type="text" name="country" value="<?= e($form['country']) ?>" required placeholder="Nigeria"></label>
    </div>

    <label>Location detail <span class="hint">Specific area or estate name</span>
        <input type="text" name="location_detail" value="<?= e($form['location_detail']) ?>"
               placeholder="e.g. Ibeju-Lekki Free Trade Zone corridor, behind La Campaigne Tropicana">
    </label>

    <div class="form-row">
        <label>Starting price (₦) <span class="hint">Minimum investment / price from</span>
            <input type="number" name="price_ngn" value="<?= e($form['price_ngn']) ?>" min="0" required placeholder="5000000">
        </label>
        <label>Expected ROI (%) <span class="hint">Projected annual or total return — optional</span>
            <input type="number" name="expected_roi_pct" value="<?= e($form['expected_roi_pct']) ?>"
                   min="0" max="999" step="0.1" placeholder="e.g. 35">
        </label>
    </div>

    <div class="form-row">
        <label>Land / Property size <span class="hint">e.g. 600 sqm (1 plot), 500 sqm</span>
            <input type="text" name="land_size" value="<?= e($form['land_size']) ?>" placeholder="e.g. 600 sqm (1 plot)">
        </label>
        <label>Units / Plots available <span class="hint">Leave blank if unlimited or not applicable</span>
            <input type="number" name="units_available" value="<?= e($form['units_available']) ?>" min="1" placeholder="e.g. 50">
        </label>
    </div>

    <label>Title / Documentation
        <input type="text" name="title_type" value="<?= e($form['title_type']) ?>"
               list="title-types-inv" placeholder="e.g. Certificate of Occupancy (C of O)">
        <datalist id="title-types-inv">
            <option value="Certificate of Occupancy (C of O)">
            <option value="Governor's Consent">
            <option value="Registered Survey">
            <option value="Deed of Assignment">
            <option value="Right of Occupancy">
            <option value="Verified Documentation">
        </datalist>
    </label>

    <label>Timeline <span class="hint">Availability or completion date</span>
        <input type="text" name="timeline" value="<?= e($form['timeline']) ?>"
               placeholder="e.g. Ready for immediate purchase · Title delivery in 30 days">
    </label>

    <label>Payment plan <span class="hint">Outline instalment options if available</span>
        <textarea name="payment_plan" rows="3" placeholder="e.g. 60% initial payment, balance over 6 months. Outright discount available."><?= e($form['payment_plan']) ?></textarea>
    </label>

    <div style="margin-top:14px">
        <label class="check-label">
            <input type="checkbox" name="featured" <?= $form['featured']?'checked':'' ?>>
            Feature this opportunity on the Investment page
        </label>
    </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     2. DESCRIPTION
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">Description</h2>

    <label>Excerpt <span class="hint">One sentence shown on the investment card</span>
        <textarea name="excerpt" rows="3" placeholder="e.g. Secure a plot in Lagos's fastest-growing corridor — C of O, infrastructure ready, 35% ROI projected over 3 years."><?= e($form['excerpt']) ?></textarea>
    </label>

    <label>Full description <span class="hint">Detailed write-up — HTML tags allowed</span>
        <textarea name="description" rows="14" placeholder="Describe the opportunity, location advantages, infrastructure, developer track record, etc."><?= e($form['description']) ?></textarea>
    </label>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     3. SEO
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">SEO</h2>

    <label>SEO Title <span class="hint">Target 50–60 characters · <span id="seo-title-count" style="font-weight:700">0</span> / 60</span>
        <input type="text" id="seo-title" name="seo_title" value="<?= e($form['seo_title']) ?>" maxlength="255"
               placeholder="e.g. Land Investment Ibeju-Lekki Lagos — From ₦5M | KGL Realty Pro">
    </label>

    <label>Meta Description <span class="hint">Target 140–160 characters · <span id="meta-desc-count" style="font-weight:700">0</span> / 160</span>
        <textarea id="meta-desc" name="meta_description" rows="3" maxlength="500"
                  placeholder="e.g. Invest in prime land along the Ibeju-Lekki Free Trade Zone corridor. C of O, infrastructure ready. From ₦5M with flexible payment plans."><?= e($form['meta_description']) ?></textarea>
    </label>
</div>

<!-- Save bar -->
<div class="card" style="display:flex;align-items:center;gap:12px">
    <button class="btn btn-primary" type="submit"><?= $id ? 'Save changes' : 'Save & add images →' ?></button>
    <a class="btn" href="/investments.php">Cancel</a>
</div>

</form>

<!-- ══════════════════════════════════════════════════════════════════
     IMAGES (only after record is saved)
     ══════════════════════════════════════════════════════════════════ -->
<?php if ($id > 0):
    $imgs = db()->prepare(
        'SELECT id, url, alt, caption, position FROM investment_images WHERE investment_id = ? ORDER BY position ASC'
    );
    $imgs->execute([$id]);
    $images = $imgs->fetchAll();
?>

<h2 id="images" style="font-size:17px;font-weight:700;margin:32px 0 12px">Investment Images</h2>

<div class="card">
    <p style="font-size:13px;color:var(--muted);margin-bottom:16px">
        Upload photos or paste a URL. First image becomes the cover photo shown on the investment card.
    </p>

    <form method="post" action="/investment-image-add.php" enctype="multipart/form-data">
        <?= csrf_field() ?>
        <input type="hidden" name="investment_id" value="<?= (int)$id ?>">

        <div style="display:flex;gap:0;margin-bottom:14px;border:1px solid var(--border);border-radius:8px;overflow:hidden;width:fit-content">
            <button type="button" id="tab-upload" onclick="switchTab('upload')"
                style="padding:7px 18px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:var(--primary,var(--navy));color:#fff">
                Upload files
            </button>
            <button type="button" id="tab-url" onclick="switchTab('url')"
                style="padding:7px 18px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:transparent;color:var(--muted)">
                Paste URL
            </button>
        </div>

        <div id="panel-upload">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">
                Choose images
                <span class="hint">JPEG, PNG, WebP or GIF · max 8 MB each · hold Ctrl/⌘ for multiple</span>
            </label>
            <input type="file" name="images[]" multiple
                   accept="image/jpeg,image/png,image/webp,image/gif"
                   style="display:block;font-size:13px;margin-bottom:10px">
        </div>

        <div id="panel-url" style="display:none">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">Image URL</label>
            <input type="text" name="url" placeholder="https://example.com/land-photo.jpg" style="margin-bottom:10px">
        </div>

        <div class="form-row">
            <label>Alt text <span class="hint">Describes the photo — important for SEO</span>
                <input type="text" name="alt" placeholder="e.g. Aerial view of land plots in Ibeju-Lekki Lagos">
            </label>
            <label>Caption <span class="hint">Optional — shown below photo in gallery</span>
                <input type="text" name="caption" placeholder="e.g. Site visit — January 2026">
            </label>
        </div>

        <div style="margin-top:12px">
            <button class="btn btn-gold" type="submit">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Add image(s)
            </button>
        </div>
    </form>

    <?php if ($images): ?>
        <div style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px">
            <?php foreach ($images as $i => $img): ?>
                <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--surface-2)">
                    <div style="aspect-ratio:4/3;overflow:hidden;background:#e2e8f0">
                        <img src="<?= e($img['url']) ?>" alt="<?= e($img['alt'] ?? '') ?>"
                             style="width:100%;height:100%;object-fit:cover"
                             onerror="this.style.display='none'">
                    </div>
                    <div style="padding:8px 10px">
                        <div style="font-size:11px;font-weight:600;color:var(--gold,#C9A84C);margin-bottom:4px">
                            #<?= $i+1 ?><?= $i===0 ? ' · Cover' : '' ?>
                        </div>
                        <?php if (!empty($img['alt'])): ?>
                            <div style="font-size:11px;color:var(--text);margin-bottom:2px;line-height:1.4"><?= e($img['alt']) ?></div>
                        <?php endif; ?>
                        <?php if (!empty($img['caption'])): ?>
                            <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:6px"><?= e($img['caption']) ?></div>
                        <?php endif; ?>
                        <form method="post" action="/investment-image-delete.php"
                              onsubmit="return confirm('Delete this image?')"
                              style="margin-top:8px">
                            <?= csrf_field() ?>
                            <input type="hidden" name="id" value="<?= (int)$img['id'] ?>">
                            <input type="hidden" name="investment_id" value="<?= (int)$id ?>">
                            <button class="btn btn-sm btn-danger" type="submit">Remove</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
            </div>
        </div>
    <?php else: ?>
        <div class="empty-state" style="padding:32px 0 8px">
            <div class="empty-icon">🖼️</div>
            <p>No images yet — add the first one above.</p>
        </div>
    <?php endif; ?>
</div>

<?php endif; ?>

<?php render_footer(); ?>

<style>
.section-heading {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
}
</style>

<script>
function attachCounter(inputId, countId, max) {
    const el = document.getElementById(inputId);
    const ct = document.getElementById(countId);
    if (!el || !ct) return;
    const update = () => {
        const n = el.value.length;
        ct.textContent = n;
        ct.style.color = n > max ? 'var(--danger)' : n > max * 0.9 ? '#d97706' : '';
    };
    el.addEventListener('input', update);
    update();
}
attachCounter('seo-title', 'seo-title-count', 60);
attachCounter('meta-desc', 'meta-desc-count', 160);

function switchTab(t) {
    document.getElementById('panel-upload').style.display = t === 'upload' ? '' : 'none';
    document.getElementById('panel-url').style.display    = t === 'url'    ? '' : 'none';
    document.getElementById('tab-upload').style.background = t === 'upload' ? 'var(--navy)' : 'transparent';
    document.getElementById('tab-upload').style.color      = t === 'upload' ? '#fff' : 'var(--muted)';
    document.getElementById('tab-url').style.background    = t === 'url'    ? 'var(--navy)' : 'transparent';
    document.getElementById('tab-url').style.color         = t === 'url'    ? '#fff' : 'var(--muted)';
}
</script>
