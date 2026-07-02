<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

$id       = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$errors   = [];
$faqPairs = [];

/* ── Default form state ──────────────────────────────────────────── */
$form = [
    // Core
    'slug' => '', 'title' => '', 'excerpt' => '', 'description' => '',
    'price_ngn' => '', 'city' => '', 'country' => 'Nigeria',
    'bedrooms' => 0, 'bathrooms' => 0, 'toilets' => 0, 'sqm' => 0,
    'condition' => '', 'title_type' => '', 'parking' => '', 'category' => '',
    'amenities_csv' => '', 'property_type' => '',
    // New listings default to featured so they show on the homepage
    // immediately; editors can untick this to hold one back.
    'status' => 'available', 'featured' => 1, 'just_listed' => 0,
    'virtual_tour_url' => '',
    // SEO
    'seo_title' => '', 'meta_description' => '', 'primary_keyword' => '',
    'secondary_keywords' => '', 'low_competition_keywords' => '',
    'long_tail_keywords' => '', 'buyer_intent_keywords' => '',
    // Investment
    'inv_capital_appreciation' => '', 'inv_rental_demand' => '',
    'inv_shortlet_potential' => '', 'inv_accessibility' => '',
    'inv_liquidity' => '', 'inv_luxury_appeal' => '',
    'inv_family_friendly' => '', 'inv_roi' => '',
    'inv_capital_growth' => '', 'inv_rental_demand_outlook' => '',
    'inv_shortlet_demand' => '', 'inv_future_appreciation' => '',
    'inv_recommendation' => '',
    // Lifestyle & social
    'lifestyle_benefits' => '', 'perfect_for' => '', 'internal_links' => '',
    'social_description' => '', 'og_description' => '', 'twitter_description' => '',
];

/* ── Load existing listing ───────────────────────────────────────── */
if ($id > 0) {
    $stmt = db()->prepare('SELECT * FROM listings WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { http_response_code(404); exit('Listing not found'); }

    $amenities = json_decode($row['amenities'] ?: '[]', true) ?: [];
    $faqPairs  = json_decode($row['faq'] ?? '[]', true) ?: [];

    foreach (array_keys($form) as $k) {
        if ($k === 'amenities_csv') {
            $form[$k] = implode(', ', $amenities);
        } elseif (array_key_exists($k, $row)) {
            $form[$k] = $row[$k] ?? $form[$k];
        }
    }
    foreach (['bedrooms','bathrooms','toilets','sqm','featured','just_listed'] as $k) {
        $form[$k] = (int)($form[$k] ?? 0);
    }
}

/* ── POST handler ─────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    $textFields = [
        'slug','title','excerpt','description','city','country',
        'condition','title_type','parking','category','property_type',
        'amenities_csv','virtual_tour_url',
        'seo_title','meta_description','primary_keyword',
        'secondary_keywords','low_competition_keywords',
        'long_tail_keywords','buyer_intent_keywords',
        'inv_capital_growth','inv_rental_demand_outlook',
        'inv_shortlet_demand','inv_future_appreciation','inv_recommendation',
        'lifestyle_benefits','perfect_for','internal_links',
        'social_description','og_description','twitter_description',
    ];
    foreach ($textFields as $k) { $form[$k] = $_POST[$k] ?? ''; }

    $form['price_ngn']   = $_POST['price_ngn'] ?? '';
    $form['bedrooms']    = (int)($_POST['bedrooms']  ?? 0);
    $form['bathrooms']   = (int)($_POST['bathrooms'] ?? 0);
    $form['toilets']     = (int)($_POST['toilets']   ?? 0);
    $form['sqm']         = (int)($_POST['sqm']       ?? 0);
    $form['status']      = $_POST['status'] ?? 'available';
    $form['featured']    = !empty($_POST['featured'])    ? 1 : 0;
    $form['just_listed'] = !empty($_POST['just_listed']) ? 1 : 0;

    $ratingKeys = [
        'inv_capital_appreciation','inv_rental_demand','inv_shortlet_potential',
        'inv_accessibility','inv_liquidity','inv_luxury_appeal','inv_family_friendly','inv_roi',
    ];
    foreach ($ratingKeys as $k) {
        $v = (int)($_POST[$k] ?? 0);
        $form[$k] = ($v >= 1 && $v <= 5) ? $v : '';
    }

    $faqQs = is_array($_POST['faq_q'] ?? null) ? $_POST['faq_q'] : [];
    $faqAs = is_array($_POST['faq_a'] ?? null) ? $_POST['faq_a'] : [];

    // Validation
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
    $form['status'] = $status;

    $amenities = array_values(array_filter(array_map(
        fn($s) => trim($s), explode(',', (string)$form['amenities_csv'])
    )));

    $faqPairs = [];
    foreach ($faqQs as $i => $q) {
        $q = trim($q); $a = trim($faqAs[$i] ?? '');
        if ($q !== '' && $a !== '') $faqPairs[] = ['q' => $q, 'a' => $a];
    }

    if (!$errors) {
        $amenitiesJson = json_encode($amenities, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $faqJson = !empty($faqPairs) ? json_encode($faqPairs, JSON_UNESCAPED_UNICODE) : null;

        $save = [
            'slug'            => $slug,
            'title'           => trim($form['title']),
            'excerpt'         => trim($form['excerpt']),
            'description'     => trim($form['description']),
            'price_ngn'       => (int)$form['price_ngn'],
            'city'            => trim($form['city']),
            'country'         => trim($form['country']),
            'bedrooms'        => $form['bedrooms'],
            'bathrooms'       => $form['bathrooms'],
            'toilets'         => $form['toilets'],
            'sqm'             => $form['sqm'],
            'condition'       => trim($form['condition']) ?: null,
            'title_type'      => trim($form['title_type']) ?: null,
            'parking'         => trim($form['parking']) ?: null,
            'category'        => trim($form['category']) ?: null,
            'property_type'   => trim($form['property_type']) ?: null,
            'status'          => $status,
            'featured'        => $form['featured'],
            'just_listed'     => $form['just_listed'],
            'virtual_tour_url'          => trim($form['virtual_tour_url']) ?: null,
            'seo_title'                 => trim($form['seo_title']) ?: null,
            'meta_description'          => trim($form['meta_description']) ?: null,
            'primary_keyword'           => trim($form['primary_keyword']) ?: null,
            'secondary_keywords'        => trim($form['secondary_keywords']) ?: null,
            'low_competition_keywords'  => trim($form['low_competition_keywords']) ?: null,
            'long_tail_keywords'        => trim($form['long_tail_keywords']) ?: null,
            'buyer_intent_keywords'     => trim($form['buyer_intent_keywords']) ?: null,
            'inv_capital_appreciation'  => $form['inv_capital_appreciation'] !== '' ? (int)$form['inv_capital_appreciation'] : null,
            'inv_rental_demand'         => $form['inv_rental_demand'] !== '' ? (int)$form['inv_rental_demand'] : null,
            'inv_shortlet_potential'    => $form['inv_shortlet_potential'] !== '' ? (int)$form['inv_shortlet_potential'] : null,
            'inv_accessibility'         => $form['inv_accessibility'] !== '' ? (int)$form['inv_accessibility'] : null,
            'inv_liquidity'             => $form['inv_liquidity'] !== '' ? (int)$form['inv_liquidity'] : null,
            'inv_luxury_appeal'         => $form['inv_luxury_appeal'] !== '' ? (int)$form['inv_luxury_appeal'] : null,
            'inv_family_friendly'       => $form['inv_family_friendly'] !== '' ? (int)$form['inv_family_friendly'] : null,
            'inv_roi'                   => $form['inv_roi'] !== '' ? (int)$form['inv_roi'] : null,
            'inv_capital_growth'        => trim($form['inv_capital_growth']) ?: null,
            'inv_rental_demand_outlook' => trim($form['inv_rental_demand_outlook']) ?: null,
            'inv_shortlet_demand'       => trim($form['inv_shortlet_demand']) ?: null,
            'inv_future_appreciation'   => trim($form['inv_future_appreciation']) ?: null,
            'inv_recommendation'        => trim($form['inv_recommendation']) ?: null,
            'lifestyle_benefits'        => trim($form['lifestyle_benefits']) ?: null,
            'perfect_for'               => trim($form['perfect_for']) ?: null,
            'faq'                       => $faqJson,
            'internal_links'            => trim($form['internal_links']) ?: null,
            'social_description'        => trim($form['social_description']) ?: null,
            'og_description'            => trim($form['og_description']) ?: null,
            'twitter_description'       => trim($form['twitter_description']) ?: null,
        ];

        // Build named-placeholder params (backtick `condition` — reserved word)
        $namedParams = [];
        foreach ($save as $k => $v) { $namedParams[':' . $k] = $v; }
        $namedParams[':amenities'] = $amenitiesJson;

        $setClauses = array_map(
            fn($c) => ($c === 'condition' ? '`condition`' : "`$c`") . ' = :' . $c,
            array_keys($save)
        );
        $setClauses[] = '`amenities` = CAST(:amenities AS JSON)';

        try {
            if ($id > 0) {
                $sql = 'UPDATE listings SET ' . implode(', ', $setClauses) . ' WHERE id = :id';
                $namedParams[':id'] = $id;
                db()->prepare($sql)->execute($namedParams);
                flash('Listing updated.');
            } else {
                $colList = implode(', ', array_map(
                    fn($c) => $c === 'condition' ? '`condition`' : "`$c`",
                    array_keys($save)
                )) . ', `amenities`';
                $phList = implode(', ', array_map(fn($k) => ':' . $k, array_keys($save)))
                    . ', CAST(:amenities AS JSON)';
                db()->prepare("INSERT INTO listings ($colList) VALUES ($phList)")
                    ->execute($namedParams);
                $id = (int)db()->lastInsertId();
                flash('Listing created — now add your property images below.');
            }
            header("Location: /listing-edit.php?id=$id");
            exit;
        } catch (PDOException $ex) {
            $errors[] = (int)$ex->errorInfo[1] === 1062
                ? 'That slug is already in use on another listing.'
                : 'Database error: ' . $ex->getMessage();
        }
    }
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

function star_select(string $name, mixed $val): string {
    $cur = ($val !== '' && $val !== null) ? (int)$val : 0;
    $n   = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $html = "<select name=\"$n\" style=\"font-size:15px;letter-spacing:1px\">"
          . "<option value=\"\">— not set —</option>";
    $labels = ['★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'];
    for ($i = 1; $i <= 5; $i++) {
        $sel   = $cur === $i ? ' selected' : '';
        $html .= "<option value=\"$i\"$sel>{$labels[$i-1]}</option>";
    }
    return $html . '</select>';
}

render_header($id ? 'Edit listing' : 'New listing');
?>

<div class="page-header">
    <div>
        <div class="page-title"><?= $id ? 'Edit listing' : 'New listing' ?></div>
        <?php if ($id): ?>
            <div class="page-count">ID #<?= $id ?> · <a href="/" style="color:var(--muted);font-size:13px">← Back to listings</a></div>
        <?php endif; ?>
    </div>
    <?php if ($id): ?>
        <span class="badge badge-<?= e($form['status']) ?>" style="font-size:13px;padding:5px 12px"><?= e($form['status']) ?></span>
    <?php endif; ?>
</div>

<?php if ($errors): ?>
    <div class="error-card">
        <strong>Could not save:</strong>
        <ul><?php foreach ($errors as $err): ?><li><?= e($err) ?></li><?php endforeach; ?></ul>
    </div>
<?php endif; ?>

<form method="post" id="listing-form">
<?= csrf_field() ?>

<!-- ══════════════════════════════════════════════════════════════════
     1. LISTING DETAILS
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">Listing Details</h2>

    <label>Title
        <input type="text" name="title" value="<?= e($form['title']) ?>" required
               placeholder="e.g. Luxury 2-Bedroom Maisonette for Sale in Lekki, Lagos">
    </label>

    <label>Slug
        <span class="hint">Leave blank to auto-derive from title</span>
        <input type="text" name="slug" value="<?= e($form['slug']) ?>"
               pattern="[a-z0-9-]{2,191}"
               placeholder="e.g. luxury-2-bedroom-maisonette-lekki-lagos">
    </label>

    <div class="form-row">
        <label>City <input type="text" name="city" value="<?= e($form['city']) ?>" required placeholder="Lagos"></label>
        <label>Country <input type="text" name="country" value="<?= e($form['country']) ?>" required></label>
    </div>

    <div class="form-row">
        <label>Property type
            <input type="text" name="property_type" value="<?= e($form['property_type']) ?>"
                   list="property-types" placeholder="e.g. Detached Duplex, Penthouse, Maisonette">
            <datalist id="property-types">
                <option value="Detached Duplex"><option value="Semi-Detached Duplex">
                <option value="Terraced House"><option value="Bungalow">
                <option value="Villa"><option value="Penthouse">
                <option value="Apartment"><option value="Mansion">
                <option value="Maisonette"><option value="Land">
                <option value="Commercial"><option value="Short-Let">
            </datalist>
        </label>
        <label>Category
            <input type="text" name="category" value="<?= e($form['category']) ?>"
                   list="categories" placeholder="e.g. Luxury Residential">
            <datalist id="categories">
                <option value="Luxury Residential"><option value="Mid-Range Residential">
                <option value="Affordable Housing"><option value="Commercial">
                <option value="Short-Let"><option value="Land"><option value="Mixed Use">
            </datalist>
        </label>
    </div>

    <div class="form-row">
        <label>Condition
            <input type="text" name="condition" value="<?= e($form['condition']) ?>"
                   list="conditions" placeholder="e.g. Newly Built">
            <datalist id="conditions">
                <option value="Newly Built"><option value="Off-Plan">
                <option value="Refurbished"><option value="Old / Used">
            </datalist>
        </label>
        <label>Property title / Documentation
            <input type="text" name="title_type" value="<?= e($form['title_type']) ?>"
                   list="title-types" placeholder="e.g. Certificate of Occupancy">
            <datalist id="title-types">
                <option value="Certificate of Occupancy (C of O)">
                <option value="Governor's Consent">
                <option value="Registered Survey">
                <option value="Deed of Assignment">
                <option value="Right of Occupancy">
                <option value="Verified Documentation">
            </datalist>
        </label>
    </div>

    <div class="form-row">
        <label>Price (₦) <input type="number" name="price_ngn" value="<?= e($form['price_ngn']) ?>" min="0" required placeholder="250000000"></label>
        <label>Area (sqm) <input type="number" name="sqm" value="<?= e($form['sqm']) ?>" min="0"></label>
    </div>

    <div class="form-row" style="grid-template-columns:1fr 1fr 1fr 1.6fr">
        <label>Bedrooms  <input type="number" name="bedrooms"  value="<?= e($form['bedrooms'])  ?>" min="0" max="30"></label>
        <label>Bathrooms <input type="number" name="bathrooms" value="<?= e($form['bathrooms']) ?>" min="0" max="30"></label>
        <label>Toilets   <input type="number" name="toilets"   value="<?= e($form['toilets'])   ?>" min="0" max="30"></label>
        <label>Status
            <select name="status">
                <?php foreach (['available','pending','sold','off_market'] as $s): ?>
                    <option value="<?= $s ?>" <?= $form['status']===$s?'selected':'' ?>><?= ucfirst(str_replace('_',' ',$s)) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>

    <label>Parking
        <input type="text" name="parking" value="<?= e($form['parking']) ?>"
               placeholder="e.g. Multiple Parking Spaces, 2-Car Garage">
    </label>

    <label>Virtual tour URL
        <input type="text" name="virtual_tour_url" value="<?= e($form['virtual_tour_url']) ?>" placeholder="https://...">
    </label>

    <div style="display:flex;gap:28px;margin-top:12px">
        <label class="check-label">
            <input type="checkbox" name="featured" <?= $form['featured']?'checked':'' ?>>
            Featured on homepage
        </label>
        <label class="check-label">
            <input type="checkbox" name="just_listed" <?= $form['just_listed']?'checked':'' ?>>
            Show "Just Listed" badge
        </label>
    </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     2. DESCRIPTION
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">Description</h2>

    <label>Excerpt
        <span class="hint">One sentence shown on listing cards and search snippets</span>
        <textarea name="excerpt" rows="3"><?= e($form['excerpt']) ?></textarea>
    </label>

    <label>Property description
        <span class="hint">Full listing description — HTML tags allowed</span>
        <textarea name="description" rows="12"><?= e($form['description']) ?></textarea>
    </label>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     3. FEATURES & LIFESTYLE
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">Features & Lifestyle</h2>

    <label>Property features / Amenities
        <span class="hint">Comma-separated — e.g. Pool, Solar backup, Fitted kitchen, 24-hour security</span>
        <input type="text" name="amenities_csv" value="<?= e($form['amenities_csv']) ?>">
    </label>

    <label>Perfect for
        <span class="hint">One per line — e.g. Young Professionals, Diaspora Buyers, Airbnb Investors</span>
        <textarea name="perfect_for" rows="6"><?= e($form['perfect_for']) ?></textarea>
    </label>

    <label>Lifestyle benefits / Nearby locations
        <span class="hint">One per line — e.g. Lekki Phase 1, The Palms Shopping Mall, Circle Mall</span>
        <textarea name="lifestyle_benefits" rows="8"><?= e($form['lifestyle_benefits']) ?></textarea>
    </label>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     4. SEO SETTINGS
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">SEO Settings</h2>

    <label>SEO Title
        <span class="hint">Target 50–60 characters &nbsp;·&nbsp; <span id="seo-title-count" style="font-weight:700">0</span> / 60</span>
        <input type="text" id="seo-title" name="seo_title"
               value="<?= e($form['seo_title']) ?>" maxlength="255"
               placeholder="e.g. Luxury 2 Bedroom Maisonette for Sale in Lekki | KGL Realty Pro">
    </label>

    <label>Meta Description
        <span class="hint">Target 140–160 characters &nbsp;·&nbsp; <span id="meta-desc-count" style="font-weight:700">0</span> / 160</span>
        <textarea id="meta-desc" name="meta_description" rows="3" maxlength="500"
                  placeholder="e.g. Discover this luxury 2-bedroom maisonette in Lekki, Lagos priced below market value at ₦250M..."><?= e($form['meta_description']) ?></textarea>
    </label>

    <label>Primary keyword
        <input type="text" name="primary_keyword" value="<?= e($form['primary_keyword']) ?>"
               placeholder="e.g. Luxury 2 Bedroom Maisonette for Sale in Lekki">
    </label>

    <div class="form-row">
        <label>Secondary keywords
            <span class="hint">One per line</span>
            <textarea name="secondary_keywords" rows="7"><?= e($form['secondary_keywords']) ?></textarea>
        </label>
        <label>Low competition keywords
            <span class="hint">One per line</span>
            <textarea name="low_competition_keywords" rows="7"><?= e($form['low_competition_keywords']) ?></textarea>
        </label>
    </div>

    <div class="form-row">
        <label>Long-tail keywords
            <span class="hint">One per line</span>
            <textarea name="long_tail_keywords" rows="6"><?= e($form['long_tail_keywords']) ?></textarea>
        </label>
        <label>Buyer intent keywords
            <span class="hint">One per line</span>
            <textarea name="buyer_intent_keywords" rows="6"><?= e($form['buyer_intent_keywords']) ?></textarea>
        </label>
    </div>

    <label>Internal linking suggestions
        <span class="hint">One per line — related pages on kglrealtypro.com to link to from this listing</span>
        <textarea name="internal_links" rows="5"><?= e($form['internal_links']) ?></textarea>
    </label>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     5. INVESTMENT ANALYSIS
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">Investment Analysis</h2>
    <p style="font-size:13px;color:var(--muted);margin:0 0 18px">Star ratings and outlook shown on the listing page to help buyers assess investment potential.</p>

    <h3 style="font-size:13px;font-weight:700;color:var(--muted);margin:0 0 12px;text-transform:uppercase;letter-spacing:.5px">Ratings</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <?php foreach ([
            'inv_capital_appreciation' => 'Capital Appreciation',
            'inv_rental_demand'        => 'Rental Demand',
            'inv_shortlet_potential'   => 'Short-let Potential',
            'inv_accessibility'        => 'Accessibility',
            'inv_liquidity'            => 'Liquidity',
            'inv_luxury_appeal'        => 'Luxury Appeal',
            'inv_family_friendly'      => 'Family Friendly',
            'inv_roi'                  => 'Return on Investment',
        ] as $key => $label): ?>
            <label><?= e($label) ?> <?= star_select($key, $form[$key]) ?></label>
        <?php endforeach; ?>
    </div>

    <h3 style="font-size:13px;font-weight:700;color:var(--muted);margin:24px 0 12px;text-transform:uppercase;letter-spacing:.5px">Investment Outlook</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <?php foreach ([
            'inv_capital_growth'        => ['Expected Capital Growth',  'High, Medium, Low'],
            'inv_rental_demand_outlook' => ['Rental Demand',            'Very High, High, Medium, Low'],
            'inv_shortlet_demand'       => ['Short-let Demand',         'Excellent, Good, Moderate'],
            'inv_future_appreciation'   => ['Future Appreciation',      'Strong, Moderate, Stable'],
            'inv_recommendation'        => ['Investor Recommendation',  'Highly Recommended, Recommended, Neutral'],
        ] as $key => [$label, $ph]): ?>
            <label><?= e($label) ?>
                <input type="text" name="<?= e($key) ?>" value="<?= e($form[$key]) ?>" placeholder="<?= e($ph) ?>">
            </label>
        <?php endforeach; ?>
    </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     6. SOCIAL MEDIA
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">Social Media</h2>

    <label>Facebook / Instagram description
        <span class="hint">Used when scheduling social posts for this listing</span>
        <textarea name="social_description" rows="4"><?= e($form['social_description']) ?></textarea>
    </label>

    <label>Open Graph description
        <span class="hint">Shown when this page is shared as a link — aim for under 200 characters</span>
        <textarea name="og_description" rows="3"><?= e($form['og_description']) ?></textarea>
    </label>

    <label>Twitter / X description
        <span class="hint">Max ~280 characters</span>
        <input type="text" name="twitter_description" value="<?= e($form['twitter_description']) ?>"
               maxlength="500"
               placeholder="e.g. Luxury 2-bedroom maisonette in Lekki for ₦250M. Below market price...">
    </label>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     7. FAQ
     ══════════════════════════════════════════════════════════════════ -->
<div class="card">
    <h2 class="section-heading">FAQ</h2>
    <p style="font-size:13px;color:var(--muted);margin:0 0 16px">Shown on the listing page. Add questions buyers typically ask about this property.</p>

    <div id="faq-container">
        <?php foreach ($faqPairs as $i => $pair): ?>
            <div class="faq-pair" style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                    <strong style="font-size:12px;color:var(--muted)">FAQ #<?= $i + 1 ?></strong>
                    <button type="button" onclick="this.closest('.faq-pair').remove()" class="btn btn-sm btn-danger">Remove</button>
                </div>
                <label>Question
                    <input type="text" name="faq_q[]" value="<?= e($pair['q']) ?>"
                           placeholder="e.g. Is the property available for immediate purchase?">
                </label>
                <label style="margin-top:10px">Answer
                    <textarea name="faq_a[]" rows="3" placeholder="Answer..."><?= e($pair['a']) ?></textarea>
                </label>
            </div>
        <?php endforeach; ?>
    </div>

    <button type="button" onclick="addFaq()" class="btn" style="margin-top:4px">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Add FAQ
    </button>
</div>

<!-- Save bar -->
<div class="card" style="display:flex;align-items:center;gap:12px">
    <button class="btn btn-primary" type="submit"><?= $id ? 'Save changes' : 'Save & add images →' ?></button>
    <a class="btn" href="/">Cancel</a>
</div>

</form>

<!-- ══════════════════════════════════════════════════════════════════
     8. IMAGES  (only after listing is saved)
     ══════════════════════════════════════════════════════════════════ -->
<?php if ($id > 0):
    $imgs = db()->prepare(
        'SELECT id, url, alt, caption, position FROM listing_images WHERE listing_id = ? ORDER BY position ASC'
    );
    $imgs->execute([$id]);
    $images = $imgs->fetchAll();
?>

<h2 id="images" style="font-size:17px;font-weight:700;margin:32px 0 12px">Property Images</h2>

<div class="card">
    <p style="font-size:13px;color:var(--muted);margin-bottom:16px">
        Upload photos directly or paste an external URL. You can select multiple files at once.
        First image added becomes the cover photo.
    </p>

    <form method="post" action="/listing-image-add.php" enctype="multipart/form-data">
        <?= csrf_field() ?>
        <input type="hidden" name="listing_id" value="<?= (int)$id ?>">

        <div style="display:flex;gap:0;margin-bottom:14px;border:1px solid var(--border);border-radius:8px;overflow:hidden;width:fit-content">
            <button type="button" id="tab-upload" onclick="switchTab('upload')"
                style="padding:7px 18px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:var(--primary);color:#fff">
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
                <span class="hint">JPEG, PNG, WebP or GIF · max 8 MB each · hold Ctrl/⌘ to select multiple</span>
            </label>
            <input type="file" name="images[]" multiple
                   accept="image/jpeg,image/png,image/webp,image/gif"
                   style="display:block;font-size:13px;margin-bottom:10px">
        </div>

        <div id="panel-url" style="display:none">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">Image URL</label>
            <input type="text" name="url" placeholder="https://example.com/photo.jpg" style="margin-bottom:10px">
        </div>

        <div class="form-row">
            <label>Alt text
                <span class="hint">Describes the photo — important for SEO</span>
                <input type="text" name="alt" placeholder="e.g. Luxury living room in 2-bedroom maisonette Lekki Lagos">
            </label>
            <label>Caption
                <span class="hint">Optional — shown below photo in gallery</span>
                <input type="text" name="caption" placeholder="e.g. Open-plan living area in Lekki maisonette">
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
                        <div style="font-size:11px;font-weight:600;color:var(--primary);margin-bottom:4px">
                            #<?= $i+1 ?><?= $i===0 ? ' · Cover' : '' ?>
                        </div>
                        <?php if (!empty($img['alt'])): ?>
                            <div style="font-size:11px;color:var(--text);margin-bottom:2px;line-height:1.4"><?= e($img['alt']) ?></div>
                        <?php endif; ?>
                        <?php if (!empty($img['caption'])): ?>
                            <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:6px"><?= e($img['caption']) ?></div>
                        <?php endif; ?>
                        <form method="post" action="/listing-image-delete.php"
                              onsubmit="return confirm('Delete this image?')"
                              style="margin-top:8px">
                            <?= csrf_field() ?>
                            <input type="hidden" name="id" value="<?= (int)$img['id'] ?>">
                            <input type="hidden" name="listing_id" value="<?= (int)$id ?>">
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
/* ── Character counters ───────────────────────────────────────────── */
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

/* ── FAQ add ─────────────────────────────────────────────────────── */
let faqIdx = <?= count($faqPairs) ?>;
function addFaq() {
    faqIdx++;
    const div = document.createElement('div');
    div.className = 'faq-pair';
    div.style.cssText = 'background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:12px';
    div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <strong style="font-size:12px;color:var(--muted)">FAQ #${faqIdx}</strong>
            <button type="button" onclick="this.closest('.faq-pair').remove()" class="btn btn-sm btn-danger">Remove</button>
        </div>
        <label style="display:block">Question
            <input type="text" name="faq_q[]" placeholder="e.g. Is the property available for immediate purchase?" style="margin-top:4px">
        </label>
        <label style="display:block;margin-top:10px">Answer
            <textarea name="faq_a[]" rows="3" placeholder="Answer..." style="margin-top:4px"></textarea>
        </label>`;
    document.getElementById('faq-container').appendChild(div);
}

/* ── Image tab toggle ────────────────────────────────────────────── */
function switchTab(t) {
    document.getElementById('panel-upload').style.display = t === 'upload' ? '' : 'none';
    document.getElementById('panel-url').style.display    = t === 'url'    ? '' : 'none';
    document.getElementById('tab-upload').style.background = t === 'upload' ? 'var(--primary)' : 'transparent';
    document.getElementById('tab-upload').style.color      = t === 'upload' ? '#fff' : 'var(--muted)';
    document.getElementById('tab-url').style.background    = t === 'url'    ? 'var(--primary)' : 'transparent';
    document.getElementById('tab-url').style.color         = t === 'url'    ? '#fff' : 'var(--muted)';
}
</script>
