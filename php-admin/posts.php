<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/layout.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    require_csrf();
    $del_id = (int)$_POST['delete_id'];
    if ($del_id > 0) {
        db()->prepare('DELETE FROM posts WHERE id = ?')->execute([$del_id]);
        flash('Post deleted.');
    }
    header('Location: /posts.php'); exit;
}

$posts = db()->query(
    "SELECT id, slug, title, author_name, categories, featured_image_url, date_posted
       FROM posts
       ORDER BY date_posted DESC
       LIMIT 300"
)->fetchAll();

render_header('Blog — Market Insights');
?>

<div class="page-header">
    <div>
        <div class="page-title">Blog — Market Insights</div>
        <div class="page-count"><?= count($posts) ?> published posts</div>
    </div>
    <a href="/post-edit.php" class="btn btn-gold">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        New Post
    </a>
</div>

<div class="table-wrap">
<table>
    <thead>
        <tr>
            <th>Post</th>
            <th>Author</th>
            <th>Categories</th>
            <th>Published</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
    <?php foreach ($posts as $p):
        $cats = json_decode($p['categories'] ?: '[]', true) ?: [];
    ?>
        <tr>
            <td>
                <a href="/post-edit.php?id=<?= (int)$p['id'] ?>" class="td-title"><?= e($p['title']) ?></a>
                <div class="td-sub">/<?= e($p['slug']) ?></div>
            </td>
            <td class="muted"><?= e($p['author_name']) ?></td>
            <td>
                <?php foreach ($cats as $cat): ?>
                    <span class="badge" style="background:#F1F5F9;color:#475569;margin-right:3px"><?= e($cat) ?></span>
                <?php endforeach; ?>
            </td>
            <td class="muted"><?= e(substr((string)$p['date_posted'], 0, 10)) ?></td>
            <td>
                <div style="display:flex;gap:6px;align-items:center;justify-content:flex-end">
                    <a class="btn btn-sm" href="/post-edit.php?id=<?= (int)$p['id'] ?>">Edit</a>
                    <form method="post" onsubmit="return confirm('Delete this post permanently?')">
                        <?= csrf_field() ?>
                        <input type="hidden" name="delete_id" value="<?= (int)$p['id'] ?>">
                        <button class="btn btn-sm btn-danger" type="submit">Delete</button>
                    </form>
                </div>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if (!$posts): ?>
        <tr><td colspan="5">
            <div class="empty-state">
                <div class="empty-icon">✍️</div>
                <p>No posts yet. Share your first market insight.</p>
                <a href="/post-edit.php" class="btn btn-gold">Write a post</a>
            </div>
        </td></tr>
    <?php endif; ?>
    </tbody>
</table>
</div>

<?php render_footer(); ?>
