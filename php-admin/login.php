<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        $error = 'Username and password are required.';
    } elseif (!attempt_login($username, $password)) {
        // Uniform error message — don't leak whether the username exists.
        $error = 'Invalid credentials.';
        // Simple rate dampener: sleep a bit on failure.
        usleep(random_int(300000, 700000));
    } else {
        header('Location: /');
        exit;
    }
}

if (current_admin()) {
    header('Location: /');
    exit;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Sign in — KGL Admin</title>
<style>
body{margin:0;font-family:system-ui,sans-serif;background:#0B1E3D;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.card{width:100%;max-width:380px;background:#fff;border-radius:8px;padding:28px 24px;box-shadow:0 10px 30px rgba(0,0,0,.2)}
h1{margin:0 0 18px;font-size:20px}
label{display:block;font-size:13px;font-weight:500;margin:12px 0 4px}
input{width:100%;padding:9px 10px;border:1px solid #d1d5db;border-radius:4px;box-sizing:border-box;font:inherit}
button{width:100%;margin-top:18px;padding:10px;background:#0274be;color:#fff;border:0;border-radius:4px;font-size:15px;font-weight:500;cursor:pointer}
.err{margin:10px 0 0;color:#b91c1c;font-size:14px}
</style>
</head>
<body>
<form class="card" method="post" novalidate>
    <h1>KGL Admin</h1>
    <?= csrf_field() ?>
    <label>Username <input name="username" autocomplete="username" required autofocus></label>
    <label>Password <input type="password" name="password" autocomplete="current-password" required></label>
    <?php if ($error): ?><p class="err"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <button type="submit">Sign in</button>
</form>
</body>
</html>
