<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * Session auth + CSRF. Two concerns, one file — they share state (the session)
 * and separating them would add indirection with no benefit at this scale.
 */

function session_start_secure(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    // HttpOnly + Secure + SameSite=Strict. HSTS is enforced at the .htaccess
    // level, but we also refuse to set session cookies over plain HTTP.
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_name('kgl_admin');
    session_start();

    // Rotate the id on a cadence to frustrate session fixation.
    if (empty($_SESSION['_created_at'])) {
        $_SESSION['_created_at'] = time();
    } elseif (time() - (int)$_SESSION['_created_at'] > 1800) {
        session_regenerate_id(true);
        $_SESSION['_created_at'] = time();
    }
}

function current_admin(): ?array {
    session_start_secure();
    return $_SESSION['admin'] ?? null;
}

function require_admin(): array {
    $admin = current_admin();
    if (!$admin) {
        header('Location: /login.php');
        exit;
    }
    return $admin;
}

function attempt_login(string $username, string $password): bool {
    session_start_secure();
    $stmt = db()->prepare(
        'SELECT id, username, password_hash, full_name FROM admin_users WHERE username = ? LIMIT 1'
    );
    $stmt->execute([$username]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($password, $row['password_hash'])) {
        return false;
    }
    // Rehash if the PHP default cost has moved on.
    if (password_needs_rehash($row['password_hash'], PASSWORD_BCRYPT)) {
        $new = password_hash($password, PASSWORD_BCRYPT);
        db()->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
            ->execute([$new, $row['id']]);
    }
    db()->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?')
        ->execute([$row['id']]);

    session_regenerate_id(true);
    $_SESSION['admin'] = [
        'id'        => (int)$row['id'],
        'username'  => $row['username'],
        'full_name' => $row['full_name'],
    ];
    return true;
}

function logout(): void {
    session_start_secure();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

// ---------- CSRF ----------
function csrf_token(): string {
    session_start_secure();
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string {
    $t = htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8');
    return "<input type=\"hidden\" name=\"_csrf\" value=\"$t\">";
}

function require_csrf(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
    session_start_secure();
    $sent = $_POST['_csrf'] ?? '';
    $have = $_SESSION['_csrf'] ?? '';
    if (!is_string($sent) || $sent === '' || !hash_equals($have, $sent)) {
        http_response_code(400);
        exit('CSRF token mismatch');
    }
}
