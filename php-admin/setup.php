<?php
declare(strict_types=1);

/**
 * One-time admin bootstrap — creates the first admin_users row.
 * ONLY works when the admin_users table is empty.
 * DELETE THIS FILE immediately after creating your first admin.
 */

require_once __DIR__ . '/includes/db.php';

$error   = '';
$success = '';

// Hard-stop: refuse to run if any admin already exists.
$count = (int) db()->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
if ($count > 0) {
    http_response_code(403);
    exit('Setup already complete. Delete this file.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username  = trim($_POST['username']  ?? '');
    $password  = trim($_POST['password']  ?? '');
    $full_name = trim($_POST['full_name'] ?? '');

    if ($username === '' || $password === '' || $full_name === '') {
        $error = 'All fields are required.';
    } elseif (strlen($password) < 12) {
        $error = 'Password must be at least 12 characters.';
    } elseif (!preg_match('/^[a-z0-9_]{3,40}$/', $username)) {
        $error = 'Username: 3–40 lowercase letters, digits, or underscores.';
    } else {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        db()->prepare(
            'INSERT INTO admin_users (username, password_hash, full_name) VALUES (?, ?, ?)'
        )->execute([$username, $hash, $full_name]);
        $success = "Admin '$username' created. Delete setup.php now, then log in.";
    }
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>KGL Admin — First-time setup</title>
    <style>
        body{font-family:system-ui,sans-serif;background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
        .card{background:#fff;padding:36px 40px;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,.08);width:100%;max-width:420px}
        h1{font-size:20px;margin:0 0 6px}
        p.sub{font-size:13px;color:#64748b;margin:0 0 24px}
        label{display:block;font-size:13px;font-weight:600;margin-bottom:4px;margin-top:16px}
        input{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:9px 12px;font-size:14px}
        button{margin-top:24px;width:100%;background:#0274be;color:#fff;border:none;border-radius:8px;padding:11px;font-size:15px;font-weight:600;cursor:pointer}
        .error{background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px}
        .success{background:#f0fdf4;border:1px solid #86efac;color:#166534;border-radius:8px;padding:12px 14px;font-size:14px}
        .warn{background:#fffbeb;border:1px solid #fcd34d;color:#92400e;border-radius:8px;padding:10px 14px;font-size:12px;margin-top:20px}
    </style>
</head>
<body>
<div class="card">
    <h1>KGL Admin Setup</h1>
    <p class="sub">Create the first administrator account. This page is only accessible while no admin users exist.</p>

    <?php if ($success): ?>
        <div class="success"><strong><?= htmlspecialchars($success, ENT_QUOTES) ?></strong></div>
        <div class="warn">Delete <code>setup.php</code> from File Manager before doing anything else.</div>
    <?php else: ?>
        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error, ENT_QUOTES) ?></div>
        <?php endif; ?>
        <form method="post" autocomplete="off">
            <label>Username</label>
            <input type="text" name="username" value="<?= htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES) ?>"
                   pattern="[a-z0-9_]{3,40}" placeholder="e.g. kgl_admin" required>

            <label>Full name</label>
            <input type="text" name="full_name" value="<?= htmlspecialchars($_POST['full_name'] ?? '', ENT_QUOTES) ?>"
                   placeholder="e.g. David Makinde-George" required>

            <label>Password (min 12 characters)</label>
            <input type="password" name="password" placeholder="Choose a strong password" required>

            <button type="submit">Create admin account</button>
        </form>
        <div class="warn">Delete this file immediately after creating your account.</div>
    <?php endif; ?>
</div>
</body>
</html>
