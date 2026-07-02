<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

/**
 * Create or edit a blog post.
 *   /post-edit.php         → new post
 *   /post-edit.php?id=123  → edit existing
 */

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$errors = [];

$form = [
    'slug'               => '',
    'title'              => '',
    'excerpt'            => '',
    'content'            => '',
    'author_name'        => 'KGL Research Desk',
    'featured_image_url' => '',
    'categories_csv'     => 'Market analysis',
];

if ($id > 0) {
    $stmt = db()->prepare('SELECT * FROM posts WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { http_response_code(404); exit('Post not found.'); }
    $cats = json_decode($row['categories'] ?: '[]', true) ?: [];
    $form = [
        'slug'               => $row['slug'],
        'title'              => $row['title'],
        'excerpt'            => $row['excerpt'],
        'content'            => $row['content'],
        'author_name'        => $row['author_name'],
        'featured_image_url' => $row['featured_image_url'] ?? '',
        'categories_csv'     => implode(', ', $cats),
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    foreach (array_keys($form) as $k) {
        $form[$k] = $_POST[$k] ?? $form[$k];
    }

    $title = trim((string)$form['title']);
    $slug  = slugify_post($form['slug'] !== '' ? $form['slug'] : $title);

    if (!preg_match('/^[a-z0-9-]{2,191}$/', $slug)) {
        $errors[] = 'Slug must be 2–191 lowercase letters, digits, or hyphens.';
    }
    if ($title === '') $errors[] = 'Title is required.';
    if (trim((string)$form['excerpt']) === '') $errors[] = 'Excerpt is required.';
    if (trim((string)$form['content']) === '') $errors[] = 'Content is required.';

    $categories = array_values(array_filter(array_map(
        fn($s) => trim($s),
        explode(',', (string)$form['categories_csv'])
    )));
    $cats_json = json_encode($categories, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $image_url = trim((string)$form['featured_image_url']) ?: null;

    if (!$errors) {
        try {
            if ($id > 0) {
                db()->prepare(
                    'UPDATE posts SET
                       slug=?, title=?, excerpt=?, content=?,
                       author_name=?, featured_image_url=?, categories=CAST(? AS JSON)
                     WHERE id=?'
                )->execute([
                    $slug, $title, $form['excerpt'], $form['content'],
                    $form['author_name'], $image_url, $cats_json, $id,
                ]);
                flash('Post updated.');
            } else {
                db()->prepare(
                    'INSERT INTO posts
                       (slug, title, excerpt, content,
                        author_name, featured_image_url, categories)
                     VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON))'
                )->execute([
                    $slug, $title, $form['excerpt'], $form['content'],
                    $form['author_name'], $image_url, $cats_json,
                ]);
                $id = (int)db()->lastInsertId();
                flash('Post published.');
            }
            header("Location: /post-edit.php?id=$id");
            exit;
        } catch (PDOException $ex) {
            if ((int)$ex->errorInfo[1] === 1062) {
                $errors[] = 'That slug is already used by another post.';
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

render_header($id ? 'Edit post' : 'New post');
?>

<h1><?= $id ? 'Edit post' : 'New post — Market Insights' ?></h1>

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
        <input type="text" name="slug" value="<?= e($form['slug']) ?>"
               pattern="[a-z0-9-]{2,191}" placeholder="e.g. lagos-market-q2-2026">
    </label>

    <div class="row">
        <label>Author
            <input type="text" name="author_name" value="<?= e($form['author_name']) ?>" required>
        </label>
        <label>Categories (comma-separated)
            <input type="text" name="categories_csv" value="<?= e($form['categories_csv']) ?>"
                   placeholder="Market analysis, Dubai, Investment">
        </label>
    </div>

    <label>Featured image URL
        <input type="text" name="featured_image_url" value="<?= e($form['featured_image_url']) ?>"
               placeholder="https://kglrealtypro.com/uploads/blog-cover.jpg">
        <span class="muted">Upload the image to cPanel → public_html/uploads/, then paste the public URL.</span>
    </label>

    <?php if ($form['featured_image_url'] !== ''): ?>
        <div style="margin:6px 0">
            <img src="<?= e($form['featured_image_url']) ?>" alt="Cover preview"
                 style="max-height:160px;border-radius:6px;border:1px solid #e5e7eb">
        </div>
    <?php endif; ?>

    <label>Excerpt (shown on the blog listing card — one or two sentences)
        <textarea name="excerpt" rows="3"><?= e($form['excerpt']) ?></textarea>
    </label>

    <label>Content (HTML supported — paste from your editor or write here)
        <textarea name="content" rows="18" style="font-family:monospace;font-size:13px"><?= e($form['content']) ?></textarea>
    </label>

    <div style="margin-top:18px;display:flex;gap:10px;align-items:center">
        <button class="btn btn-primary" type="submit"><?= $id ? 'Save changes' : 'Publish post' ?></button>
        <a class="btn" href="/posts.php">Cancel</a>
        <?php if ($id): ?>
            <span class="muted" style="margin-left:auto">ID: <?= $id ?></span>
        <?php endif; ?>
    </div>
</form>

<?php render_footer(); ?>
