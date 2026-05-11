<?php
declare(strict_types=1);

/**
 * Seed the first (or additional) admin user.
 *   php bin/seed-admin.php <username> <password> "<full name>"
 *
 * Safe to re-run — username uniqueness is enforced by the schema.
 */

require_once __DIR__ . '/../includes/db.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

[$self, $username, $password, $fullName] = array_pad($argv, 4, null);
if (!$username || !$password || !$fullName) {
    fwrite(STDERR, "usage: php bin/seed-admin.php <username> <password> \"<full name>\"\n");
    exit(1);
}
if (strlen($password) < 12) {
    fwrite(STDERR, "refusing: password must be at least 12 chars\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
try {
    db()->prepare(
        'INSERT INTO admin_users (username, password_hash, full_name) VALUES (?, ?, ?)'
    )->execute([$username, $hash, $fullName]);
    fwrite(STDOUT, "created admin user '$username'\n");
} catch (PDOException $ex) {
    if ((int)$ex->errorInfo[1] === 1062) {
        fwrite(STDERR, "username already exists — use set-admin-password.php to reset\n");
        exit(1);
    }
    throw $ex;
}
