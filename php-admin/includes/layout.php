<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

function e(mixed $v): string {
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}

function flash(?string $set = null): ?string {
    session_start_secure();
    if ($set !== null) {
        $_SESSION['_flash'] = $set;
        return null;
    }
    $msg = $_SESSION['_flash'] ?? null;
    unset($_SESSION['_flash']);
    return $msg;
}

function render_header(string $title): void {
    $admin = current_admin();
    $msg = flash();
    ?>
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="robots" content="noindex,nofollow">
        <title><?= e($title) ?> — KGL Admin</title>
        <style>
            *{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#1a1a1a;background:#f6f7f9}
            header{background:#0B1E3D;color:#fff;padding:14px 24px;display:flex;gap:24px;align-items:center}
            header a{color:#fff;text-decoration:none;font-size:14px}
            header .spacer{flex:1}
            main{max-width:1100px;margin:28px auto;padding:0 24px}
            h1{font-size:22px;margin:0 0 18px}
            h2{font-size:16px;margin:24px 0 8px}
            table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden}
            th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #eef0f3;font-size:14px}
            th{background:#f9fafb;font-weight:600}
            .card{background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:20px;margin-bottom:18px}
            .btn{display:inline-block;padding:8px 14px;border-radius:4px;border:1px solid #d1d5db;background:#fff;color:#111;cursor:pointer;font-size:14px;text-decoration:none}
            .btn-primary{background:#0274be;color:#fff;border-color:#0274be}
            .btn-danger{background:#b91c1c;color:#fff;border-color:#b91c1c}
            label{display:block;font-size:13px;font-weight:500;margin:12px 0 4px}
            input[type=text],input[type=number],input[type=password],input[type=email],select,textarea{
                width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:4px;font:inherit;background:#fff
            }
            textarea{min-height:120px;resize:vertical}
            .row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
            .flash{padding:10px 14px;border-radius:4px;margin-bottom:16px;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
            .muted{color:#6b7280;font-size:13px}
        </style>
    </head>
    <body>
    <header>
        <strong>KGL Admin</strong>
        <a href="/">Listings</a>
        <a href="/leads.php">Leads</a>
        <a href="/tours.php">Tours</a>
        <a href="/handoffs.php">Handoffs</a>
        <span class="spacer"></span>
        <?php if ($admin): ?>
            <span><?= e($admin['full_name']) ?></span>
            <form action="/logout.php" method="post" style="display:inline">
                <?= csrf_field() ?>
                <button class="btn" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)">Log out</button>
            </form>
        <?php endif; ?>
    </header>
    <main>
        <?php if ($msg): ?><div class="flash"><?= e($msg) ?></div><?php endif; ?>
    <?php
}

function render_footer(): void {
    ?>
    </main></body></html>
    <?php
}
