<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';

if (current_admin()) { header('Location: /'); exit; }

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        $error = 'Username and password are required.';
    } elseif (!attempt_login($username, $password)) {
        $error = 'Invalid credentials. Please try again.';
        usleep(random_int(300_000, 700_000));
    } else {
        header('Location: /');
        exit;
    }
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Sign in — KGL Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
    <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        font-family: 'Inter', system-ui, sans-serif;
        background: #0B1E3D;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        position: relative;
        overflow: hidden;
    }

    /* Subtle background pattern */
    body::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(circle at 25% 25%, rgba(201,168,76,.08) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, rgba(201,168,76,.05) 0%, transparent 50%);
        pointer-events: none;
    }

    body::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px);
        background-size: 32px 32px;
        pointer-events: none;
    }

    .login-wrap {
        width: 100%;
        max-width: 400px;
        position: relative;
        z-index: 1;
    }

    .login-brand {
        text-align: center;
        margin-bottom: 28px;
    }

    .login-logo {
        width: 52px; height: 52px;
        background: linear-gradient(135deg, #C9A84C, #e8c97a);
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: 'DM Serif Display', serif;
        font-size: 22px;
        color: #0B1E3D;
        font-weight: 700;
        margin-bottom: 14px;
        box-shadow: 0 8px 24px rgba(201,168,76,.3);
    }

    .login-brand-name {
        display: block;
        font-family: 'DM Serif Display', serif;
        font-size: 22px;
        color: #fff;
        letter-spacing: .01em;
        line-height: 1.2;
    }

    .login-brand-sub {
        display: block;
        font-size: 12px;
        color: rgba(255,255,255,.4);
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-top: 4px;
    }

    .login-card {
        background: rgba(255,255,255,.97);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 24px 64px rgba(0,0,0,.3);
        backdrop-filter: blur(20px);
    }

    .login-heading {
        font-size: 17px;
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 6px;
    }

    .login-sub {
        font-size: 13px;
        color: #64748B;
        margin-bottom: 24px;
    }

    label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: #334155;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: .06em;
    }

    .field { margin-bottom: 16px; }

    input {
        width: 100%;
        padding: 10px 13px;
        border: 1.5px solid #E2E8F0;
        border-radius: 9px;
        font: inherit;
        font-size: 14px;
        color: #0F172A;
        background: #F8FAFC;
        outline: none;
        transition: border-color .15s, box-shadow .15s;
    }

    input:focus {
        border-color: #0B1E3D;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(11,30,61,.08);
    }

    .error {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #FEF2F2;
        border: 1px solid #FECACA;
        color: #DC2626;
        border-radius: 8px;
        padding: 10px 13px;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 16px;
    }

    button[type=submit] {
        width: 100%;
        margin-top: 8px;
        padding: 12px;
        background: #0B1E3D;
        color: #fff;
        border: none;
        border-radius: 9px;
        font: inherit;
        font-size: 14.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background .15s, box-shadow .15s, transform .1s;
        letter-spacing: .01em;
    }

    button[type=submit]:hover {
        background: #112649;
        box-shadow: 0 6px 20px rgba(11,30,61,.3);
        transform: translateY(-1px);
    }

    button[type=submit]:active { transform: translateY(0); }

    .login-footer {
        text-align: center;
        margin-top: 20px;
        font-size: 11.5px;
        color: rgba(255,255,255,.3);
    }
    </style>
</head>
<body>
<div class="login-wrap">

    <div class="login-brand">
        <div class="login-logo">K</div>
        <span class="login-brand-name">KGL Realty Pro</span>
        <span class="login-brand-sub">Admin Console</span>
    </div>

    <div class="login-card">
        <div class="login-heading">Welcome back</div>
        <div class="login-sub">Sign in to manage listings, leads &amp; blog posts.</div>

        <?php if ($error): ?>
        <div class="error">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
        </div>
        <?php endif; ?>

        <form method="post" novalidate>
            <?= csrf_field() ?>
            <div class="field">
                <label for="username">Username</label>
                <input id="username" name="username" autocomplete="username" required autofocus
                       placeholder="Enter your username">
            </div>
            <div class="field">
                <label for="password">Password</label>
                <input id="password" type="password" name="password" autocomplete="current-password" required
                       placeholder="••••••••••">
            </div>
            <button type="submit">Sign in →</button>
        </form>
    </div>

    <p class="login-footer">Protected area · KGL Realty Pro © <?= date('Y') ?></p>
</div>
</body>
</html>
