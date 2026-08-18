<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

$id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$errors = [];

$form = [
    // Core content
    'slug'                    => '',
    'title'                   => '',
    'excerpt'                 => '',
    'content'                 => '',
    'author_name'             => 'KGL Research Desk',
    'featured_image_url'      => '',
    'featured_image_alt'      => '',
    'categories_csv'          => 'Market analysis',
    // SEO — core
    'seo_title'               => '',
    'meta_description'        => '',
    'focus_keyword'           => '',
    'og_image_url'            => '',
    // SEO — keywords
    'secondary_keywords'      => '',
    'long_tail_keywords'      => '',
    'low_competition_keywords'=> '',
    'buyer_intent_keywords'   => '',
    'internal_links'          => '',
    // SEO — social
    'social_title'            => '',
    'social_description'      => '',
    // SEO — technical
    'canonical_url'           => '',
    'robots_meta'             => 'index,follow',
    'schema_type'             => 'BlogPosting',
];

$images = [];

if ($id > 0) {
    $stmt = db()->prepare('SELECT * FROM posts WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { http_response_code(404); exit('Post not found.'); }

    $cats = json_decode($row['categories'] ?: '[]', true) ?: [];
    $form = [
        'slug'                    => $row['slug'],
        'title'                   => $row['title'],
        'excerpt'                 => $row['excerpt'],
        'content'                 => $row['content'],
        'author_name'             => $row['author_name'],
        'featured_image_url'      => $row['featured_image_url']       ?? '',
        'featured_image_alt'      => $row['featured_image_alt']       ?? '',
        'categories_csv'          => implode(', ', $cats),
        'seo_title'               => $row['seo_title']                ?? '',
        'meta_description'        => $row['meta_description']         ?? '',
        'focus_keyword'           => $row['focus_keyword']            ?? '',
        'og_image_url'            => $row['og_image_url']             ?? '',
        'secondary_keywords'      => $row['secondary_keywords']       ?? '',
        'long_tail_keywords'      => $row['long_tail_keywords']       ?? '',
        'low_competition_keywords'=> $row['low_competition_keywords'] ?? '',
        'buyer_intent_keywords'   => $row['buyer_intent_keywords']    ?? '',
        'internal_links'          => $row['internal_links']           ?? '',
        'social_title'            => $row['social_title']             ?? '',
        'social_description'      => $row['social_description']       ?? '',
        'canonical_url'           => $row['canonical_url']            ?? '',
        'robots_meta'             => $row['robots_meta']              ?? 'index,follow',
        'schema_type'             => $row['schema_type']              ?? 'BlogPosting',
    ];

    $imgStmt = db()->prepare(
        'SELECT id, url, alt, caption FROM post_images WHERE post_id = ? ORDER BY position ASC'
    );
    $imgStmt->execute([$id]);
    $images = $imgStmt->fetchAll();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    foreach (array_keys($form) as $k) {
        $form[$k] = $_POST[$k] ?? $form[$k];
    }

    $title = trim((string)$form['title']);
    $slug  = slugify_post($form['slug'] !== '' ? $form['slug'] : $title);

    if (!preg_match('/^[a-z0-9-]{2,191}$/', $slug))   $errors[] = 'Slug must be 2–191 lowercase letters, digits, or hyphens.';
    if ($title === '')                                   $errors[] = 'Title is required.';
    if (trim((string)$form['excerpt']) === '')           $errors[] = 'Article summary (Excerpt) is required.';
    if (trim(strip_tags((string)$form['content'])) === '') $errors[] = 'Article content cannot be empty.';

    $categories = array_values(array_filter(array_map(
        fn($s) => trim($s),
        explode(',', (string)$form['categories_csv'])
    )));
    $cats_json = json_encode($categories, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    // Featured image — file upload overrides URL
    $image_url    = trim((string)$form['featured_image_url']) ?: null;
    $uploadedFile = $_FILES['featured_image_file'] ?? null;

    if ($uploadedFile && isset($uploadedFile['error']) && $uploadedFile['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            $phpErrMsgs = [
                UPLOAD_ERR_INI_SIZE   => 'exceeds server upload limit',
                UPLOAD_ERR_FORM_SIZE  => 'exceeds form size limit',
                UPLOAD_ERR_PARTIAL    => 'was only partially uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'server temp directory missing',
                UPLOAD_ERR_CANT_WRITE => 'server could not write file',
            ];
            $errors[] = 'Image upload failed: ' . ($phpErrMsgs[$uploadedFile['error']] ?? 'unknown error');
        } elseif ($uploadedFile['size'] > 8 * 1024 * 1024) {
            $errors[] = 'Cover image must be under 8 MB.';
        } else {
            $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
            $mime    = (new finfo(FILEINFO_MIME_TYPE))->file($uploadedFile['tmp_name']);
            if (!array_key_exists($mime, $allowed)) {
                $errors[] = 'Only JPEG, PNG, WebP or GIF accepted for the cover image.';
            } else {
                $uploadDir = __DIR__ . '/uploads/';
                $scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $baseUrl   = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/uploads/';
                if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
                    $errors[] = 'Could not create uploads/ directory — check cPanel permissions.';
                } else {
                    $filename = uniqid('blog-', true) . '.' . $allowed[$mime];
                    if (!move_uploaded_file($uploadedFile['tmp_name'], $uploadDir . $filename)) {
                        $errors[] = 'Could not save image — check uploads/ folder permissions.';
                    } else {
                        $image_url                  = $baseUrl . $filename;
                        $form['featured_image_url'] = $image_url;
                    }
                }
            }
        }
    }

    if (!$errors) {
        $null = fn($v) => trim((string)$v) !== '' ? trim((string)$v) : null;

        try {
            if ($id > 0) {
                db()->prepare(
                    'UPDATE posts SET
                       slug=?, title=?, excerpt=?, content=?,
                       author_name=?, featured_image_url=?, featured_image_alt=?, categories=CAST(? AS JSON),
                       seo_title=?, meta_description=?, focus_keyword=?, og_image_url=?,
                       secondary_keywords=?, long_tail_keywords=?, low_competition_keywords=?,
                       buyer_intent_keywords=?, internal_links=?,
                       social_title=?, social_description=?,
                       canonical_url=?, robots_meta=?, schema_type=?
                     WHERE id=?'
                )->execute([
                    $slug, $title, $form['excerpt'], $form['content'],
                    $form['author_name'], $image_url, $null($form['featured_image_alt']), $cats_json,
                    $null($form['seo_title']), $null($form['meta_description']), $null($form['focus_keyword']), $null($form['og_image_url']),
                    $null($form['secondary_keywords']), $null($form['long_tail_keywords']), $null($form['low_competition_keywords']),
                    $null($form['buyer_intent_keywords']), $null($form['internal_links']),
                    $null($form['social_title']), $null($form['social_description']),
                    $null($form['canonical_url']), $form['robots_meta'], $form['schema_type'],
                    $id,
                ]);
                flash('Post updated.');
            } else {
                db()->prepare(
                    'INSERT INTO posts
                       (slug, title, excerpt, content, author_name, featured_image_url, featured_image_alt, categories,
                        seo_title, meta_description, focus_keyword, og_image_url,
                        secondary_keywords, long_tail_keywords, low_competition_keywords,
                        buyer_intent_keywords, internal_links,
                        social_title, social_description,
                        canonical_url, robots_meta, schema_type)
                     VALUES (?,?,?,?,?,?,?,CAST(? AS JSON),?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                )->execute([
                    $slug, $title, $form['excerpt'], $form['content'],
                    $form['author_name'], $image_url, $null($form['featured_image_alt']), $cats_json,
                    $null($form['seo_title']), $null($form['meta_description']), $null($form['focus_keyword']), $null($form['og_image_url']),
                    $null($form['secondary_keywords']), $null($form['long_tail_keywords']), $null($form['low_competition_keywords']),
                    $null($form['buyer_intent_keywords']), $null($form['internal_links']),
                    $null($form['social_title']), $null($form['social_description']),
                    $null($form['canonical_url']), $form['robots_meta'], $form['schema_type'],
                ]);
                $id = (int)db()->lastInsertId();
                flash('Post published.');
            }
            header("Location: /post-edit.php?id=$id");
            exit;
        } catch (PDOException $ex) {
            if ((int)$ex->errorInfo[1] === 1062) {
                $errors[] = 'That URL slug is already used by another post.';
            } else {
                $errors[] = 'Database error: ' . $ex->getMessage();
            }
        }
    }
}

function slugify_post(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

render_header($id ? 'Edit Post' : 'New Post');
?>

<!-- Quill rich text editor (free, no API key) -->
<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
<style>
/* ── Post editor overrides ─────────────────────────────── */
.ql-toolbar.ql-snow { border-radius: 8px 8px 0 0; border-color: var(--border); background: var(--surface-2); }
.ql-container.ql-snow { border-radius: 0 0 8px 8px; border-color: var(--border); font-family: inherit; font-size: 15px; min-height: 380px; }
.ql-editor { min-height: 360px; line-height: 1.8; color: var(--text); }
.ql-editor p { margin-bottom: 1em; }
.ql-editor h1,.ql-editor h2,.ql-editor h3 { font-family: 'DM Serif Display', serif; color: var(--navy); margin: 1.4em 0 .5em; }
.ql-editor img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
.ql-editor blockquote { border-left: 4px solid var(--gold); padding-left: 16px; color: var(--muted); font-style: italic; margin: 16px 0; }

/* ── Tip boxes ─────────────────────────────────────────── */
.tip-box { display:flex; gap:10px; background: rgba(201,168,76,.08); border:1px solid rgba(201,168,76,.3); border-radius:8px; padding:12px 14px; font-size:12.5px; color:var(--text-2); margin-bottom:16px; }
.tip-icon { font-size:16px; flex-shrink:0; margin-top:1px; }

/* ── Tooltip ───────────────────────────────────────────── */
.tt { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:var(--border); color:var(--muted); font-size:10px; font-weight:700; cursor:help; margin-left:4px; vertical-align:middle; position:relative; }
.tt:hover::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%); background:#0f172a; color:#fff; font-size:11px; font-weight:400; line-height:1.4; white-space:normal; width:220px; padding:7px 10px; border-radius:6px; z-index:999; pointer-events:none; }
.tt:hover::before { content:''; position:absolute; bottom:calc(100% + 1px); left:50%; transform:translateX(-50%); border:5px solid transparent; border-top-color:#0f172a; z-index:999; }

/* ── SEO score ─────────────────────────────────────────── */
.seo-score-wrap { display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:start; margin-bottom:24px; padding:18px 20px; background:var(--surface-2); border:1px solid var(--border); border-radius:var(--radius); }
.score-circle { width:72px; height:72px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:700; border:4px solid currentColor; flex-shrink:0; }
.score-num { font-size:26px; line-height:1; }
.score-lbl { font-size:9px; text-transform:uppercase; letter-spacing:.07em; }
.score-checks { display:grid; grid-template-columns:1fr 1fr; gap:5px 16px; }
.sc-item { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-2); }
.sc-ok  { color:var(--success); }
.sc-fail{ color:var(--muted); }

/* ── SERP preview ──────────────────────────────────────── */
.serp-preview { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px 18px; }
.serp-url   { font-size:13px; color:#1a6129; margin-bottom:3px; }
.serp-title { font-size:17px; color:#1a0dab; font-weight:500; line-height:1.3; margin-bottom:4px; }
.serp-desc  { font-size:13.5px; color:#545454; line-height:1.5; }

/* ── Social preview ────────────────────────────────────── */
.social-card { border:1px solid #dde0e5; border-radius:8px; overflow:hidden; max-width:480px; }
.social-card-img { width:100%; height:160px; object-fit:cover; background:var(--surface-2); display:flex; align-items:center; justify-content:center; }
.social-card-body { padding:10px 14px 14px; background:#f0f2f5; }
.social-card-domain { font-size:11px; color:#65676b; text-transform:uppercase; margin-bottom:2px; }
.social-card-title  { font-size:14px; font-weight:700; color:#050505; line-height:1.3; margin-bottom:4px; max-height:2.6em; overflow:hidden; }
.social-card-desc   { font-size:13px; color:#65676b; line-height:1.4; max-height:2.8em; overflow:hidden; }

/* ── Char counter colours ──────────────────────────────── */
.cnt-good   { color:var(--success); font-weight:700; }
.cnt-warn   { color:var(--warning); font-weight:700; }
.cnt-danger { color:var(--danger);  font-weight:700; }

/* ── Section heading ───────────────────────────────────── */
.sec-head { font-size:11.5px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; margin:0 0 6px; }

/* ── Cover drop zone ───────────────────────────────────── */
.drop-zone { border:2px dashed var(--border); border-radius:var(--radius); padding:28px; text-align:center; cursor:pointer; transition:border-color var(--transition),background var(--transition); }
.drop-zone:hover,.drop-zone.dragover { border-color:var(--navy); background:rgba(11,30,61,.03); }
.drop-zone-icon { font-size:32px; margin-bottom:8px; }

/* ── details/summary card ──────────────────────────────── */
details.card summary { cursor:pointer; list-style:none; display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:var(--navy); }
details.card summary::after { content:'›'; margin-left:auto; font-size:18px; line-height:1; transition:transform 200ms; }
details.card[open] summary::after { transform:rotate(90deg); }
details.card > *:not(summary) { margin-top:18px; }

@media(max-width:640px) {
    .seo-score-wrap { grid-template-columns:1fr; }
    .score-checks { grid-template-columns:1fr; }
}
</style>

<div class="page-header">
    <div>
        <div class="page-title"><?= $id ? 'Edit Article' : 'Write New Article' ?></div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">
            Fill in each section below — required fields are marked <span style="color:var(--danger)">*</span>
        </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
        <a href="/posts.php" class="btn">← All articles</a>
        <?php if ($id): ?>
        <form method="post" action="/post-delete.php" style="display:contents"
              onsubmit="return confirm('Permanently delete this article and all its images?')">
            <?= csrf_field() ?>
            <input type="hidden" name="id" value="<?= $id ?>">
            <button class="btn btn-danger" type="submit">Delete</button>
        </form>
        <?php endif; ?>
    </div>
</div>

<?php if ($errors): ?>
<div class="error-card">
    <strong>Could not save — please fix these:</strong>
    <ul style="margin:8px 0 0 18px">
        <?php foreach ($errors as $e): ?><li><?= e($e) ?></li><?php endforeach; ?>
    </ul>
</div>
<?php endif; ?>

<form id="post-form" method="post" enctype="multipart/form-data">
<?= csrf_field() ?>

<!-- ══════════════════════════════════════════════════════
     SECTION 1 — ARTICLE BASICS
     ══════════════════════════════════════════════════════ -->
<div class="card">
    <p class="sec-head">① Article basics</p>

    <label style="margin-top:0">
        Article title <span style="color:var(--danger)">*</span>
        <span class="hint">Write a clear, compelling title — readers and Google both judge by it</span>
        <input type="text" name="title" id="field-title"
               value="<?= e($form['title']) ?>" required
               placeholder="e.g. Why Lekki Phase 1 Will Outperform Every Other Lagos District in 2026"
               style="font-size:16px;font-weight:600;padding:11px 14px"
               oninput="onTitleInput(this.value)">
    </label>

    <div class="form-row" style="margin-top:4px">
        <label>Author
            <input type="text" name="author_name" value="<?= e($form['author_name']) ?>" required>
        </label>
        <label>Categories
            <span class="hint">Comma-separated — e.g. Market analysis, Lagos, Investment</span>
            <input type="text" name="categories_csv" value="<?= e($form['categories_csv']) ?>"
                   placeholder="Market analysis, Dubai, Investment">
        </label>
    </div>
</div>

<!-- ══════════════════════════════════════════════════════
     SECTION 2 — COVER IMAGE
     ══════════════════════════════════════════════════════ -->
<div class="card">
    <p class="sec-head">② Cover photo</p>
    <div class="tip-box">
        <span class="tip-icon">💡</span>
        <span>Use a <strong>landscape photo</strong> (at least 1200×630 px). This image appears at the top of your article and whenever it's shared on WhatsApp, Facebook, or LinkedIn.</span>
    </div>

    <!-- Drop zone -->
    <div class="drop-zone" id="drop-zone" onclick="document.getElementById('cover-file-input').click()"
         ondragover="event.preventDefault();this.classList.add('dragover')"
         ondragleave="this.classList.remove('dragover')"
         ondrop="handleDrop(event)">
        <div id="drop-zone-inner">
            <div class="drop-zone-icon">🖼️</div>
            <div style="font-size:14px;font-weight:600;color:var(--text-2);margin-bottom:4px">
                Click to choose a photo, or drag one here
            </div>
            <div style="font-size:12px;color:var(--muted)">JPEG, PNG, WebP or GIF · max 8 MB</div>
        </div>
        <input type="file" name="featured_image_file" id="cover-file-input"
               accept="image/jpeg,image/png,image/webp,image/gif"
               style="display:none" onchange="onCoverFileSelected(this)">
    </div>

    <div id="cover-preview-wrap" style="<?= $form['featured_image_url'] ? '' : 'display:none' ?>;margin-top:12px">
        <div style="position:relative;display:inline-block">
            <img id="cover-preview" src="<?= e($form['featured_image_url']) ?>" alt=""
                 style="max-height:200px;max-width:100%;border-radius:8px;border:1px solid var(--border);object-fit:cover;display:block">
            <button type="button" onclick="removeCoverImage()"
                    style="position:absolute;top:6px;right:6px;background:#0009;color:#fff;border:none;border-radius:50%;
                           width:26px;height:26px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center"
                    title="Remove cover image">✕</button>
        </div>
    </div>

    <input type="hidden" name="featured_image_url" id="featured-image-url" value="<?= e($form['featured_image_url']) ?>">

    <label style="margin-top:14px">
        Photo description <span class="tt" data-tip="Describes the image for people using screen readers and helps Google understand it. Use 5–10 words.">?</span>
        <span class="hint">e.g. "Aerial view of Lekki Phase 1 shoreline at sunset"</span>
        <input type="text" name="featured_image_alt" value="<?= e($form['featured_image_alt']) ?>"
               id="field-img-alt"
               placeholder="Describe what's in the photo in plain words">
    </label>
</div>

<!-- ══════════════════════════════════════════════════════
     SECTION 3 — ARTICLE SUMMARY
     ══════════════════════════════════════════════════════ -->
<div class="card">
    <p class="sec-head">③ Article summary <span style="color:var(--danger)">*</span></p>
    <div class="tip-box">
        <span class="tip-icon">💡</span>
        <span>This short summary appears on the blog listing page and in Google search results. Write it as if you're telling someone what they'll learn from reading this article. <strong>Aim for 150–200 characters.</strong></span>
    </div>

    <label style="margin-top:0">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <span>Summary</span>
            <span style="font-size:12px"><span id="excerpt-count" class="cnt-good">0</span> / 200 characters</span>
        </div>
        <textarea name="excerpt" id="field-excerpt" rows="3"
                  oninput="countExcerpt()"
                  placeholder="Discover why Lekki Phase 1 is emerging as Lagos's top-performing property market in 2026, with average yields rising to 12% amid growing diaspora demand."><?= e($form['excerpt']) ?></textarea>
    </label>
</div>

<!-- ══════════════════════════════════════════════════════
     SECTION 4 — ARTICLE CONTENT (Quill WYSIWYG)
     ══════════════════════════════════════════════════════ -->
<div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <div>
            <p class="sec-head" style="margin:0">④ Article content <span style="color:var(--danger)">*</span></p>
            <span style="font-size:12px;color:var(--muted)">Use the toolbar to format headings, bold, lists, links and photos</span>
        </div>
        <div style="display:flex;gap:16px;font-size:12.5px;color:var(--muted)">
            <span>Words: <strong id="word-count" style="color:var(--text)">0</strong></span>
            <span>Read time: <strong id="read-time" style="color:var(--text)">—</strong></span>
        </div>
    </div>

    <!-- Quill attaches here -->
    <div id="quill-editor"></div>

    <!-- Hidden textarea carries the HTML to the server -->
    <textarea name="content" id="content-input" style="display:none"><?= e($form['content']) ?></textarea>

    <div style="margin-top:10px;padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;font-size:12px;color:var(--muted)">
        <strong>Tips:</strong> Use <strong>Heading 2</strong> for main sections, <strong>Heading 3</strong> for sub-sections. Include your focus keyword in at least one heading. Aim for <strong>600–1,500 words</strong> for best ranking results.
    </div>
</div>

<!-- ══════════════════════════════════════════════════════
     SECTION 5 — SEO CORE (always visible)
     ══════════════════════════════════════════════════════ -->
<div class="card">
    <p class="sec-head" style="margin-bottom:4px">⑤ SEO settings — help Google find this article</p>
    <p style="font-size:13px;color:var(--muted);margin:0 0 18px">Fill in this section carefully — it directly controls how this article ranks on Google and what people see in search results.</p>

    <!-- SEO Health Score -->
    <div class="seo-score-wrap" id="seo-score-wrap">
        <div class="score-circle" id="score-circle" style="color:var(--muted)">
            <span class="score-num" id="score-num">0</span>
            <span class="score-lbl">/ 10</span>
        </div>
        <div>
            <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:10px" id="score-label">Complete the fields below to improve your SEO score</div>
            <div class="score-checks" id="score-checks">
                <!-- populated by JS -->
            </div>
        </div>
    </div>

    <!-- Focus keyword — most important, first -->
    <label>
        Focus keyword <span style="color:var(--danger)">*</span>
        <span class="tt" data-tip="The main phrase you want this article to rank for on Google. Use it naturally throughout the article, in headings, and in your SEO title and description.">?</span>
        <span class="hint">The single most important phrase — e.g. "buy property in Lagos 2026" or "Lekki real estate investment"</span>
        <input type="text" name="focus_keyword" id="focus-keyword"
               value="<?= e($form['focus_keyword']) ?>"
               placeholder="e.g. Lekki Phase 1 property investment 2026"
               oninput="updateSeoScore()">
    </label>

    <div class="form-row" style="margin-top:4px">
        <label>
            Google search title (SEO Title)
            <span class="tt" data-tip="This is the blue link text that appears in Google search results. Keep it between 50–60 characters and include your focus keyword near the start.">?</span>
            <span class="hint" style="display:flex;justify-content:space-between">
                <span>50–60 characters is ideal</span>
                <span><span id="seo-title-count" class="cnt-good">0</span>&thinsp;/&thinsp;60</span>
            </span>
            <input type="text" name="seo_title" id="seo-title"
                   value="<?= e($form['seo_title']) ?>" maxlength="255"
                   placeholder="e.g. Lekki Phase 1 Property Guide 2026 | KGL Realty Pro"
                   oninput="countChars(this,'seo-title-count',60);updateSerp();updateSeoScore()">
        </label>

        <label>
            Slug (URL path)
            <span class="tt" data-tip="The part of the web address after /blog/. Keep it short and include your focus keyword. It's auto-generated from your title but you can customise it.">?</span>
            <span class="hint">kglrealtypro.com/blog/<strong id="slug-preview"><?= e($form['slug']) ?></strong></span>
            <input type="text" name="slug" id="field-slug"
                   value="<?= e($form['slug']) ?>"
                   pattern="[a-z0-9-]{2,191}"
                   placeholder="auto-generated from title"
                   oninput="slugEdited=true;document.getElementById('slug-preview').textContent=this.value;updateSerp()">
        </label>
    </div>

    <label style="margin-top:4px">
        Google search description (Meta Description)
        <span class="tt" data-tip="The short paragraph that appears under the blue link in Google. It should entice people to click. Include your focus keyword and keep it between 140–160 characters.">?</span>
        <span class="hint" style="display:flex;justify-content:space-between">
            <span>140–160 characters is ideal</span>
            <span><span id="meta-desc-count" class="cnt-good">0</span>&thinsp;/&thinsp;160</span>
        </span>
        <textarea name="meta_description" id="meta-desc" rows="3" maxlength="500"
                  oninput="countChars(this,'meta-desc-count',160);updateSerp();updateSeoScore()"
                  placeholder="Discover Lekki Phase 1's top property investment opportunities in 2026. KGL Realty Pro shows you why yields are rising and how to buy at the right price."><?= e($form['meta_description']) ?></textarea>
    </label>

    <!-- Live SERP preview -->
    <div style="margin-top:20px">
        <div class="sec-head" style="margin-bottom:8px">How it will look on Google</div>
        <div class="serp-preview">
            <div class="serp-url">kglrealtypro.com › blog › <span id="serp-slug"><?= e($form['slug']) ?></span></div>
            <div class="serp-title" id="serp-title"><?= e($form['seo_title'] ?: $form['title']) ?></div>
            <div class="serp-desc"  id="serp-desc"><?= e($form['meta_description'] ?: $form['excerpt']) ?></div>
        </div>
    </div>
</div>

<!-- ══════════════════════════════════════════════════════
     SECTION 6 — SEO KEYWORDS (collapsible)
     ══════════════════════════════════════════════════════ -->
<details class="card" <?= ($form['secondary_keywords'] || $form['long_tail_keywords'] || $form['low_competition_keywords'] || $form['buyer_intent_keywords']) ? 'open' : '' ?>>
    <summary>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" style="flex-shrink:0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
        </svg>
        Keyword research
        <span style="font-size:12px;font-weight:400;color:var(--muted)">&nbsp;— add more phrases Google should associate with this article</span>
    </summary>

    <div class="tip-box">
        <span class="tip-icon">🎯</span>
        <span>These keywords tell Google what topics your article covers. <strong>One keyword per line.</strong> You don't need to cram them into the article — just list them here and mention them naturally in the content where they fit.</span>
    </div>

    <div class="form-row">
        <label>
            Secondary keywords
            <span class="tt" data-tip="Closely related phrases to your focus keyword. Also known as LSI (Latent Semantic Indexing) keywords. E.g. if focus keyword is 'Lagos property investment', secondary could be 'Lagos real estate market', 'property prices Lagos'.">?</span>
            <span class="hint">Related phrases — one per line</span>
            <textarea name="secondary_keywords" rows="6"
                      placeholder="Lagos real estate market&#10;property investment Nigeria&#10;buy house Lagos"><?= e($form['secondary_keywords']) ?></textarea>
        </label>
        <label>
            Long-tail keywords
            <span class="tt" data-tip="Longer, more specific phrases that attract highly motivated readers. Easier to rank for and often convert better. E.g. 'how to buy property in Lekki Phase 1 as a diaspora buyer'.">?</span>
            <span class="hint">Longer, specific phrases — one per line</span>
            <textarea name="long_tail_keywords" rows="6"
                      placeholder="how to buy property in Lekki Phase 1&#10;best areas to invest in Lagos 2026&#10;property investment for Nigerian diaspora"><?= e($form['long_tail_keywords']) ?></textarea>
        </label>
    </div>

    <div class="form-row">
        <label>
            Low competition keywords
            <span class="tt" data-tip="Phrases that many people search for but few websites rank for. These are quick ranking wins. Usually very specific questions or location combinations.">?</span>
            <span class="hint">Quick-win phrases with less competition — one per line</span>
            <textarea name="low_competition_keywords" rows="5"
                      placeholder="property under 100 million Lagos&#10;2 bedroom flat Lekki 2026&#10;affordable luxury homes Ikoyi"><?= e($form['low_competition_keywords']) ?></textarea>
        </label>
        <label>
            Buyer intent keywords
            <span class="tt" data-tip="Phrases used by people who are ready to buy or enquire — not just browsing. These often include words like 'buy', 'price', 'for sale', 'cost', 'agent'.">?</span>
            <span class="hint">Phrases from people ready to act — one per line</span>
            <textarea name="buyer_intent_keywords" rows="5"
                      placeholder="buy 3 bedroom house Lekki&#10;property for sale Ikoyi price&#10;luxury apartment Lagos for sale"><?= e($form['buyer_intent_keywords']) ?></textarea>
        </label>
    </div>

    <label>
        Internal linking suggestions
        <span class="tt" data-tip="Links from this article to other pages on kglrealtypro.com strengthen SEO across the whole site. List the page URLs or titles you plan to link to from this article.">?</span>
        <span class="hint">Pages on kglrealtypro.com worth linking to from this article — one per line</span>
        <textarea name="internal_links" rows="4"
                  placeholder="/properties?city=Lagos — link phrase: 'browse Lagos properties'&#10;/investment — link phrase: 'investment opportunities'&#10;/agents — link phrase: 'speak to an agent'"><?= e($form['internal_links']) ?></textarea>
    </label>
</details>

<!-- ══════════════════════════════════════════════════════
     SECTION 7 — SOCIAL SHARING (collapsible)
     ══════════════════════════════════════════════════════ -->
<details class="card" <?= ($form['social_title'] || $form['social_description'] || $form['og_image_url']) ? 'open' : '' ?>>
    <summary>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" style="flex-shrink:0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/>
        </svg>
        Social media sharing
        <span style="font-size:12px;font-weight:400;color:var(--muted)">&nbsp;— control how this looks when shared on WhatsApp, Facebook & LinkedIn</span>
    </summary>

    <div class="tip-box">
        <span class="tip-icon">📱</span>
        <span>When someone shares this article, platforms like Facebook and WhatsApp show a preview card. You can customise the title and description here — or leave blank to use the article title and summary automatically.</span>
    </div>

    <div class="form-row">
        <label>
            Social title (optional)
            <span class="hint">Defaults to the article title if left blank</span>
            <input type="text" name="social_title" id="social-title"
                   value="<?= e($form['social_title']) ?>"
                   placeholder="Leave blank to use article title"
                   oninput="updateSocialPreview()">
        </label>
        <label>
            Social image URL (optional)
            <span class="hint">Defaults to cover photo if left blank · best size: 1200×630 px</span>
            <input type="text" name="og_image_url" id="og-image-url"
                   value="<?= e($form['og_image_url']) ?>"
                   placeholder="https://… (leave blank to use cover photo)"
                   oninput="updateSocialPreview()">
        </label>
    </div>

    <label>
        Social description (optional)
        <span class="hint">Defaults to the article summary if left blank</span>
        <textarea name="social_description" id="social-desc" rows="3"
                  oninput="updateSocialPreview()"
                  placeholder="Leave blank to use the article summary"><?= e($form['social_description']) ?></textarea>
    </label>

    <!-- Facebook-style preview -->
    <div style="margin-top:16px">
        <div class="sec-head" style="margin-bottom:8px">Preview when shared on Facebook / WhatsApp</div>
        <div class="social-card">
            <div class="social-card-img" id="social-img-wrap">
                <img id="social-preview-img"
                     src="<?= e($form['og_image_url'] ?: $form['featured_image_url']) ?>"
                     alt=""
                     style="<?= ($form['og_image_url'] || $form['featured_image_url']) ? 'width:100%;height:160px;object-fit:cover' : 'display:none' ?>"
                     onerror="this.style.display='none'">
                <span id="social-img-placeholder" style="font-size:28px;opacity:.3;<?= ($form['og_image_url'] || $form['featured_image_url']) ? 'display:none' : '' ?>">🖼️</span>
            </div>
            <div class="social-card-body">
                <div class="social-card-domain">KGLREALTYPRO.COM</div>
                <div class="social-card-title"  id="social-preview-title"><?= e($form['social_title'] ?: $form['title']) ?></div>
                <div class="social-card-desc"   id="social-preview-desc"><?= e($form['social_description'] ?: $form['excerpt']) ?></div>
            </div>
        </div>
    </div>
</details>

<!-- ══════════════════════════════════════════════════════
     SECTION 8 — TECHNICAL SETTINGS (collapsible)
     ══════════════════════════════════════════════════════ -->
<details class="card" <?= ($form['canonical_url'] || $form['robots_meta'] !== 'index,follow' || $form['schema_type'] !== 'BlogPosting') ? 'open' : '' ?>>
    <summary>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" style="flex-shrink:0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        Technical settings
        <span style="font-size:12px;font-weight:400;color:var(--muted)">&nbsp;— leave as defaults unless you know what these do</span>
    </summary>

    <div class="form-row">
        <label>
            Canonical URL
            <span class="tt" data-tip="Only set this if this article also exists on another URL and you want Google to treat this as the 'official' version. Leave blank in most cases.">?</span>
            <span class="hint">Leave blank — only needed for duplicate content scenarios</span>
            <input type="text" name="canonical_url" value="<?= e($form['canonical_url']) ?>"
                   placeholder="https://kglrealtypro.com/blog/article-slug">
        </label>
        <label>
            Google indexing
            <span class="tt" data-tip="'Index, Follow' means Google will index this page and follow its links. Choose 'No-index' for draft or thin content you don't want ranked yet.">?</span>
            <select name="robots_meta">
                <?php foreach ([
                    'index,follow'    => 'Index, Follow (default — Google ranks this)',
                    'noindex,follow'  => 'No-index, Follow (hide from Google)',
                    'index,nofollow'  => 'Index, No-follow (rank but don\'t follow links)',
                    'noindex,nofollow'=> 'No-index, No-follow (completely hidden)',
                ] as $v => $l): ?>
                    <option value="<?= e($v) ?>" <?= $form['robots_meta'] === $v ? 'selected' : '' ?>><?= e($l) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>

    <label>
        Article type (Schema)
        <span class="tt" data-tip="Tells Google exactly what type of content this is. 'BlogPosting' is right for most articles. Use 'NewsArticle' for time-sensitive news, 'FAQPage' if the article is structured as Q&A.">?</span>
        <select name="schema_type" style="max-width:340px">
            <?php foreach ([
                'BlogPosting'  => 'Blog Post (most common)',
                'Article'      => 'Article (general editorial)',
                'NewsArticle'  => 'News Article (time-sensitive)',
                'FAQPage'      => 'FAQ Page (question & answer format)',
            ] as $v => $l): ?>
                <option value="<?= e($v) ?>" <?= $form['schema_type'] === $v ? 'selected' : '' ?>><?= e($l) ?></option>
            <?php endforeach; ?>
        </select>
    </label>
</details>

<!-- ══════════════════════════════════════════════════════
     FORM ACTIONS
     ══════════════════════════════════════════════════════ -->
<div class="form-actions">
    <button class="btn btn-gold" type="submit" style="font-size:14.5px;padding:10px 24px">
        <?= $id ? '💾 Save changes' : '🚀 Publish article' ?>
    </button>
    <a class="btn" href="/posts.php">Cancel</a>
    <div class="spacer"></div>
    <?php if ($id): ?><span class="muted">ID: <?= $id ?></span><?php endif; ?>
</div>

</form>

<!-- ══════════════════════════════════════════════════════
     SECTION 9 — GALLERY (only when editing a saved post)
     ══════════════════════════════════════════════════════ -->
<?php if ($id > 0): ?>
<div class="card" id="images" style="margin-top:6px">
    <p class="sec-head" style="margin-bottom:6px">⑨ Photo gallery</p>
    <p style="font-size:13px;color:var(--muted);margin:0 0 18px">
        Add extra photos to this article. Use "Copy URL" then paste the URL into the article editor
        using the image button in the toolbar — or use the toolbar's image button directly to upload and insert in one step.
    </p>

    <?php if ($images): ?>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:24px">
        <?php foreach ($images as $img): ?>
        <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
            <img src="<?= e($img['url']) ?>" alt="<?= e($img['alt'] ?? '') ?>"
                 style="width:100%;height:110px;object-fit:cover;display:block">
            <div style="padding:8px 10px">
                <div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:6px"
                     title="<?= e($img['alt'] ?? $img['caption'] ?? '') ?>">
                    <?= e($img['alt'] ?: ($img['caption'] ?: '(no description)')) ?>
                </div>
                <div style="display:flex;gap:5px">
                    <button type="button" class="btn btn-sm" style="font-size:11px;padding:3px 7px;flex:1"
                            onclick="copyToClipboard(<?= json_encode($img['url']) ?>,this)">Copy URL</button>
                    <form method="post" action="/post-image-delete.php" style="display:contents"
                          onsubmit="return confirm('Delete this photo?')">
                        <?= csrf_field() ?>
                        <input type="hidden" name="id"      value="<?= $img['id'] ?>">
                        <input type="hidden" name="post_id" value="<?= $id ?>">
                        <button class="btn btn-sm btn-danger" type="submit" style="font-size:11px;padding:3px 7px">✕</button>
                    </form>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p style="font-size:13px;color:var(--muted);margin:0 0 18px">No extra photos yet.</p>
    <?php endif; ?>

    <details open style="border-top:1px solid var(--border);padding-top:18px">
        <summary style="cursor:pointer;font-size:13.5px;font-weight:600;color:var(--navy);list-style:none;display:flex;align-items:center;gap:7px;margin-bottom:14px">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add photos to gallery
        </summary>
        <form method="post" action="/post-image-add.php" enctype="multipart/form-data">
            <?= csrf_field() ?>
            <input type="hidden" name="post_id" value="<?= $id ?>">
            <div class="form-row" style="margin-bottom:12px">
                <label style="margin-top:0">Photo description (alt text)
                    <input type="text" name="alt" placeholder="Describe what's in the photo">
                </label>
                <label style="margin-top:0">Caption (optional)
                    <input type="text" name="caption" placeholder="Short caption shown under photo">
                </label>
            </div>
            <input type="file" name="images[]" multiple accept="image/jpeg,image/png,image/webp,image/gif"
                   style="font-size:13px;display:block;margin-bottom:8px">
            <span class="hint">Select one or more photos · JPEG, PNG, WebP or GIF · max 8 MB each</span>
            <br><button type="submit" class="btn btn-primary" style="margin-top:12px">Add to gallery</button>
        </form>
    </details>
</div>
<?php endif; ?>

<!-- ══════════════════════════════════════════════════════
     SCRIPTS
     ══════════════════════════════════════════════════════ -->
<script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>
<script>
// ── CSRF token for AJAX ───────────────────────────────────────────────────────
const CSRF_TOKEN = '<?= e(csrf_token()) ?>';

// ── Quill editor ──────────────────────────────────────────────────────────────
const quill = new Quill('#quill-editor', {
    theme: 'snow',
    placeholder: 'Start writing your article here…\n\nTip: Use Heading 2 for main sections (e.g. "Why Lekki is Outperforming"), Heading 3 for sub-sections, and bold for important points.',
    modules: {
        toolbar: {
            container: [
                [{ header: [2, 3, 4, false] }],
                ['bold', 'italic', 'underline'],
                ['blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
            ],
            handlers: { image: quillImageHandler }
        }
    }
});

// Load existing content
const existingContent = document.getElementById('content-input').value;
if (existingContent.trim()) {
    quill.clipboard.dangerouslyPasteHTML(existingContent);
}

// Sync to hidden textarea on text change
quill.on('text-change', function() {
    const html = quill.root.innerHTML;
    document.getElementById('content-input').value = (html === '<p><br></p>') ? '' : html;
    updateWordCount();
    updateSeoScore();
});

// Sync before submit (fallback)
document.getElementById('post-form').addEventListener('submit', function() {
    const html = quill.root.innerHTML;
    document.getElementById('content-input').value = (html === '<p><br></p>') ? '' : html;
});

// Custom image upload handler (prevents base64 embedding)
async function quillImageHandler() {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.click();
    input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        fd.append('_csrf', CSRF_TOKEN);
        try {
            const res = await fetch('/post-image-upload.php', { method: 'POST', body: fd });
            const j   = await res.json();
            if (j.url) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', j.url, Quill.sources.USER);
                quill.setSelection(range.index + 1, Quill.sources.SILENT);
            } else {
                alert('Image upload failed: ' + (j.error || 'Unknown error'));
            }
        } catch {
            alert('Network error during image upload — please try again.');
        }
    };
}

// Word count + reading time
function updateWordCount() {
    const text  = quill.getText().trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const mins  = Math.max(1, Math.round(words / 200));
    document.getElementById('word-count').textContent = words.toLocaleString();
    document.getElementById('read-time').textContent  = `~${mins} min`;
    return words;
}
updateWordCount();

// ── Cover image handling ──────────────────────────────────────────────────────
let slugEdited = <?= ($id > 0 || $form['slug'] !== '') ? 'true' : 'false' ?>;

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) uploadCoverFile(file);
}

function onCoverFileSelected(input) {
    const file = input.files && input.files[0];
    if (file) uploadCoverFile(file);
}

async function uploadCoverFile(file) {
    if (file.size > 8 * 1024 * 1024) { alert('Image must be under 8 MB.'); return; }
    const fd = new FormData();
    fd.append('image', file);
    fd.append('_csrf', CSRF_TOKEN);
    document.getElementById('drop-zone-inner').innerHTML = '<div style="font-size:14px;color:var(--muted)">Uploading…</div>';
    try {
        const res = await fetch('/post-image-upload.php', { method: 'POST', body: fd });
        const j   = await res.json();
        if (j.url) {
            setCoverImage(j.url);
        } else {
            alert('Upload failed: ' + (j.error || 'Unknown error'));
            resetDropZone();
        }
    } catch {
        alert('Network error — please try again.');
        resetDropZone();
    }
}

function setCoverImage(url) {
    document.getElementById('featured-image-url').value = url;
    document.getElementById('cover-preview').src = url;
    document.getElementById('cover-preview-wrap').style.display = '';
    resetDropZone();
    updateSocialPreview();
    updateSeoScore();
}

function removeCoverImage() {
    document.getElementById('featured-image-url').value = '';
    document.getElementById('cover-preview-wrap').style.display = 'none';
    updateSocialPreview();
    updateSeoScore();
}

function resetDropZone() {
    document.getElementById('drop-zone-inner').innerHTML = `
        <div class="drop-zone-icon">🖼️</div>
        <div style="font-size:14px;font-weight:600;color:var(--text-2);margin-bottom:4px">Click to choose a photo, or drag one here</div>
        <div style="font-size:12px;color:var(--muted)">JPEG, PNG, WebP or GIF · max 8 MB</div>`;
}

// ── Auto-slug from title ──────────────────────────────────────────────────────
function onTitleInput(title) {
    if (!slugEdited) {
        const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/[\s-]+/g,'-');
        document.getElementById('field-slug').value = slug;
        document.getElementById('slug-preview').textContent = slug;
        document.getElementById('serp-slug').textContent = slug;
    }
    updateSerp();
    updateSocialPreview();
    updateSeoScore();
}

// ── Character counters ────────────────────────────────────────────────────────
function countChars(el, counterId, limit) {
    const len = el.value.length;
    const counter = document.getElementById(counterId);
    counter.textContent = len;
    counter.className = len > limit ? 'cnt-danger' : len > limit * 0.9 ? 'cnt-warn' : len < limit * 0.6 ? 'cnt-warn' : 'cnt-good';
}

function countExcerpt() {
    const len = document.getElementById('field-excerpt').value.length;
    const el  = document.getElementById('excerpt-count');
    el.textContent = len;
    el.className = len > 200 ? 'cnt-danger' : len > 150 ? 'cnt-good' : len > 80 ? 'cnt-warn' : 'cnt-warn';
    updateSerp();
    updateSocialPreview();
    updateSeoScore();
}

// ── Live SERP preview ─────────────────────────────────────────────────────────
function updateSerp() {
    const title   = document.getElementById('field-title')?.value || '';
    const seoT    = document.getElementById('seo-title')?.value || '';
    const slug    = document.getElementById('field-slug')?.value || '';
    const desc    = document.getElementById('meta-desc')?.value || '';
    const excerpt = document.getElementById('field-excerpt')?.value || '';
    document.getElementById('serp-title').textContent = seoT || title;
    document.getElementById('serp-desc').textContent  = desc || excerpt;
    document.getElementById('serp-slug').textContent  = slug;
    document.getElementById('slug-preview').textContent = slug;
}

// ── Social preview ────────────────────────────────────────────────────────────
function updateSocialPreview() {
    const title      = document.getElementById('field-title')?.value || '';
    const socialT    = document.getElementById('social-title')?.value || '';
    const socialD    = document.getElementById('social-desc')?.value || '';
    const excerpt    = document.getElementById('field-excerpt')?.value || '';
    const ogImg      = document.getElementById('og-image-url')?.value || '';
    const coverImg   = document.getElementById('featured-image-url')?.value || '';
    const imgSrc     = ogImg || coverImg;

    document.getElementById('social-preview-title').textContent = socialT || title;
    document.getElementById('social-preview-desc').textContent  = socialD || excerpt;

    const img  = document.getElementById('social-preview-img');
    const ph   = document.getElementById('social-img-placeholder');
    if (imgSrc) {
        img.src = imgSrc;
        img.style.display   = 'block';
        img.style.width     = '100%';
        img.style.height    = '160px';
        img.style.objectFit = 'cover';
        ph.style.display    = 'none';
    } else {
        img.style.display = 'none';
        ph.style.display  = '';
    }
}

// ── SEO health score ──────────────────────────────────────────────────────────
function updateSeoScore() {
    const title    = (document.getElementById('field-title')?.value || '').trim();
    const seoT     = (document.getElementById('seo-title')?.value || '').trim();
    const metaD    = (document.getElementById('meta-desc')?.value || '').trim();
    const focusKw  = (document.getElementById('focus-keyword')?.value || '').trim().toLowerCase();
    const excerpt  = (document.getElementById('field-excerpt')?.value || '').trim();
    const coverImg = (document.getElementById('featured-image-url')?.value || '').trim();
    const imgAlt   = (document.getElementById('field-img-alt')?.value || '').trim();
    const content  = quill ? quill.getText().toLowerCase() : '';
    const words    = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    const checks = [
        { ok: title.length > 0,                                        label: 'Article title filled in' },
        { ok: focusKw.length > 0,                                      label: 'Focus keyword set' },
        { ok: focusKw && seoT.toLowerCase().includes(focusKw),         label: 'Keyword in Google title' },
        { ok: focusKw && metaD.toLowerCase().includes(focusKw),        label: 'Keyword in Google description' },
        { ok: focusKw && content.includes(focusKw),                    label: 'Keyword appears in content' },
        { ok: seoT.length >= 50 && seoT.length <= 60,                  label: 'Google title 50–60 chars' },
        { ok: metaD.length >= 140 && metaD.length <= 160,              label: 'Description 140–160 chars' },
        { ok: excerpt.length >= 60,                                    label: 'Article summary written' },
        { ok: coverImg.length > 0,                                     label: 'Cover photo added' },
        { ok: words >= 300,                                            label: 'Content ≥ 300 words' },
    ];

    const score = checks.filter(c => c.ok).length;
    const pct   = (score / checks.length) * 100;

    const circle = document.getElementById('score-circle');
    const color  = score >= 8 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--danger)';
    circle.style.color       = color;
    circle.style.borderColor = color;
    document.getElementById('score-num').textContent = score;

    const labels = ['Needs work — complete the fields below', 'Getting there — a few more steps', 'Good SEO setup!', 'Excellent — fully optimised!'];
    const labelIdx = score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;
    document.getElementById('score-label').textContent = labels[labelIdx];
    document.getElementById('score-label').style.color = color;

    document.getElementById('score-checks').innerHTML = checks.map(c => `
        <div class="sc-item ${c.ok ? 'sc-ok' : 'sc-fail'}">
            ${c.ok
                ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
                : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
            }
            ${c.label}
        </div>`).join('');
}

// ── Gallery copy URL ─────────────────────────────────────────────────────────
function copyToClipboard(url, btn) {
    navigator.clipboard.writeText(url).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = 'var(--success)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--success)';
        setTimeout(() => { btn.textContent = orig; btn.style = ''; }, 2000);
    }, () => prompt('Copy this URL:', url));
}

// ── Init ──────────────────────────────────────────────────────────────────────
(function init() {
    // Init char counters
    const seoEl  = document.getElementById('seo-title');
    const descEl = document.getElementById('meta-desc');
    if (seoEl)  countChars(seoEl,  'seo-title-count', 60);
    if (descEl) countChars(descEl, 'meta-desc-count', 160);
    countExcerpt();
    updateSeoScore();
    updateSocialPreview();

    // Listen for slug edits
    document.getElementById('field-slug')?.addEventListener('input', function() {
        slugEdited = this.value.trim() !== '';
    });

    // Listen for excerpt / title changes to update social + serp
    ['field-excerpt', 'field-title'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', function() {
            updateSerp(); updateSocialPreview(); updateSeoScore();
        });
    });
})();
</script>

<?php render_footer(); ?>
